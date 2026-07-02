"""Transcription provider interface.

Any speech-to-text backend (hosted API, self-hosted Whisper-class model,
mock fixture) implements TranscriptionAdapter so the rest of the pipeline
never depends on a specific vendor.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum


class Speaker(str, Enum):
    CALL_TAKER = "call_taker"
    CALLER = "caller"
    UNKNOWN = "unknown"


@dataclass(frozen=True)
class TranscriptSegment:
    speaker: Speaker
    start_ms: int
    end_ms: int
    text: str
    confidence: float
    language: str = "en-AU"


@dataclass(frozen=True)
class TranscriptResult:
    call_id: str
    segments: list[TranscriptSegment]
    adapter_name: str
    adapter_version: str
    non_english_detected: bool = False
    detected_languages: list[str] = field(default_factory=lambda: ["en-AU"])

    def to_text(self) -> str:
        return "\n".join(f"[{s.start_ms}ms] {s.speaker.value}: {s.text}" for s in self.segments)


class TranscriptionAdapter(ABC):
    name: str
    version: str

    @abstractmethod
    async def transcribe(self, audio_ref: str) -> TranscriptResult: ...
