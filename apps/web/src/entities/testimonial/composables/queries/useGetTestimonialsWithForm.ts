import { computed, type Ref } from 'vue';
import {
  useGetTestimonialsWithFormQuery,
  type GetTestimonialsWithFormQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetTestimonialsWithForm(variables: Ref<GetTestimonialsWithFormQueryVariables>) {
  const { result, loading, error, refetch } = useGetTestimonialsWithFormQuery(variables, {
    enabled: computed(() => !!variables.value.organizationId),
  });

  const testimonials = computed(() => result.value?.testimonials ?? []);
  const isLoading = computed(() => loading.value && !result.value);

  return {
    testimonials,
    loading,
    isLoading,
    error,
    refetch,
    result,
  };
}
