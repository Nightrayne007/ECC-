import { COLORS } from "../constants/theme.js";

// Reform pipeline reshaping the cultivation compliance landscape — surfaced in
// the Reform Tracker and used to ground the Co-pilot and AI briefings.
// `keyDate` (nullable ISO date) feeds the alerts engine where a reform has a
// clean effective date; free-text `timeline` remains the display string.
export const REFORM_TRACKER = [
  {
    id: 1,
    regulator: "TGA",
    area: "Compliance cadence",
    title: "Quarterly compliance reviews replace the annual cycle",
    status: "Confirmed",
    statusColor: COLORS.danger,
    timeline: "Effective from 1 Jul 2026 (FY2026-27)",
    keyDate: "2026-07-01",
    summary: "Medicinal cannabis has been named a top-tier focus area in the TGA's 2026-27 Compliance Priorities. Cultivation and manufacturing licence holders move from annual assessments to quarterly desk audits.",
    impact: "Cultivation logs, QMS records and batch documentation will need to be audit-ready every quarter from July, not just at annual renewal. Expect the first quarterly review window to open shortly after FY start.",
    actionPrompt: "Draft a quarterly compliance review readiness checklist for our QLD cultivation facility ahead of the TGA's move to quarterly desk audits from 1 July 2026.",
  },
  {
    id: 2,
    regulator: "TGA",
    area: "Manufacturing & labelling",
    title: "TGO 93 rewrite: GMP-equivalent imports & child-resistant packaging",
    status: "Drafting",
    statusColor: COLORS.warning,
    timeline: "Consultation closed — exposure draft & transition period TBC",
    keyDate: null,
    summary: "TGA is finalising a rewritten Therapeutic Goods Order No. 93, introducing GMP-equivalence for imported medicinal cannabis, mandatory child-resistant closures, and clearer active-ingredient label statements, with amendments to the Therapeutic Goods Regulation 1990 and Narcotic Drugs Regulation 2016.",
    impact: "Primary packaging and labelling SOPs for product leaving the cultivation site for manufacture should be reviewed now so the facility isn't caught short once the transition period opens.",
    actionPrompt: "Explain how the proposed TGO 93 rewrite (GMP-equivalence, child-resistant packaging, clearer labelling) could affect a QLD cultivation permit holder supplying dried flower to manufacturers, and what SOP changes to prepare now.",
  },
  {
    id: 3,
    regulator: "TGA / ODC",
    area: "SAS, AP & compounding",
    title: "SAS/AP streamlining and Category 5 (>98% THC) removal proposal",
    status: "Under development",
    statusColor: COLORS.purple,
    timeline: "Narcotic Drugs Regulation 2016 amendments in development",
    keyDate: null,
    summary: "Proposed reforms would drop the TGO 93 declaration form from Special Access Scheme and Authorised Prescriber applications, require prior SAS approval before extemporaneous compounding, and — per AMA-backed recommendations — remove Category 5 (>98% THC) products from the framework entirely.",
    impact: "No direct change to the cultivation licence, but removal of Category 5 could soften manufacturer demand for isolate-grade, ultra-high-THC inputs — worth factoring into strain planning for future high-THC batches.",
    actionPrompt: "If Category 5 (>98% THC) medicinal cannabis products are removed from the TGO 93 framework, how might that affect demand for ultra-high-THC cultivars, and should we adjust our cultivation strain mix?",
  },
  {
    id: 4,
    regulator: "ODC",
    area: "Enforcement",
    title: "Heightened site inspections and enforcement activity",
    status: "Active now",
    statusColor: COLORS.danger,
    timeline: "Ongoing through 2026",
    keyDate: null,
    summary: "Recent enforcement action against non-compliant licence holders has produced fines exceeding $100,000, alongside a marked increase in unannounced inspection frequency across the cultivation sector.",
    impact: "Security documentation, SOP currency and record-keeping need to withstand an unannounced inspection at any time — this overlaps directly with the open items in your Permit Accelerator gap analysis.",
    actionPrompt: "Given heightened ODC enforcement and unannounced inspections, what should we have ready at all times, and how should our current permit gap areas be prioritised in response?",
  },
];
