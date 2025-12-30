import { computed } from 'vue';
import { useGetPlansQuery } from '@/shared/graphql/generated/operations';

export function useGetPlans() {
  const { result, loading, error, refetch } = useGetPlansQuery();

  const plans = computed(() => result.value?.plans ?? []);
  const isLoading = computed(() => loading.value && !result.value);

  return {
    plans,
    loading,
    isLoading,
    error,
    refetch,
    result,
  };
}
