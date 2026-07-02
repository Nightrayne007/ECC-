"""Phase 2 stub — live audio translation. Interface placeholder only.

Do not implement in Phase 1 (see Section 6 of CLAUDE.md). Reserved so the
shape is importable/reviewable without building the feature.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import AsyncIterator


class TranslationProvider(ABC):
    @abstractmethod
    async def translate_stream(self, audio: AsyncIterator[bytes], target_lang: str) -> AsyncIterator[bytes]:
        raise NotImplementedError
