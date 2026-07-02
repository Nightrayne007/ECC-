"""Real acoustic-signal distress analysis on raw PCM audio.

Swap-in path for when raw audio bytes become available (e.g. from the
AudioTap in app/ingestion/tap.py backed by real call recording storage).
Not wired into the default pipeline in Phase 1 — MockDistressAnalyzer is
the default, since there's no real audio source yet. This module is real,
tested signal processing (autocorrelation pitch tracking + RMS energy),
not a mock: it's unit-tested against synthetic sine-wave audio with known
frequency/amplitude in tests/backend/test_distress_signal_analyzer.py.

Deliberately implemented in plain numpy rather than a heavier DSP library
(e.g. librosa) to keep the dependency footprint small for a Phase 1 swap-in
path that isn't on the default critical path.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

import numpy as np

from app.distress.interface import (
    DistressAnalyzer,
    DistressMarker,
    DistressMarkerKind,
    DistressResult,
    Severity,
)
from app.transcription.interface import TranscriptResult

FRAME_MS = 40
HOP_MS = 20
F0_MIN_HZ = 60.0
F0_MAX_HZ = 400.0
VOICED_RMS_THRESHOLD = 0.01
ENERGY_SPIKE_STD_MULTIPLIER = 2.0
PITCH_VARIANCE_HZ_THRESHOLD = 35.0


@dataclass(frozen=True)
class FrameMetrics:
    timestamp_ms: int
    rms: float
    f0_hz: float | None


def frame_rms(frame: np.ndarray) -> float:
    if frame.size == 0:
        return 0.0
    return float(np.sqrt(np.mean(np.square(frame))))


def estimate_pitch_autocorrelation(frame: np.ndarray, sample_rate: int) -> float | None:
    """Estimate fundamental frequency of one frame via autocorrelation.

    Returns None for unvoiced/silent frames (below RMS threshold) or when
    no clear periodicity is found in the [F0_MIN_HZ, F0_MAX_HZ] band.
    """
    if frame_rms(frame) < VOICED_RMS_THRESHOLD:
        return None

    windowed = frame * np.hanning(len(frame))
    autocorr = np.correlate(windowed, windowed, mode="full")
    autocorr = autocorr[len(autocorr) // 2 :]

    min_lag = int(sample_rate / F0_MAX_HZ)
    max_lag = int(sample_rate / F0_MIN_HZ)
    max_lag = min(max_lag, len(autocorr) - 1)
    if min_lag >= max_lag:
        return None

    search_window = autocorr[min_lag:max_lag]
    if search_window.size == 0 or np.max(search_window) <= 0:
        return None

    peak_lag = min_lag + int(np.argmax(search_window))
    if peak_lag == 0:
        return None
    return sample_rate / peak_lag


def compute_frame_metrics(samples: np.ndarray, sample_rate: int) -> list[FrameMetrics]:
    frame_size = int(sample_rate * FRAME_MS / 1000)
    hop_size = int(sample_rate * HOP_MS / 1000)
    frames: list[FrameMetrics] = []

    for start in range(0, max(len(samples) - frame_size, 0) + 1, hop_size):
        frame = samples[start : start + frame_size]
        timestamp_ms = int(start / sample_rate * 1000)
        frames.append(
            FrameMetrics(
                timestamp_ms=timestamp_ms,
                rms=frame_rms(frame),
                f0_hz=estimate_pitch_autocorrelation(frame, sample_rate),
            )
        )
    return frames


def detect_energy_spikes(frames: list[FrameMetrics]) -> list[FrameMetrics]:
    rms_values = np.array([f.rms for f in frames])
    if rms_values.size == 0:
        return []
    baseline = float(np.mean(rms_values))
    threshold = baseline + ENERGY_SPIKE_STD_MULTIPLIER * float(np.std(rms_values))
    return [f for f in frames if f.rms > threshold and f.rms > VOICED_RMS_THRESHOLD]


def pitch_variance_hz(frames: list[FrameMetrics]) -> float | None:
    voiced = [f.f0_hz for f in frames if f.f0_hz is not None]
    if len(voiced) < 2:
        return None
    return float(np.std(voiced))


AudioLoader = Callable[[str], tuple[np.ndarray, int]]
"""Resolves an audio_ref to (mono float32 samples in [-1, 1], sample_rate_hz)."""


class SignalDistressAnalyzer(DistressAnalyzer):
    name = "signal-distress"
    version = "v1"

    def __init__(self, audio_loader: AudioLoader) -> None:
        self._audio_loader = audio_loader

    async def analyze(self, audio_ref: str, transcript: TranscriptResult) -> DistressResult:
        samples, sample_rate = self._audio_loader(audio_ref)
        frames = compute_frame_metrics(samples, sample_rate)

        markers: list[DistressMarker] = []

        for spike in detect_energy_spikes(frames):
            markers.append(
                DistressMarker(
                    kind=DistressMarkerKind.ENERGY_SPIKE,
                    value=round(spike.rms, 4),
                    severity=Severity.HIGH if spike.rms > VOICED_RMS_THRESHOLD * 4 else Severity.MODERATE,
                    timestamp_ms=spike.timestamp_ms,
                    description=f"RMS energy spike ({spike.rms:.3f}) above rolling baseline.",
                )
            )

        variance = pitch_variance_hz(frames)
        if variance is not None and variance > PITCH_VARIANCE_HZ_THRESHOLD:
            ratio = variance / PITCH_VARIANCE_HZ_THRESHOLD
            markers.append(
                DistressMarker(
                    kind=DistressMarkerKind.ELEVATED_PITCH_VARIANCE,
                    value=round(variance, 2),
                    severity=Severity.HIGH if ratio >= 1.6 else Severity.MODERATE,
                    timestamp_ms=frames[0].timestamp_ms if frames else 0,
                    description=f"Pitch (F0) std-dev {variance:.1f}Hz across voiced frames (threshold {PITCH_VARIANCE_HZ_THRESHOLD}Hz).",
                )
            )

        overall_score = _score(markers)
        return DistressResult(
            call_id=audio_ref,
            overall_distress_score=overall_score,
            markers=markers,
            adapter_name=self.name,
            adapter_version=self.version,
            detail={"frame_count": len(frames), "pitch_variance_hz": variance},
        )


def _score(markers: list[DistressMarker]) -> float:
    if not markers:
        return 0.0
    weights = {Severity.LOW: 0.25, Severity.MODERATE: 0.55, Severity.HIGH: 0.9}
    total = sum(weights[m.severity] for m in markers)
    return round(min(total / max(len(markers), 1) * min(len(markers) / 3, 1.5), 1.0), 4)
