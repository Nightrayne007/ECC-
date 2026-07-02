"""On-demand caller media session + stored asset models."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, new_uuid


class MediaSession(Base, TimestampMixin):
    __tablename__ = "media_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    call_id: Mapped[str] = mapped_column(String(36), ForeignKey("calls.id"))
    media_type: Mapped[str] = mapped_column(String(16))
    status: Mapped[str] = mapped_column(String(16), default="pending")
    provider_name: Mapped[str] = mapped_column(String(128))
    provider_version: Mapped[str] = mapped_column(String(64))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    assets: Mapped[list["MediaAsset"]] = relationship(back_populates="session")


class MediaAsset(Base, TimestampMixin):
    __tablename__ = "media_assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("media_sessions.id"))
    call_id: Mapped[str] = mapped_column(String(36), ForeignKey("calls.id"))
    media_type: Mapped[str] = mapped_column(String(16))
    content_type: Mapped[str] = mapped_column(String(128))
    storage_ref: Mapped[str] = mapped_column(String(1024))
    byte_size: Mapped[int] = mapped_column(Integer)
    sha256: Mapped[str] = mapped_column(String(64))

    session: Mapped["MediaSession"] = relationship(back_populates="assets")
