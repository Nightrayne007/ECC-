# Aegis000 — Phase 1 (AI QA + Transcription Wedge)

See `CLAUDE.md` for the full build brief. This is the Phase 1 scaffold:
real-time transcription (mock adapter for local dev), a 100%-coverage QA
scoring engine, a vocal-distress analysis engine, an immutable audit log,
and a supervisor dashboard shell.

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

See `backend/.env.example` for all settings.

## Architecture

See `docs/failover-design.md` for the life-safety boundary (Aegis is a
read-only tap; it can never affect call answering), `docs/privacy-impact.md`
for the data-handling posture, and `docs/procurement-notes.md` for the
buyer/compliance context.
