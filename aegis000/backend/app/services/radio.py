"""Radio monitor orchestration: poll feed -> extract events -> persist.

Observe-only: this service reads a radio feed and records what it hears. It
has no transmit path. Every extracted priority event is written to the
immutable audit log, the same reproducibility guarantee as QA scores and
flags. Ingestion is idempotent on a transmission's external_ref, so
re-polling the same window does not duplicate rows.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit.log import AuditLogger
from app.models.radio import RadioChannel, RadioEvent, RadioTransmission
from app.radio.interface import RadioFeedAdapter, RadioTransmission as RadioTransmissionVO
from app.radio.signals import RadioSignalCatalog, extract_events


class RadioMonitorService:
    def __init__(self, session: AsyncSession, *, feed: RadioFeedAdapter, catalog: RadioSignalCatalog) -> None:
        self._session = session
        self._feed = feed
        self._catalog = catalog

    async def _get_or_create_channel(self, tx: RadioTransmissionVO) -> RadioChannel:
        existing = (
            await self._session.execute(
                select(RadioChannel).where(RadioChannel.external_id == tx.channel_external_id)
            )
        ).scalar_one_or_none()
        if existing is not None:
            return existing
        channel = RadioChannel(external_id=tx.channel_external_id, label=tx.channel_label, service=tx.service)
        self._session.add(channel)
        await self._session.flush()
        return channel

    async def ingest_transmissions(self, transmissions: list[RadioTransmissionVO]) -> dict:
        audit = AuditLogger(self._session)
        ingested = 0
        events_created = 0

        for tx in transmissions:
            already = (
                await self._session.execute(
                    select(RadioTransmission).where(RadioTransmission.external_ref == tx.external_ref)
                )
            ).scalar_one_or_none()
            if already is not None:
                continue

            channel = await self._get_or_create_channel(tx)
            row = RadioTransmission(
                channel_id=channel.id,
                external_ref=tx.external_ref,
                source=tx.source,
                started_at=tx.started_at,
                duration_ms=tx.duration_ms,
                text=tx.text,
                audio_ref=tx.audio_ref,
                transcribed=tx.text is not None,
            )
            self._session.add(row)
            await self._session.flush()
            ingested += 1

            matches = extract_events(tx.text or "", self._catalog)
            for match in matches:
                self._session.add(
                    RadioEvent(
                        transmission_id=row.id,
                        channel_id=channel.id,
                        category=match.category,
                        severity=match.severity,
                        phrase=match.phrase,
                        meaning=match.meaning,
                    )
                )
                events_created += 1

            if matches:
                await audit.record(
                    subject_type="radio_transmission",
                    subject_ref=row.id,
                    action="radio_event",
                    model_name=self._catalog.name,
                    model_version=self._catalog.version,
                    prompt_version=None,
                    input_payload={"external_ref": tx.external_ref, "text": tx.text},
                    output_payload={
                        "events": [
                            {"phrase": m.phrase, "category": m.category, "severity": m.severity} for m in matches
                        ]
                    },
                )

        await self._session.commit()
        return {"ingested": ingested, "events": events_created}

    async def poll_and_ingest(self, *, since=None, limit: int = 50) -> dict:
        transmissions = await self._feed.poll(since=since, limit=limit)
        return await self.ingest_transmissions(transmissions)
