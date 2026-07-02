"""Per-agent QA score trend, for the supervisor dashboard."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.call import Call
from app.models.qa import QAScore
from app.schemas.call import AgentTrendPointOut

router = APIRouter(prefix="/api/agents", tags=["agents"])


@router.get("/{agent_id}/trend", response_model=list[AgentTrendPointOut])
async def agent_trend(agent_id: str, db: AsyncSession = Depends(get_db)) -> list[AgentTrendPointOut]:
    stmt = (
        select(
            func.date_trunc("day", Call.started_at).label("period"),
            func.avg(QAScore.overall_score).label("avg_score"),
            func.count(QAScore.id).label("call_count"),
        )
        .join(QAScore, QAScore.call_id == Call.id)
        .where(Call.agent_id == agent_id)
        .group_by("period")
        .order_by("period")
    )
    rows = (await db.execute(stmt)).all()
    return [
        AgentTrendPointOut(period=str(row.period), avg_score=float(row.avg_score), call_count=row.call_count)
        for row in rows
    ]
