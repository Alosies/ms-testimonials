import { computed } from 'vue';
import {
  useCreateFormMutation,
  type CreateFormMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useCreateForm() {
  const { mutate, loading, error, onDone, onError } = useCreateFormMutation();

  const hasError = computed(() => error.value !== null);

  const createForm = async (variables: CreateFormMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.insert_forms_one ?? null;
  };

  return {
    mutate,
    createForm,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
