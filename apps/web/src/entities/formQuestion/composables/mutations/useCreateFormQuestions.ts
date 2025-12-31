import { computed } from 'vue';
import {
  useCreateFormQuestionsMutation,
  type CreateFormQuestionsMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useCreateFormQuestions() {
  const { mutate, loading, error, onDone, onError } = useCreateFormQuestionsMutation();

  const hasError = computed(() => error.value !== null);

  const createFormQuestions = async (variables: CreateFormQuestionsMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.insert_form_questions?.returning ?? [];
  };

  return {
    mutate,
    createFormQuestions,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
