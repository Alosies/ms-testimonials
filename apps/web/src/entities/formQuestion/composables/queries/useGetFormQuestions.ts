import { computed } from 'vue';
import {
  useGetFormQuestionsQuery,
  type GetFormQuestionsQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetFormQuestions(variables: GetFormQuestionsQueryVariables) {
  const { result, loading, error, refetch } = useGetFormQuestionsQuery(variables);

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
