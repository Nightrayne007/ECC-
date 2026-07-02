# Aegis000 — Phase 1 (AI QA + Transcription Wedge)

See `CLAUDE.md` for the full build brief. This is the Phase 1 scaffold:
real-time transcription (mock adapter for local dev), a 100%-coverage QA
scoring engine, an immutable audit log, and a supervisor dashboard shell.

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

See `backend/.env.example` for all settings.

## Architecture

See `docs/failover-design.md` for the life-safety boundary (Aegis is a
read-only tap; it can never affect call answering), `docs/privacy-impact.md`
for the data-handling posture, and `docs/procurement-notes.md` for the
buyer/compliance context.
