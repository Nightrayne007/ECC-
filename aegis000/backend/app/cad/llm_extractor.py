"""Real CAD field extraction via the repo's existing src/llm abstraction."""

from __future__ import annotations

import json
from typing import Protocol

from llm.core.types import LLMInput, LLMOutput, Message, Role

from app.qa.keyword_triggers import FlagResult
from app.transcription.interface import TranscriptResult
from app.cad.interface import CadExtractor, CadPrefillResult
from app.cad.prompts.v1 import PROMPT_VERSION, SYSTEM_PROMPT, render
from app.translation.interface import TranslatedSegment


class CadParsingError(Exception):
    pass


class CadExtractionModel(Protocol):
    model_name: str
    model_version: str

    def generate(self, input: LLMInput) -> LLMOutput: ...


class LLMCadExtractor(CadExtractor):
    name = "llm-cad-extractor"
    version = PROMPT_VERSION

    def __init__(self, model: CadExtractionModel) -> None:
        self._model = model

    async def extract(
        self,
        transcript: TranscriptResult,
        translations: list[TranslatedSegment] | None = None,
        triggers: list[FlagResult] | None = None,
    ) -> CadPrefillResult:
        prompt_text = render(transcript.to_text())
        output = self._model.generate(
            LLMInput(
                messages=[
                    Message(role=Role.SYSTEM, content=SYSTEM_PROMPT),
                    Message(role=Role.USER, content=prompt_text),
                ],
                temperature=0,
            )
        )
        try:
            payload = json.loads(output.content)
        except json.JSONDecodeError as exc:
            raise CadParsingError(f"malformed CAD extraction output: {exc}") from exc

        return CadPrefillResult(
            incident_type=str(payload.get("incident_type", "Unclassified — Review Required")),
            location_text=payload.get("location_text"),
            hazards=list(payload.get("hazards", [])),
            notes=str(payload.get("notes", "")),
            confidence=float(payload.get("confidence", 0.0)),
            model_name=getattr(self._model, "model_name", self.name),
            model_version=getattr(self._model, "model_version", self.version),
        )
