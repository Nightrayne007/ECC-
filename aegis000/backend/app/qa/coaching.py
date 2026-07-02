"""Auto-extract coaching moments from a low-scoring QA result."""

from __future__ import annotations

from dataclasses import dataclass

from app.qa.scorer import QAScoreResult
from app.transcription.interface import Speaker, TranscriptResult


@dataclass(frozen=True)
class CoachingMoment:
    criterion_key: str
    timestamp_ms: int
    snippet: str
    note: str


def extract_coaching_moments(
    transcript: TranscriptResult, qa_result: QAScoreResult, threshold: float = 0.6
) -> list[CoachingMoment]:
    moments: list[CoachingMoment] = []
    caller_segments = [s for s in transcript.segments if s.speaker == Speaker.CALLER]

    for criterion in qa_result.criterion_scores:
        if criterion.score >= threshold:
            continue
        anchor = transcript.segments[0] if transcript.segments else None
        if caller_segments:
            anchor = caller_segments[0]
        if anchor is None:
            continue
        moments.append(
            CoachingMoment(
                criterion_key=criterion.key,
                timestamp_ms=anchor.start_ms,
                snippet=anchor.text,
                note=f"Below target on '{criterion.key}' ({criterion.score:.2f}): {criterion.rationale}",
            )
        )
    return moments
