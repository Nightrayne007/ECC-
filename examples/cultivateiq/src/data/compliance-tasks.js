// Seed data only — live task state (completed/snoozed, derived status) is
// managed by useCompliance and persisted to localStorage.
export const COMPLIANCE_TASKS = [
  { id: 1, title: "Monthly cultivation report to ODC", due: "2026-06-30", priority: "high" },
  { id: 2, title: "Batch record BT-2026-041 sign-off", due: "2026-06-13", priority: "high" },
  { id: 7, title: "Quarterly compliance review readiness (TGA, effective 1 Jul 2026)", due: "2026-06-15", priority: "high" },
  { id: 3, title: "Pest management SOP review", due: "2026-06-05", priority: "medium" },
  { id: 8, title: "TGO 93 labelling & packaging SOP gap assessment", due: "2026-06-20", priority: "medium" },
  { id: 4, title: "Storage facility temperature logs", due: "2026-06-18", priority: "medium" },
  { id: 5, title: "Staff training records update", due: "2026-07-15", priority: "low" },
  { id: 6, title: "Annual licence renewal application", due: "2026-06-30", priority: "high" },
];
