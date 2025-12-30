import { computed } from 'vue';
import {
  useUpdateOrganizationMutation,
  type UpdateOrganizationMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useUpdateOrganization() {
  const { mutate, loading, error, onDone, onError } = useUpdateOrganizationMutation();

  const hasError = computed(() => error.value !== null);

  const updateOrganization = async (variables: UpdateOrganizationMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.update_organizations_by_pk ?? null;
  };

  return {
    mutate,
    updateOrganization,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
