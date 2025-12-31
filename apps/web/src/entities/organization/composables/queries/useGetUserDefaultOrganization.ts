import { computed, type Ref } from 'vue';
import {
  useGetUserDefaultOrganizationQuery,
  type GetUserDefaultOrganizationQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetUserDefaultOrganization(
  variables: Ref<GetUserDefaultOrganizationQueryVariables>,
) {
  const { result, loading, error, refetch } = useGetUserDefaultOrganizationQuery(variables, {
    enabled: computed(() => !!variables.value.userId),
  });

  // Extract the organization role assignment (includes organization + role)
  const organizationRole = computed(
    () => result.value?.organization_roles[0] ?? null,
  );

  // Extract just the organization
  const organization = computed(
    () => organizationRole.value?.organization ?? null,
  );

  // Extract the user's role in this organization
  const role = computed(() => organizationRole.value?.role ?? null);

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
