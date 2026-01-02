import { computed, type Ref } from 'vue';
import {
  useGetFormQuestionsQuery,
  type GetFormQuestionsQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetFormQuestions(variables: Ref<GetFormQuestionsQueryVariables>) {
  const enabled = computed(() => !!variables.value.formId);
  const { result, loading, error, refetch } = useGetFormQuestionsQuery(variables, {
    enabled,
  });

  const formQuestions = computed(() => result.value?.form_questions ?? []);
  const isLoading = computed(() => loading.value && !result.value);

  return {
    formQuestions,
    loading,
    isLoading,
    error,
    refetch,
    result,
  };
}
