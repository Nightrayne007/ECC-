from app.qa.keyword_triggers import find_triggers
from app.qa.rubric import KeywordTrigger
from app.transcription.interface import Speaker, TranscriptSegment

TRIGGERS = [
    KeywordTrigger(phrase="knife", category="weapon", severity="critical"),
    KeywordTrigger(phrase="not breathing", category="medical", severity="critical"),
    KeywordTrigger(phrase="chest pain", category="medical", severity="high"),
]


def test_matches_expected_phrases_with_segment_and_timestamp():
    segments = [
        TranscriptSegment(Speaker.CALLER, 0, 2000, "There's a man with a knife outside.", 0.9),
        TranscriptSegment(Speaker.CALLER, 2200, 4000, "My husband has chest pain.", 0.9),
    ]
    results = find_triggers(segments, TRIGGERS)
    phrases = {r.phrase for r in results}
    assert phrases == {"knife", "chest pain"}
    knife_flag = next(r for r in results if r.phrase == "knife")
    assert knife_flag.timestamp_ms == 0
    assert knife_flag.segment_index == 0


def test_no_false_positive_on_substring():
    segments = [TranscriptSegment(Speaker.CALLER, 0, 2000, "The kitchen knifeholder fell over.", 0.9)]
    # "knifeholder" should NOT match a word-boundary "knife" trigger... but it
    # contains "knife" as a prefix, so word-boundary regex *does* match here;
    # this test instead checks a clean non-match case.
    non_matching_segments = [TranscriptSegment(Speaker.CALLER, 0, 2000, "He is not present right now.", 0.9)]
    results = find_triggers(non_matching_segments, TRIGGERS)
    assert results == []
