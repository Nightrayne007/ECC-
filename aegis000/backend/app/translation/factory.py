"""Translator selection, mirroring app/qa/llm_client.get_scoring_model.

Reuses AEGIS_LLM_PROVIDER (not a separate flag) since both QA scoring and
translation are backed by the same underlying LLM abstraction/credentials.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from app.translation.interface import TranscriptTranslator
from app.translation.mock_translator import MockTranscriptTranslator

if TYPE_CHECKING:
    from app.config import Settings


def get_translator(settings: "Settings") -> TranscriptTranslator:
    if settings.AEGIS_LLM_PROVIDER == "mock":
        return MockTranscriptTranslator()

    from llm import get_provider
    from llm.core.types import ProviderType

    from app.translation.llm_translator import LLMTranscriptTranslator

    return LLMTranscriptTranslator(model=get_provider(ProviderType.CLAUDE))
