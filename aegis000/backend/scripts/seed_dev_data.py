"""Seed local dev data end-to-end through the real pipeline.

Runs transcription -> distress analysis -> translation -> CAD pre-fill ->
QA scoring -> audit log -> DB (all mock), so the dashboard has real, varied
data without any external services beyond Postgres, and without any API
keys.

Usage: python scripts/seed_dev_data.py
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone

from app.cad.mock_extractor import MockCadExtractor
from app.db import AsyncSessionLocal, init_models
from app.distress.mock_analyzer import MockDistressAnalyzer
from app.ingestion.failover import PipelineFailure
from app.models.agent import Agent
from app.pipeline.process_call import run_pipeline_for_call
from app.qa.llm_client import MockScoringModel
from app.qa.rubric import load_rubric
from app.transcription.mock_adapter import MockTranscriptionAdapter
from app.translation.mock_translator import MockTranscriptTranslator

RUBRIC_PATH = "../rubrics/example-eso-v1.yaml"

SEED_CALLS = [
    ("agent-alice", "000-mock-001"),
    ("agent-bob", "000-mock-002"),
    ("agent-alice", "000-mock-003"),
    ("agent-carol", "000-mock-004"),
    ("agent-bob", "000-mock-005"),  # synthesized, not a fixture
]


async def main() -> None:
    await init_models()
    rubric = load_rubric(RUBRIC_PATH)
    adapter = MockTranscriptionAdapter()
    model = MockScoringModel()
    distress_analyzer = MockDistressAnalyzer()
    translator = MockTranscriptTranslator()
    cad_extractor = MockCadExtractor()

    async with AsyncSessionLocal() as session:
        agents: dict[str, Agent] = {}
        for external_id in {a for a, _ in SEED_CALLS}:
            agent = Agent(external_id=external_id, name=external_id.replace("agent-", "").title(), team="alpha")
            session.add(agent)
            agents[external_id] = agent
        await session.flush()

        for i, (agent_key, audio_ref) in enumerate(SEED_CALLS):
            call_id = f"call-{i:04d}"
            started_at = datetime.now(timezone.utc) - timedelta(hours=len(SEED_CALLS) - i)
            result = await run_pipeline_for_call(
                session=session,
                call_id=call_id,
                agent_id=agents[agent_key].id,
                audio_ref=audio_ref,
                transcription_adapter=adapter,
                scoring_model=model,
                rubric=rubric,
                distress_analyzer=distress_analyzer,
                translator=translator,
                cad_extractor=cad_extractor,
                started_at=started_at,
            )
            if isinstance(result, PipelineFailure):
                print(f"FAILED {audio_ref}: {result.error}")
            else:
                print(f"seeded {call_id} ({audio_ref}) for {agent_key}")


if __name__ == "__main__":
    asyncio.run(main())
