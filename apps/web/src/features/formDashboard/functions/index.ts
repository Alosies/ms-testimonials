/**
 * Dashboard Functions
 *
 * Pure utility functions for dashboard display.
 */

export {
  formatPercentage,
  formatDuration,
  formatNumber,
  formatRating,
  formatStars,
} from './formatMetricValue';

export {
  getSentimentTextClass,
  getSentimentBgClass,
  getSentimentIcon,
  shouldShowBenchmark,
} from './getMetricSentiment';

export {
  getProgressWidth,
  getDropoffColorClass,
  getBarColorClass,
  findHighestDropoff,
  getStepTypeLabel,
} from './calculateDropoff';
