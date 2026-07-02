"""Automated CAD field pre-fill.

Phase 2. Extracts structured, dispatch-relevant fields (incident type,
location, hazards) from the transcript so a call-taker can confirm and
submit them faster, instead of typing them into the CAD system by hand.

Non-negotiable per the life-safety architecture principle: this module
only ever produces a *draft* — CadPrefillResult — for a human to review.
Nothing in this codebase submits a CadPrefillResult to a real CAD system;
there is no such integration, and none should be added without an
explicit, human-in-the-loop confirmation step. See docs/failover-design.md.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field

from app.qa.keyword_triggers import FlagResult
from app.transcription.interface import TranscriptResult
from app.translation.interface import TranslatedSegment


@dataclass(frozen=True)
class CadPrefillResult:
    incident_type: str
    location_text: str | None
    hazards: list[str]
    notes: str
    confidence: float
    model_name: str
    model_version: str
    detail: dict = field(default_factory=dict)


class CadExtractor(ABC):
    name: str
    version: str

    @abstractmethod
    async def extract(
        self,
        transcript: TranscriptResult,
        translations: list[TranslatedSegment] | None = None,
        triggers: list[FlagResult] | None = None,
    ) -> CadPrefillResult:
        """translations/triggers are optional context already computed
        elsewhere in the pipeline — reused here rather than recomputed."""
        ...
