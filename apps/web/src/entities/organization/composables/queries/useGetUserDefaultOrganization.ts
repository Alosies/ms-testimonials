import { computed, type Ref } from 'vue';
import {
  useGetUserDefaultOrganizationQuery,
  type GetUserDefaultOrganizationQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetUserDefaultOrganization(
  variables: Ref<GetUserDefaultOrganizationQueryVariables>,
) {

  const isEnabled = computed(() => !!variables.value.userId);
  const { result, loading, error, refetch } = useGetUserDefaultOrganizationQuery(variables, {
    enabled: isEnabled,
  });

  // Extract the organization role assignment (includes organization + role)
  const organizationRole = computed(
    () => result.value?.organization_roles[0] ?? null,
  );

  // Extract just the organization
  const organization = computed(
    () => {
      if (isEnabled.value) {
        return organizationRole.value?.organization ?? null;
      }
      return null;
    },
  );

  // Extract the user's role in this organization
  const role = computed(() => {
    if (isEnabled.value) {
      return organizationRole.value?.role ?? null;
    }
    return null;
  });

  const isLoading = computed(() => loading.value && !result.value);

  return {
    organization,
    role,
    organizationRole,
    loading,
    isLoading,
    error,
    refetch,
    result,
  };
}
