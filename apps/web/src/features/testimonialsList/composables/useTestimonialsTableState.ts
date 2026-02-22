import { ref, computed, type Ref, type ComputedRef } from 'vue';
import type { TestimonialWithFormItem, TestimonialStatus } from '@/entities/testimonial';
import type { SortColumn, SortDirection } from '../models';

export const STATUS_OPTIONS: Array<{ value: TestimonialStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export interface TestimonialsTableState {
  statusFilter: Ref<TestimonialStatus | 'all'>;
  searchQuery: Ref<string>;
  sortColumn: Ref<SortColumn>;
  sortDirection: Ref<SortDirection>;
  selectedTestimonialId: Ref<string | null>;
  filteredTestimonials: ComputedRef<TestimonialWithFormItem[]>;
  selectedTestimonial: ComputedRef<TestimonialWithFormItem | null>;
  hasFilteredResults: ComputedRef<boolean>;
  isSearching: ComputedRef<boolean>;
  toggleSort: (column: SortColumn) => void;
  setStatusFilter: (status: TestimonialStatus | 'all') => void;
  selectTestimonial: (id: string) => void;
  clearSearch: () => void;
}

export function useTestimonialsTableState(
  testimonials: Ref<TestimonialWithFormItem[]>,
): TestimonialsTableState {
  const statusFilter = ref<TestimonialStatus | 'all'>('all');
  const searchQuery = ref('');
  const sortColumn = ref<SortColumn>('date');
  const sortDirection = ref<SortDirection>('desc');
  const selectedTestimonialId = ref<string | null>(null);

  const toggleSort = (column: SortColumn): void => {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn.value = column;
      sortDirection.value = 'asc';
    }
  };

  const setStatusFilter = (status: TestimonialStatus | 'all'): void => {
    statusFilter.value = status;
  };

  const selectTestimonial = (id: string): void => {
    selectedTestimonialId.value = id;
  };

  const clearSearch = (): void => {
    searchQuery.value = '';
  };

  const filteredTestimonials = computed((): TestimonialWithFormItem[] => {
    let result = [...testimonials.value];

    // Status filter
    if (statusFilter.value !== 'all') {
      result = result.filter((t) => t.status === statusFilter.value);
    }

    // Search filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.content?.toLowerCase().includes(q) ||
          t.customer_name.toLowerCase().includes(q) ||
          t.customer_company?.toLowerCase().includes(q),
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortColumn.value) {
        case 'customer':
          comparison = a.customer_name.localeCompare(b.customer_name);
          break;
        case 'rating':
          comparison = (a.rating ?? 0) - (b.rating ?? 0);
          break;
        case 'status': {
          const getStatusOrder = (status: string): number => {
            if (status === 'pending') return 0;
            if (status === 'approved') return 1;
            return 2;
          };
          comparison = getStatusOrder(a.status) - getStatusOrder(b.status);
          break;
        }
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortDirection.value === 'asc' ? comparison : -comparison;
    });

    return result;
  });

  const selectedTestimonial = computed(
    () => testimonials.value.find((t) => t.id === selectedTestimonialId.value) ?? null,
  );

  const hasFilteredResults = computed(() => filteredTestimonials.value.length > 0);
  const isSearching = computed(() => searchQuery.value.trim().length > 0);

  return {
    statusFilter,
    searchQuery,
    sortColumn,
    sortDirection,
    selectedTestimonialId,
    filteredTestimonials,
    selectedTestimonial,
    hasFilteredResults,
    isSearching,
    toggleSort,
    setStatusFilter,
    selectTestimonial,
    clearSearch,
  };
}
