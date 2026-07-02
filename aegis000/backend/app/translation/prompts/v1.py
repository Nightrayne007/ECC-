"""Translation prompt, version 1. Versioned like app/qa/prompts for the
same reason: a translated address or symptom feeds directly into dispatch,
so every translation must be traceable to the exact prompt that produced
it via the audit log.
"""

from __future__ import annotations

PROMPT_VERSION = "translation-v1"

SYSTEM_PROMPT = (
    "You are a translator for Australian emergency (Triple Zero) call "
    "transcripts. Translate the given text accurately into the target "
    "language, preserving all factual details exactly — addresses, "
    "numbers, names, and described symptoms must not be altered or "
    "approximated. Respond with the translation only, no commentary, no "
    "quotation marks."
)


def render(text: str, source_lang: str, target_lang: str) -> str:
    return f"Source language: {source_lang}\nTarget language: {target_lang}\nText: {text}"
