import { computed } from 'vue';
import {
  useUpdateFormMutation,
  type UpdateFormMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useUpdateForm() {
  const { mutate, loading, error, onDone, onError } = useUpdateFormMutation();

  const hasError = computed(() => error.value !== null);

  const updateForm = async (variables: UpdateFormMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.update_forms_by_pk ?? null;
  };

  return {
    mutate,
    updateForm,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
