/**
 * Metric Sentiment Utilities
 *
 * Determines display styling based on benchmark comparison.
 */

import type { MetricSentiment } from '@api/shared/schemas/dashboard';

/**
 * Get Tailwind CSS classes for sentiment-based coloring
 *
 * @param sentiment - The metric sentiment
 * @returns Tailwind class string
 */
export function getSentimentTextClass(sentiment: MetricSentiment | null): string {
  switch (sentiment) {
    case 'positive':
      return 'text-green-600 dark:text-green-400';
    case 'negative':
      return 'text-red-600 dark:text-red-400';
    case 'neutral':
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

/**
 * Get Tailwind CSS classes for sentiment-based background
 *
 * @param sentiment - The metric sentiment
 * @returns Tailwind class string
 */
export function getSentimentBgClass(sentiment: MetricSentiment | null): string {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-50 dark:bg-green-900/20';
    case 'negative':
      return 'bg-red-50 dark:bg-red-900/20';
    case 'neutral':
    default:
      return 'bg-gray-50 dark:bg-gray-900/20';
  }
}

/**
 * Get icon for sentiment display
 *
 * @param sentiment - The metric sentiment
 * @returns Icon character or string
 */
export function getSentimentIcon(sentiment: MetricSentiment | null): string {
  switch (sentiment) {
    case 'positive':
      return '↑';
    case 'negative':
      return '↓';
    case 'neutral':
    default:
      return '→';
  }
}

/**
 * Check if a metric should show benchmark comparison
 *
 * @param isStatisticallySignificant - Whether we have enough data
 * @param benchmarkValue - The benchmark value
 * @returns Whether to show the comparison
 */
export function shouldShowBenchmark(
  isStatisticallySignificant: boolean,
  benchmarkValue: number | null
): boolean {
  return isStatisticallySignificant && benchmarkValue !== null;
}
