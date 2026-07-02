# CLAUDE.md — Project: Aegis000 (Australian Emergency-Dispatch AI Layer)

> Build brief for Claude Code. Working name: **Aegis000**. This is the AI intelligence layer for Australian emergency call centres — the AU answer to Prepared (Axon 911). Start with the wedge (automated QA + transcription), not the full platform.

---

## 0. Context for the agent

We are building an **assistive AI layer** that plugs into *existing* Australian emergency-services infrastructure (state ESO CAD systems like NEC ControlWorks, Solacom Guardian call-handling, Esri GIS). We do **not** replace the phone system or CAD. We augment the humans on the headset.

Buyers = state government ESOs (NSW Police, ESTA Victoria, Ambulance services, QFES), not consumers. Design for government procurement, data residency, and life-safety failover from day one.

**Reference incumbent:** Prepared/Axon 911 (US). Their stack: non-emergency triage → live transcription → multilingual AI translation → on-demand livestream/photo → radio monitoring → 100% automated QA.

**Our wedge (Phase 1):** automated 100% call QA + real-time transcription. Lowest regulatory risk, fastest ROI, biggest unmet gap in AU.

---

## 1. Phase 1 scope (build this first)

### 1.1 Real-time transcription service
- Stream audio in, produce timestamped speech-to-text.
- Speaker diarisation (call-taker vs caller).
- Australian English tuning + common non-English language detection flag.
- Output: structured transcript object (JSON) with timestamps, speaker labels, confidence scores.

### 1.2 Automated QA engine
- Score **100% of calls**, not a sample.
- Configurable rubric per ESO (greeting, location capture, protocol adherence, empathy markers, call-control).
- Keyword/phrase triggers (e.g. "knife", "not breathing", "chest pain") surface as flags.
- Coaching moments auto-extracted with transcript timestamp + snippet.
- Supervisor dashboard: per-agent trend, team trend, flagged calls queue.

### 1.3 Supervisor dashboard (web)
- Call list with QA score, flags, language detected, duration.
- Drill-down: transcript + audio playback + scored rubric.
- Agent performance trends over time.
- Export for coaching / compliance records.

**Out of scope for Phase 1:** livestream video, dispatch radio monitoring, non-emergency deflection. Stub the interfaces but don't build.

---

## 2. Architecture principles (non-negotiable)

- **AU data residency.** All storage + processing in Australian cloud regions. No US region by default. Make region config explicit, not incidental.
- **Life-safety failover.** The AI layer must NEVER be in the critical path of answering a 000 call. It observes and assists; if it dies, call-taking continues fully manual. Document and enforce this boundary in code (read-only tap on the audio stream, not inline).
- **Auditability.** Every AI decision (score, flag, translation) is logged with model version, input hash, timestamp, and is reproducible. Treat this like a CPS 230 critical operation — full audit trail.
- **PII handling.** Call audio/transcripts are highly sensitive personal (and often health) information under the Privacy Act 1988 + state health privacy regimes. Encrypt at rest and in transit. Role-based access. Configurable retention + redaction.
- **Model-agnostic.** Abstract the speech + LLM providers behind an interface so translation/transcription backends can be swapped (and so on-prem/sovereign models can be dropped in for accreditation).

---

## 3. Suggested tech stack

| Layer | Choice | Notes |
|---|---|---|
| Backend | Python (FastAPI) | Matches existing build patterns; async for streaming |
| Transcription | Pluggable interface; start with a hosted STT, keep swap path to self-hosted (Whisper-class) | Accreditation may force sovereign/on-prem |
| QA / LLM scoring | Anthropic API behind an abstraction layer | Keep prompt templates versioned in-repo |
| Frontend | React + TypeScript, Tailwind | Supervisor dashboard |
| DB | Postgres (AU-region) | Transcripts, scores, audit log |
| Queue | Redis / task queue | Async QA processing per call |
| Auth | RBAC, SSO-ready (state ESOs will want SAML/AD) | |

---

## 4. Repo structure (proposed)

```
aegis000/
├── CLAUDE.md                  # this file
├── backend/
│   ├── transcription/         # STT interface + adapters
│   ├── qa/                    # scoring engine, rubrics, prompt templates
│   ├── audit/                 # immutable audit log
│   ├── api/                   # FastAPI routes
│   └── models/                # DB models
├── frontend/                  # React supervisor dashboard
├── rubrics/                   # per-ESO QA rubric configs (YAML)
├── docs/
│   ├── privacy-impact.md      # PIA template per state
│   ├── failover-design.md     # life-safety boundary spec
│   └── procurement-notes.md   # state ESO buyer map
└── tests/
```

---

## 5. Regulatory / compliance checklist (track as you build)

- [ ] Privacy Impact Assessment template (per-state, health-adjacent data)
- [ ] Data residency enforced + documented (AU regions only)
- [ ] Failover-to-manual boundary designed and tested (AI never inline)
- [ ] Full audit trail on every AI output (model version + input hash)
- [ ] RBAC + SSO/SAML for state AD integration
- [ ] Configurable retention + redaction policy
- [ ] Security accreditation path scoped (likely PROTECTED level)
- [ ] Encryption at rest + in transit

---

## 6. Phased roadmap (post-MVP)

- **Phase 2** — AI-native live audio translation (undercut TIS National human-interpreter response time) + automated CAD field pre-fill.
- **Phase 3** — On-demand livestream/photo from caller (build native to avoid single-vendor UK dependency à la BluLink/GoodSAM; target multi-state, not NSW-only).
- **Phase 4** — AI radio-channel monitoring layered on NEC ICCS/ControlWorks.

---

## 7. First tasks for Claude Code

1. Scaffold the repo structure above.
2. Build the transcription interface + one adapter + a mock adapter for local dev (no real audio needed to start).
3. Build the QA scoring engine with a sample YAML rubric and versioned prompt template.
4. Wire the audit log so every score is reproducible.
5. Stand up a minimal FastAPI + Postgres backend and a React dashboard shell showing a scored call list.

Build Phase 1 only. Stub Phases 2–4 interfaces, don't implement.
