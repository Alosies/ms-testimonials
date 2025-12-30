import { computed, type Ref } from 'vue';
import {
  useGetPlanQuery,
  type GetPlanQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetPlan(variables: Ref<GetPlanQueryVariables>) {
  const { result, loading, error, refetch } = useGetPlanQuery(variables, {
    enabled: computed(() => !!variables.value.planId),
  });

  const plan = computed(() => result.value?.plans_by_pk ?? null);
  const isLoading = computed(() => loading.value && !result.value);

  return {
    plan,
    loading,
    isLoading,
    error,
    refetch,
    result,
  };
}
