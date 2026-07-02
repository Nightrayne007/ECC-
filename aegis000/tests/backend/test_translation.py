import pytest

from app.transcription.interface import Speaker, TranscriptSegment
from app.translation.mock_translator import MockTranscriptTranslator


@pytest.mark.asyncio
async def test_english_only_segments_produce_no_translations():
    segments = [
        TranscriptSegment(Speaker.CALL_TAKER, 0, 2000, "Triple Zero emergency.", 0.98),
        TranscriptSegment(Speaker.CALLER, 2200, 5000, "My neighbour has fallen.", 0.95),
    ]
    result = await MockTranscriptTranslator().translate_segments(segments)
    assert result == []


@pytest.mark.asyncio
async def test_known_italian_fixture_translated_correctly():
    segments = [
        TranscriptSegment(
            Speaker.CALLER,
            0,
            4000,
            "Bisogno di un'ambulanza, mio padre non respira bene.",
            0.88,
            language="it",
        ),
    ]
    result = await MockTranscriptTranslator().translate_segments(segments)
    assert len(result) == 1
    assert result[0].source_lang == "it"
    assert result[0].target_lang == "en-AU"
    assert "ambulance" in result[0].translated_text.lower()
    assert "not breathing" in result[0].translated_text.lower()


@pytest.mark.asyncio
async def test_unseen_non_english_text_gets_clearly_labeled_placeholder_not_fabricated_output():
    segments = [
        TranscriptSegment(Speaker.CALLER, 0, 3000, "Ho bisogno di aiuto immediatamente.", 0.9, language="it"),
    ]
    result = await MockTranscriptTranslator().translate_segments(segments)
    assert len(result) == 1
    assert "unavailable" in result[0].translated_text.lower()


@pytest.mark.asyncio
async def test_translation_is_deterministic():
    segments = [
        TranscriptSegment(Speaker.CALLER, 0, 4000, "Via Roma numero dieci, Melbourne.", 0.9, language="it"),
    ]
    translator = MockTranscriptTranslator()
    first = await translator.translate_segments(segments)
    second = await translator.translate_segments(segments)
    assert first == second
