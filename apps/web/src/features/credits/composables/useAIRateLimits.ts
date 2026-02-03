/**
 * AI Rate Limits Composable
 *
 * Provides reactive rate limit state and fetching for the current organization.
 * Part of ADR-023 AI Capabilities Plan Integration.
 *
 * @example
 * ```typescript
 * // Basic usage
 * const { limits, loading, error, refresh } = useAIRateLimits();
 *
 * // With auto-refresh every 30 seconds
 * const { limits } = useAIRateLimits({
 *   refreshInterval: 30000,
 * });
 * ```
 */

import { ref, onMounted, onUnmounted } from 'vue';
import { useApi } from '@/shared/api/rest';
import type {
  AIRateLimitsResponse,
  UseAIRateLimitsOptions,
  UseAIRateLimitsReturn,
} from '../models';

/**
 * Composable for fetching and managing AI rate limit state.
 *
 * Provides reactive access to the organization's AI rate limits with
 * optional auto-refresh.
 *
 * @param options - Configuration options
 * @returns Reactive limits state and helper functions
 */
export function useAIRateLimits(
  options: UseAIRateLimitsOptions = {}
): UseAIRateLimitsReturn {
  const { autoFetch = true, refreshInterval = 0 } = options;

  // Initialize API client at setup time (per Vue composable rules)
  const api = useApi();

  // Reactive state
  const limits = ref<AIRateLimitsResponse | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  // Interval timer for auto-refresh
  let refreshTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * Fetch the current rate limits from the API
   */
  async function fetchLimits(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.fetch('/credits/limits');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch limits (status ${response.status})`
        );
      }

      limits.value = await response.json();
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown error fetching limits');
    } finally {
      loading.value = false;
    }
  }

  // Setup auto-refresh timer
  function startRefreshTimer(): void {
    if (refreshInterval > 0 && !refreshTimer) {
      refreshTimer = setInterval(() => {
        fetchLimits();
      }, refreshInterval);
    }
  }

  // Cleanup timer
  function stopRefreshTimer(): void {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  }

  // Auto-fetch on mount if enabled
  onMounted(() => {
    if (autoFetch) {
      fetchLimits();
    }
    startRefreshTimer();
  });

  // Cleanup on unmount
  onUnmounted(() => {
    stopRefreshTimer();
  });

  return {
    limits,
    loading,
    error,
    fetchLimits,
    refresh: fetchLimits,
  };
}
