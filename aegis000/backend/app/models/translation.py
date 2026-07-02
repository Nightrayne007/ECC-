"""Per-segment translation overlay."""

from __future__ import annotations

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, new_uuid


class TranslatedSegmentRow(Base, TimestampMixin):
    __tablename__ = "translated_segments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    segment_id: Mapped[str] = mapped_column(String(36), ForeignKey("transcript_segments.id"), unique=True)
    source_lang: Mapped[str] = mapped_column(String(16))
    target_lang: Mapped[str] = mapped_column(String(16))
    translated_text: Mapped[str] = mapped_column(Text)
    model_name: Mapped[str] = mapped_column(String(128))
    model_version: Mapped[str] = mapped_column(String(64))

    segment: Mapped["TranscriptSegment"] = relationship(back_populates="translation")
