"""Caller vocal-distress analysis interface.

Distinct from the text-based QA rubric: this looks at *how* something was
said (pace, pitch variance, energy/tremor, silence) rather than *what* was
said. Any backend (transcript-derived heuristics for local dev, real
acoustic signal processing when audio bytes are available) implements
DistressAnalyzer so the pipeline never depends on a specific approach.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum

from app.transcription.interface import TranscriptResult


class DistressMarkerKind(str, Enum):
    RAPID_SPEECH_RATE = "rapid_speech_rate"
    VOCAL_TREMOR = "vocal_tremor"
    PROLONGED_SILENCE = "prolonged_silence"
    ENERGY_SPIKE = "energy_spike"
    ELEVATED_PITCH_VARIANCE = "elevated_pitch_variance"


class Severity(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"


@dataclass(frozen=True)
class DistressMarker:
    kind: DistressMarkerKind
    value: float
    severity: Severity
    timestamp_ms: int
    description: str
    segment_index: int | None = None


@dataclass(frozen=True)
class DistressResult:
    call_id: str
    overall_distress_score: float
    markers: list[DistressMarker]
    adapter_name: str
    adapter_version: str
    detail: dict = field(default_factory=dict)


class DistressAnalyzer(ABC):
    name: str
    version: str

    @abstractmethod
    async def analyze(self, audio_ref: str, transcript: TranscriptResult) -> DistressResult: ...
