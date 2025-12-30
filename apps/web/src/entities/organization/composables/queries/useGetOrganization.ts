import { computed, type Ref } from 'vue';
import {
  useGetOrganizationQuery,
  type GetOrganizationQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetOrganization(variables: Ref<GetOrganizationQueryVariables>) {
  const { result, loading, error, refetch } = useGetOrganizationQuery(variables, {
    enabled: computed(() => !!variables.value.organizationId),
  });

  const organization = computed(() => result.value?.organizations_by_pk ?? null);
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
