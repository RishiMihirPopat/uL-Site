/**
 * Date and time formatting helpers (SRP & DRY).
 */

/**
 * Formats an ISO or standard date string for article card displays (e.g. "OCT 24, 2024").
 */
export function formatArticleDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

/**
 * Parses an ISO datetime-local value (e.g. from an admin form picker)
 * and formats the display date ("Sat, 4 Jul") and display time ("6:30 PM").
 */
export function parseEventDateTime(isoString: string): { date: string; time: string } | null {
  if (!isoString) return null;
  try {
    const dt = new Date(isoString);
    if (Number.isNaN(dt.getTime())) return null;
    const weekday = dt.toLocaleDateString('en-US', { weekday: 'short' });
    const day = dt.getDate();
    const month = dt.toLocaleDateString('en-US', { month: 'short' });
    const dateFormatted = `${weekday}, ${day} ${month}`;
    const timeFormatted = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return { date: dateFormatted, time: timeFormatted };
  } catch {
    return null;
  }
}

/**
 * Converts a name or phrase to Title Case (e.g. "kezia d'souza" -> "Kezia D'souza").
 */
export function toTitleCase(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
