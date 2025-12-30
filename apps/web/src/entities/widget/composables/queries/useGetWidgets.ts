import { computed, type Ref } from 'vue';
import {
  useGetWidgetsQuery,
  type GetWidgetsQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetWidgets(variables: Ref<GetWidgetsQueryVariables>) {
  const { result, loading, error, refetch } = useGetWidgetsQuery(variables, {
    enabled: computed(() => !!variables.value.organizationId),
  });

  const widgets = computed(() => result.value?.widgets ?? []);
  const isLoading = computed(() => loading.value && !result.value);

  return {
    widgets,
    loading,
    isLoading,
    error,
    refetch,
    result,
  };
}
