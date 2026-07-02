"""Hand-written fixture transcripts used by the mock transcription adapter."""

from __future__ import annotations

from app.transcription.interface import Speaker, TranscriptSegment

# 000-mock-001: chest pain call, scores well on protocol adherence + empathy.
CHEST_PAIN_CALL = [
    TranscriptSegment(Speaker.CALL_TAKER, 0, 3000, "Triple Zero, is this a police, fire, or ambulance emergency?", 0.98),
    TranscriptSegment(Speaker.CALLER, 3200, 7000, "Ambulance, my husband is having chest pain, it's really bad.", 0.95),
    TranscriptSegment(Speaker.CALL_TAKER, 7200, 10500, "Okay, I'm sending help right now. What's your address?", 0.97),
    TranscriptSegment(Speaker.CALLER, 10800, 14000, "42 Wattle Street, Coburg, Victoria.", 0.93),
    TranscriptSegment(Speaker.CALL_TAKER, 14200, 18000, "Thank you, help is on the way. Is he conscious and breathing?", 0.98),
    TranscriptSegment(Speaker.CALLER, 18200, 21000, "Yes, he's conscious, he says the chest pain is severe.", 0.94),
    TranscriptSegment(Speaker.CALL_TAKER, 21200, 26000, "I understand this is frightening. Stay with him, I'll stay on the line with you.", 0.97),
]

# 000-mock-002: weapon call, "knife" trigger, weaker empathy/call-control.
KNIFE_CALL = [
    TranscriptSegment(Speaker.CALL_TAKER, 0, 2500, "Triple Zero emergency.", 0.96),
    TranscriptSegment(Speaker.CALLER, 2700, 6000, "There's a man outside with a knife, he's threatening my neighbour!", 0.92),
    TranscriptSegment(Speaker.CALL_TAKER, 6200, 8000, "Address, now.", 0.9),
    TranscriptSegment(Speaker.CALLER, 8200, 11000, "15 Grey Street, Bankstown, New South Wales.", 0.91),
    TranscriptSegment(Speaker.CALL_TAKER, 11200, 13500, "Police are on the way. Stay inside.", 0.95),
]

# 000-mock-003: non-English caller, triggers non_english_detected.
NON_ENGLISH_CALL = [
    TranscriptSegment(Speaker.CALL_TAKER, 0, 3000, "Triple Zero, what's your emergency?", 0.97),
    TranscriptSegment(Speaker.CALLER, 3200, 8000, "Bisogno di un'ambulanza, mio padre non respira bene.", 0.88, language="it"),
    TranscriptSegment(Speaker.CALL_TAKER, 8200, 11000, "I'll connect an interpreter, please stay on the line.", 0.96),
    TranscriptSegment(Speaker.CALLER, 11200, 15000, "Via Roma numero dieci, Melbourne.", 0.85, language="it"),
]

# 000-mock-004: "not breathing" medical trigger.
NOT_BREATHING_CALL = [
    TranscriptSegment(Speaker.CALL_TAKER, 0, 2500, "Triple Zero, is this police, fire, or ambulance?", 0.98),
    TranscriptSegment(Speaker.CALLER, 2700, 6500, "Ambulance please, my baby is not breathing!", 0.9),
    TranscriptSegment(Speaker.CALL_TAKER, 6700, 9000, "I'm sending help immediately. What's your address?", 0.97),
    TranscriptSegment(Speaker.CALLER, 9200, 12000, "8 Fern Court, Toowoomba, Queensland.", 0.92),
    TranscriptSegment(Speaker.CALL_TAKER, 12200, 17000, "Help is on the way. I'm going to guide you through infant CPR right now.", 0.96),
]

FIXTURES: dict[str, list[TranscriptSegment]] = {
    "000-mock-001": CHEST_PAIN_CALL,
    "000-mock-002": KNIFE_CALL,
    "000-mock-003": NON_ENGLISH_CALL,
    "000-mock-004": NOT_BREATHING_CALL,
}
