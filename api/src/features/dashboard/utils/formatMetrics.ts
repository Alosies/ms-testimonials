/**
 * Metric Formatting Utilities
 *
 * Safe calculations and formatting for dashboard metrics.
 * Handles edge cases like division by zero and insufficient data.
 */

import type { MetricSentiment, MetricWithBenchmark } from '@/shared/schemas/dashboard';

/**
 * Minimum sessions required for statistically meaningful metrics
 */
export const MIN_SIGNIFICANT_SESSIONS = 5;

/**
 * Maximum duration to consider valid (30 minutes in ms)
 * Sessions longer than this are excluded from averages
 */
export const MAX_VALID_DURATION_MS = 30 * 60 * 1000;

/**
 * Minimum duration to consider valid (1 second in ms)
 * Sessions shorter than this are excluded from averages
 */
export const MIN_VALID_DURATION_MS = 1000;

/**
 * Calculate percentage safely, handling division by zero
 *
 * @param numerator - The top number
 * @param denominator - The bottom number
 * @returns Percentage rounded to 1 decimal, or null if invalid
 */
export function safePercentage(numerator: number, denominator: number): number | null {
  if (denominator === 0 || !isFinite(denominator)) return null;
  const result = (numerator / denominator) * 100;
  if (!isFinite(result) || isNaN(result)) return null;
  return Math.round(result * 10) / 10;
}

/**
 * Calculate average safely, filtering out invalid values
 *
 * @param values - Array of numbers to average
 * @param minValue - Minimum valid value (exclusive)
 * @param maxValue - Maximum valid value (exclusive)
 * @returns Average rounded to nearest integer, or null if no valid values
 */
export function safeAverage(
  values: number[],
  minValue: number = 0,
  maxValue: number = Infinity
): number | null {
  const filtered = values.filter(
    (v) => isFinite(v) && v > minValue && v < maxValue
  );
  if (filtered.length === 0) return null;
  return Math.round(filtered.reduce((a, b) => a + b, 0) / filtered.length);
}

/**
 * Determine sentiment based on actual vs expected value
 *
 * @param actual - The actual metric value
 * @param expected - The expected benchmark value
 * @param higherIsBetter - Whether higher values are positive (true for completion rate, false for abandonment)
 * @returns Sentiment classification
 */
export function getSentiment(
  actual: number | null,
  expected: number | null,
  higherIsBetter: boolean = true
): MetricSentiment | null {
  if (actual === null || expected === null) return null;

  const diff = actual - expected;
  const threshold = 1; // 1% threshold for "neutral"

  if (Math.abs(diff) < threshold) return 'neutral';

  if (higherIsBetter) {
    return diff > 0 ? 'positive' : 'negative';
  } else {
    return diff < 0 ? 'positive' : 'negative';
  }
}

/**
 * Format benchmark difference as human-readable string
 *
 * @param actual - The actual metric value
 * @param expected - The expected benchmark value
 * @param higherIsBetter - Whether higher values are positive
 * @returns Formatted string like "↑ 18% above expected" or null
 */
export function formatBenchmarkDiff(
  actual: number | null,
  expected: number | null,
  higherIsBetter: boolean = true
): string | null {
  if (actual === null || expected === null || expected === 0) return null;

  const diff = actual - expected;
  const percentDiff = Math.abs(Math.round((diff / expected) * 100));

  // Too small to be meaningful
  if (percentDiff < 1) return 'On target';

  const isAbove = diff > 0;
  const arrow = isAbove ? '↑' : '↓';
  const direction = isAbove ? 'above' : 'below';

  return `${arrow} ${percentDiff}% ${direction} expected`;
}

/**
 * Create a MetricWithBenchmark object with all computed fields
 *
 * @param value - The actual metric value
 * @param benchmark - The expected benchmark value
 * @param higherIsBetter - Whether higher values are positive
 * @returns Complete MetricWithBenchmark object
 */
export function createMetricWithBenchmark(
  value: number | null,
  benchmark: number | null,
  higherIsBetter: boolean = true
): MetricWithBenchmark {
  return {
    value,
    benchmark,
    sentiment: getSentiment(value, benchmark, higherIsBetter),
    diff: formatBenchmarkDiff(value, benchmark, higherIsBetter),
  };
}

/**
 * Check if sample size is statistically significant
 *
 * @param sessionCount - Number of sessions
 * @returns Whether we have enough data for meaningful stats
 */
export function isStatisticallySignificant(sessionCount: number): boolean {
  return sessionCount >= MIN_SIGNIFICANT_SESSIONS;
}

/**
 * Get caveat message for small sample sizes
 *
 * @param sessionCount - Number of sessions
 * @returns Warning message or null if sufficient data
 */
export function getDataCaveat(sessionCount: number): string | null {
  if (sessionCount === 0) return 'No data yet';
  if (sessionCount < MIN_SIGNIFICANT_SESSIONS) {
    return `Based on ${sessionCount} session${sessionCount > 1 ? 's' : ''}`;
  }
  return null;
}

/**
 * Convert period string to number of days
 *
 * @param period - Period string (7d, 30d, 90d)
 * @returns Number of days
 */
export function periodToDays(period: '7d' | '30d' | '90d'): number {
  const map: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
  };
  return map[period] || 30;
}

/**
 * Get the start date for a period
 *
 * @param periodDays - Number of days to go back
 * @returns Date object for the start of the period
 */
export function getPeriodStartDate(periodDays: number): Date {
  return new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
}
