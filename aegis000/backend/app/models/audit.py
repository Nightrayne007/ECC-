"""Immutable, append-only audit log for every AI decision."""

from __future__ import annotations

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, new_uuid


class AuditLogEntry(Base, TimestampMixin):
    """One row per AI decision (transcription, qa_score, ...).

    Never updated or deleted after insert — reproducibility depends on
    input_hash/output_hash matching input_snapshot/output_snapshot forever.
    No route or service in this codebase issues UPDATE/DELETE against this
    table; enforce the same at the DB grant level before PROTECTED-level
    accreditation (see docs/failover-design.md).
    """

    __tablename__ = "audit_log_entries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    call_id: Mapped[str] = mapped_column(String(36), ForeignKey("calls.id"))
    action: Mapped[str] = mapped_column(String(32))
    model_name: Mapped[str] = mapped_column(String(128))
    model_version: Mapped[str] = mapped_column(String(64))
    prompt_version: Mapped[str | None] = mapped_column(String(64), nullable=True)
    input_hash: Mapped[str] = mapped_column(String(64))
    output_hash: Mapped[str] = mapped_column(String(64))
    input_snapshot: Mapped[dict] = mapped_column(JSON)
    output_snapshot: Mapped[dict] = mapped_column(JSON)
