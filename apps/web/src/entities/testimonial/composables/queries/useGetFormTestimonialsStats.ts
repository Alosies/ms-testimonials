import { computed, type Ref } from 'vue';
import {
  useGetFormTestimonialsStatsQuery,
  type GetFormTestimonialsStatsQueryVariables,
} from '@/shared/graphql/generated/operations';
import type { TestimonialsStats } from '../../models';

export function useGetFormTestimonialsStats(variables: Ref<GetFormTestimonialsStatsQueryVariables>) {
  const { result, loading, error, refetch } = useGetFormTestimonialsStatsQuery(variables, {
    enabled: computed(() => !!variables.value.organizationId && !!variables.value.formId),
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
