// Document register seed. Status (valid / expiring-soon / expired) is derived
// at render time via computeDocStatus(doc, today, leadDays).
export const DOCUMENT_REGISTER = [
  { id: "doc-1", name: "ODC Medicinal Cannabis Licence MC-2024-QLD-0047", category: "Licence", issued: "2024-07-01", expires: "2027-06-30", owner: "R. Chand" },
  { id: "doc-2", name: "Cultivation Permit (current period)", category: "Permit", issued: "2025-07-01", expires: "2026-06-30", owner: "R. Chand" },
  { id: "doc-3", name: "Pest Management SOP v3", category: "SOP", issued: "2025-06-05", expires: "2026-06-05", owner: "M. Tanaka" },
  { id: "doc-4", name: "Security & Access Control Plan", category: "Security", issued: "2025-10-01", expires: "2026-09-30", owner: "P. Sharma" },
  { id: "doc-5", name: "Staff Training Matrix", category: "Personnel", issued: "2025-07-15", expires: "2026-07-15", owner: "S. Reyes" },
  { id: "doc-6", name: "Waste Disposal Protocol v2", category: "SOP", issued: "2025-05-31", expires: "2026-05-31", owner: "J. O'Brien" },
  { id: "doc-7", name: "Public Liability Insurance Certificate", category: "Insurance", issued: "2025-08-12", expires: "2026-08-12", owner: "R. Chand" },
  { id: "doc-8", name: "Environmental Sensor Calibration Certificates", category: "Calibration", issued: "2025-06-20", expires: "2026-06-20", owner: "M. Tanaka" },
];
