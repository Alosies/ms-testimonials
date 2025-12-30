import { computed, type Ref } from 'vue';
import {
  useGetTestimonialsStatsQuery,
  type GetTestimonialsStatsQueryVariables,
} from '@/shared/graphql/generated/operations';
import type { TestimonialsStats } from '../../models';

export function useGetTestimonialsStats(variables: Ref<GetTestimonialsStatsQueryVariables>) {
  const { result, loading, error, refetch } = useGetTestimonialsStatsQuery(variables, {
    enabled: computed(() => !!variables.value.organizationId),
  });

  const stats = computed<TestimonialsStats>(() => ({
    total: result.value?.total?.aggregate?.count ?? 0,
    pending: result.value?.pending?.aggregate?.count ?? 0,
    approved: result.value?.approved?.aggregate?.count ?? 0,
    rejected: result.value?.rejected?.aggregate?.count ?? 0,
  }));

  const isLoading = computed(() => loading.value && !result.value);

  return {
    stats,
    loading,
    isLoading,
    error,
    refetch,
    result,
  };
}
