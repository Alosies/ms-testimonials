import { computed, type Ref } from 'vue';
import {
  useGetFormQuery,
  type GetFormQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetForm(variables: Ref<GetFormQueryVariables>) {
  const { result, loading, error, refetch } = useGetFormQuery(variables, {
    enabled: computed(() => !!variables.value.formId),
  });

  const form = computed(() => result.value?.forms_by_pk ?? null);
  const isLoading = computed(() => loading.value && !result.value);

  return {
    form,
    loading,
    isLoading,
    error,
    refetch,
    result,
  };
}
