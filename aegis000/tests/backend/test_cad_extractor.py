import pytest

from app.cad.mock_extractor import MockCadExtractor
from app.qa.keyword_triggers import FlagResult
from app.transcription.interface import Speaker, TranscriptResult, TranscriptSegment
from app.translation.interface import TranslatedSegment


def _transcript(segments: list[TranscriptSegment]) -> TranscriptResult:
    return TranscriptResult(call_id="t1", segments=segments, adapter_name="test", adapter_version="1")


@pytest.mark.asyncio
async def test_extracts_address_from_caller_segment():
    segments = [
        TranscriptSegment(Speaker.CALL_TAKER, 0, 2000, "What's your address?", 0.98),
        TranscriptSegment(Speaker.CALLER, 2200, 5000, "42 Wattle Street, Coburg, Victoria.", 0.95),
    ]
    result = await MockCadExtractor().extract(_transcript(segments))
    assert result.location_text == "42 Wattle Street, Coburg, Victoria"


@pytest.mark.asyncio
async def test_no_address_present_returns_none_not_a_guess():
    segments = [
        TranscriptSegment(Speaker.CALLER, 0, 2000, "Please send someone quickly.", 0.95),
    ]
    result = await MockCadExtractor().extract(_transcript(segments))
    assert result.location_text is None


@pytest.mark.asyncio
async def test_incident_type_classified_from_highest_severity_trigger():
    segments = [
        TranscriptSegment(Speaker.CALLER, 0, 2000, "There's a man with a knife.", 0.95),
        TranscriptSegment(Speaker.CALLER, 2200, 4000, "He also has chest pain.", 0.95),
    ]
    triggers = [
        FlagResult("chest pain", "medical", "high", "He also has chest pain.", 2200, 1),
        FlagResult("knife", "weapon", "critical", "There's a man with a knife.", 0, 0),
    ]
    result = await MockCadExtractor().extract(_transcript(segments), triggers=triggers)
    assert result.incident_type == "Police — Weapons Offence"
    assert set(result.hazards) == {"knife", "chest pain"}


@pytest.mark.asyncio
async def test_no_triggers_yields_unclassified_incident_type():
    segments = [TranscriptSegment(Speaker.CALLER, 0, 2000, "My neighbour has fallen over.", 0.95)]
    result = await MockCadExtractor().extract(_transcript(segments))
    assert result.incident_type == "Unclassified — Review Required"


@pytest.mark.asyncio
async def test_uses_translated_text_when_original_is_non_english():
    segments = [
        TranscriptSegment(Speaker.CALLER, 0, 3000, "Via Roma numero dieci, Melbourne.", 0.9, language="it"),
    ]
    translations = [
        TranslatedSegment(
            segment_index=0,
            source_lang="it",
            target_lang="en-AU",
            original_text="Via Roma numero dieci, Melbourne.",
            translated_text="10 Roma Way, Melbourne, Victoria.",
            model_name="mock-translator",
            model_version="mock-1",
        )
    ]
    result = await MockCadExtractor().extract(_transcript(segments), translations=translations)
    assert result.location_text == "10 Roma Way, Melbourne, Victoria"


@pytest.mark.asyncio
async def test_confidence_higher_when_address_and_incident_type_both_found():
    segments = [TranscriptSegment(Speaker.CALLER, 0, 2000, "42 Wattle Street, Coburg, Victoria.", 0.95)]
    triggers = [FlagResult("chest pain", "medical", "high", "x", 0, 0)]

    with_both = await MockCadExtractor().extract(_transcript(segments), triggers=triggers)
    with_neither = await MockCadExtractor().extract(
        _transcript([TranscriptSegment(Speaker.CALLER, 0, 2000, "Please help.", 0.95)])
    )
    assert with_both.confidence > with_neither.confidence
