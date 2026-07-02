"""Call, transcript, and flag models."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, new_uuid


class Call(Base, TimestampMixin):
    __tablename__ = "calls"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agents.id"))
    audio_ref: Mapped[str] = mapped_column(String(256))
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    source: Mapped[str] = mapped_column(String(64), default="mock")
    language_detected: Mapped[str] = mapped_column(String(16), default="en-AU")
    non_english_flag: Mapped[bool] = mapped_column(Boolean, default=False)

    agent: Mapped["Agent"] = relationship(back_populates="calls")
    transcript: Mapped["Transcript | None"] = relationship(back_populates="call", uselist=False)
    qa_score: Mapped["QAScore | None"] = relationship(back_populates="call", uselist=False)
    flags: Mapped[list["Flag"]] = relationship(back_populates="call")
    coaching_moments: Mapped[list["CoachingMoment"]] = relationship(back_populates="call")


class Transcript(Base, TimestampMixin):
    __tablename__ = "transcripts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    call_id: Mapped[str] = mapped_column(String(36), ForeignKey("calls.id"), unique=True)
    adapter_name: Mapped[str] = mapped_column(String(128))
    adapter_version: Mapped[str] = mapped_column(String(64))
    raw_json: Mapped[dict] = mapped_column(JSON)

    call: Mapped["Call"] = relationship(back_populates="transcript")
    segments: Mapped[list["TranscriptSegment"]] = relationship(back_populates="transcript", order_by="TranscriptSegment.start_ms")


class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    transcript_id: Mapped[str] = mapped_column(String(36), ForeignKey("transcripts.id"))
    speaker: Mapped[str] = mapped_column(String(32))
    start_ms: Mapped[int] = mapped_column(Integer)
    end_ms: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(String(4096))
    confidence: Mapped[float] = mapped_column(Float, default=1.0)

    transcript: Mapped["Transcript"] = relationship(back_populates="segments")


class Flag(Base, TimestampMixin):
    __tablename__ = "flags"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    call_id: Mapped[str] = mapped_column(String(36), ForeignKey("calls.id"))
    segment_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("transcript_segments.id"), nullable=True)
    phrase: Mapped[str] = mapped_column(String(128))
    category: Mapped[str] = mapped_column(String(64))
    severity: Mapped[str] = mapped_column(String(32))
    snippet: Mapped[str] = mapped_column(String(1024))
    timestamp_ms: Mapped[int] = mapped_column(Integer)

    call: Mapped["Call"] = relationship(back_populates="flags")


class CoachingMoment(Base, TimestampMixin):
    __tablename__ = "coaching_moments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    call_id: Mapped[str] = mapped_column(String(36), ForeignKey("calls.id"))
    criterion_key: Mapped[str] = mapped_column(String(64))
    timestamp_ms: Mapped[int] = mapped_column(Integer)
    snippet: Mapped[str] = mapped_column(String(1024))
    note: Mapped[str] = mapped_column(String(1024))

    call: Mapped["Call"] = relationship(back_populates="coaching_moments")
