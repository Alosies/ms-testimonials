import { computed } from 'vue';
import {
  useCreateFormQuestionMutation,
  type CreateFormQuestionMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useCreateFormQuestion() {
  const { mutate, loading, error, onDone, onError } = useCreateFormQuestionMutation();

  const hasError = computed(() => error.value !== null);

  const createFormQuestion = async (variables: CreateFormQuestionMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.insert_form_questions_one ?? null;
  };

  return {
    mutate,
    createFormQuestion,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
