"""Media storage abstraction for caller-uploaded photos / recorded streams.

MediaStore is deliberately behind an interface so the dev-time local
filesystem store can be swapped for an AU-region object store (S3/GCS in an
Australian region) for a real deployment WITHOUT touching call flow code —
the same model-agnostic / data-residency principle applied to STT and LLM
providers elsewhere in the codebase. A real deployment MUST use an
AU-region bucket (see docs/privacy-impact.md); LocalMediaStore is dev-only.
"""

from __future__ import annotations

import hashlib
from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class StoredObject:
    storage_ref: str
    byte_size: int
    sha256: str


class MediaStore(ABC):
    @abstractmethod
    async def put(self, key: str, data: bytes) -> StoredObject: ...

    @abstractmethod
    async def get(self, storage_ref: str) -> bytes: ...


class LocalMediaStore(MediaStore):
    """Filesystem-backed store for local dev only. Never for production —
    call media is highly sensitive and belongs in an encrypted, access-
    controlled, AU-region object store."""

    def __init__(self, base_dir: str) -> None:
        self._base = Path(base_dir)
        self._base.mkdir(parents=True, exist_ok=True)

    async def put(self, key: str, data: bytes) -> StoredObject:
        # Prevent traversal: only the final path component is used as the name.
        safe_key = Path(key).name
        path = self._base / safe_key
        path.write_bytes(data)
        return StoredObject(
            storage_ref=str(path),
            byte_size=len(data),
            sha256=hashlib.sha256(data).hexdigest(),
        )

    async def get(self, storage_ref: str) -> bytes:
        path = Path(storage_ref)
        # Only allow reads from within the store's base directory.
        resolved = path.resolve()
        if self._base.resolve() not in resolved.parents and resolved != self._base.resolve():
            raise ValueError("storage_ref outside media store base")
        return resolved.read_bytes()
