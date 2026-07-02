"""Draft CAD pre-fill — never submitted to a real CAD system by this codebase."""

from __future__ import annotations

from sqlalchemy import JSON, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, new_uuid


class CadPrefillRow(Base, TimestampMixin):
    __tablename__ = "cad_prefills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    call_id: Mapped[str] = mapped_column(String(36), ForeignKey("calls.id"), unique=True)
    incident_type: Mapped[str] = mapped_column(String(128))
    location_text: Mapped[str | None] = mapped_column(String(512), nullable=True)
    hazards: Mapped[list] = mapped_column(JSON, default=list)
    notes: Mapped[str] = mapped_column(Text)
    confidence: Mapped[float] = mapped_column(Float)
    model_name: Mapped[str] = mapped_column(String(128))
    model_version: Mapped[str] = mapped_column(String(64))

    call: Mapped["Call"] = relationship(back_populates="cad_prefill")
