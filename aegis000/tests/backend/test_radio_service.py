import pytest
from sqlalchemy import select

from app.models.audit import AuditLogEntry
from app.models.radio import RadioChannel, RadioEvent, RadioTransmission
from app.radio.mock_feed import MockRadioFeedAdapter
from app.radio.signals import load_signal_catalog
from app.services.radio import RadioMonitorService

CATALOG_PATH = "../rubrics/example-radio-signals.yaml"


def _service(db_session) -> RadioMonitorService:
    return RadioMonitorService(
        db_session, feed=MockRadioFeedAdapter(), catalog=load_signal_catalog(CATALOG_PATH)
    )


@pytest.mark.asyncio
async def test_poll_and_ingest_creates_channels_transmissions_events(db_session):
    result = await _service(db_session).poll_and_ingest()

    assert result["ingested"] > 0
    assert result["events"] > 0

    channels = (await db_session.execute(select(RadioChannel))).scalars().all()
    assert len(channels) >= 3  # police, ambulance, fire

    transmissions = (await db_session.execute(select(RadioTransmission))).scalars().all()
    assert all(t.transcribed for t in transmissions)  # mock provides text

    events = (await db_session.execute(select(RadioEvent))).scalars().all()
    assert any(e.category == "officer_safety" for e in events)


@pytest.mark.asyncio
async def test_radio_events_recorded_in_audit_log_with_subject_type(db_session):
    await _service(db_session).poll_and_ingest()

    entries = (
        await db_session.execute(select(AuditLogEntry).where(AuditLogEntry.action == "radio_event"))
    ).scalars().all()
    assert len(entries) > 0
    assert all(e.subject_type == "radio_transmission" for e in entries)
    assert all(e.call_id is None for e in entries)


@pytest.mark.asyncio
async def test_ingest_is_idempotent_on_external_ref(db_session):
    service = _service(db_session)
    await service.poll_and_ingest()

    # A second poll of the same window ingests nothing new.
    second = await service.poll_and_ingest()
    assert second["ingested"] == 0

    transmissions = (await db_session.execute(select(RadioTransmission))).scalars().all()
    refs = [t.external_ref for t in transmissions]
    assert len(refs) == len(set(refs))
