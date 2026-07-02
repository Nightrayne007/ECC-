"""Default media transport provider.

Photo capture is fully real end-to-end: the join URL points at the caller
upload endpoint, and the uploaded bytes are stored via a MediaStore. Live
video is returned as a placeholder join target — a real SFU/TURN transport
is the swap-in (webrtc_provider.py), since it cannot run without that
infrastructure.
"""

from __future__ import annotations

from app.livestream.interface import JoinInstruction, LivestreamProvider, MediaType


class MockLivestreamProvider(LivestreamProvider):
    name = "mock-livestream"
    version = "mock-1"

    async def prepare_join(
        self, *, session_id: str, call_id: str, media_type: MediaType, invite_token: str, invite_base_url: str
    ) -> JoinInstruction:
        if media_type == MediaType.PHOTO:
            return JoinInstruction(
                join_url=f"{invite_base_url}/capture?token={invite_token}",
                transport="upload",
                detail={"upload_endpoint": f"/api/media/upload/{invite_token}"},
            )
        return JoinInstruction(
            join_url=f"{invite_base_url}/live?token={invite_token}",
            transport="webrtc",
            detail={
                "note": "Mock livestream target — real WebRTC SFU/TURN transport is the swap-in "
                "(AEGIS_LIVESTREAM_PROVIDER=webrtc).",
            },
        )
