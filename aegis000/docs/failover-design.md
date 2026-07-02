# Failover Design — Life-Safety Boundary

## Life-Safety Principle

Aegis000 must never be in the critical path of answering or handling a
000 call. It observes and assists; if it dies, call-taking continues fully
manual. This is enforced in code, not just documented here.

## Architecture Boundary

- `backend/app/ingestion/tap.py` — `AudioTap`: a strictly read-only
  consumer of a copy of the audio stream. Nothing downstream of it ever
  writes back to the source.
- `backend/app/ingestion/failover.py` — `isolate_from_call_path`: a
  decorator applied to `run_pipeline_for_call` (and `rescore_call`) in
  `backend/app/pipeline/process_call.py`. Any exception raised anywhere in
  the pipeline is logged and converted to a `PipelineFailure` sentinel
  instead of propagating.
- The FastAPI routes in `backend/app/api/` are exclusively supervisor-facing
  reads plus an async rescore trigger — no route result ever gates or
  affects call answering/routing.
- **CAD field pre-fill (`backend/app/cad/`) is display-only.** It produces
  a `CadPrefillResult`/`CadPrefillRow` — a *draft* for a human call-taker
  to review — and nothing else. There is no code path anywhere in this
  codebase that submits a `CadPrefillResult` to a real CAD system; no such
  integration exists. If one is ever built, it must require an explicit
  human confirmation step before anything reaches CAD — never an automatic
  write. The dashboard (`frontend/src/components/CadPrefillPanel.tsx`)
  reflects this in the UI with an explicit "DRAFT — not submitted
  automatically" banner, not just in the backend.
- **On-demand caller media (`backend/app/livestream/`, Phase 3) is
  human-initiated and consent-gated.** A photo/livestream is only ever
  requested by a call-taker action (`POST /api/calls/{id}/media-sessions`),
  and only ever delivered because the caller chose to open the single-use
  invite and upload/join. Nothing in the media path gates or blocks
  answering the 000 call; a media request failing (or the SFU being
  unreachable) has no effect on call-taking. The invite is time-limited and
  single-use (`backend/app/livestream/tokens.py` + session-status check in
  `backend/app/services/media.py`) so a leaked link cannot be replayed.

## Failure Modes & Degradation Behaviour

[TODO: enumerate concrete failure modes once integrated with a real CAD/CTI
source — STT outage, LLM outage, DB outage, worker queue backlog — and the
expected degraded state for each]

## Testing Strategy

`tests/backend/test_failover_isolation.py` proves the boundary: a
transcription adapter that raises mid-pipeline yields a `PipelineFailure`
(never an exception), and a subsequent healthy call still processes
normally in the same process — modelling "AI failing on one call doesn't
take down the ability to process or serve others."

## Open Questions for Real ControlWorks/Guardian Integration

[TODO: how is the audio tap physically implemented against NEC ControlWorks
/ Solacom Guardian — SIP fork, RTP mirror, recording-system feed? Who owns
the go/no-go decision if Aegis is unreachable?]
