"""Audit trail retrieval — every entry is verified live against its snapshot."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit.log import verify_entry
from app.db import get_db
from app.models.audit import AuditLogEntry
from app.schemas.call import AuditEntryOut

router = APIRouter(prefix="/api/audit", tags=["audit"])


@router.get("/{call_id}", response_model=list[AuditEntryOut])
async def get_audit_trail(call_id: str, db: AsyncSession = Depends(get_db)) -> list[AuditEntryOut]:
    stmt = select(AuditLogEntry).where(AuditLogEntry.call_id == call_id).order_by(AuditLogEntry.created_at)
    entries = (await db.execute(stmt)).scalars().all()
    return [
        AuditEntryOut(
            id=e.id,
            action=e.action,
            model_name=e.model_name,
            model_version=e.model_version,
            prompt_version=e.prompt_version,
            input_hash=e.input_hash,
            output_hash=e.output_hash,
            created_at=e.created_at,
            verified=verify_entry(e),
        )
        for e in entries
    ]
