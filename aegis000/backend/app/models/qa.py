"""QA rubric snapshots and scoring results."""

from __future__ import annotations

from sqlalchemy import Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, new_uuid


class Rubric(Base, TimestampMixin):
    """Immutable snapshot of the exact rubric YAML that scored a call."""

    __tablename__ = "rubrics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    eso_id: Mapped[str] = mapped_column(String(128))
    name: Mapped[str] = mapped_column(String(256))
    version: Mapped[str] = mapped_column(String(32))
    yaml_source: Mapped[str] = mapped_column(Text)


class QAScore(Base, TimestampMixin):
    __tablename__ = "qa_scores"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    call_id: Mapped[str] = mapped_column(String(36), ForeignKey("calls.id"), unique=True)
    rubric_id: Mapped[str] = mapped_column(String(36), ForeignKey("rubrics.id"))
    overall_score: Mapped[float] = mapped_column(Float)
    model_name: Mapped[str] = mapped_column(String(128))
    model_version: Mapped[str] = mapped_column(String(64))
    prompt_version: Mapped[str] = mapped_column(String(64))

    call: Mapped["Call"] = relationship(back_populates="qa_score")
    criterion_scores: Mapped[list["QACriterionScore"]] = relationship(back_populates="qa_score")


class QACriterionScore(Base):
    __tablename__ = "qa_criterion_scores"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    qa_score_id: Mapped[str] = mapped_column(String(36), ForeignKey("qa_scores.id"))
    criterion_key: Mapped[str] = mapped_column(String(64))
    score: Mapped[float] = mapped_column(Float)
    weight: Mapped[float] = mapped_column(Float)
    rationale: Mapped[str] = mapped_column(Text)

    qa_score: Mapped["QAScore"] = relationship(back_populates="criterion_scores")
