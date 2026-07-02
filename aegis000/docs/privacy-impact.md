# Privacy Impact Assessment — Aegis000 (Template)

> Stub template. Complete per-state before any production deployment. Not a
> substitute for legal/compliance review.

## Purpose

[TODO: describe the specific processing purpose for this deployment/ESO]

## Data Categories

- Call audio (raw and derived transcripts)
- Speaker-diarised transcript text, timestamps, confidence scores
- Detected/flagged keywords and coaching moments (may include health-adjacent
  content, e.g. medical conditions mentioned by callers)
- **Inferred vocal-distress markers** (`backend/app/distress/`) — speech
  rate, pitch variance, energy spikes, and text-derived tremor proxies
  computed from the caller's voice/speech. This is an *inference about a
  person's emotional/physiological state*, not a direct record — treat it
  as at least as sensitive as the health-adjacent transcript content above,
  and scope it explicitly in the risk register below (inference accuracy,
  risk of a wrong high-distress inference affecting triage/coaching, and
  whether callers should be informed distress is being inferred from their
  voice).
- Agent identifiers and performance scores
- Audit log entries (model version, input/output hashes, snapshots)

## Legal Basis

- Privacy Act 1988 (Cth)
- State health privacy regimes (varies by jurisdiction — see Per-State
  Variations below)

## Data Flow Diagram

[TODO: diagram — audio tap → transcription → QA scoring → storage → dashboard]

## Retention & Redaction Configuration

- Retention window: `AEGIS_RETENTION_DAYS` (`backend/app/config.py`) — default 365 days. [TODO: confirm per-ESO requirement]
- Redaction policy: [TODO — not yet implemented; scope for a Phase 1 follow-up]

## Risk Register

[TODO: enumerate risks — unauthorised access, re-identification, retention overrun, cross-border processing]

## Per-State Variations

| State | Health Privacy Regime | Notes |
|---|---|---|
| NSW | [TODO] | |
| VIC | [TODO] | |
| QLD | [TODO] | |
| WA | [TODO] | |
| SA | [TODO] | |
| TAS | [TODO] | |
| ACT | [TODO] | |
| NT | [TODO] | |
