"""Call list, call detail, and rescore routes.

Read-only for supervisors, plus one async trigger (rescore). No route here
gates or affects call answering — this is the life-safety boundary applied
to the API surface, not just the ingestion layer.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import get_db
from app.ingestion.failover import PipelineFailure
from app.models.call import Call, CoachingMoment, Flag, Transcript, TranscriptSegment
from app.models.distress import DistressAssessment
from app.models.qa import QAScore
from app.pipeline.process_call import rescore_call
from app.qa.llm_client import get_scoring_model
from app.config import settings
from app.schemas.call import CallDetailOut, CallSummaryOut, TranslatedSegmentOut

router = APIRouter(prefix="/api/calls", tags=["calls"])


@router.get("", response_model=list[CallSummaryOut])
async def list_calls(
    agent_id: str | None = None,
    flagged: bool | None = None,
    language: str | None = None,
    min_score: float | None = None,
    db: AsyncSession = Depends(get_db),
) -> list[CallSummaryOut]:
    stmt = select(Call).options(
        selectinload(Call.qa_score), selectinload(Call.flags), selectinload(Call.distress_assessment)
    )
    if agent_id:
        stmt = stmt.where(Call.agent_id == agent_id)
    if language:
        stmt = stmt.where(Call.language_detected == language)

    calls = (await db.execute(stmt)).scalars().all()

    results = []
    for call in calls:
        flag_count = len(call.flags)
        if flagged is True and flag_count == 0:
            continue
        if flagged is False and flag_count > 0:
            continue
        overall_score = call.qa_score.overall_score if call.qa_score else None
        if min_score is not None and (overall_score is None or overall_score < min_score):
            continue
        results.append(
            CallSummaryOut(
                id=call.id,
                agent_id=call.agent_id,
                started_at=call.started_at,
                duration_seconds=call.duration_seconds,
                language_detected=call.language_detected,
                non_english_flag=call.non_english_flag,
                overall_score=overall_score,
                flag_count=flag_count,
                distress_score=call.distress_assessment.overall_distress_score if call.distress_assessment else None,
            )
        )
    return results


@router.get("/{call_id}", response_model=CallDetailOut)
async def get_call(call_id: str, db: AsyncSession = Depends(get_db)) -> CallDetailOut:
    stmt = (
        select(Call)
        .options(
            selectinload(Call.transcript).selectinload(Transcript.segments).selectinload(TranscriptSegment.translation),
            selectinload(Call.qa_score).selectinload(QAScore.criterion_scores),
            selectinload(Call.flags),
            selectinload(Call.coaching_moments),
            selectinload(Call.distress_assessment).selectinload(DistressAssessment.markers),
            selectinload(Call.cad_prefill),
        )
        .where(Call.id == call_id)
    )
    call = (await db.execute(stmt)).scalar_one_or_none()
    if call is None:
        raise HTTPException(status_code=404, detail="call not found")

    segments = call.transcript.segments if call.transcript else []
    translated_segments = [
        TranslatedSegmentOut(
            start_ms=seg.start_ms,
            source_lang=seg.translation.source_lang,
            target_lang=seg.translation.target_lang,
            translated_text=seg.translation.translated_text,
        )
        for seg in segments
        if seg.translation is not None
    ]

    return CallDetailOut(
        id=call.id,
        agent_id=call.agent_id,
        started_at=call.started_at,
        duration_seconds=call.duration_seconds,
        language_detected=call.language_detected,
        non_english_flag=call.non_english_flag,
        segments=segments,
        qa_score=call.qa_score,
        flags=call.flags,
        coaching_moments=call.coaching_moments,
        distress_assessment=call.distress_assessment,
        translated_segments=translated_segments,
        cad_prefill=call.cad_prefill,
    )


@router.post("/{call_id}/rescore")
async def rescore(call_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    model = get_scoring_model(settings)
    result = await rescore_call(session=db, call_id=call_id, scoring_model=model)
    if isinstance(result, PipelineFailure):
        raise HTTPException(status_code=422, detail=result.error)
    return {"call_id": call_id, "overall_score": result.overall_score}
