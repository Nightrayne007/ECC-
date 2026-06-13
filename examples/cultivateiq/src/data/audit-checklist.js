// Granular audit checklist seed, grouped by domain, targeting the TGA's
// quarterly compliance reviews. Item status: "incomplete" | "in-progress" | "complete".
export const AUDIT_CHECKLIST = [
  {
    domain: "Security",
    items: [
      { id: "sec-1", label: "Perimeter CCTV coverage map current and signed off", status: "complete" },
      { id: "sec-2", label: "Access control logs reviewed for the quarter", status: "in-progress" },
      { id: "sec-3", label: "Alarm system test records on file (monthly)", status: "complete" },
      { id: "sec-4", label: "Visitor register complete with escorts recorded", status: "incomplete" },
    ],
  },
  {
    domain: "SOPs",
    items: [
      { id: "sop-1", label: "All cultivation SOPs within review date", status: "incomplete" },
      { id: "sop-2", label: "Pest management SOP reflects current chemicals register", status: "in-progress" },
      { id: "sop-3", label: "Sanitation SOP sign-off sheets current", status: "complete" },
    ],
  },
  {
    domain: "Records & Documentation",
    items: [
      { id: "rec-1", label: "Batch records complete and countersigned to date", status: "in-progress" },
      { id: "rec-2", label: "Inventory reconciliation performed for the period", status: "incomplete" },
      { id: "rec-3", label: "Temperature/humidity logs continuous (no gaps)", status: "complete" },
      { id: "rec-4", label: "Four-eyes QA ledger integrity verified", status: "complete" },
    ],
  },
  {
    domain: "Personnel & Training",
    items: [
      { id: "per-1", label: "Training matrix current for all cultivation staff", status: "in-progress" },
      { id: "per-2", label: "Fit-and-proper-person checks within validity", status: "complete" },
      { id: "per-3", label: "New starter inductions documented", status: "complete" },
    ],
  },
  {
    domain: "Waste & Disposal",
    items: [
      { id: "was-1", label: "Destruction records witnessed and reconciled", status: "incomplete" },
      { id: "was-2", label: "Waste protocol matches current ODC guidance", status: "incomplete" },
    ],
  },
  {
    domain: "Labelling & Packaging (TGO 93)",
    items: [
      { id: "lab-1", label: "Outbound labelling reviewed against current TGO 93", status: "in-progress" },
      { id: "lab-2", label: "Child-resistant packaging readiness assessed (proposed reform)", status: "incomplete" },
      { id: "lab-3", label: "Active-ingredient statements verified on dispatch docs", status: "complete" },
    ],
  },
];
