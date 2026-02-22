import { computed } from 'vue';
import { useApproveTestimonialMutation } from '@/shared/graphql/generated/operations';

export function useApproveTestimonial() {
  const { mutate, loading, error, onDone, onError } = useApproveTestimonialMutation();

  const hasError = computed(() => error.value !== null);

  const approveTestimonial = async (id: string, approvedBy: string) => {
    const result = await mutate({ id, approvedBy });
    return result?.data?.update_testimonials_by_pk ?? null;
  };

  return {
    mutate,
    approveTestimonial,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
