"""Radio feed adapter selection."""

from __future__ import annotations

from typing import TYPE_CHECKING

from app.radio.interface import RadioFeedAdapter
from app.radio.mock_feed import MockRadioFeedAdapter

if TYPE_CHECKING:
    from app.config import Settings


def get_radio_feed(settings: "Settings") -> RadioFeedAdapter:
    if settings.AEGIS_RADIO_FEED == "mock":
        return MockRadioFeedAdapter()

    from app.radio.openmhz_feed import OpenMHzRadioFeedAdapter

    return OpenMHzRadioFeedAdapter(
        system=settings.AEGIS_RADIO_OPENMHZ_SYSTEM or "",
        base_url=settings.AEGIS_RADIO_OPENMHZ_BASE_URL,
    )
