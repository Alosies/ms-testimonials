/**
 * Metric Value Formatting
 *
 * Utilities for formatting dashboard metric values for display.
 */

/**
 * Format a percentage value for display
 *
 * @param value - Percentage value (e.g., 68.4)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "68.4%")
 */
export function formatPercentage(value: number | null, decimals: number = 1): string {
  if (value === null || !isFinite(value)) return '—';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a duration in milliseconds to human-readable format
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted string (e.g., "2m 34s")
 */
export function formatDuration(ms: number | null): string {
  if (ms === null || !isFinite(ms) || ms < 0) return '—';

  const seconds = Math.floor(ms / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Format a number with thousands separator
 *
 * @param value - Number to format
 * @returns Formatted string (e.g., "1,234")
 */
export function formatNumber(value: number | null): string {
  if (value === null || !isFinite(value)) return '—';
  return value.toLocaleString();
}

/**
 * Format a rating value
 *
 * @param value - Rating value (e.g., 4.2)
 * @returns Formatted string (e.g., "4.2")
 */
export function formatRating(value: number | null): string {
  if (value === null || !isFinite(value)) return '—';
  return value.toFixed(1);
}

/**
 * Generate star display string
 *
 * @param rating - Rating value (1-5)
 * @returns String of filled and empty stars
 */
export function formatStars(rating: number | null): string {
  if (rating === null || !isFinite(rating)) return '☆☆☆☆☆';

  const filled = Math.round(rating);
  const empty = 5 - filled;

  return '★'.repeat(filled) + '☆'.repeat(empty);
}
