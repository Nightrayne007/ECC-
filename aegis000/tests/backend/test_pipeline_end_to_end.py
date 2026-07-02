import pytest
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.cad.mock_extractor import MockCadExtractor
from app.distress.mock_analyzer import MockDistressAnalyzer
from app.models.agent import Agent
from app.models.audit import AuditLogEntry
from app.models.cad import CadPrefillRow
from app.models.call import Call, Flag, Transcript
from app.models.distress import DistressAssessment
from app.models.qa import QAScore
from app.pipeline.process_call import run_pipeline_for_call
from app.qa.llm_client import MockScoringModel
from app.qa.rubric import load_rubric
from app.transcription.mock_adapter import MockTranscriptionAdapter
from app.translation.mock_translator import MockTranscriptTranslator


@pytest.mark.asyncio
async def test_full_pipeline_creates_linked_rows(db_session):
    rubric = load_rubric("../rubrics/example-eso-v1.yaml")
    agent = Agent(external_id="agent-e2e", name="E2E Agent")
    db_session.add(agent)
    await db_session.flush()

    call = await run_pipeline_for_call(
        session=db_session,
        call_id="call-e2e-knife",
        agent_id=agent.id,
        audio_ref="000-mock-002",  # contains "knife" trigger
        transcription_adapter=MockTranscriptionAdapter(),
        scoring_model=MockScoringModel(),
        rubric=rubric,
        distress_analyzer=MockDistressAnalyzer(),
        translator=MockTranscriptTranslator(),
        cad_extractor=MockCadExtractor(),
    )

    assert isinstance(call, Call)

    transcript = (
        await db_session.execute(
            select(Transcript).options(selectinload(Transcript.segments)).where(Transcript.call_id == call.id)
        )
    ).scalar_one()
    assert len(transcript.segments) > 0

    qa_score = (
        await db_session.execute(
            select(QAScore).options(selectinload(QAScore.criterion_scores)).where(QAScore.call_id == call.id)
        )
    ).scalar_one()
    assert 0.0 <= qa_score.overall_score <= 1.0
    assert len(qa_score.criterion_scores) == len(rubric.criteria)

    flags = (await db_session.execute(select(Flag).where(Flag.call_id == call.id))).scalars().all()
    assert any(f.phrase == "knife" for f in flags)

    distress = (
        await db_session.execute(
            select(DistressAssessment)
            .options(selectinload(DistressAssessment.markers))
            .where(DistressAssessment.call_id == call.id)
        )
    ).scalar_one()
    assert 0.0 <= distress.overall_distress_score <= 1.0

    cad_prefill = (
        await db_session.execute(select(CadPrefillRow).where(CadPrefillRow.call_id == call.id))
    ).scalar_one()
    assert cad_prefill.incident_type == "Police — Weapons Offence"
    assert cad_prefill.location_text == "15 Grey Street, Bankstown, New South Wales"

    audit_entries = (
        await db_session.execute(select(AuditLogEntry).where(AuditLogEntry.call_id == call.id))
    ).scalars().all()
    actions = {e.action for e in audit_entries}
    # No "translation" entry: 000-mock-002 has no non-English segments to translate.
    assert actions == {"transcription", "qa_score", "distress_analysis", "cad_prefill"}


@pytest.mark.asyncio
async def test_keyword_triggers_run_against_translated_text(db_session):
    """A caller reporting 'not breathing' in Italian must still raise the
    same critical medical flag as an English caller would — triggers run
    against the translated text overlay, not just the original language."""
    rubric = load_rubric("../rubrics/example-eso-v1.yaml")
    agent = Agent(external_id="agent-translation-triggers", name="Translation Triggers Agent")
    db_session.add(agent)
    await db_session.flush()

    call = await run_pipeline_for_call(
        session=db_session,
        call_id="call-translated-trigger",
        agent_id=agent.id,
        audio_ref="000-mock-003",  # Italian caller reports "not respira bene" -> "not breathing well"
        transcription_adapter=MockTranscriptionAdapter(),
        scoring_model=MockScoringModel(),
        rubric=rubric,
        distress_analyzer=MockDistressAnalyzer(),
        translator=MockTranscriptTranslator(),
        cad_extractor=MockCadExtractor(),
    )

    flags = (await db_session.execute(select(Flag).where(Flag.call_id == call.id))).scalars().all()
    assert any(f.phrase == "not breathing" and f.severity == "critical" for f in flags)

    cad_prefill = (
        await db_session.execute(select(CadPrefillRow).where(CadPrefillRow.call_id == call.id))
    ).scalar_one()
    assert cad_prefill.incident_type == "Ambulance — Medical Emergency"

    audit_entries = (
        await db_session.execute(select(AuditLogEntry).where(AuditLogEntry.call_id == call.id))
    ).scalars().all()
    actions = {e.action for e in audit_entries}
    assert "translation" in actions
