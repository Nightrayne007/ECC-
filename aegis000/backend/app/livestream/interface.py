"""On-demand caller media (photo / livestream) — Phase 3.

Unlike Phases 1–2 (automatic per-call analysis in run_pipeline_for_call),
this is a human-initiated, on-demand assist: a call-taker requests a photo
or livestream from the caller, we mint a secure invite (app/livestream/
tokens.py), and the caller consents by opening the link and uploading /
joining. It is never in the critical path of answering the 000 call.

The LivestreamProvider abstracts the media *transport*: how the caller's
device delivers the media. Photo capture is fully functional (HTTP upload
into a MediaStore). Live video transport needs an SFU/TURN infrastructure
and is the documented swap-in (see webrtc_provider.py) — MockLivestreamProvider
is the default and returns a placeholder join target for livestream.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum


class MediaType(str, Enum):
    PHOTO = "photo"
    LIVESTREAM = "livestream"


class SessionStatus(str, Enum):
    PENDING = "pending"      # invite issued, caller has not yet acted
    ACTIVE = "active"        # livestream joined / in progress
    COMPLETED = "completed"  # photo uploaded or stream ended
    EXPIRED = "expired"      # invite lapsed before use
    CANCELLED = "cancelled"  # call-taker revoked


@dataclass(frozen=True)
class JoinInstruction:
    """What the caller-facing invite should point at."""

    join_url: str
    transport: str  # "upload" (photo) | "webrtc" (livestream)
    detail: dict = field(default_factory=dict)


class LivestreamProvider(ABC):
    name: str
    version: str

    @abstractmethod
    async def prepare_join(
        self, *, session_id: str, call_id: str, media_type: MediaType, invite_token: str, invite_base_url: str
    ) -> JoinInstruction: ...
