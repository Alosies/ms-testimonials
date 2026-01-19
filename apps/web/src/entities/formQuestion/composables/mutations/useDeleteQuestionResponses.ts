import { computed } from 'vue';
import {
  useDeleteQuestionResponsesMutation,
  type DeleteQuestionResponsesMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useDeleteQuestionResponses() {
  const { mutate, loading, error, onDone, onError } = useDeleteQuestionResponsesMutation();

  const hasError = computed(() => error.value !== null);

  const deleteQuestionResponses = async (variables: DeleteQuestionResponsesMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.delete_form_question_responses?.affected_rows ?? 0;
  };

  return {
    mutate,
    deleteQuestionResponses,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
