import hashlib

import pytest

from app.livestream.storage import LocalMediaStore


@pytest.mark.asyncio
async def test_put_and_get_roundtrip(tmp_path):
    store = LocalMediaStore(str(tmp_path))
    data = b"\xff\xd8fake-jpeg-bytes"
    stored = await store.put("session-1.jpg", data)

    assert stored.byte_size == len(data)
    assert stored.sha256 == hashlib.sha256(data).hexdigest()
    assert await store.get(stored.storage_ref) == data


@pytest.mark.asyncio
async def test_put_strips_path_traversal(tmp_path):
    store = LocalMediaStore(str(tmp_path))
    stored = await store.put("../../etc/evil.jpg", b"x")
    # Only the final component is used, so it lands inside the base dir.
    assert stored.storage_ref.startswith(str(tmp_path))
    assert "evil.jpg" in stored.storage_ref


@pytest.mark.asyncio
async def test_get_rejects_ref_outside_base(tmp_path):
    store = LocalMediaStore(str(tmp_path))
    with pytest.raises(ValueError):
        await store.get("/etc/passwd")
