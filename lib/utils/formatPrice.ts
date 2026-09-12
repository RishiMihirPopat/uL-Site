/**
 * Formats event price ensuring the rupee symbol (₹) is automatically applied to numeric values.
 */
export function formatEventPrice(price?: string | null): string {
  if (!price) return 'Free';
  const trimmed = String(price).trim();
  if (
    !trimmed ||
    trimmed === '—' ||
    trimmed.toLowerCase() === 'free' ||
    trimmed === '0' ||
    trimmed === '₹0'
  ) {
    return 'Free';
  }

  // Already formatted with ₹
  if (trimmed.startsWith('₹')) {
    return trimmed;
  }

  // If prefixed with Rs., Rs, INR, etc.
  if (/^(?:rs\.?|inr)\s*/i.test(trimmed)) {
    return trimmed.replace(/^(?:rs\.?|inr)\s*/i, '₹');
  }

  // If purely numeric or starting with digits (e.g. 550, 499, 500 onwards)
  if (/^\d/.test(trimmed)) {
    return `₹${trimmed}`;
  }

  return trimmed;
}
