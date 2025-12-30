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

  const organization = computed(
    () => result.value?.organization_roles[0]?.organization ?? null,
  );
  const isLoading = computed(() => loading.value && !result.value);

  return {
    organization,
    loading,
    isLoading,
    error,
    refetch,
    result,
  };
}
