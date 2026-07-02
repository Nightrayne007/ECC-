"""Deterministic, regex/keyword-based CAD field extraction — no LLM needed.

Location extraction runs against the *effective* text per segment: the
translated text when a translation exists for that segment, otherwise the
original. This is the practical payoff of doing translation and CAD
pre-fill in the same pass — an address given in Italian still gets
extracted once translated.
"""

from __future__ import annotations

import re

from app.qa.keyword_triggers import FlagResult
from app.transcription.interface import Speaker, TranscriptResult
from app.cad.interface import CadExtractor, CadPrefillResult
from app.translation.interface import TranslatedSegment

ADDRESS_PATTERN = re.compile(
    r"\d+\s+[A-Za-z][A-Za-z\s]*?,\s*[A-Za-z][A-Za-z\s]*?,\s*[A-Za-z][A-Za-z\s]*"
)

_CATEGORY_INCIDENT_TYPE = {
    "weapon": "Police — Weapons Offence",
    "medical": "Ambulance — Medical Emergency",
}
_SEVERITY_RANK = {"critical": 0, "high": 1, "medium": 2, "low": 3}
_DEFAULT_INCIDENT_TYPE = "Unclassified — Review Required"


def _effective_texts(transcript: TranscriptResult, translations: list[TranslatedSegment] | None) -> list[str]:
    overlay = {t.segment_index: t.translated_text for t in (translations or [])}
    return [overlay.get(i, s.text) for i, s in enumerate(transcript.segments)]


def _extract_location(transcript: TranscriptResult, effective_texts: list[str]) -> str | None:
    for i, segment in enumerate(transcript.segments):
        if segment.speaker != Speaker.CALLER:
            continue
        match = ADDRESS_PATTERN.search(effective_texts[i])
        if match:
            return match.group(0).strip().rstrip(".")
    return None


def _classify_incident_type(triggers: list[FlagResult] | None) -> str:
    if not triggers:
        return _DEFAULT_INCIDENT_TYPE
    best = min(triggers, key=lambda t: _SEVERITY_RANK.get(t.severity, 99))
    return _CATEGORY_INCIDENT_TYPE.get(best.category, _DEFAULT_INCIDENT_TYPE)


class MockCadExtractor(CadExtractor):
    name = "mock-cad-extractor"
    version = "mock-1"

    async def extract(
        self,
        transcript: TranscriptResult,
        translations: list[TranslatedSegment] | None = None,
        triggers: list[FlagResult] | None = None,
    ) -> CadPrefillResult:
        effective_texts = _effective_texts(transcript, translations)
        location_text = _extract_location(transcript, effective_texts)
        incident_type = _classify_incident_type(triggers)
        hazards = sorted({t.phrase for t in (triggers or [])})

        caller_texts = [
            effective_texts[i] for i, s in enumerate(transcript.segments) if s.speaker == Speaker.CALLER
        ]
        notes = " ".join(caller_texts)[:280]

        confidence = 0.3
        if location_text:
            confidence += 0.35
        if incident_type != _DEFAULT_INCIDENT_TYPE:
            confidence += 0.35

        return CadPrefillResult(
            incident_type=incident_type,
            location_text=location_text,
            hazards=hazards,
            notes=notes,
            confidence=round(min(confidence, 1.0), 2),
            model_name=self.name,
            model_version=self.version,
        )
