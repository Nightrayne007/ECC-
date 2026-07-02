"""Phase 3 stub — on-demand caller livestream/photo. Interface placeholder only.

Do not implement in Phase 1 (see Section 6 of CLAUDE.md). Reserved so the
shape is importable/reviewable without building the feature.
"""

from __future__ import annotations

from abc import ABC, abstractmethod


class LivestreamProvider(ABC):
    @abstractmethod
    async def request_livestream(self, call_id: str) -> str:
        """Returns a session URL/token for the caller to join. Not implemented."""
        raise NotImplementedError

    @abstractmethod
    async def request_photo(self, call_id: str) -> str:
        """Returns a stored photo reference. Not implemented."""
        raise NotImplementedError
