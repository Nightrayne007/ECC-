"""Hosted STT adapter — real HTTP call to a configurable STT endpoint.

Kept as the swap-in path to a production or sovereign/self-hosted
Whisper-class backend for accreditation. Not selected by default; enable
with AEGIS_TRANSCRIPTION_ADAPTER=hosted and STT_ENDPOINT_URL.
"""

from __future__ import annotations

import httpx

from app.transcription.interface import (
    Speaker,
    TranscriptionAdapter,
    TranscriptResult,
    TranscriptSegment,
)


class HostedTranscriptionAdapter(TranscriptionAdapter):
    name = "hosted-stt"
    version = "v1"

    def __init__(self, endpoint_url: str, api_key: str | None = None, timeout_s: float = 30.0) -> None:
        self._endpoint_url = endpoint_url
        self._api_key = api_key
        self._timeout_s = timeout_s

    async def transcribe(self, audio_ref: str) -> TranscriptResult:
        headers = {"Authorization": f"Bearer {self._api_key}"} if self._api_key else {}
        async with httpx.AsyncClient(timeout=self._timeout_s) as client:
            response = await client.post(self._endpoint_url, json={"audio_ref": audio_ref}, headers=headers)
            response.raise_for_status()
            payload = response.json()

        segments = [
            TranscriptSegment(
                speaker=Speaker(seg["speaker"]),
                start_ms=seg["start_ms"],
                end_ms=seg["end_ms"],
                text=seg["text"],
                confidence=seg["confidence"],
                language=seg.get("language", "en-AU"),
            )
            for seg in payload["segments"]
        ]
        detected_languages = sorted({s.language for s in segments})
        return TranscriptResult(
            call_id=audio_ref,
            segments=segments,
            adapter_name=self.name,
            adapter_version=self.version,
            non_english_detected=any(lang != "en-AU" for lang in detected_languages),
            detected_languages=detected_languages,
        )
