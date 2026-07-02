import pytest

from app.audit.hashing import canonical_json, sha256_hex
from app.audit.log import AuditLogger, verify_entry
from app.models.agent import Agent
from app.models.call import Call
from datetime import datetime, timezone


def test_canonical_json_is_key_order_independent():
    a = {"b": 1, "a": 2}
    b = {"a": 2, "b": 1}
    assert canonical_json(a) == canonical_json(b)
    assert sha256_hex(canonical_json(a)) == sha256_hex(canonical_json(b))


async def _make_call(db_session) -> Call:
    agent = Agent(external_id="agent-audit-test", name="Audit Test Agent")
    db_session.add(agent)
    await db_session.flush()
    call = Call(agent_id=agent.id, audio_ref="n/a", started_at=datetime.now(timezone.utc))
    db_session.add(call)
    await db_session.flush()
    return call


@pytest.mark.asyncio
async def test_recorded_entry_verifies_true(db_session):
    call = await _make_call(db_session)
    logger = AuditLogger(db_session)
    entry = await logger.record(
        call_id=call.id,
        action="qa_score",
        model_name="mock-scorer",
        model_version="mock-1",
        prompt_version="qa-scoring-v1",
        input_payload={"foo": "bar"},
        output_payload={"score": 0.8},
    )
    assert verify_entry(entry) is True


@pytest.mark.asyncio
async def test_mutated_snapshot_fails_verification(db_session):
    call = await _make_call(db_session)
    logger = AuditLogger(db_session)
    entry = await logger.record(
        call_id=call.id,
        action="qa_score",
        model_name="mock-scorer",
        model_version="mock-1",
        prompt_version="qa-scoring-v1",
        input_payload={"foo": "bar"},
        output_payload={"score": 0.8},
    )
    entry.output_snapshot = {"score": 0.99}  # tampered
    assert verify_entry(entry) is False
