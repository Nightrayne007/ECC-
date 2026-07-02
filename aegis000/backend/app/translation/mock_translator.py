"""Deterministic mock translator — no API key, no network call.

Ships canned translations for the known non-English fixture phrases (see
app/transcription/fixtures.py) so the local dev flow demonstrates real
value. Any other non-English text gets a clearly-labeled placeholder
rather than a fabricated-looking translation — a mock must never produce
output that could pass for a real translation of unseen content, since a
mistranslated address or symptom in a genuine emergency call is exactly
the failure mode this system exists to avoid.
"""

from __future__ import annotations

from app.transcription.interface import TranscriptSegment
from app.translation.interface import TranscriptTranslator, TranslatedSegment

_KNOWN_TRANSLATIONS: dict[str, str] = {
    "Bisogno di un'ambulanza, mio padre non respira bene.": "I need an ambulance, my father is not breathing well.",
    "Via Roma numero dieci, Melbourne.": "Via Roma number ten, Melbourne.",
}


class MockTranscriptTranslator(TranscriptTranslator):
    name = "mock-translator"
    version = "mock-1"

    async def translate_segments(
        self, segments: list[TranscriptSegment], target_lang: str = "en-AU"
    ) -> list[TranslatedSegment]:
        results: list[TranslatedSegment] = []
        for i, segment in enumerate(segments):
            if segment.language == target_lang:
                continue
            translated_text = _KNOWN_TRANSLATIONS.get(segment.text)
            if translated_text is None:
                translated_text = f"[mock translation unavailable for unseen {segment.language} text]"
            results.append(
                TranslatedSegment(
                    segment_index=i,
                    source_lang=segment.language,
                    target_lang=target_lang,
                    original_text=segment.text,
                    translated_text=translated_text,
                    model_name=self.name,
                    model_version=self.version,
                )
            )
        return results
