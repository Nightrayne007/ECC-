import pytest

from app.radio.mock_feed import MockRadioFeedAdapter
from app.radio.signals import extract_events, load_signal_catalog

CATALOG_PATH = "../rubrics/example-radio-signals.yaml"


@pytest.mark.asyncio
async def test_mock_feed_returns_transmissions_with_text():
    feed = MockRadioFeedAdapter()
    transmissions = await feed.poll()
    assert len(transmissions) > 0
    assert all(t.text for t in transmissions)
    assert {t.service for t in transmissions} >= {"police", "ambulance", "fire"}


@pytest.mark.asyncio
async def test_mock_feed_is_deterministic():
    feed = MockRadioFeedAdapter()
    first = await feed.poll()
    second = await feed.poll()
    assert [t.external_ref for t in first] == [t.external_ref for t in second]
    assert [t.text for t in first] == [t.text for t in second]


@pytest.mark.asyncio
async def test_mock_feed_since_cursor_filters_older_transmissions():
    feed = MockRadioFeedAdapter()
    everything = await feed.poll()
    midpoint = everything[2].started_at
    newer = await feed.poll(since=midpoint)
    assert all(t.started_at > midpoint for t in newer)
    assert len(newer) == len(everything) - 3


def test_signal_catalog_loads():
    catalog = load_signal_catalog(CATALOG_PATH)
    assert catalog.eso_id == "example-eso"
    assert any(s.phrase == "signal one" for s in catalog.signals)


def test_event_extraction_matches_priority_phrases():
    catalog = load_signal_catalog(CATALOG_PATH)
    events = extract_events("Signal one, signal one, shots fired, officer down.", catalog)
    categories = {e.category for e in events}
    assert "officer_safety" in categories
    assert "firearms" in categories
    assert all(e.severity == "critical" for e in events)


def test_event_extraction_no_false_positive():
    catalog = load_signal_catalog(CATALOG_PATH)
    events = extract_events("Routine patrol, all quiet, returning to station.", catalog)
    assert events == []
