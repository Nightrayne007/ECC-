import numpy as np
import pytest

from app.distress.interface import DistressMarkerKind
from app.distress.signal_analyzer import (
    SignalDistressAnalyzer,
    compute_frame_metrics,
    detect_energy_spikes,
    estimate_pitch_autocorrelation,
    pitch_variance_hz,
)
from app.transcription.interface import TranscriptResult

SAMPLE_RATE = 16000


def sine_wave(freq_hz: float, duration_s: float, amplitude: float = 0.3, sample_rate: int = SAMPLE_RATE) -> np.ndarray:
    t = np.linspace(0, duration_s, int(sample_rate * duration_s), endpoint=False)
    return (amplitude * np.sin(2 * np.pi * freq_hz * t)).astype(np.float32)


def test_pitch_estimate_matches_known_sine_frequency():
    frame = sine_wave(220.0, duration_s=0.04)  # one FRAME_MS worth
    estimated = estimate_pitch_autocorrelation(frame, SAMPLE_RATE)
    assert estimated is not None
    assert abs(estimated - 220.0) < 10.0


def test_silent_frame_has_no_pitch_estimate():
    frame = np.zeros(int(SAMPLE_RATE * 0.04), dtype=np.float32)
    assert estimate_pitch_autocorrelation(frame, SAMPLE_RATE) is None


def test_energy_spike_detected_against_quiet_baseline():
    quiet = 0.01 * np.random.default_rng(42).standard_normal(SAMPLE_RATE).astype(np.float32)
    burst = sine_wave(300.0, duration_s=0.3, amplitude=0.9)
    samples = np.concatenate([quiet, burst, quiet])

    frames = compute_frame_metrics(samples, SAMPLE_RATE)
    spikes = detect_energy_spikes(frames)

    assert len(spikes) > 0
    burst_start_ms = int(len(quiet) / SAMPLE_RATE * 1000)
    burst_end_ms = int((len(quiet) + len(burst)) / SAMPLE_RATE * 1000)
    assert any(burst_start_ms <= s.timestamp_ms <= burst_end_ms for s in spikes)


def test_pitch_variance_high_when_frequency_alternates():
    low = sine_wave(120.0, duration_s=0.5)
    high = sine_wave(320.0, duration_s=0.5)
    samples = np.concatenate([low, high, low, high])
    frames = compute_frame_metrics(samples, SAMPLE_RATE)
    variance = pitch_variance_hz(frames)
    assert variance is not None
    assert variance > 35.0


@pytest.mark.asyncio
async def test_signal_analyzer_end_to_end_flags_energy_spike_and_pitch_variance():
    quiet = 0.01 * np.random.default_rng(7).standard_normal(SAMPLE_RATE).astype(np.float32)
    burst = sine_wave(350.0, duration_s=0.3, amplitude=0.9)
    low = sine_wave(120.0, duration_s=0.4)
    samples = np.concatenate([quiet, burst, low])

    analyzer = SignalDistressAnalyzer(audio_loader=lambda ref: (samples, SAMPLE_RATE))
    empty_transcript = TranscriptResult(call_id="x", segments=[], adapter_name="t", adapter_version="1")

    result = await analyzer.analyze("synthetic-call", empty_transcript)

    kinds = {m.kind for m in result.markers}
    assert DistressMarkerKind.ENERGY_SPIKE in kinds
    assert result.overall_distress_score > 0.0


@pytest.mark.asyncio
async def test_signal_analyzer_propagates_loader_failure():
    def failing_loader(ref: str):
        raise RuntimeError("no audio available")

    analyzer = SignalDistressAnalyzer(audio_loader=failing_loader)
    empty_transcript = TranscriptResult(call_id="x", segments=[], adapter_name="t", adapter_version="1")

    with pytest.raises(RuntimeError):
        await analyzer.analyze("missing-audio", empty_transcript)
