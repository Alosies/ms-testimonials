import { computed } from 'vue';
import {
  useDeleteFormMutation,
  type DeleteFormMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useDeleteForm() {
  const { mutate, loading, error, onDone, onError } = useDeleteFormMutation();

  const hasError = computed(() => error.value !== null);

  const deleteForm = async (variables: DeleteFormMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.update_forms_by_pk ?? null;
  };

  return {
    mutate,
    deleteForm,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
