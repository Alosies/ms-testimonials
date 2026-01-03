import { computed } from 'vue';
import {
  useCreateFormStepsMutation,
  type CreateFormStepsMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useCreateFormSteps() {
  const { mutate, loading, error, onDone, onError } = useCreateFormStepsMutation();

  const hasError = computed(() => error.value !== null);

  const createFormSteps = async (variables: CreateFormStepsMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.insert_form_steps?.returning ?? [];
  };

  return {
    mutate,
    createFormSteps,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
