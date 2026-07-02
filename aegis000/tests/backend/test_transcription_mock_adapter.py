import pytest

from app.transcription.mock_adapter import MockTranscriptionAdapter


@pytest.mark.asyncio
async def test_fixture_transcript_is_stable_across_calls():
    adapter = MockTranscriptionAdapter()
    first = await adapter.transcribe("000-mock-001")
    second = await adapter.transcribe("000-mock-001")
    assert [s.text for s in first.segments] == [s.text for s in second.segments]


@pytest.mark.asyncio
async def test_unknown_ref_synthesizes_deterministically():
    adapter = MockTranscriptionAdapter()
    first = await adapter.transcribe("some-unseen-ref-123")
    second = await adapter.transcribe("some-unseen-ref-123")
    assert [(s.text, s.start_ms) for s in first.segments] == [(s.text, s.start_ms) for s in second.segments]
    assert len(first.segments) > 0


@pytest.mark.asyncio
async def test_non_english_flag_set_on_relevant_fixture():
    adapter = MockTranscriptionAdapter()
    result = await adapter.transcribe("000-mock-003")
    assert result.non_english_detected is True
    assert "it" in result.detected_languages


@pytest.mark.asyncio
async def test_english_fixture_not_flagged_non_english():
    adapter = MockTranscriptionAdapter()
    result = await adapter.transcribe("000-mock-001")
    assert result.non_english_detected is False
