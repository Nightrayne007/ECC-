"""API response schemas for calls, transcripts, and QA scores."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SegmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    speaker: str
    start_ms: int
    end_ms: int
    text: str
    confidence: float


class FlagOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    phrase: str
    category: str
    severity: str
    snippet: str
    timestamp_ms: int


class CoachingMomentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    criterion_key: str
    timestamp_ms: int
    snippet: str
    note: str


class CriterionScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    criterion_key: str
    score: float
    weight: float
    rationale: str


class QAScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    overall_score: float
    model_name: str
    model_version: str
    prompt_version: str
    criterion_scores: list[CriterionScoreOut]


class DistressMarkerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    kind: str
    value: float
    severity: str
    timestamp_ms: int
    description: str


class DistressAssessmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    overall_distress_score: float
    model_name: str
    model_version: str
    markers: list[DistressMarkerOut]


class CallSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    agent_id: str
    started_at: datetime
    duration_seconds: int
    language_detected: str
    non_english_flag: bool
    overall_score: float | None
    flag_count: int
    distress_score: float | None


class CallDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    agent_id: str
    started_at: datetime
    duration_seconds: int
    language_detected: str
    non_english_flag: bool
    segments: list[SegmentOut]
    qa_score: QAScoreOut | None
    flags: list[FlagOut]
    coaching_moments: list[CoachingMomentOut]
    distress_assessment: DistressAssessmentOut | None


class AgentTrendPointOut(BaseModel):
    period: str
    avg_score: float
    call_count: int


class AuditEntryOut(BaseModel):
    id: str
    action: str
    model_name: str
    model_version: str
    prompt_version: str | None
    input_hash: str
    output_hash: str
    created_at: datetime
    verified: bool
