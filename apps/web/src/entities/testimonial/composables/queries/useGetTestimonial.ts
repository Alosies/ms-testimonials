import { computed, type Ref } from 'vue';
import {
  useGetTestimonialQuery,
  type GetTestimonialQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetTestimonial(variables: Ref<GetTestimonialQueryVariables>) {
  const { result, loading, error, refetch } = useGetTestimonialQuery(variables, {
    enabled: computed(() => !!variables.value.testimonialId),
  });

  const testimonial = computed(() => result.value?.testimonials_by_pk ?? null);
  const isLoading = computed(() => loading.value && !result.value);

  return {
    testimonial,
    loading,
    isLoading,
    error,
    refetch,
    result,
  };
}
