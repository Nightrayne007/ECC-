"""QA scoring engine — orchestrates prompt rendering, model call, parsing."""

from __future__ import annotations

import json
from dataclasses import dataclass

from llm.core.types import LLMInput, Message, Role

from app.qa.llm_client import ScoringModel
from app.qa.prompts.v1 import PROMPT_VERSION, SYSTEM_PROMPT, render
from app.qa.rubric import Rubric
from app.transcription.interface import TranscriptResult


class QAParsingError(Exception):
    pass


@dataclass(frozen=True)
class CriterionScoreResult:
    key: str
    score: float
    weight: float
    rationale: str


@dataclass(frozen=True)
class QAScoreResult:
    overall_score: float
    criterion_scores: list[CriterionScoreResult]
    model_name: str
    model_version: str
    prompt_version: str
    raw_llm_output: str


class QAEngine:
    def __init__(self, model: ScoringModel, prompt_version: str = PROMPT_VERSION) -> None:
        self.model = model
        self.prompt_version = prompt_version

    def score_call(self, transcript: TranscriptResult, rubric: Rubric) -> QAScoreResult:
        prompt_text = render(transcript.to_text(), rubric)
        llm_input = LLMInput(
            messages=[
                Message(role=Role.SYSTEM, content=SYSTEM_PROMPT),
                Message(role=Role.USER, content=prompt_text),
            ],
            temperature=0,
        )
        output = self.model.generate(llm_input)
        return self._parse(output.content, rubric)

    def _parse(self, raw_output: str, rubric: Rubric) -> QAScoreResult:
        try:
            payload = json.loads(raw_output)
            entries = {e["key"]: e for e in payload["criteria"]}
        except (json.JSONDecodeError, KeyError, TypeError) as exc:
            raise QAParsingError(f"malformed scoring output: {exc}") from exc

        weights_by_key = {c.key: c.weight for c in rubric.criteria}
        criterion_scores: list[CriterionScoreResult] = []
        overall = 0.0
        for criterion in rubric.criteria:
            entry = entries.get(criterion.key)
            if entry is None:
                raise QAParsingError(f"missing score for criterion '{criterion.key}'")
            score = float(entry["score"])
            criterion_scores.append(
                CriterionScoreResult(
                    key=criterion.key,
                    score=score,
                    weight=weights_by_key[criterion.key],
                    rationale=str(entry.get("rationale", "")),
                )
            )
            overall += score * criterion.weight

        return QAScoreResult(
            overall_score=round(overall, 4),
            criterion_scores=criterion_scores,
            model_name=getattr(self.model, "model_name", "unknown"),
            model_version=getattr(self.model, "model_version", "unknown"),
            prompt_version=self.prompt_version,
            raw_llm_output=raw_output,
        )
