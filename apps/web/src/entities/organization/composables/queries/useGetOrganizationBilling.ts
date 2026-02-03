import { computed, type Ref } from 'vue';
import {
  useGetOrganizationBillingQuery,
  type GetOrganizationBillingQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetOrganizationBilling(variables: Ref<GetOrganizationBillingQueryVariables>) {
  const { result, loading, error, refetch } = useGetOrganizationBillingQuery(variables, {
    enabled: computed(() => !!variables.value.organizationId),
  });

  const organization = computed(() => result.value?.organizations_by_pk ?? null);
  const activePlan = computed(() => organization.value?.plans?.[0] ?? null);
  const isLoading = computed(() => loading.value && !result.value);

  return {
    organization,
    activePlan,
    loading,
    isLoading,
    error,
    refetch,
    result,
  };
}
