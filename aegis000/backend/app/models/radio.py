"""Radio channel / transmission / extracted-event models (Phase 4)."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, new_uuid


class RadioChannel(Base, TimestampMixin):
    __tablename__ = "radio_channels"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    external_id: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    label: Mapped[str] = mapped_column(String(256))
    service: Mapped[str] = mapped_column(String(32))

    transmissions: Mapped[list["RadioTransmission"]] = relationship(back_populates="channel")


class RadioTransmission(Base, TimestampMixin):
    __tablename__ = "radio_transmissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    channel_id: Mapped[str] = mapped_column(String(36), ForeignKey("radio_channels.id"))
    external_ref: Mapped[str] = mapped_column(String(256), unique=True, index=True)
    source: Mapped[str] = mapped_column(String(64))
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)
    text: Mapped[str | None] = mapped_column(Text, nullable=True)
    audio_ref: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    transcribed: Mapped[bool] = mapped_column(Boolean, default=False)

    channel: Mapped["RadioChannel"] = relationship(back_populates="transmissions")
    events: Mapped[list["RadioEvent"]] = relationship(back_populates="transmission")


class RadioEvent(Base, TimestampMixin):
    __tablename__ = "radio_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    transmission_id: Mapped[str] = mapped_column(String(36), ForeignKey("radio_transmissions.id"))
    channel_id: Mapped[str] = mapped_column(String(36), ForeignKey("radio_channels.id"))
    category: Mapped[str] = mapped_column(String(64))
    severity: Mapped[str] = mapped_column(String(16))
    phrase: Mapped[str] = mapped_column(String(128))
    meaning: Mapped[str] = mapped_column(String(512))

    transmission: Mapped["RadioTransmission"] = relationship(back_populates="events")
