"""Real WebRTC livestream transport — swap-in path.

Live video from a caller's browser requires an SFU (selective forwarding
unit) plus TURN relays for NAT traversal — infrastructure that cannot run
inside this scaffold. This provider is the documented swap-in: enable with
AEGIS_LIVESTREAM_PROVIDER=webrtc and configure an AU-region SFU endpoint.
Photo capture does not depend on this and works with the default provider.

The join-URL construction here is real; only the SFU room provisioning is
left as the integration point (raises if no SFU endpoint is configured),
so this fails loudly rather than pretending to work.
"""

from __future__ import annotations

from app.livestream.interface import JoinInstruction, LivestreamProvider, MediaType


class WebRtcLivestreamProvider(LivestreamProvider):
    name = "webrtc-livestream"
    version = "v1"

    def __init__(self, sfu_endpoint: str | None) -> None:
        self._sfu_endpoint = sfu_endpoint

    async def prepare_join(
        self, *, session_id: str, call_id: str, media_type: MediaType, invite_token: str, invite_base_url: str
    ) -> JoinInstruction:
        if media_type == MediaType.PHOTO:
            return JoinInstruction(
                join_url=f"{invite_base_url}/capture?token={invite_token}",
                transport="upload",
                detail={"upload_endpoint": f"/api/media/upload/{invite_token}"},
            )
        if not self._sfu_endpoint:
            raise RuntimeError(
                "WebRtcLivestreamProvider requires an AU-region SFU endpoint "
                "(AEGIS_LIVESTREAM_SFU_ENDPOINT); none configured."
            )
        return JoinInstruction(
            join_url=f"{invite_base_url}/live?token={invite_token}",
            transport="webrtc",
            detail={"sfu_endpoint": self._sfu_endpoint, "room": session_id},
        )
