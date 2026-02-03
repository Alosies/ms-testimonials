/**
 * Credit Balance Composable
 *
 * Provides reactive credit balance state and fetching for the current organization.
 * Part of ADR-023 AI Capabilities Plan Integration.
 *
 * @example
 * ```typescript
 * // Basic usage
 * const { balance, loading, error, fetchBalance } = useCreditBalance();
 *
 * // With auto-refresh every 30 seconds
 * const { balance, percentUsed, isLow } = useCreditBalance({
 *   refreshInterval: 30000,
 * });
 *
 * // Without auto-fetch on mount
 * const { balance, fetchBalance } = useCreditBalance({ autoFetch: false });
 * ```
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useApi } from '@/shared/api/rest';
import type {
  CreditBalance,
  UseCreditBalanceOptions,
  UseCreditBalanceReturn,
} from '../models';

/**
 * Composable for fetching and managing credit balance state.
 *
 * Provides reactive access to the organization's credit balance with
 * optional auto-refresh and computed helpers for UI display.
 *
 * @param options - Configuration options
 * @returns Reactive balance state and helper functions
 */
export function useCreditBalance(
  options: UseCreditBalanceOptions = {}
): UseCreditBalanceReturn {
  const { autoFetch = true, refreshInterval = 0 } = options;

  // Initialize API client at setup time (per Vue composable rules)
  const api = useApi();

  // Reactive state
  const balance = ref<CreditBalance | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  // Interval timer for auto-refresh
  let refreshTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * Fetch the current credit balance from the API
   */
  async function fetchBalance(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.fetch('/credits/balance');

      if (!response.ok) {
        // Try to parse error message from response
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch balance (status ${response.status})`
        );
      }

      balance.value = await response.json();
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown error fetching balance');
    } finally {
      loading.value = false;
    }
  }

  // Computed: Original plan allocation (before any usage was consumed)
  // Since monthlyCredits is reduced during settlement, we reconstruct:
  // originalAllocation = currentMonthlyCredits + usedThisPeriod
  const originalPlanAllocation = computed<number>(() => {
    if (!balance.value) return 0;
    return balance.value.monthlyCredits + balance.value.usedThisPeriod;
  });

  // Computed: Percentage of monthly credits used this period
  const percentUsed = computed<number>(() => {
    const original = originalPlanAllocation.value;
    if (original === 0) return 0;
    const used = balance.value?.usedThisPeriod ?? 0;
    return Math.min(100, Math.round((used / original) * 100));
  });

  // Computed: Whether remaining credits are low (< 20% of original allocation remaining)
  const isLow = computed<boolean>(() => {
    const original = originalPlanAllocation.value;
    if (original === 0) return false;
    const remaining = balance.value?.monthlyCredits ?? 0;
    const threshold = original * 0.2;
    return remaining < threshold;
  });

  // Computed: Days until the billing period resets
  const daysUntilReset = computed<number>(() => {
    if (!balance.value?.periodEndsAt) {
      return 0;
    }
    const now = new Date();
    const periodEnd = new Date(balance.value.periodEndsAt);
    const diffMs = periodEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  });

  // Setup auto-refresh timer
  function startRefreshTimer(): void {
    if (refreshInterval > 0 && !refreshTimer) {
      refreshTimer = setInterval(() => {
        fetchBalance();
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
      fetchBalance();
    }
    startRefreshTimer();
  });

  // Cleanup on unmount
  onUnmounted(() => {
    stopRefreshTimer();
  });

  return {
    balance,
    loading,
    error,
    fetchBalance,
    refresh: fetchBalance,
    percentUsed,
    isLow,
    daysUntilReset,
  };
}
