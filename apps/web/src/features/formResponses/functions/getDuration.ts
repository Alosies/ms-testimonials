/**
 * Formats a duration in milliseconds to a human-readable string
 * @param ms Duration in milliseconds
 * @returns Formatted string like "45s", "5m 23s", "1h 30m"
 */
export function formatDuration(ms: number): string {
  if (ms < 0) return '0s';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMins = minutes % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  }
  if (minutes > 0) {
    const remainingSecs = seconds % 60;
    return remainingSecs > 0 ? `${minutes}m ${remainingSecs}s` : `${minutes}m`;
  }
  return `${seconds}s`;
}

/**
 * Calculates duration between two ISO date strings
 * @param startDate ISO date string for start time
 * @param endDate ISO date string for end time
 * @returns Formatted duration string
 */
export function calculateDuration(startDate: string, endDate: string): string {
  const startTime = new Date(startDate).getTime();
  const endTime = new Date(endDate).getTime();
  return formatDuration(endTime - startTime);
}
