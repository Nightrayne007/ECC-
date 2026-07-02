"""Orchestration for on-demand caller media sessions.

Ties together the invite token service, the media transport provider, and
the media store, and records every action (session requested, media
uploaded) in the immutable audit log — an on-demand media request is an AI-
adjacent decision that affects a life-safety response and must be traceable
the same way scores and flags are.

Single-use enforcement: a token's signature+expiry are checked by
InviteTokenService, and the session status is checked here — an upload is
only accepted while the session is PENDING and unexpired, so a captured or
replayed token cannot be reused after the caller has already uploaded.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit.log import AuditLogger
from app.livestream.interface import LivestreamProvider, MediaType, SessionStatus
from app.livestream.storage import MediaStore
from app.livestream.tokens import InviteTokenError, InviteTokenService
from app.models.call import Call
from app.models.media import MediaAsset, MediaSession


class MediaSessionError(Exception):
    pass


class MediaService:
    def __init__(
        self,
        session: AsyncSession,
        *,
        provider: LivestreamProvider,
        store: MediaStore,
        tokens: InviteTokenService,
        invite_base_url: str,
    ) -> None:
        self._session = session
        self._provider = provider
        self._store = store
        self._tokens = tokens
        self._invite_base_url = invite_base_url

    async def request_session(self, *, call_id: str, media_type: MediaType) -> dict:
        call = (await self._session.execute(select(Call).where(Call.id == call_id))).scalar_one_or_none()
        if call is None:
            raise MediaSessionError("call not found")

        media_session = MediaSession(
            call_id=call_id,
            media_type=media_type.value,
            status=SessionStatus.PENDING.value,
            provider_name=self._provider.name,
            provider_version=self._provider.version,
            expires_at=datetime.now(timezone.utc),  # replaced below once the token TTL is known
        )
        self._session.add(media_session)
        await self._session.flush()

        token, expires_at = self._tokens.issue(
            session_id=media_session.id, call_id=call_id, media_type=media_type.value
        )
        media_session.expires_at = datetime.fromtimestamp(expires_at, tz=timezone.utc)

        join = await self._provider.prepare_join(
            session_id=media_session.id,
            call_id=call_id,
            media_type=media_type,
            invite_token=token,
            invite_base_url=self._invite_base_url,
        )

        await AuditLogger(self._session).record(
            call_id=call_id,
            action="media_session_requested",
            model_name=self._provider.name,
            model_version=self._provider.version,
            prompt_version=None,
            input_payload={"media_type": media_type.value},
            output_payload={"session_id": media_session.id, "transport": join.transport, "expires_at": expires_at},
        )
        await self._session.commit()

        return {
            "session_id": media_session.id,
            "media_type": media_type.value,
            "status": media_session.status,
            "invite_token": token,
            "join_url": join.join_url,
            "transport": join.transport,
            "expires_at": media_session.expires_at,
        }

    async def ingest_photo(self, *, token: str, data: bytes, content_type: str) -> MediaAsset:
        try:
            payload = self._tokens.verify(token)
        except InviteTokenError as exc:
            raise MediaSessionError(str(exc)) from exc

        if payload.media_type != MediaType.PHOTO.value:
            raise MediaSessionError("token is not for a photo session")

        media_session = (
            await self._session.execute(select(MediaSession).where(MediaSession.id == payload.session_id))
        ).scalar_one_or_none()
        if media_session is None:
            raise MediaSessionError("session not found")
        if media_session.status != SessionStatus.PENDING.value:
            raise MediaSessionError("session already used or no longer active")

        stored = await self._store.put(f"{media_session.id}.jpg", data)
        asset = MediaAsset(
            session_id=media_session.id,
            call_id=media_session.call_id,
            media_type=MediaType.PHOTO.value,
            content_type=content_type,
            storage_ref=stored.storage_ref,
            byte_size=stored.byte_size,
            sha256=stored.sha256,
        )
        self._session.add(asset)
        media_session.status = SessionStatus.COMPLETED.value

        await AuditLogger(self._session).record(
            call_id=media_session.call_id,
            action="media_uploaded",
            model_name=self._provider.name,
            model_version=self._provider.version,
            prompt_version=None,
            input_payload={"session_id": media_session.id, "content_type": content_type, "byte_size": stored.byte_size},
            output_payload={"sha256": stored.sha256, "media_type": MediaType.PHOTO.value},
        )
        await self._session.commit()
        return asset
