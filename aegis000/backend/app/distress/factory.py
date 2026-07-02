"""Distress analyzer selection, mirroring app/qa/llm_client.get_scoring_model."""

from __future__ import annotations

from typing import TYPE_CHECKING

from app.distress.interface import DistressAnalyzer
from app.distress.mock_analyzer import MockDistressAnalyzer

if TYPE_CHECKING:
    from app.config import Settings


def _no_audio_source(audio_ref: str) -> tuple:
    raise NotImplementedError(
        "AEGIS_DISTRESS_ANALYZER=signal requires a real audio source "
        "(e.g. call-recording storage behind AudioTap). No such source is "
        "wired up in Phase 1 — provide an audio_loader to SignalDistressAnalyzer."
    )


def get_distress_analyzer(settings: "Settings") -> DistressAnalyzer:
    if settings.AEGIS_DISTRESS_ANALYZER == "mock":
        return MockDistressAnalyzer()

    from app.distress.signal_analyzer import SignalDistressAnalyzer

    return SignalDistressAnalyzer(audio_loader=_no_audio_source)
