"""Real translation via the repo's existing src/llm abstraction.

Same reuse boundary as app/qa/llm_client.py: a local Protocol so this
module never depends on llm.core.interface.LLMProvider directly, and the
existing get_provider(ProviderType.CLAUDE) factory does the real work.
"""

from __future__ import annotations

from typing import Protocol

from llm.core.types import LLMInput, LLMOutput, Message, Role

from app.transcription.interface import TranscriptSegment
from app.translation.interface import TranscriptTranslator, TranslatedSegment
from app.translation.prompts.v1 import SYSTEM_PROMPT, render


class TranslationModel(Protocol):
    model_name: str
    model_version: str

    def generate(self, input: LLMInput) -> LLMOutput: ...


class LLMTranscriptTranslator(TranscriptTranslator):
    name = "llm-translator"
    version = "v1"

    def __init__(self, model: TranslationModel) -> None:
        self._model = model

    async def translate_segments(
        self, segments: list[TranscriptSegment], target_lang: str = "en-AU"
    ) -> list[TranslatedSegment]:
        results: list[TranslatedSegment] = []
        for i, segment in enumerate(segments):
            if segment.language == target_lang:
                continue
            prompt_text = render(segment.text, segment.language, target_lang)
            output = self._model.generate(
                LLMInput(
                    messages=[
                        Message(role=Role.SYSTEM, content=SYSTEM_PROMPT),
                        Message(role=Role.USER, content=prompt_text),
                    ],
                    temperature=0,
                )
            )
            results.append(
                TranslatedSegment(
                    segment_index=i,
                    source_lang=segment.language,
                    target_lang=target_lang,
                    original_text=segment.text,
                    translated_text=output.content.strip(),
                    model_name=getattr(self._model, "model_name", self.name),
                    model_version=getattr(self._model, "model_version", self.version),
                )
            )
        return results
