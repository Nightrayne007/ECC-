"""Deterministic keyword/phrase flag matching — independent of any LLM.

Flags must never drift with model behaviour, so this is pure regex matching
against transcript segments rather than something an LLM decides.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from app.qa.rubric import KeywordTrigger
from app.transcription.interface import TranscriptSegment


@dataclass(frozen=True)
class FlagResult:
    phrase: str
    category: str
    severity: str
    snippet: str
    timestamp_ms: int
    segment_index: int


def find_triggers(segments: list[TranscriptSegment], triggers: list[KeywordTrigger]) -> list[FlagResult]:
    results: list[FlagResult] = []
    for idx, segment in enumerate(segments):
        for trigger in triggers:
            pattern = r"\b" + re.escape(trigger.phrase) + r"\b"
            if re.search(pattern, segment.text, flags=re.IGNORECASE):
                results.append(
                    FlagResult(
                        phrase=trigger.phrase,
                        category=trigger.category,
                        severity=trigger.severity,
                        snippet=segment.text,
                        timestamp_ms=segment.start_ms,
                        segment_index=idx,
                    )
                )
    return results
