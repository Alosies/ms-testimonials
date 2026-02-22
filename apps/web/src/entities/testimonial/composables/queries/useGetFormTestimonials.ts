import { computed, type Ref } from 'vue';
import {
  useGetFormTestimonialsQuery,
  type GetFormTestimonialsQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetFormTestimonials(variables: Ref<GetFormTestimonialsQueryVariables>) {
  const { result, loading, error, refetch } = useGetFormTestimonialsQuery(variables, {
    enabled: computed(() => !!variables.value.organizationId && !!variables.value.formId),
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
