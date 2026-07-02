"""Shared pytest fixtures for the Aegis000 backend test suite.

Uses a real Postgres database (via DATABASE_URL / docker-compose) rather
than SQLite, since the schema relies on JSONB columns for audit/transcript
snapshots. Each test runs inside a transaction that's rolled back after,
so tests stay isolated without needing a fresh DB per test.
"""

from __future__ import annotations

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.db import engine
from app.models.base import Base


@pytest_asyncio.fixture(scope="session", autouse=True)
async def _create_schema():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session() -> AsyncSession:
    connection = await engine.connect()
    transaction = await connection.begin()
    session_factory = async_sessionmaker(bind=connection, expire_on_commit=False, join_transaction_mode="create_savepoint")
    session = session_factory()

    yield session

    await session.close()
    await transaction.rollback()
    await connection.close()


@pytest.fixture
def rubric():
    from app.qa.rubric import load_rubric

    return load_rubric("../rubrics/example-eso-v1.yaml")
