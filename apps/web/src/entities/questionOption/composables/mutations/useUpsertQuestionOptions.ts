import { computed } from 'vue';
import {
  useUpsertQuestionOptionsMutation,
  type UpsertQuestionOptionsMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useUpsertQuestionOptions() {
  const { mutate, loading, error, onDone, onError } = useUpsertQuestionOptionsMutation();

  const hasError = computed(() => error.value !== null);

  const upsertQuestionOptions = async (variables: UpsertQuestionOptionsMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.insert_question_options?.returning ?? [];
  };

  return {
    mutate,
    upsertQuestionOptions,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
