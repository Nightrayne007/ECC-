"""Runtime configuration for the Aegis000 backend."""

from __future__ import annotations

from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="", env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql+asyncpg://aegis:aegis@localhost:5432/aegis000"
    REDIS_URL: str = "redis://localhost:6379/0"

    AEGIS_LLM_PROVIDER: Literal["mock", "claude"] = "mock"
    AEGIS_TRANSCRIPTION_ADAPTER: Literal["mock", "hosted"] = "mock"

    # Explicit AU data residency — must never fall back to a provider default.
    AEGIS_DATA_REGION: str = "ap-southeast-2"
    AEGIS_RETENTION_DAYS: int = 365

    ANTHROPIC_API_KEY: str | None = None
    STT_ENDPOINT_URL: str | None = None

    CORS_ORIGINS: list[str] = ["http://localhost:5173"]


def get_settings() -> Settings:
    return Settings()


settings = get_settings()
