"""Per-ESO QA rubric loading + validation."""

from __future__ import annotations

from pathlib import Path

import yaml
from pydantic import BaseModel, field_validator


class RubricCriterion(BaseModel):
    key: str
    label: str
    weight: float


class KeywordTrigger(BaseModel):
    phrase: str
    category: str
    severity: str


class Rubric(BaseModel):
    eso_id: str
    name: str
    version: str
    criteria: list[RubricCriterion]
    keyword_triggers: list[KeywordTrigger]

    @field_validator("criteria")
    @classmethod
    def _weights_sum_to_one(cls, criteria: list[RubricCriterion]) -> list[RubricCriterion]:
        total = sum(c.weight for c in criteria)
        if abs(total - 1.0) > 0.01:
            raise RubricValidationError(f"criteria weights must sum to ~1.0, got {total}")
        return criteria


class RubricValidationError(ValueError):
    pass


def load_rubric(path: str | Path) -> Rubric:
    raw = yaml.safe_load(Path(path).read_text())
    return Rubric.model_validate(raw)
