"""CAD field pre-fill extraction prompt, version 1."""

from __future__ import annotations

PROMPT_VERSION = "cad-prefill-v1"

SYSTEM_PROMPT = (
    "You are extracting structured dispatch fields from an Australian "
    "emergency (Triple Zero) call transcript, for a human call-taker to "
    "review and confirm before submitting to a CAD (computer-aided "
    "dispatch) system. This is a draft only — never state or imply it has "
    "already been dispatched. Respond with JSON only, no prose, matching "
    'this exact shape: {"incident_type": "<short label>", "location_text": '
    '"<address or null>", "hazards": ["<phrase>", ...], "notes": "<one or '
    'two sentence summary>", "confidence": <0.0-1.0>}. If no address is '
    "stated, use null for location_text, don't guess."
)


def render(transcript_text: str) -> str:
    return f"Transcript:\n{transcript_text}\n\nExtract the CAD pre-fill fields described in your instructions."
