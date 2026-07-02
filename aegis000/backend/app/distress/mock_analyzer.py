"""Transcript-derived distress heuristics — no raw audio required.

Estimates vocal-distress proxies from what's already in the transcript
(timing, word count, punctuation, repetition) so it runs in the same
mock-first, no-audio-needed local dev flow as MockTranscriptionAdapter.
Real acoustic analysis (pitch/energy on raw PCM) lives in
signal_analyzer.py as the swap-in path once real audio is available.
"""

from __future__ import annotations

import re

from app.distress.interface import (
    DistressAnalyzer,
    DistressMarker,
    DistressMarkerKind,
    DistressResult,
    Severity,
)
from app.transcription.interface import Speaker, TranscriptResult, TranscriptSegment

RAPID_SPEECH_WPS = 3.0  # words/second considered rapid for emergency call speech
PROLONGED_SILENCE_MS = 4000
REPEATED_WORD_PATTERN = re.compile(r"\b(\w+)\b(?:\s+\1\b)+", re.IGNORECASE)


def _severity_for_ratio(ratio: float) -> Severity:
    if ratio >= 1.6:
        return Severity.HIGH
    if ratio >= 1.2:
        return Severity.MODERATE
    return Severity.LOW


def _speech_rate_wps(segment: TranscriptSegment) -> float:
    duration_s = max((segment.end_ms - segment.start_ms) / 1000, 0.1)
    word_count = len(segment.text.split())
    return word_count / duration_s


def _tremor_score(segment: TranscriptSegment) -> float:
    text = segment.text
    exclamations = text.count("!")
    caps_words = sum(1 for w in text.split() if len(w) > 2 and w.isupper())
    repeated = len(REPEATED_WORD_PATTERN.findall(text))
    low_confidence = 1 if segment.confidence < 0.9 else 0
    return exclamations + caps_words + repeated + low_confidence * 0.5


class MockDistressAnalyzer(DistressAnalyzer):
    name = "mock-distress"
    version = "mock-1"

    async def analyze(self, audio_ref: str, transcript: TranscriptResult) -> DistressResult:
        caller_segments = [
            (i, s) for i, s in enumerate(transcript.segments) if s.speaker == Speaker.CALLER
        ]
        markers: list[DistressMarker] = []

        for i, segment in caller_segments:
            rate = _speech_rate_wps(segment)
            if rate > RAPID_SPEECH_WPS:
                ratio = rate / RAPID_SPEECH_WPS
                markers.append(
                    DistressMarker(
                        kind=DistressMarkerKind.RAPID_SPEECH_RATE,
                        value=round(rate, 2),
                        severity=_severity_for_ratio(ratio),
                        timestamp_ms=segment.start_ms,
                        description=f"Caller speech rate {rate:.1f} words/sec (threshold {RAPID_SPEECH_WPS}).",
                        segment_index=i,
                    )
                )

            tremor = _tremor_score(segment)
            if tremor >= 1:
                markers.append(
                    DistressMarker(
                        kind=DistressMarkerKind.VOCAL_TREMOR,
                        value=tremor,
                        severity=_severity_for_ratio(1 + tremor / 2),
                        timestamp_ms=segment.start_ms,
                        description="Punctuation/repetition/low-confidence transcription proxy for vocal tremor.",
                        segment_index=i,
                    )
                )

        for (i, current), (_, nxt) in zip(caller_segments, caller_segments[1:]):
            gap_ms = nxt.start_ms - current.end_ms
            if gap_ms >= PROLONGED_SILENCE_MS:
                markers.append(
                    DistressMarker(
                        kind=DistressMarkerKind.PROLONGED_SILENCE,
                        value=float(gap_ms),
                        severity=_severity_for_ratio(gap_ms / PROLONGED_SILENCE_MS),
                        timestamp_ms=current.end_ms,
                        description=f"{gap_ms}ms silence from caller after speaking.",
                        segment_index=i,
                    )
                )

        overall_score = self._score(markers)

        return DistressResult(
            call_id=audio_ref,
            overall_distress_score=overall_score,
            markers=markers,
            adapter_name=self.name,
            adapter_version=self.version,
        )

    @staticmethod
    def _score(markers: list[DistressMarker]) -> float:
        if not markers:
            return 0.0
        weights = {Severity.LOW: 0.25, Severity.MODERATE: 0.55, Severity.HIGH: 0.9}
        total = sum(weights[m.severity] for m in markers)
        return round(min(total / max(len(markers), 1) * min(len(markers) / 3, 1.5), 1.0), 4)
