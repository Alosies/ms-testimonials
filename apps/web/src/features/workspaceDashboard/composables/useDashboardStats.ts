import { computed, type Ref } from 'vue';
import {
  useGetDashboardStatsQuery,
  type GetDashboardStatsQueryVariables,
} from '@/shared/graphql/generated/operations';
import type { DashboardStats } from '../models';

export function useDashboardStats(variables: Ref<GetDashboardStatsQueryVariables>) {
  const { result, loading, error, refetch } = useGetDashboardStatsQuery(variables, {
    enabled: computed(() => !!variables.value.organizationId),
  });

  const stats = computed<DashboardStats>(() => ({
    formsCount: result.value?.forms_aggregate?.aggregate?.count ?? 0,
    testimonialsCount: result.value?.testimonials_aggregate?.aggregate?.count ?? 0,
    pendingCount: result.value?.pending_testimonials?.aggregate?.count ?? 0,
    widgetsCount: result.value?.widgets_aggregate?.aggregate?.count ?? 0,
  }));

  const isLoading = computed(() => loading.value && !result.value);

  return {
    stats,
    loading,
    isLoading,
    error,
    refetch,
  };
}
