import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_radio_poll_then_list_flow(db_session):
    async def override_get_db():
        yield db_session

    from app.db import get_db

    app.dependency_overrides[get_db] = override_get_db
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            poll = await client.post("/api/radio/poll")
            assert poll.status_code == 200
            assert poll.json()["ingested"] > 0

            transmissions = await client.get("/api/radio/transmissions")
            assert transmissions.status_code == 200
            body = transmissions.json()
            assert len(body) > 0
            # At least one transmission carries an extracted priority event.
            assert any(len(t["events"]) > 0 for t in body)

            channels = await client.get("/api/radio/channels")
            assert channels.status_code == 200
            assert len(channels.json()) >= 3
    finally:
        app.dependency_overrides.clear()
