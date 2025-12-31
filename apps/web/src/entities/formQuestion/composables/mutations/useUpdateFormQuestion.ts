import { computed } from 'vue';
import {
  useUpdateFormQuestionMutation,
  type UpdateFormQuestionMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useUpdateFormQuestion() {
  const { mutate, loading, error, onDone, onError } = useUpdateFormQuestionMutation();

  const hasError = computed(() => error.value !== null);

  const updateFormQuestion = async (variables: UpdateFormQuestionMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.update_form_questions_by_pk ?? null;
  };

  return {
    mutate,
    updateFormQuestion,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
