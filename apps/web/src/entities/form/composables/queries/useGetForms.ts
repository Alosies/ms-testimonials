import { computed, type Ref } from 'vue';
import {
  useGetFormsQuery,
  type GetFormsQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetForms(variables: Ref<GetFormsQueryVariables>) {
  const { result, loading, error, refetch } = useGetFormsQuery(variables, {
    enabled: computed(() => !!variables.value.organizationId),
  });

  const forms = computed(() => result.value?.forms ?? []);
  const isLoading = computed(() => loading.value && !result.value);

  return {
    forms,
    loading,
    isLoading,
    error,
    refetch,
    result,
  };
}
