"""Phase 4 stub — AI radio-channel monitoring (NEC ICCS/ControlWorks). Interface placeholder only.

Do not implement in Phase 1 (see Section 6 of CLAUDE.md). Reserved so the
shape is importable/reviewable without building the feature.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import AsyncIterator


class RadioMonitor(ABC):
    @abstractmethod
    async def monitor_channel(self, channel_id: str) -> AsyncIterator[dict]:
        """Yields structured radio-traffic events. Not implemented."""
        raise NotImplementedError
