import { computed, type Ref } from 'vue';
import {
  useGetTestimonialsQuery,
  type GetTestimonialsQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetTestimonials(variables: Ref<GetTestimonialsQueryVariables>) {
  const { result, loading, error, refetch } = useGetTestimonialsQuery(variables, {
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
