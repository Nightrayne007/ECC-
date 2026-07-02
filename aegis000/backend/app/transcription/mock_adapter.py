"""Deterministic mock transcription adapter — no network calls, no audio."""

from __future__ import annotations

import random
import zlib

from app.transcription.fixtures import FIXTURES
from app.transcription.interface import (
    Speaker,
    TranscriptionAdapter,
    TranscriptResult,
    TranscriptSegment,
)

_SYNTH_LINES = [
    "Triple Zero, what's your emergency?",
    "Okay, I understand. Can you confirm your address?",
    "Help is on the way, please stay on the line.",
    "Is anyone injured?",
    "Thank you, stay calm, I'm here with you.",
]


class MockTranscriptionAdapter(TranscriptionAdapter):
    name = "mock-transcription"
    version = "mock-1"

    async def transcribe(self, audio_ref: str) -> TranscriptResult:
        if audio_ref in FIXTURES:
            segments = FIXTURES[audio_ref]
        else:
            segments = self._synthesize(audio_ref)

        non_english = any(s.language != "en-AU" for s in segments)
        languages = sorted({s.language for s in segments})

        return TranscriptResult(
            call_id=audio_ref,
            segments=segments,
            adapter_name=self.name,
            adapter_version=self.version,
            non_english_detected=non_english,
            detected_languages=languages,
        )

    @staticmethod
    def _synthesize(audio_ref: str) -> list[TranscriptSegment]:
        """Deterministic synthesis for any audio_ref not in FIXTURES, seeded
        by a CRC32 of the ref so repeated seeding runs are reproducible."""
        rng = random.Random(zlib.crc32(audio_ref.encode("utf-8")))
        segments: list[TranscriptSegment] = []
        cursor_ms = 0
        speakers = [Speaker.CALL_TAKER, Speaker.CALLER]
        for i in range(rng.randint(3, 6)):
            duration = rng.randint(2000, 5000)
            segments.append(
                TranscriptSegment(
                    speaker=speakers[i % 2],
                    start_ms=cursor_ms,
                    end_ms=cursor_ms + duration,
                    text=rng.choice(_SYNTH_LINES),
                    confidence=round(rng.uniform(0.85, 0.99), 2),
                )
            )
            cursor_ms += duration + 200
        return segments
