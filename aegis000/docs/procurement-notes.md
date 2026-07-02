# Procurement Notes — Aegis000 (Template)

> Stub template for the buyer-facing/commercial context. Not a policy
> document — fill in per active sales motion.

## Buyer Map (Per-State ESO)

| State | Primary Buyer | CAD/Call-Handling System | Status |
|---|---|---|---|
| NSW | [TODO — NSW Police, Ambulance NSW] | NEC ControlWorks / Solacom Guardian | [TODO] |
| VIC | [TODO — ESTA Victoria] | [TODO] | [TODO] |
| QLD | [TODO — QFES] | [TODO] | [TODO] |
| WA | [TODO] | [TODO] | [TODO] |
| SA | [TODO] | [TODO] | [TODO] |
| TAS | [TODO] | [TODO] | [TODO] |
| ACT | [TODO] | [TODO] | [TODO] |
| NT | [TODO] | [TODO] | [TODO] |

## Incumbent Comparison (Prepared / Axon 911)

[TODO: feature-by-feature comparison — non-emergency triage, live
transcription, multilingual translation, livestream/photo, radio
monitoring, automated QA. Note Aegis000's wedge is QA + transcription only
in Phase 1.]

## Radio Monitoring — Feed Sourcing (Phase 4)

- **Production source: direct ICCS/ControlWorks tap.** Radio monitoring is
  only viable in a real deployment via an authorized tap on the ESO's own
  NEC ICCS/ControlWorks radio infrastructure — unencrypted at source and
  under the ESO's lawful basis.
- **Public feeds are dev/demo only, not a product input.** Broadcastify is
  the main aggregator of AU emergency feeds but is freemium and its ToS
  forbids competing scanner apps; RadioReference is metadata-only and paid.
  The one genuinely-free JSON API returning real call audio is **OpenMHz**
  (the bundled `OpenMHzRadioFeedAdapter`), but AU coverage is thin because
  most AU emergency voice (NSW PSN, much of SA GRN) is **encrypted P25** and
  cannot be lawfully received in the clear.
- **Implication:** do not pitch radio monitoring as scraping public feeds —
  it is an integration play against the ESO's own network.

## Accreditation Path (Likely PROTECTED Level)

[TODO: scope security accreditation requirements — ISM controls, IRAP
assessment, hosting environment certification]

## Pricing / Packaging Notes

[TODO]
