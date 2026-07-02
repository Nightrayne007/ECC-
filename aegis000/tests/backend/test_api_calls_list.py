import pytest
from httpx import ASGITransport, AsyncClient

from app.distress.mock_analyzer import MockDistressAnalyzer
from app.main import app
from app.models.agent import Agent
from app.pipeline.process_call import run_pipeline_for_call
from app.qa.llm_client import MockScoringModel
from app.qa.rubric import load_rubric
from app.transcription.mock_adapter import MockTranscriptionAdapter


@pytest.mark.asyncio
async def test_list_calls_returns_seeded_call(db_session):
    rubric = load_rubric("../rubrics/example-eso-v1.yaml")
    agent = Agent(external_id="agent-api", name="API Agent")
    db_session.add(agent)
    await db_session.flush()

    await run_pipeline_for_call(
        session=db_session,
        call_id="call-api-1",
        agent_id=agent.id,
        audio_ref="000-mock-001",
        transcription_adapter=MockTranscriptionAdapter(),
        scoring_model=MockScoringModel(),
        rubric=rubric,
        distress_analyzer=MockDistressAnalyzer(),
    )

    async def override_get_db():
        yield db_session

    from app.db import get_db

    app.dependency_overrides[get_db] = override_get_db
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/calls")
        assert response.status_code == 200
        body = response.json()
        seeded = next(c for c in body if c["id"] == "call-api-1")
        assert "distress_score" in seeded
    finally:
        app.dependency_overrides.clear()
