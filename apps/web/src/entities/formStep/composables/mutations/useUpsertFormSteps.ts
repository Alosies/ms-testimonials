import { computed } from 'vue';
import {
  useUpsertFormStepsMutation,
  type UpsertFormStepsMutationVariables,
} from '@/shared/graphql/generated/operations';

/**
 * Upsert form steps - inserts new steps and updates existing ones.
 * Used for saving form editor state including branching flow changes.
 */
export function useUpsertFormSteps() {
  const { mutate, loading, error, onDone, onError } = useUpsertFormStepsMutation();

  const hasError = computed(() => error.value !== null);

  const upsertFormSteps = async (variables: UpsertFormStepsMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.insert_form_steps?.returning ?? [];
  };

  return {
    mutate,
    upsertFormSteps,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
