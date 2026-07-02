"""Scoring model boundary.

Per project decision, Aegis000 reuses the repo's existing provider-agnostic
LLM abstraction (src/llm) for the real Anthropic call path rather than
writing a second Anthropic client. ScoringModel is a narrow structural
Protocol so both the reused llm.core.interface.LLMProvider implementations
and Aegis's own deterministic MockScoringModel satisfy it without any
inheritance or edits to the llm package.
"""

from __future__ import annotations

import hashlib
from typing import TYPE_CHECKING, Protocol

from llm.core.types import LLMInput, LLMOutput

if TYPE_CHECKING:
    from app.config import Settings


class ScoringModel(Protocol):
    model_name: str
    model_version: str

    def generate(self, input: LLMInput) -> LLMOutput: ...


class MockScoringModel:
    """Deterministic canned scorer — no network calls, no API key needed.

    Per-criterion scores are derived from a hash of the prompt text, so the
    same transcript+rubric always yields the same QAScoreResult.
    """

    model_name = "mock-scorer"
    model_version = "mock-1"

    def generate(self, input: LLMInput) -> LLMOutput:
        prompt_text = input.messages[-1].content
        digest = hashlib.sha256(prompt_text.encode("utf-8")).hexdigest()

        criterion_keys = self._extract_criterion_keys(prompt_text)
        criteria_json = []
        for i, key in enumerate(criterion_keys):
            # Derive a stable score in [0.55, 0.95] from a slice of the digest.
            chunk = digest[i * 4 : i * 4 + 4] or digest[:4]
            score = 0.55 + (int(chunk, 16) % 400) / 1000
            criteria_json.append(
                {"key": key, "score": round(score, 2), "rationale": f"Deterministic mock rationale for {key}."}
            )

        import json

        content = json.dumps({"criteria": criteria_json})
        return LLMOutput(content=content, model=self.model_name)

    @staticmethod
    def _extract_criterion_keys(prompt_text: str) -> list[str]:
        keys = []
        for line in prompt_text.splitlines():
            stripped = line.strip()
            if stripped.startswith("- ") and ":" in stripped:
                keys.append(stripped[2:].split(":", 1)[0].strip())
        return keys


def get_scoring_model(settings: "Settings") -> ScoringModel:
    if settings.AEGIS_LLM_PROVIDER == "mock":
        return MockScoringModel()

    from llm import get_provider
    from llm.core.types import ProviderType

    return get_provider(ProviderType.CLAUDE)
