import pytest

from app.distress.interface import DistressMarkerKind
from app.distress.mock_analyzer import MockDistressAnalyzer
from app.transcription.interface import Speaker, TranscriptResult, TranscriptSegment


def _transcript(segments: list[TranscriptSegment]) -> TranscriptResult:
    return TranscriptResult(call_id="t1", segments=segments, adapter_name="test", adapter_version="1")


@pytest.mark.asyncio
async def test_calm_transcript_has_no_markers_and_zero_score():
    segments = [
        TranscriptSegment(Speaker.CALL_TAKER, 0, 3000, "Triple Zero, what's your emergency?", 0.98),
        TranscriptSegment(Speaker.CALLER, 3200, 8000, "My neighbour has fallen and hurt his ankle.", 0.97),
    ]
    result = await MockDistressAnalyzer().analyze("call-calm", _transcript(segments))
    assert result.markers == []
    assert result.overall_distress_score == 0.0


@pytest.mark.asyncio
async def test_rapid_speech_rate_detected():
    # 12 words in 1.5s -> 8 words/sec, well above the 3.0 wps threshold
    segments = [
        TranscriptSegment(
            Speaker.CALLER, 0, 1500, "help help please he is not moving at all right now hurry", 0.9
        ),
    ]
    result = await MockDistressAnalyzer().analyze("call-rapid", _transcript(segments))
    kinds = {m.kind for m in result.markers}
    assert DistressMarkerKind.RAPID_SPEECH_RATE in kinds
    assert result.overall_distress_score > 0.0


@pytest.mark.asyncio
async def test_tremor_proxy_from_punctuation_and_repetition():
    segments = [
        TranscriptSegment(Speaker.CALLER, 0, 5000, "HELP HELP no no no please come quickly!!!", 0.99),
    ]
    result = await MockDistressAnalyzer().analyze("call-tremor", _transcript(segments))
    kinds = {m.kind for m in result.markers}
    assert DistressMarkerKind.VOCAL_TREMOR in kinds


@pytest.mark.asyncio
async def test_prolonged_silence_between_caller_segments_detected():
    segments = [
        TranscriptSegment(Speaker.CALLER, 0, 1000, "He's not breathing.", 0.9),
        TranscriptSegment(Speaker.CALLER, 8000, 9000, "Please hurry.", 0.9),
    ]
    result = await MockDistressAnalyzer().analyze("call-silence", _transcript(segments))
    kinds = {m.kind for m in result.markers}
    assert DistressMarkerKind.PROLONGED_SILENCE in kinds


@pytest.mark.asyncio
async def test_analysis_is_deterministic():
    segments = [
        TranscriptSegment(Speaker.CALLER, 0, 1500, "help help please he is not moving hurry", 0.9),
    ]
    transcript = _transcript(segments)
    first = await MockDistressAnalyzer().analyze("call-det", transcript)
    second = await MockDistressAnalyzer().analyze("call-det", transcript)
    assert first.overall_distress_score == second.overall_distress_score
    assert [m.kind for m in first.markers] == [m.kind for m in second.markers]
