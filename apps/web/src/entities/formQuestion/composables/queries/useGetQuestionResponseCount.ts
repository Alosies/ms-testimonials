import { computed, type Ref } from 'vue';
import {
  useGetQuestionResponseCountQuery,
  type GetQuestionResponseCountQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetQuestionResponseCount(
  variables: Ref<GetQuestionResponseCountQueryVariables>
) {
  const enabled = computed(() => !!variables.value.questionId);
  const { result, loading, error, refetch } = useGetQuestionResponseCountQuery(variables, {
    enabled,
  });

  const responseCount = computed(
    () => result.value?.form_question_responses_aggregate?.aggregate?.count ?? 0
  );
  const isLoading = computed(() => loading.value && !result.value);

  return {
    responseCount,
    loading,
    isLoading,
    error,
    refetch,
    result,
  };
}
