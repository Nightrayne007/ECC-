"""Read-only audio tap — the life-safety boundary.

AudioTap consumes a copy of the audio stream. Nothing in this class, or
anything downstream of it, ever writes back to the source. Aegis has no
mechanism to affect call answering or routing: it can only observe.
"""

from __future__ import annotations

from collections.abc import AsyncIterator


class AudioTap:
    def __init__(self, source: AsyncIterator[bytes]) -> None:
        self._source = source

    async def frames(self) -> AsyncIterator[bytes]:
        async for chunk in self._source:
            yield chunk
