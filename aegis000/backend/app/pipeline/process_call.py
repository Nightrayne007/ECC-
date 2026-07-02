"""Single entry point wiring transcription -> QA scoring -> audit -> DB.

Invoked by both the dev seed script and the async worker task. Wrapped in
@isolate_from_call_path so a failure anywhere in this chain can never
propagate to the caller or affect any other call being processed.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit.log import AuditLogger
from app.ingestion.failover import isolate_from_call_path
from app.models.call import Call, CoachingMoment, Flag, Transcript, TranscriptSegment
from app.models.qa import QACriterionScore, QAScore, Rubric as RubricModel
from app.qa.coaching import extract_coaching_moments
from app.qa.keyword_triggers import find_triggers
from app.qa.rubric import Rubric
from app.qa.scorer import QAEngine
from app.qa.llm_client import ScoringModel
from app.transcription.interface import Speaker, TranscriptionAdapter, TranscriptResult, TranscriptSegment as TranscriptSegmentVO


async def _get_or_create_rubric_snapshot(session: AsyncSession, rubric: Rubric) -> RubricModel:
    stmt = select(RubricModel).where(
        RubricModel.eso_id == rubric.eso_id, RubricModel.version == rubric.version
    )
    existing = (await session.execute(stmt)).scalar_one_or_none()
    if existing is not None:
        return existing

    snapshot = RubricModel(
        eso_id=rubric.eso_id,
        name=rubric.name,
        version=rubric.version,
        yaml_source=rubric.model_dump_json(),
    )
    session.add(snapshot)
    await session.flush()
    return snapshot


@isolate_from_call_path
async def run_pipeline_for_call(
    *,
    session: AsyncSession,
    call_id: str,
    agent_id: str,
    audio_ref: str,
    transcription_adapter: TranscriptionAdapter,
    scoring_model: ScoringModel,
    rubric: Rubric,
    started_at: datetime | None = None,
) -> Call:
    started_at = started_at or datetime.now(timezone.utc)
    audit = AuditLogger(session)

    transcript_result = await transcription_adapter.transcribe(audio_ref)

    call = Call(
        id=call_id,
        agent_id=agent_id,
        audio_ref=audio_ref,
        started_at=started_at,
        duration_seconds=max((s.end_ms for s in transcript_result.segments), default=0) // 1000,
        source="mock",
        language_detected=transcript_result.detected_languages[0] if transcript_result.detected_languages else "en-AU",
        non_english_flag=transcript_result.non_english_detected,
    )
    session.add(call)
    await session.flush()

    transcript_row = Transcript(
        call_id=call.id,
        adapter_name=transcript_result.adapter_name,
        adapter_version=transcript_result.adapter_version,
        raw_json={"segments": [s.__dict__ | {"speaker": s.speaker.value} for s in transcript_result.segments]},
    )
    session.add(transcript_row)
    await session.flush()

    segment_rows: list[TranscriptSegment] = []
    for seg in transcript_result.segments:
        row = TranscriptSegment(
            transcript_id=transcript_row.id,
            speaker=seg.speaker.value,
            start_ms=seg.start_ms,
            end_ms=seg.end_ms,
            text=seg.text,
            confidence=seg.confidence,
        )
        session.add(row)
        segment_rows.append(row)
    await session.flush()

    await audit.record(
        call_id=call.id,
        action="transcription",
        model_name=transcript_result.adapter_name,
        model_version=transcript_result.adapter_version,
        prompt_version=None,
        input_payload={"audio_ref": audio_ref},
        output_payload={"segment_count": len(transcript_result.segments), "text": transcript_result.to_text()},
    )

    triggers = find_triggers(transcript_result.segments, rubric.keyword_triggers)
    for trigger in triggers:
        session.add(
            Flag(
                call_id=call.id,
                segment_id=segment_rows[trigger.segment_index].id if trigger.segment_index < len(segment_rows) else None,
                phrase=trigger.phrase,
                category=trigger.category,
                severity=trigger.severity,
                snippet=trigger.snippet,
                timestamp_ms=trigger.timestamp_ms,
            )
        )

    rubric_snapshot = await _get_or_create_rubric_snapshot(session, rubric)

    engine = QAEngine(scoring_model)
    qa_result = engine.score_call(transcript_result, rubric)

    qa_score_row = QAScore(
        call_id=call.id,
        rubric_id=rubric_snapshot.id,
        overall_score=qa_result.overall_score,
        model_name=qa_result.model_name,
        model_version=qa_result.model_version,
        prompt_version=qa_result.prompt_version,
    )
    session.add(qa_score_row)
    await session.flush()

    for criterion in qa_result.criterion_scores:
        session.add(
            QACriterionScore(
                qa_score_id=qa_score_row.id,
                criterion_key=criterion.key,
                score=criterion.score,
                weight=criterion.weight,
                rationale=criterion.rationale,
            )
        )

    for moment in extract_coaching_moments(transcript_result, qa_result):
        session.add(
            CoachingMoment(
                call_id=call.id,
                criterion_key=moment.criterion_key,
                timestamp_ms=moment.timestamp_ms,
                snippet=moment.snippet,
                note=moment.note,
            )
        )

    await audit.record(
        call_id=call.id,
        action="qa_score",
        model_name=qa_result.model_name,
        model_version=qa_result.model_version,
        prompt_version=qa_result.prompt_version,
        input_payload={"transcript_text": transcript_result.to_text(), "rubric_version": rubric.version},
        output_payload={
            "overall_score": qa_result.overall_score,
            "criteria": [c.__dict__ for c in qa_result.criterion_scores],
        },
    )

    await session.commit()
    return call


@isolate_from_call_path
async def rescore_call(*, session: AsyncSession, call_id: str, scoring_model: ScoringModel) -> QAScore:
    """Re-run QA scoring for a call using its already-stored transcript.

    Used by POST /api/calls/{id}/rescore — never re-transcribes, only
    re-derives the QA score (e.g. after a rubric or model change).
    """
    call = (await session.execute(select(Call).where(Call.id == call_id))).scalar_one()
    transcript_row = (
        await session.execute(select(Transcript).where(Transcript.call_id == call_id))
    ).scalar_one()
    segment_rows = (
        await session.execute(
            select(TranscriptSegment)
            .where(TranscriptSegment.transcript_id == transcript_row.id)
            .order_by(TranscriptSegment.start_ms)
        )
    ).scalars().all()
    existing_score = (
        await session.execute(select(QAScore).where(QAScore.call_id == call_id))
    ).scalar_one()
    rubric_snapshot = (
        await session.execute(select(RubricModel).where(RubricModel.id == existing_score.rubric_id))
    ).scalar_one()
    rubric = Rubric.model_validate_json(rubric_snapshot.yaml_source)

    transcript_result = TranscriptResult(
        call_id=call_id,
        segments=[
            TranscriptSegmentVO(
                speaker=Speaker(row.speaker),
                start_ms=row.start_ms,
                end_ms=row.end_ms,
                text=row.text,
                confidence=row.confidence,
            )
            for row in segment_rows
        ],
        adapter_name=transcript_row.adapter_name,
        adapter_version=transcript_row.adapter_version,
    )

    engine = QAEngine(scoring_model)
    qa_result = engine.score_call(transcript_result, rubric)

    for old_criterion in (
        await session.execute(
            select(QACriterionScore).where(QACriterionScore.qa_score_id == existing_score.id)
        )
    ).scalars().all():
        await session.delete(old_criterion)

    existing_score.overall_score = qa_result.overall_score
    existing_score.model_name = qa_result.model_name
    existing_score.model_version = qa_result.model_version
    existing_score.prompt_version = qa_result.prompt_version
    await session.flush()

    for criterion in qa_result.criterion_scores:
        session.add(
            QACriterionScore(
                qa_score_id=existing_score.id,
                criterion_key=criterion.key,
                score=criterion.score,
                weight=criterion.weight,
                rationale=criterion.rationale,
            )
        )

    audit = AuditLogger(session)
    await audit.record(
        call_id=call_id,
        action="qa_score",
        model_name=qa_result.model_name,
        model_version=qa_result.model_version,
        prompt_version=qa_result.prompt_version,
        input_payload={"transcript_text": transcript_result.to_text(), "rubric_version": rubric.version, "rescore": True},
        output_payload={
            "overall_score": qa_result.overall_score,
            "criteria": [c.__dict__ for c in qa_result.criterion_scores],
        },
    )

    await session.commit()
    return existing_score
