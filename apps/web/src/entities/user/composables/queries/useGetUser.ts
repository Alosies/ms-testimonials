import { computed, type Ref } from 'vue';
import {
  useGetUserQuery,
  type GetUserQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetUser(variables: Ref<GetUserQueryVariables>) {
  const { result, loading, error, refetch } = useGetUserQuery(variables, {
    enabled: computed(() => !!variables.value.userId),
  });

  const user = computed(() => result.value?.users_by_pk ?? null);
  const isLoading = computed(() => loading.value && !result.value);

  return {
    user,
    loading,
    isLoading,
    error,
    refetch,
    result,
  };
}
