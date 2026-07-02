"""API schemas for radio monitoring."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RadioEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    category: str
    severity: str
    phrase: str
    meaning: str


class RadioTransmissionOut(BaseModel):
    id: str
    channel_external_id: str
    channel_label: str
    service: str
    source: str
    started_at: datetime
    duration_ms: int
    text: str | None
    audio_ref: str | None
    transcribed: bool
    events: list[RadioEventOut]


class RadioChannelOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    external_id: str
    label: str
    service: str


class RadioPollResultOut(BaseModel):
    ingested: int
    events: int
