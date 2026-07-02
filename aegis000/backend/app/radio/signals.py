"""Per-ESO radio signal catalog + deterministic event extraction.

Radio codes vary by state and service, so the catalog is configurable YAML
(mirroring the QA rubric). Matching is pure, deterministic, word-boundary
regex — an "officer requires assistance" event must never depend on model
drift, exactly like the QA keyword triggers.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

import yaml
from pydantic import BaseModel


class RadioSignal(BaseModel):
    phrase: str
    category: str
    severity: str
    meaning: str


class RadioSignalCatalog(BaseModel):
    eso_id: str
    name: str
    version: str
    signals: list[RadioSignal]


def load_signal_catalog(path: str | Path) -> RadioSignalCatalog:
    raw = yaml.safe_load(Path(path).read_text())
    return RadioSignalCatalog.model_validate(raw)


@dataclass(frozen=True)
class RadioEventMatch:
    phrase: str
    category: str
    severity: str
    meaning: str


def extract_events(text: str, catalog: RadioSignalCatalog) -> list[RadioEventMatch]:
    if not text:
        return []
    matches: list[RadioEventMatch] = []
    for signal in catalog.signals:
        pattern = r"\b" + re.escape(signal.phrase) + r"\b"
        if re.search(pattern, text, flags=re.IGNORECASE):
            matches.append(
                RadioEventMatch(
                    phrase=signal.phrase,
                    category=signal.category,
                    severity=signal.severity,
                    meaning=signal.meaning,
                )
            )
    return matches
