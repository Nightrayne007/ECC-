import pytest

from app.livestream.tokens import InviteTokenError, InviteTokenService


def test_issue_and_verify_roundtrip():
    svc = InviteTokenService(secret="test-secret", ttl_seconds=900)
    token, expires_at = svc.issue(session_id="s1", call_id="c1", media_type="photo", now=1000)
    payload = svc.verify(token, now=1100)
    assert payload.session_id == "s1"
    assert payload.call_id == "c1"
    assert payload.media_type == "photo"
    assert payload.expires_at == expires_at == 1900


def test_expired_token_rejected():
    svc = InviteTokenService(secret="test-secret", ttl_seconds=60)
    token, _ = svc.issue(session_id="s1", call_id="c1", media_type="photo", now=1000)
    with pytest.raises(InviteTokenError, match="expired"):
        svc.verify(token, now=2000)


def test_tampered_payload_rejected():
    svc = InviteTokenService(secret="test-secret", ttl_seconds=900)
    token, _ = svc.issue(session_id="s1", call_id="c1", media_type="photo", now=1000)
    payload_b64, signature = token.split(".", 1)
    tampered = f"{payload_b64}x.{signature}"
    with pytest.raises(InviteTokenError):
        svc.verify(tampered, now=1100)


def test_wrong_secret_rejected():
    issuer = InviteTokenService(secret="secret-a", ttl_seconds=900)
    verifier = InviteTokenService(secret="secret-b", ttl_seconds=900)
    token, _ = issuer.issue(session_id="s1", call_id="c1", media_type="photo", now=1000)
    with pytest.raises(InviteTokenError, match="signature"):
        verifier.verify(token, now=1100)


def test_empty_secret_rejected():
    with pytest.raises(ValueError):
        InviteTokenService(secret="", ttl_seconds=900)
