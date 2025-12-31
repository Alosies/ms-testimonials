import { computed } from 'vue';
import {
  useDeleteFormQuestionMutation,
  type DeleteFormQuestionMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useDeleteFormQuestion() {
  const { mutate, loading, error, onDone, onError } = useDeleteFormQuestionMutation();

  const hasError = computed(() => error.value !== null);

  const deleteFormQuestion = async (variables: DeleteFormQuestionMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.update_form_questions_by_pk ?? null;
  };

  return {
    mutate,
    deleteFormQuestion,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
