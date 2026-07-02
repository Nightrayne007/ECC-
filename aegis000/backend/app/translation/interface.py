"""Live translation of non-English caller speech.

Phase 2. Operates on already-transcribed segments (the same post-hoc
pipeline shape as transcription/QA in Phase 1) rather than raw audio
bytes — "live" in the sense of running automatically per call, not literal
audio-to-audio streaming synthesis, which is out of scope here (no TTS
integration). Model-agnostic: MockTranscriptTranslator for local dev,
LLMTranscriptTranslator (reusing the repo's existing src/llm abstraction,
same pattern as app/qa/llm_client.py) as the real path.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.transcription.interface import TranscriptSegment


@dataclass(frozen=True)
class TranslatedSegment:
    segment_index: int
    source_lang: str
    target_lang: str
    original_text: str
    translated_text: str
    model_name: str
    model_version: str


class TranscriptTranslator(ABC):
    name: str
    version: str

    @abstractmethod
    async def translate_segments(
        self, segments: list[TranscriptSegment], target_lang: str = "en-AU"
    ) -> list[TranslatedSegment]:
        """Translate every segment not already in target_lang. Segments
        already in target_lang are omitted from the result (nothing to
        translate), so callers should treat this as a sparse overlay."""
        ...
