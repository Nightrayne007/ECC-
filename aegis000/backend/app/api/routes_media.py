"""On-demand caller media routes (Phase 3).

Three surfaces:
- Call-taker/supervisor requests a photo/livestream from the caller.
- Caller uploads a photo, authenticated only by the single-use invite token
  (no account needed — the caller is a member of the public in an emergency).
- Supervisor lists a call's media sessions and fetches stored assets.

None of these gate or affect answering the 000 call — requesting media is a
human-initiated assist, and the caller must consent by acting on the invite.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.db import get_db
from app.livestream.factory import get_invite_token_service, get_livestream_provider, get_media_store
from app.livestream.interface import MediaType
from app.models.media import MediaAsset, MediaSession
from app.schemas.call import (
    MediaAssetOut,
    MediaSessionOut,
    MediaSessionRequestIn,
    MediaSessionSummaryOut,
)
from app.services.media import MediaService, MediaSessionError

router = APIRouter(prefix="/api", tags=["media"])

MAX_UPLOAD_BYTES = 15 * 1024 * 1024


def _media_service(db: AsyncSession) -> MediaService:
    return MediaService(
        db,
        provider=get_livestream_provider(settings),
        store=get_media_store(settings),
        tokens=get_invite_token_service(settings),
        invite_base_url=settings.AEGIS_MEDIA_INVITE_BASE_URL,
    )


@router.post("/calls/{call_id}/media-sessions", response_model=MediaSessionOut)
async def request_media_session(
    call_id: str, body: MediaSessionRequestIn, db: AsyncSession = Depends(get_db)
) -> MediaSessionOut:
    try:
        media_type = MediaType(body.media_type)
    except ValueError:
        raise HTTPException(status_code=422, detail="media_type must be 'photo' or 'livestream'")

    try:
        result = await _media_service(db).request_session(call_id=call_id, media_type=media_type)
    except MediaSessionError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return MediaSessionOut(**result)


@router.post("/media/upload/{token}", response_model=MediaAssetOut)
async def upload_media(token: str, request: Request, db: AsyncSession = Depends(get_db)) -> MediaAssetOut:
    data = await request.body()
    if not data:
        raise HTTPException(status_code=422, detail="empty upload")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="upload too large")
    content_type = request.headers.get("content-type", "application/octet-stream")

    try:
        asset = await _media_service(db).ingest_photo(token=token, data=data, content_type=content_type)
    except MediaSessionError as exc:
        raise HTTPException(status_code=409, detail=str(exc))
    return MediaAssetOut.model_validate(asset)


@router.get("/calls/{call_id}/media", response_model=list[MediaSessionSummaryOut])
async def list_call_media(call_id: str, db: AsyncSession = Depends(get_db)) -> list[MediaSessionSummaryOut]:
    stmt = (
        select(MediaSession)
        .options(selectinload(MediaSession.assets))
        .where(MediaSession.call_id == call_id)
        .order_by(MediaSession.created_at)
    )
    sessions = (await db.execute(stmt)).scalars().all()
    return [MediaSessionSummaryOut.model_validate(s) for s in sessions]


@router.get("/media/asset/{asset_id}/content")
async def get_media_asset_content(asset_id: str, db: AsyncSession = Depends(get_db)) -> Response:
    asset = (await db.execute(select(MediaAsset).where(MediaAsset.id == asset_id))).scalar_one_or_none()
    if asset is None:
        raise HTTPException(status_code=404, detail="asset not found")
    data = await get_media_store(settings).get(asset.storage_ref)
    return Response(content=data, media_type=asset.content_type)
