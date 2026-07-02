"""CAD extractor selection, mirroring app/translation/factory.py."""

from __future__ import annotations

from typing import TYPE_CHECKING

from app.cad.interface import CadExtractor
from app.cad.mock_extractor import MockCadExtractor

if TYPE_CHECKING:
    from app.config import Settings


def get_cad_extractor(settings: "Settings") -> CadExtractor:
    if settings.AEGIS_LLM_PROVIDER == "mock":
        return MockCadExtractor()

    from llm import get_provider
    from llm.core.types import ProviderType

    from app.cad.llm_extractor import LLMCadExtractor

    return LLMCadExtractor(model=get_provider(ProviderType.CLAUDE))
