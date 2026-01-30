/**
 * Format a Date as YYYY-MM-DD in the user's local timezone.
 * Use this (not toISOString().slice(0,10)) so "today" and week ranges
 * match what the backend expects and what the user sees.
 */
export function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
