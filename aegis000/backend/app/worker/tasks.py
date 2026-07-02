"""arq worker for async QA processing per call.

Chosen over Celery/RQ for native asyncio fit with FastAPI's async DB
session. Run separately with: arq app.worker.tasks.WorkerSettings

Not required to see the dashboard populated locally — scripts/seed_dev_data.py
runs the same pipeline in-process for local dev.
"""

from __future__ import annotations

from arq.connections import RedisSettings

from app.config import settings
from app.db import AsyncSessionLocal
from app.pipeline.process_call import rescore_call
from app.qa.llm_client import get_scoring_model


async def qa_rescore_task(ctx: dict, call_id: str) -> None:
    async with AsyncSessionLocal() as session:
        model = get_scoring_model(settings)
        await rescore_call(session=session, call_id=call_id, scoring_model=model)


class WorkerSettings:
    functions = [qa_rescore_task]
    redis_settings = RedisSettings.from_dsn(settings.REDIS_URL)
