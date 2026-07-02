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
    AEGIS_DISTRESS_ANALYZER: Literal["mock", "signal"] = "mock"
    AEGIS_LIVESTREAM_PROVIDER: Literal["mock", "webrtc"] = "mock"
    AEGIS_MEDIA_STORE: Literal["local", "object"] = "local"
    AEGIS_RADIO_FEED: Literal["mock", "openmhz"] = "mock"

    # Explicit AU data residency — must never fall back to a provider default.
    AEGIS_DATA_REGION: str = "ap-southeast-2"
    AEGIS_RETENTION_DAYS: int = 365

    ANTHROPIC_API_KEY: str | None = None
    STT_ENDPOINT_URL: str | None = None

    # On-demand caller media (Phase 3). The invite secret MUST be overridden
    # with a strong random value in any real deployment.
    AEGIS_MEDIA_INVITE_SECRET: str = "dev-insecure-invite-secret-change-me"
    AEGIS_MEDIA_INVITE_TTL_SECONDS: int = 900
    AEGIS_MEDIA_LOCAL_DIR: str = "/tmp/aegis-media"
    AEGIS_MEDIA_INVITE_BASE_URL: str = "http://localhost:5173"
    AEGIS_LIVESTREAM_SFU_ENDPOINT: str | None = None

    # Radio monitoring (Phase 4). Signal catalog is per-ESO configurable.
    AEGIS_RADIO_SIGNAL_CATALOG: str = "../rubrics/example-radio-signals.yaml"
    AEGIS_RADIO_OPENMHZ_SYSTEM: str | None = None
    AEGIS_RADIO_OPENMHZ_BASE_URL: str = "https://api.openmhz.com"

    CORS_ORIGINS: list[str] = ["http://localhost:5173"]


def get_settings() -> Settings:
    return Settings()


settings = get_settings()
