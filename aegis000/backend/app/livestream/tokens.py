"""Native, single-vendor-free invite tokens for caller media sessions.

The brief (Section 6, Phase 3) calls for building the livestream/photo
capability *native* rather than depending on a single external vendor
(à la BluLink/GoodSAM). The core of that independence is owning the
caller-invite mechanism: a secure, time-limited, tamper-evident token we
issue and verify ourselves, with no third-party identity service.

Tokens are HMAC-SHA256 signed over a compact JSON payload. They are
stateless-signed (signature + expiry checked here), while *single-use* is
enforced by the MediaSession status in the database — a token whose session
is no longer PENDING is rejected by the service layer even if the signature
is still valid and unexpired.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from dataclasses import dataclass


class InviteTokenError(Exception):
    pass


@dataclass(frozen=True)
class InvitePayload:
    session_id: str
    call_id: str
    media_type: str
    expires_at: int  # unix seconds


def _b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _b64url_decode(text: str) -> bytes:
    padding = "=" * (-len(text) % 4)
    return base64.urlsafe_b64decode(text + padding)


class InviteTokenService:
    def __init__(self, secret: str, ttl_seconds: int = 900) -> None:
        if not secret:
            raise ValueError("invite token secret must not be empty")
        self._secret = secret.encode("utf-8")
        self._ttl_seconds = ttl_seconds

    def _sign(self, payload_b64: str) -> str:
        digest = hmac.new(self._secret, payload_b64.encode("ascii"), hashlib.sha256).digest()
        return _b64url_encode(digest)

    def issue(self, *, session_id: str, call_id: str, media_type: str, now: int | None = None) -> tuple[str, int]:
        """Return (token, expires_at). expires_at is unix seconds."""
        issued = now if now is not None else int(time.time())
        expires_at = issued + self._ttl_seconds
        payload = {"sid": session_id, "cid": call_id, "mt": media_type, "exp": expires_at}
        payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8"))
        signature = self._sign(payload_b64)
        return f"{payload_b64}.{signature}", expires_at

    def verify(self, token: str, *, now: int | None = None) -> InvitePayload:
        try:
            payload_b64, signature = token.split(".", 1)
        except ValueError as exc:
            raise InviteTokenError("malformed token") from exc

        expected = self._sign(payload_b64)
        if not hmac.compare_digest(expected, signature):
            raise InviteTokenError("invalid token signature")

        try:
            payload = json.loads(_b64url_decode(payload_b64))
        except (ValueError, json.JSONDecodeError) as exc:
            raise InviteTokenError("undecodable token payload") from exc

        current = now if now is not None else int(time.time())
        if int(payload["exp"]) < current:
            raise InviteTokenError("token expired")

        return InvitePayload(
            session_id=payload["sid"],
            call_id=payload["cid"],
            media_type=payload["mt"],
            expires_at=int(payload["exp"]),
        )
