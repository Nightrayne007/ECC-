"""Vocal-distress assessment models."""

from __future__ import annotations

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, new_uuid


class DistressAssessment(Base, TimestampMixin):
    __tablename__ = "distress_assessments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    call_id: Mapped[str] = mapped_column(String(36), ForeignKey("calls.id"), unique=True)
    overall_distress_score: Mapped[float] = mapped_column(Float)
    model_name: Mapped[str] = mapped_column(String(128))
    model_version: Mapped[str] = mapped_column(String(64))

    call: Mapped["Call"] = relationship(back_populates="distress_assessment")
    markers: Mapped[list["DistressMarkerRow"]] = relationship(back_populates="assessment")


class DistressMarkerRow(Base):
    __tablename__ = "distress_markers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    assessment_id: Mapped[str] = mapped_column(String(36), ForeignKey("distress_assessments.id"))
    kind: Mapped[str] = mapped_column(String(64))
    value: Mapped[float] = mapped_column(Float)
    severity: Mapped[str] = mapped_column(String(16))
    timestamp_ms: Mapped[int] = mapped_column(Integer)
    description: Mapped[str] = mapped_column(Text)

    assessment: Mapped["DistressAssessment"] = relationship(back_populates="markers")
