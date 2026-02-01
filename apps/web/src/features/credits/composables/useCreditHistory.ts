/**
 * Credit History Composable
 *
 * Manages the state and fetching of credit transaction history.
 */

import { ref, computed, watch } from 'vue';
import { useApiForCredits } from '../api';
import type {
  CreditTransaction,
  PaginationMeta,
  TransactionType,
} from '../models';

/**
 * Composable for managing credit transaction history
 */
export function useCreditHistory() {
  const api = useApiForCredits();

  // State
  const transactions = ref<CreditTransaction[]>([]);
  const pagination = ref<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const loading = ref(false);
  const error = ref<string | null>(null);
  const typeFilter = ref<TransactionType | undefined>(undefined);

  // Computed
  const hasTransactions = computed(() => transactions.value.length > 0);
  const canGoNext = computed(() => pagination.value.page < pagination.value.totalPages);
  const canGoPrev = computed(() => pagination.value.page > 1);

  /**
   * Fetch transactions from the API
   */
  async function fetchTransactions(page = 1): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.getTransactions({
        page,
        limit: pagination.value.limit,
        transactionType: typeFilter.value,
      });

      transactions.value = response.data;
      pagination.value = response.pagination;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load credit history';
      transactions.value = [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * Go to next page
   */
  function nextPage(): void {
    if (canGoNext.value) {
      fetchTransactions(pagination.value.page + 1);
    }
  }

  /**
   * Go to previous page
   */
  function prevPage(): void {
    if (canGoPrev.value) {
      fetchTransactions(pagination.value.page - 1);
    }
  }

  /**
   * Set transaction type filter
   */
  function setTypeFilter(type: TransactionType | undefined): void {
    typeFilter.value = type;
  }

  // Re-fetch when filter changes
  watch(typeFilter, () => {
    fetchTransactions(1);
  });

  return {
    // State
    transactions,
    pagination,
    loading,
    error,
    typeFilter,

    // Computed
    hasTransactions,
    canGoNext,
    canGoPrev,

    // Methods
    fetchTransactions,
    nextPage,
    prevPage,
    setTypeFilter,
  };
}
