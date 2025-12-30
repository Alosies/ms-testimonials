import { computed } from 'vue';
import {
  useUpdateUserMutation,
  type UpdateUserMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useUpdateUser() {
  const { mutate, loading, error, onDone, onError } = useUpdateUserMutation();

  const hasError = computed(() => error.value !== null);

  const updateUser = async (variables: UpdateUserMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.update_users_by_pk ?? null;
  };

  return {
    mutate,
    updateUser,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
