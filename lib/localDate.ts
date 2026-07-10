// ============================================================
// LOCAL DATE HELPERS
//
// Bakit hindi toISOString().split("T")[0]?
// toISOString() converts to UTC. In PHT (UTC+8), between
// midnight and 8 AM, local date differs from UTC date by one
// day, so "today" gets misidentified as "yesterday".
//
// All customer-facing storage uses LOCAL YYYY-MM-DD; reads
// must too. Use these helpers everywhere.
// ============================================================

export function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function localDateStrOffset(daysOffset: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + daysOffset);
  return localDateStr(d);
}
