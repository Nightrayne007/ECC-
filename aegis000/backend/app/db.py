"""Async SQLAlchemy engine/session wiring."""

from __future__ import annotations

from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings
from app.models.base import Base

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncIterator[AsyncSession]:
    async with AsyncSessionLocal() as session:
        yield session


async def init_models() -> None:
    """Dev-only schema creation. Production deployments should use Alembic
    migrations instead — not built in Phase 1 to keep scope tight."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
