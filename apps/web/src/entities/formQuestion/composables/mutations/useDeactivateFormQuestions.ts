import { computed } from 'vue';
import {
  useDeactivateFormQuestionsMutation,
  type DeactivateFormQuestionsMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useDeactivateFormQuestions() {
  const { mutate, loading, error, onDone, onError } = useDeactivateFormQuestionsMutation();

  const hasError = computed(() => error.value !== null);

  const deactivateFormQuestions = async (variables: DeactivateFormQuestionsMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.update_form_questions?.affected_rows ?? 0;
  };

  return {
    mutate,
    deactivateFormQuestions,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
