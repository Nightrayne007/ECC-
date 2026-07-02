"""AI radio-channel monitoring — Phase 4.

Layered on the ESO's radio infrastructure (NEC ICCS/ControlWorks) in a real
deployment: an observe-only tap that transcribes radio traffic and surfaces
structured, priority events (officer-safety calls, urgent traffic, incident
mentions) to supervisors. It never transmits — it only listens.

Model-agnostic per the architecture principles: RadioFeedAdapter abstracts
the traffic source. MockRadioFeedAdapter is the default (synthetic chatter,
no external dependency). OpenMHzRadioFeedAdapter is a real, ToS-clean
example swap-in against the free OpenMHz API for local dev/demo. The
production source is a direct authorized tap on ICCS/ControlWorks (see
docs/failover-design.md) — public scanner feeds are dev-only and much AU
emergency voice is encrypted at source.

The feed uses a poll model (fetch transmissions newer than a cursor),
mirroring how a real call-recording/trunk-recorder feed is consumed.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime


@dataclass(frozen=True)
class RadioTransmission:
    external_ref: str
    channel_external_id: str
    channel_label: str
    service: str  # police | fire | ambulance | multi
    started_at: datetime
    duration_ms: int
    source: str
    # text is present when the feed already provides a transcript (mock, or a
    # real feed with STT upstream). audio_ref points at fetchable audio when
    # it does not — transcription of that audio is the STT swap-in.
    text: str | None = None
    audio_ref: str | None = None
    detail: dict = field(default_factory=dict)


class RadioFeedAdapter(ABC):
    name: str
    version: str

    @abstractmethod
    async def poll(self, *, since: datetime | None = None, limit: int = 50) -> list[RadioTransmission]:
        """Return transmissions newer than `since`, oldest first."""
        ...
