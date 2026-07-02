"""Livestream provider + media store + token service selection."""

from __future__ import annotations

from typing import TYPE_CHECKING

from app.livestream.interface import LivestreamProvider
from app.livestream.mock_provider import MockLivestreamProvider
from app.livestream.storage import LocalMediaStore, MediaStore
from app.livestream.tokens import InviteTokenService

if TYPE_CHECKING:
    from app.config import Settings


def get_livestream_provider(settings: "Settings") -> LivestreamProvider:
    if settings.AEGIS_LIVESTREAM_PROVIDER == "mock":
        return MockLivestreamProvider()

    from app.livestream.webrtc_provider import WebRtcLivestreamProvider

    return WebRtcLivestreamProvider(sfu_endpoint=settings.AEGIS_LIVESTREAM_SFU_ENDPOINT)


def get_media_store(settings: "Settings") -> MediaStore:
    if settings.AEGIS_MEDIA_STORE == "local":
        return LocalMediaStore(settings.AEGIS_MEDIA_LOCAL_DIR)

    raise RuntimeError(
        "AEGIS_MEDIA_STORE=object requires an AU-region object store adapter, "
        "not wired up in this scaffold."
    )


def get_invite_token_service(settings: "Settings") -> InviteTokenService:
    return InviteTokenService(
        secret=settings.AEGIS_MEDIA_INVITE_SECRET,
        ttl_seconds=settings.AEGIS_MEDIA_INVITE_TTL_SECONDS,
    )
