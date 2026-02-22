import { ref, computed, type Ref } from 'vue';
import type {
  TestimonialStatus,
  TestimonialWithFormItem,
} from '@/entities/testimonial';
import type { SortOption } from '../models';

export const STATUS_OPTIONS: Array<{ value: 'all' | 'pending' | 'approved' | 'rejected'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export function useTestimonialsListState(
  testimonials: Ref<TestimonialWithFormItem[]>,
) {
  const statusFilter = ref<TestimonialStatus | 'all'>('all');
  const searchQuery = ref('');
  const sortOption = ref<SortOption>('newest');
  const selectedTestimonialId = ref<string | null>(null);

  const filteredTestimonials = computed(() => {
    let result = testimonials.value;

    // Status filter
    if (statusFilter.value !== 'all') {
      result = result.filter((t) => t.status === statusFilter.value);
    }

    // Search filter (client-side)
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      result = result.filter(
        (t) =>
          t.content?.toLowerCase().includes(q) ||
          t.customer_name.toLowerCase().includes(q) ||
          t.customer_company?.toLowerCase().includes(q),
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortOption.value) {
        case 'oldest':
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case 'highest_rated':
          return (b.rating ?? 0) - (a.rating ?? 0);
        case 'newest':
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    return result;
  });

  const selectedTestimonial = computed(
    () =>
      testimonials.value.find((t) => t.id === selectedTestimonialId.value) ??
      null,
  );

  const hasFilteredResults = computed(
    () => filteredTestimonials.value.length > 0,
  );

  function setStatusFilter(status: TestimonialStatus | 'all') {
    statusFilter.value = status;
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query;
  }

  function selectTestimonial(id: string) {
    selectedTestimonialId.value = id;
  }

  return {
    statusFilter,
    searchQuery,
    sortOption,
    selectedTestimonialId,
    filteredTestimonials,
    selectedTestimonial,
    hasFilteredResults,
    setStatusFilter,
    setSearchQuery,
    selectTestimonial,
  };
}
