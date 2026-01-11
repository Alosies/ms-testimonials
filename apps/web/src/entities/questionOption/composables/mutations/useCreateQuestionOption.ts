import { computed } from 'vue';
import {
  useCreateQuestionOptionMutation,
  type CreateQuestionOptionMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useCreateQuestionOption() {
  const { mutate, loading, error, onDone, onError } = useCreateQuestionOptionMutation();

  const hasError = computed(() => error.value !== null);

  const createQuestionOption = async (input: CreateQuestionOptionMutationVariables['input']) => {
    const result = await mutate({ input });
    if (!result?.data?.insert_question_options_one) {
      throw new Error('Failed to create question option');
    }
    return result.data.insert_question_options_one;
  };

  return {
    mutate,
    createQuestionOption,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
