from datetime import datetime, timezone

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.models.agent import Agent
from app.models.call import Call


@pytest.mark.asyncio
async def test_media_request_upload_and_list_flow(db_session, tmp_path, monkeypatch):
    from app.config import settings

    monkeypatch.setattr(settings, "AEGIS_MEDIA_LOCAL_DIR", str(tmp_path))
    monkeypatch.setattr(settings, "AEGIS_MEDIA_INVITE_SECRET", "test-secret")

    agent = Agent(external_id="agent-api-media", name="API Media Agent")
    db_session.add(agent)
    await db_session.flush()
    call = Call(agent_id=agent.id, audio_ref="000-mock-001", started_at=datetime.now(timezone.utc))
    db_session.add(call)
    await db_session.flush()
    await db_session.commit()

    async def override_get_db():
        yield db_session

    from app.db import get_db

    app.dependency_overrides[get_db] = override_get_db
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            request = await client.post(f"/api/calls/{call.id}/media-sessions", json={"media_type": "photo"})
            assert request.status_code == 200
            session = request.json()
            assert session["transport"] == "upload"
            token = session["invite_token"]

            upload = await client.post(
                f"/api/media/upload/{token}", content=b"\xff\xd8jpeg-bytes", headers={"content-type": "image/jpeg"}
            )
            assert upload.status_code == 200
            asset = upload.json()
            assert asset["media_type"] == "photo"

            # Single-use: a second upload with the same token is rejected.
            replay = await client.post(
                f"/api/media/upload/{token}", content=b"again", headers={"content-type": "image/jpeg"}
            )
            assert replay.status_code == 409

            listing = await client.get(f"/api/calls/{call.id}/media")
            assert listing.status_code == 200
            sessions = listing.json()
            assert len(sessions) == 1
            assert sessions[0]["status"] == "completed"
            assert len(sessions[0]["assets"]) == 1

            content = await client.get(f"/api/media/asset/{asset['id']}/content")
            assert content.status_code == 200
            assert content.content == b"\xff\xd8jpeg-bytes"
    finally:
        app.dependency_overrides.clear()
