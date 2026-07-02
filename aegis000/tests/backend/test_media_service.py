from datetime import datetime, timezone

import pytest
from sqlalchemy import select

from app.livestream.interface import MediaType, SessionStatus
from app.livestream.mock_provider import MockLivestreamProvider
from app.livestream.storage import LocalMediaStore
from app.livestream.tokens import InviteTokenService
from app.models.agent import Agent
from app.models.audit import AuditLogEntry
from app.models.call import Call
from app.models.media import MediaAsset, MediaSession
from app.services.media import MediaService, MediaSessionError


async def _make_call(db_session) -> Call:
    agent = Agent(external_id="agent-media", name="Media Agent")
    db_session.add(agent)
    await db_session.flush()
    call = Call(agent_id=agent.id, audio_ref="000-mock-001", started_at=datetime.now(timezone.utc))
    db_session.add(call)
    await db_session.flush()
    return call


def _service(db_session, tmp_path) -> MediaService:
    return MediaService(
        db_session,
        provider=MockLivestreamProvider(),
        store=LocalMediaStore(str(tmp_path)),
        tokens=InviteTokenService(secret="test-secret", ttl_seconds=900),
        invite_base_url="http://localhost:5173",
    )


@pytest.mark.asyncio
async def test_request_photo_session_issues_pending_session_and_token(db_session, tmp_path):
    call = await _make_call(db_session)
    service = _service(db_session, tmp_path)

    result = await service.request_session(call_id=call.id, media_type=MediaType.PHOTO)

    assert result["status"] == SessionStatus.PENDING.value
    assert result["transport"] == "upload"
    assert result["invite_token"]

    session_row = (
        await db_session.execute(select(MediaSession).where(MediaSession.id == result["session_id"]))
    ).scalar_one()
    assert session_row.status == SessionStatus.PENDING.value

    audit = (
        await db_session.execute(
            select(AuditLogEntry).where(
                AuditLogEntry.call_id == call.id, AuditLogEntry.action == "media_session_requested"
            )
        )
    ).scalars().all()
    assert len(audit) == 1


@pytest.mark.asyncio
async def test_photo_upload_stores_asset_and_completes_session(db_session, tmp_path):
    call = await _make_call(db_session)
    service = _service(db_session, tmp_path)
    result = await service.request_session(call_id=call.id, media_type=MediaType.PHOTO)

    photo_bytes = b"\xff\xd8jpeg"
    asset = await service.ingest_photo(token=result["invite_token"], data=photo_bytes, content_type="image/jpeg")

    assert isinstance(asset, MediaAsset)
    assert asset.byte_size == len(photo_bytes)

    session_row = (
        await db_session.execute(select(MediaSession).where(MediaSession.id == result["session_id"]))
    ).scalar_one()
    assert session_row.status == SessionStatus.COMPLETED.value

    upload_audit = (
        await db_session.execute(
            select(AuditLogEntry).where(AuditLogEntry.call_id == call.id, AuditLogEntry.action == "media_uploaded")
        )
    ).scalars().all()
    assert len(upload_audit) == 1


@pytest.mark.asyncio
async def test_token_is_single_use(db_session, tmp_path):
    call = await _make_call(db_session)
    service = _service(db_session, tmp_path)
    result = await service.request_session(call_id=call.id, media_type=MediaType.PHOTO)

    await service.ingest_photo(token=result["invite_token"], data=b"first", content_type="image/jpeg")

    with pytest.raises(MediaSessionError, match="already used"):
        await service.ingest_photo(token=result["invite_token"], data=b"second", content_type="image/jpeg")


@pytest.mark.asyncio
async def test_invalid_token_rejected(db_session, tmp_path):
    service = _service(db_session, tmp_path)
    with pytest.raises(MediaSessionError):
        await service.ingest_photo(token="garbage.token", data=b"x", content_type="image/jpeg")


@pytest.mark.asyncio
async def test_livestream_session_uses_webrtc_transport(db_session, tmp_path):
    call = await _make_call(db_session)
    service = _service(db_session, tmp_path)
    result = await service.request_session(call_id=call.id, media_type=MediaType.LIVESTREAM)
    assert result["transport"] == "webrtc"
