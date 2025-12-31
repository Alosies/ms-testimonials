import { computed } from 'vue';
import {
  useReorderFormQuestionsMutation,
  type ReorderFormQuestionsMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useReorderFormQuestions() {
  const { mutate, loading, error, onDone, onError } = useReorderFormQuestionsMutation();

  const hasError = computed(() => error.value !== null);

  const reorderFormQuestions = async (variables: ReorderFormQuestionsMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.update_form_questions_many ?? [];
  };

  return {
    mutate,
    reorderFormQuestions,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
