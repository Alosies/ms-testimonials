/**
 * Form Dashboard Composable
 *
 * Provides reactive dashboard data fetching with TanStack Query.
 * Handles loading states, caching, and automatic refetching.
 */

import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { useApiForDashboard } from '../api/useApiForDashboard';
import type { Period } from '@api/shared/schemas/dashboard';

/**
 * Form dashboard query composable
 *
 * @param formId - Reactive form ID reference
 * @param period - Reactive period reference (defaults to '30d')
 * @returns Query state and data
 */
export function useFormDashboard(
  formId: Ref<string>,
  period: Ref<Period> = computed(() => '30d')
) {
  const { getFormDashboard } = useApiForDashboard();

  const query = useQuery({
    queryKey: computed(() => ['form-dashboard', formId.value, period.value] as const),
    queryFn: async () => {
      if (!formId.value) {
        throw new Error('Form ID is required');
      }
      return getFormDashboard(formId.value, period.value);
    },
    enabled: computed(() => !!formId.value),
    staleTime: 5 * 60 * 1000, // 5 minutes - dashboard data doesn't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });

  // Computed helpers for easier template access
  const dashboard = computed(() => query.data.value?.data ?? null);
  const hasData = computed(() => dashboard.value?.availability.hasData ?? false);
  const isSignificant = computed(
    () => dashboard.value?.availability.isStatisticallySignificant ?? false
  );
  const caveat = computed(() => dashboard.value?.availability.caveat ?? null);

  return {
    // Raw query state
    query,
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    // Convenient data accessors
    dashboard,
    hasData,
    isSignificant,
    caveat,

    // Individual section accessors
    stats: computed(() => dashboard.value?.stats ?? null),
    funnel: computed(() => dashboard.value?.funnel ?? null),
    audience: computed(() => dashboard.value?.audience ?? null),
    ratings: computed(() => dashboard.value?.ratings ?? null),
    benchmark: computed(() => dashboard.value?.benchmark ?? null),
  };
}
