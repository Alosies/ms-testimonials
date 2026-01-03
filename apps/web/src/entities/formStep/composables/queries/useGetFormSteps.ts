import { computed, type Ref } from 'vue';
import {
  useGetFormStepsQuery,
  type GetFormStepsQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetFormSteps(variables: Ref<GetFormStepsQueryVariables>) {
  const { result, loading, error, refetch } = useGetFormStepsQuery(variables, {
    enabled: computed(() => !!variables.value.formId),
  });

  const formSteps = computed(() => result.value?.form_steps ?? []);
  const isLoading = computed(() => loading.value && !result.value);

  return {
    formSteps,
    loading,
    isLoading,
    error,
    refetch,
    result,
  };
}
