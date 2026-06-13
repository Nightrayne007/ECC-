// Seed batch data — live batch state (stage advancement, stageHistory) is
// managed by useCompliance and persisted to localStorage.
export const BATCH_DATA = [
  { id: "BT-2026-039", strain: "Bedrocan T22", stage: "Flowering", week: 7, thc: "Est. 21.4%", status: "On track", planted: "2026-04-20" },
  { id: "BT-2026-040", strain: "CBD Crew CBD+", stage: "Vegetative", week: 3, thc: "Est. 1.1%", status: "On track", planted: "2026-05-20" },
  { id: "BT-2026-041", strain: "Tilray T9", stage: "Harvest ready", week: 10, thc: "Est. 9.2%", status: "Action needed", planted: "2026-04-01" },
  { id: "BT-2026-038", strain: "Bedrocan T22", stage: "Drying", week: 11, thc: "Tested 22.1%", status: "Complete", planted: "2026-03-25" },
];

// Canonical seed-to-harvest stage sequence with target durations (days).
export const GROW_STAGE_ORDER = [
  { key: "seed", label: "Seed / Clone", targetDays: 3 },
  { key: "germination", label: "Germination", targetDays: 10 },
  { key: "vegetative", label: "Vegetative", targetDays: 28 },
  { key: "flowering", label: "Flowering", targetDays: 63 },
  { key: "drying", label: "Drying", targetDays: 10 },
  { key: "curing", label: "Curing", targetDays: 14 },
  { key: "harvested", label: "Harvested", targetDays: null },
];

// Display labels used in BATCH_DATA that map onto a canonical stage key.
export const STAGE_ALIASES = {
  "Harvest ready": "flowering",
};

export function stageKeyForLabel(label) {
  if (STAGE_ALIASES[label]) return STAGE_ALIASES[label];
  const found = GROW_STAGE_ORDER.find((s) => s.label === label);
  return found ? found.key : null;
}

// Grow-room environmental target ranges per stage, used for the
// weather-vs-room HVAC load correlation in the Grow Journey view.
export const STAGE_TARGETS = {
  seed: { tempC: [22, 26], humidityPct: [70, 80] },
  germination: { tempC: [22, 26], humidityPct: [65, 75] },
  vegetative: { tempC: [22, 27], humidityPct: [55, 65] },
  flowering: { tempC: [21, 25], humidityPct: [45, 55] },
  drying: { tempC: [18, 21], humidityPct: [50, 60] },
  curing: { tempC: [17, 20], humidityPct: [55, 62] },
  harvested: { tempC: [15, 25], humidityPct: [40, 60] },
};

// Plausible per-batch stage history consistent with each batch's planted date
// and current stage. Consumed only by useCompliance's seedState().
export const GROW_JOURNEY_SEED = {
  "BT-2026-039": [
    { stage: "seed", enteredOn: "2026-04-20", targetDays: 3, actualDays: 3 },
    { stage: "germination", enteredOn: "2026-04-23", targetDays: 10, actualDays: 10 },
    { stage: "vegetative", enteredOn: "2026-05-03", targetDays: 28, actualDays: 26 },
    { stage: "flowering", enteredOn: "2026-05-29", targetDays: 63, actualDays: null },
  ],
  "BT-2026-040": [
    { stage: "seed", enteredOn: "2026-05-20", targetDays: 3, actualDays: 3 },
    { stage: "germination", enteredOn: "2026-05-23", targetDays: 10, actualDays: 9 },
    { stage: "vegetative", enteredOn: "2026-06-01", targetDays: 28, actualDays: null },
  ],
  "BT-2026-041": [
    { stage: "seed", enteredOn: "2026-04-01", targetDays: 3, actualDays: 3 },
    { stage: "germination", enteredOn: "2026-04-04", targetDays: 10, actualDays: 10 },
    { stage: "vegetative", enteredOn: "2026-04-14", targetDays: 28, actualDays: 24 },
    { stage: "flowering", enteredOn: "2026-05-08", targetDays: 63, actualDays: null },
  ],
  "BT-2026-038": [
    { stage: "seed", enteredOn: "2026-03-25", targetDays: 3, actualDays: 3 },
    { stage: "germination", enteredOn: "2026-03-28", targetDays: 10, actualDays: 10 },
    { stage: "vegetative", enteredOn: "2026-04-07", targetDays: 28, actualDays: 28 },
    { stage: "flowering", enteredOn: "2026-05-05", targetDays: 63, actualDays: 31 },
    { stage: "drying", enteredOn: "2026-06-05", targetDays: 10, actualDays: null },
  ],
};

// Read-only environmental readings per batch. Shaped so a future
// "Add Reading" action could append entries.
export const GROWTH_METRICS_SEED = {
  "BT-2026-039": [
    { date: "2026-05-08", tempC: 24.8, humidityPct: 58, lightHours: 18, ec: 1.6, ph: 6.0 },
    { date: "2026-05-15", tempC: 24.2, humidityPct: 56, lightHours: 18, ec: 1.7, ph: 6.1 },
    { date: "2026-05-22", tempC: 24.5, humidityPct: 54, lightHours: 18, ec: 1.8, ph: 6.0 },
    { date: "2026-05-29", tempC: 23.6, humidityPct: 52, lightHours: 12, ec: 1.9, ph: 6.2 },
    { date: "2026-06-05", tempC: 23.2, humidityPct: 50, lightHours: 12, ec: 2.0, ph: 6.1 },
    { date: "2026-06-12", tempC: 23.4, humidityPct: 49, lightHours: 12, ec: 2.0, ph: 6.0 },
  ],
  "BT-2026-040": [
    { date: "2026-05-23", tempC: 25.1, humidityPct: 72, lightHours: 18, ec: 0.8, ph: 5.9 },
    { date: "2026-05-30", tempC: 25.4, humidityPct: 66, lightHours: 18, ec: 1.0, ph: 6.0 },
    { date: "2026-06-06", tempC: 24.9, humidityPct: 62, lightHours: 18, ec: 1.2, ph: 6.1 },
    { date: "2026-06-12", tempC: 25.0, humidityPct: 60, lightHours: 18, ec: 1.3, ph: 6.0 },
  ],
  "BT-2026-041": [
    { date: "2026-05-08", tempC: 24.0, humidityPct: 55, lightHours: 12, ec: 1.8, ph: 6.1 },
    { date: "2026-05-15", tempC: 23.8, humidityPct: 53, lightHours: 12, ec: 1.9, ph: 6.0 },
    { date: "2026-05-22", tempC: 23.5, humidityPct: 51, lightHours: 12, ec: 2.0, ph: 6.2 },
    { date: "2026-05-29", tempC: 23.2, humidityPct: 49, lightHours: 12, ec: 2.0, ph: 6.1 },
    { date: "2026-06-05", tempC: 22.9, humidityPct: 47, lightHours: 12, ec: 1.9, ph: 6.0 },
    { date: "2026-06-12", tempC: 23.0, humidityPct: 46, lightHours: 12, ec: 1.8, ph: 6.0 },
  ],
  "BT-2026-038": [
    { date: "2026-05-22", tempC: 23.0, humidityPct: 50, lightHours: 12, ec: 1.9, ph: 6.1 },
    { date: "2026-05-29", tempC: 22.8, humidityPct: 49, lightHours: 12, ec: 1.8, ph: 6.0 },
    { date: "2026-06-05", tempC: 19.5, humidityPct: 56, lightHours: 0, ec: null, ph: null },
    { date: "2026-06-12", tempC: 19.2, humidityPct: 55, lightHours: 0, ec: null, ph: null },
  ],
};
