/**
 * Dashboard Utilities
 *
 * Helper functions for metric calculation and formatting.
 */

export {
  safePercentage,
  safeAverage,
  getSentiment,
  formatBenchmarkDiff,
  createMetricWithBenchmark,
  isStatisticallySignificant,
  getDataCaveat,
  periodToDays,
  getPeriodStartDate,
  MIN_SIGNIFICANT_SESSIONS,
  MAX_VALID_DURATION_MS,
  MIN_VALID_DURATION_MS,
} from './formatMetrics';

export {
  getStepWeight,
  calculateComplexityScore,
  calculateExpectedCompletionRate,
  calculateBenchmark,
} from './calculateBenchmark';
