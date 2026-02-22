import { computed } from 'vue';
import { useRejectTestimonialMutation } from '@/shared/graphql/generated/operations';

export function useRejectTestimonial() {
  const { mutate, loading, error, onDone, onError } = useRejectTestimonialMutation();

  const hasError = computed(() => error.value !== null);

  const rejectTestimonial = async (id: string, rejectedBy: string, rejectionReason?: string) => {
    const result = await mutate({ id, rejectedBy, rejectionReason: rejectionReason ?? null });
    return result?.data?.update_testimonials_by_pk ?? null;
  };

  return {
    mutate,
    rejectTestimonial,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
