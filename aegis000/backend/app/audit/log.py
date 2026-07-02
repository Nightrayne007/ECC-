"""Append-only audit logging for every AI decision (transcription, qa_score).

Every entry is reproducible: input_hash/output_hash are recomputed from the
stored snapshots by verify_entry(), so tampering or drift is detectable
without trusting the hash fields themselves.
"""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.audit.hashing import canonical_json, sha256_hex
from app.models.audit import AuditLogEntry


class AuditLogger:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def record(
        self,
        *,
        action: str,
        model_name: str,
        model_version: str,
        prompt_version: str | None,
        input_payload: dict,
        output_payload: dict,
        call_id: str | None = None,
        subject_type: str = "call",
        subject_ref: str | None = None,
    ) -> AuditLogEntry:
        entry = AuditLogEntry(
            subject_type=subject_type,
            call_id=call_id,
            subject_ref=subject_ref,
            action=action,
            model_name=model_name,
            model_version=model_version,
            prompt_version=prompt_version,
            input_hash=sha256_hex(canonical_json(input_payload)),
            output_hash=sha256_hex(canonical_json(output_payload)),
            input_snapshot=input_payload,
            output_snapshot=output_payload,
        )
        self.session.add(entry)
        await self.session.flush()
        return entry


def verify_entry(entry: AuditLogEntry) -> bool:
    return (
        sha256_hex(canonical_json(entry.input_snapshot)) == entry.input_hash
        and sha256_hex(canonical_json(entry.output_snapshot)) == entry.output_hash
    )
