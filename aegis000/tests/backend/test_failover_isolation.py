import pytest

from app.distress.mock_analyzer import MockDistressAnalyzer
from app.ingestion.failover import PipelineFailure
from app.pipeline.process_call import run_pipeline_for_call
from app.qa.llm_client import MockScoringModel
from app.qa.rubric import load_rubric
from app.transcription.interface import TranscriptionAdapter, TranscriptResult


class RaisingAdapter(TranscriptionAdapter):
    name = "raising"
    version = "1"

    async def transcribe(self, audio_ref: str) -> TranscriptResult:
        raise RuntimeError("simulated STT outage")


@pytest.fixture
def loaded_rubric():
    return load_rubric("../rubrics/example-eso-v1.yaml")


@pytest.mark.asyncio
async def test_pipeline_failure_never_raises(db_session, loaded_rubric):
    from app.models.agent import Agent

    agent = Agent(external_id="agent-x", name="Agent X")
    db_session.add(agent)
    await db_session.flush()

    result = await run_pipeline_for_call(
        session=db_session,
        call_id="call-fail",
        agent_id=agent.id,
        audio_ref="doesnt-matter",
        transcription_adapter=RaisingAdapter(),
        scoring_model=MockScoringModel(),
        rubric=loaded_rubric,
        distress_analyzer=MockDistressAnalyzer(),
    )
    assert isinstance(result, PipelineFailure)
    assert result.call_id == "call-fail"


@pytest.mark.asyncio
async def test_healthy_call_succeeds_after_a_prior_failure(db_session, loaded_rubric):
    from app.models.agent import Agent
    from app.transcription.mock_adapter import MockTranscriptionAdapter

    agent = Agent(external_id="agent-y", name="Agent Y")
    db_session.add(agent)
    await db_session.flush()

    failed = await run_pipeline_for_call(
        session=db_session,
        call_id="call-fail-2",
        agent_id=agent.id,
        audio_ref="irrelevant",
        transcription_adapter=RaisingAdapter(),
        scoring_model=MockScoringModel(),
        rubric=loaded_rubric,
        distress_analyzer=MockDistressAnalyzer(),
    )
    assert isinstance(failed, PipelineFailure)

    healthy = await run_pipeline_for_call(
        session=db_session,
        call_id="call-ok",
        agent_id=agent.id,
        audio_ref="000-mock-001",
        transcription_adapter=MockTranscriptionAdapter(),
        scoring_model=MockScoringModel(),
        rubric=loaded_rubric,
        distress_analyzer=MockDistressAnalyzer(),
    )
    assert not isinstance(healthy, PipelineFailure)
    assert healthy.id == "call-ok"
