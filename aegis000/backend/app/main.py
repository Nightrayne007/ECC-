"""Aegis000 FastAPI application factory."""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import routes_agents, routes_audit, routes_calls, routes_qa
from app.config import settings
from app.db import init_models


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    await init_models()
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="Aegis000 API", version="0.1.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(routes_calls.router)
    app.include_router(routes_agents.router)
    app.include_router(routes_qa.router)
    app.include_router(routes_audit.router)

    @app.get("/healthz")
    async def healthz() -> dict:
        return {"status": "ok", "data_region": settings.AEGIS_DATA_REGION}

    return app


app = create_app()
