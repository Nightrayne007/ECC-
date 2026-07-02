"""Radio-channel monitoring routes (Phase 4).

Observe-only, supervisor-facing: list monitored channels, the recent
transmission feed with extracted priority events, and a poll trigger that
pulls the latest traffic from the configured feed. Nothing here transmits
on any radio channel or affects call answering.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.db import get_db
from app.models.radio import RadioChannel, RadioTransmission
from app.radio.factory import get_radio_feed
from app.radio.signals import load_signal_catalog
from app.schemas.radio import (
    RadioChannelOut,
    RadioEventOut,
    RadioPollResultOut,
    RadioTransmissionOut,
)
from app.services.radio import RadioMonitorService

router = APIRouter(prefix="/api/radio", tags=["radio"])


@router.get("/channels", response_model=list[RadioChannelOut])
async def list_channels(db: AsyncSession = Depends(get_db)) -> list[RadioChannelOut]:
    channels = (await db.execute(select(RadioChannel).order_by(RadioChannel.label))).scalars().all()
    return [RadioChannelOut.model_validate(c) for c in channels]


@router.get("/transmissions", response_model=list[RadioTransmissionOut])
async def list_transmissions(
    service: str | None = None, limit: int = 100, db: AsyncSession = Depends(get_db)
) -> list[RadioTransmissionOut]:
    stmt = (
        select(RadioTransmission)
        .options(selectinload(RadioTransmission.events), selectinload(RadioTransmission.channel))
        .order_by(RadioTransmission.started_at.desc())
        .limit(limit)
    )
    rows = (await db.execute(stmt)).scalars().all()
    if service:
        rows = [r for r in rows if r.channel.service == service]

    return [
        RadioTransmissionOut(
            id=r.id,
            channel_external_id=r.channel.external_id,
            channel_label=r.channel.label,
            service=r.channel.service,
            source=r.source,
            started_at=r.started_at,
            duration_ms=r.duration_ms,
            text=r.text,
            audio_ref=r.audio_ref,
            transcribed=r.transcribed,
            events=[RadioEventOut.model_validate(e) for e in r.events],
        )
        for r in rows
    ]


@router.post("/poll", response_model=RadioPollResultOut)
async def poll_radio(db: AsyncSession = Depends(get_db)) -> RadioPollResultOut:
    catalog = load_signal_catalog(settings.AEGIS_RADIO_SIGNAL_CATALOG)
    service = RadioMonitorService(db, feed=get_radio_feed(settings), catalog=catalog)
    result = await service.poll_and_ingest()
    return RadioPollResultOut(**result)
