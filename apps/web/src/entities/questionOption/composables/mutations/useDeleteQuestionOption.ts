import { computed } from 'vue';
import {
  useDeleteQuestionOptionMutation,
  type DeleteQuestionOptionMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useDeleteQuestionOption() {
  const { mutate, loading, error, onDone, onError } = useDeleteQuestionOptionMutation();

  const hasError = computed(() => error.value !== null);

  const deleteQuestionOption = async (variables: DeleteQuestionOptionMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.delete_question_options_by_pk ?? null;
  };

  return {
    mutate,
    deleteQuestionOption,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
