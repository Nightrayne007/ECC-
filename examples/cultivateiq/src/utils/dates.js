const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function startOfDay(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function parseDate(iso) {
  // Treat "YYYY-MM-DD" as a local date, not UTC midnight.
  const [y, m, day] = iso.split("-").map(Number);
  return new Date(y, m - 1, day);
}

export function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Whole days from `from` to `to` (positive if `to` is later).
export function diffDays(from, to) {
  return Math.round((startOfDay(to) - startOfDay(from)) / MS_PER_DAY);
}

export function computeTaskStatus(task, today = new Date()) {
  if (task.completed) return "completed";
  if (task.snoozedUntil && parseDate(task.snoozedUntil) > startOfDay(today)) return "snoozed";
  const days = diffDays(today, parseDate(task.due));
  if (days < 0) return "overdue";
  if (days === 0) return "due-today";
  return "upcoming";
}

export function computeDocStatus(doc, today = new Date(), leadDays = 30) {
  const days = diffDays(today, parseDate(doc.expires));
  if (days < 0) return "expired";
  if (days <= leadDays) return "expiring-soon";
  return "valid";
}

export function formatDaysRemaining(days) {
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""}`;
  if (days === 0) return "Due today";
  return `Due in ${days} day${days !== 1 ? "s" : ""}`;
}
