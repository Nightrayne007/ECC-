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
- **Translated caller speech** (`backend/app/translation/`) — non-English
  caller segments translated to English for the call-taker/dashboard. A
  mistranslation of an address or symptom is a direct life-safety risk, not
  just a privacy one — the risk register should treat translation accuracy
  as a first-class item, and any real (non-mock) deployment should log
  which specific model/prompt version produced each translation (already
  done via the audit log) so a bad translation can be traced.
- **Draft CAD pre-fill fields** (`backend/app/cad/`) — incident type,
  location, and hazard extraction derived from the transcript (and, where
  present, its translation). This is a draft only — see
  `docs/failover-design.md` for the "never auto-submitted" boundary — but
  it is still an AI-derived summary of caller-reported information and
  should be scoped in the risk register (extraction accuracy, a wrong or
  missed location, a call-taker over-trusting the draft).
- **On-demand caller media** (`backend/app/livestream/`, `backend/app/services/media.py`)
  — photos and (in a real deployment) live video captured from a caller's
  own device at a call-taker's request. This is among the most sensitive
  data the system holds: it can depict injuries, minors, bystanders,
  interiors of homes, and other people who never consented. Controls
  already in code: single-use, time-limited invite tokens
  (`backend/app/livestream/tokens.py`); the caller must actively opt in by
  opening the invite and uploading; media stored behind a `MediaStore`
  interface so production can enforce an **AU-region, encrypted,
  access-controlled** object store (the dev `LocalMediaStore` is not for
  production). Risk register must cover: third-party subjects in the media,
  retention/deletion of media assets (tie to `AEGIS_RETENTION_DAYS`),
  and access control on the asset-fetch endpoint (RBAC — currently open in
  the scaffold, must be gated before deployment).
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
