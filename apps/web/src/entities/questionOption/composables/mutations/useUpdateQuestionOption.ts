import { computed } from 'vue';
import {
  useUpdateQuestionOptionMutation,
  type UpdateQuestionOptionMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useUpdateQuestionOption() {
  const { mutate, loading, error, onDone, onError } = useUpdateQuestionOptionMutation();

  const hasError = computed(() => error.value !== null);

  const updateQuestionOption = async (variables: UpdateQuestionOptionMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.update_question_options_by_pk ?? null;
  };

  return {
    mutate,
    updateQuestionOption,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
