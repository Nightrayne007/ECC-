# Aegis000 — Phases 1–3

See `CLAUDE.md` for the full build brief. Phase 1 scaffold: real-time
transcription (mock adapter for local dev), a 100%-coverage QA scoring
engine, a vocal-distress analysis engine, an immutable audit log, and a
supervisor dashboard shell. Phase 2: live translation of non-English caller
speech and automated CAD field pre-fill (draft only — see
`docs/failover-design.md`). Phase 3: on-demand caller media (photo/livestream)
built native — a single-use, time-limited invite backbone with a swappable
media store and transport (photo capture is fully functional; live video
transport is the SFU swap-in). Phase 4 remains an interface-only stub.

## Local dev quickstart

No API keys or real audio required — everything runs through deterministic
mock adapters by default.

```bash
# 1. Start Postgres + Redis
docker compose up -d

# 2. Backend: install, seed, run
cd backend
pip install -r requirements.txt -r requirements-dev.txt
python scripts/seed_dev_data.py
uvicorn app.main:app --reload

# 3. Frontend (separate terminal)
cd ../frontend
npm install
npm run dev
```

Dashboard: `http://localhost:5173` · API: `http://localhost:8000`

## Tests

```bash
cd backend
pytest
```

## Switching to real backends

- `AEGIS_LLM_PROVIDER=claude` — routes QA scoring through the repo's
  existing `llm` package (`src/llm`) instead of the deterministic mock.
  Requires `ANTHROPIC_API_KEY`.
- `AEGIS_TRANSCRIPTION_ADAPTER=hosted` — routes transcription through a
  configurable `STT_ENDPOINT_URL` instead of the mock adapter.
- `AEGIS_DISTRESS_ANALYZER=signal` — routes vocal-distress analysis through
  `backend/app/distress/signal_analyzer.py`, real numpy signal processing
  (autocorrelation pitch tracking + RMS energy spike detection) instead of
  the transcript-derived mock heuristics. Requires wiring a real audio
  source (raw PCM) into its `audio_loader`; not connected to a real source
  in Phase 1, but the DSP itself is genuine and unit-tested against
  synthetic sine-wave audio.

Translation (`backend/app/translation/`) and CAD field extraction
(`backend/app/cad/`) both follow `AEGIS_LLM_PROVIDER` too — `mock` (default)
uses deterministic/heuristic local logic, `claude` routes through the same
`src/llm` abstraction as QA scoring.

Caller media (`backend/app/livestream/`) uses `AEGIS_LIVESTREAM_PROVIDER`
(`mock` default vs `webrtc` for a real SFU) and `AEGIS_MEDIA_STORE` (`local`
dev filesystem vs an AU-region `object` store). The invite secret
(`AEGIS_MEDIA_INVITE_SECRET`) MUST be changed from its dev default for any
real deployment.

See `backend/.env.example` for all settings.

## Architecture

See `docs/failover-design.md` for the life-safety boundary (Aegis is a
read-only tap; it can never affect call answering), `docs/privacy-impact.md`
for the data-handling posture, and `docs/procurement-notes.md` for the
buyer/compliance context.
