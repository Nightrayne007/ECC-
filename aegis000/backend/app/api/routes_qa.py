"""Rubric listing."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.qa import Rubric

router = APIRouter(prefix="/api/rubrics", tags=["rubrics"])


@router.get("")
async def list_rubrics(db: AsyncSession = Depends(get_db)) -> list[dict]:
    rows = (await db.execute(select(Rubric))).scalars().all()
    return [{"id": r.id, "eso_id": r.eso_id, "name": r.name, "version": r.version} for r in rows]
