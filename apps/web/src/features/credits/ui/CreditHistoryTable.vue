<script setup lang="ts">
import { onMounted } from 'vue';
import { Icon } from '@testimonials/icons';
import { useCreditHistory } from '../composables';
import { TRANSACTION_TYPE_LABELS, type TransactionType } from '../models';
import CreditHistoryTableSkeleton from './CreditHistoryTableSkeleton.vue';
import CreditHistoryEmptyState from './CreditHistoryEmptyState.vue';

const {
  transactions,
  pagination,
  loading,
  error,
  hasTransactions,
  canGoNext,
  canGoPrev,
  typeFilter,
  fetchTransactions,
  nextPage,
  prevPage,
  setTypeFilter,
} = useCreditHistory();

// Filter options for the dropdown
const filterOptions: { value: TransactionType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'ai_consumption', label: 'AI Usage' },
  { value: 'plan_allocation', label: 'Monthly Credit' },
  { value: 'topup_purchase', label: 'Credit Purchase' },
  { value: 'promo_bonus', label: 'Promotional Bonus' },
  { value: 'admin_adjustment', label: 'Admin Adjustment' },
  { value: 'plan_change_adjustment', label: 'Plan Change' },
  { value: 'expiration', label: 'Expired' },
];

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Get label for transaction type
 */
function getTypeLabel(type: TransactionType): string {
  return TRANSACTION_TYPE_LABELS[type] || type;
}

/**
 * Get badge style for transaction type
 */
function getTypeBadgeClass(type: TransactionType): string {
  switch (type) {
    case 'ai_consumption':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'plan_allocation':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'topup_purchase':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    case 'promo_bonus':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'admin_adjustment':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    case 'plan_change_adjustment':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
    case 'expiration':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

/**
 * Format credits amount with sign
 */
function formatCredits(amount: number): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}${amount.toLocaleString()}`;
}

/**
 * Handle filter change
 */
function handleFilterChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  const value = target.value as TransactionType | '';
  setTypeFilter(value || undefined);
}

// Fetch on mount
onMounted(() => {
  fetchTransactions();
});
</script>

<template>
  <div>
    <!-- Filter Controls -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <label for="type-filter" class="text-sm text-muted-foreground">Filter by:</label>
        <select
          id="type-filter"
          :value="typeFilter || ''"
          class="px-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          @change="handleFilterChange"
        >
          <option
            v-for="option in filterOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <CreditHistoryTableSkeleton v-if="loading && !hasTransactions" />

    <!-- Error State -->
    <div
      v-else-if="error"
      class="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center"
    >
      <Icon icon="heroicons:exclamation-triangle" class="h-8 w-8 text-destructive mx-auto mb-2" />
      <p class="text-sm text-destructive">{{ error }}</p>
      <button
        class="mt-3 text-sm text-primary hover:underline"
        @click="fetchTransactions()"
      >
        Try again
      </button>
    </div>

    <!-- Empty State -->
    <CreditHistoryEmptyState v-else-if="!hasTransactions" />

    <!-- Table -->
    <div
      v-else
      class="rounded-xl border border-border bg-card overflow-hidden"
      data-testid="credit-history-table"
    >
      <table class="w-full">
        <!-- Table Header -->
        <thead>
          <tr class="border-b border-border bg-muted/30">
            <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Date
            </th>
            <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Type
            </th>
            <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
              Capability
            </th>
            <th class="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Credits
            </th>
            <th class="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
              Balance After
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="divide-y divide-border/50">
          <tr
            v-for="transaction in transactions"
            :key="transaction.id"
            class="group hover:bg-muted/30 transition-colors"
            data-testid="transaction-row"
          >
            <!-- Date -->
            <td class="py-3 px-4">
              <span class="text-sm text-foreground">
                {{ formatDate(transaction.createdAt) }}
              </span>
            </td>

            <!-- Type -->
            <td class="py-3 px-4">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="getTypeBadgeClass(transaction.transactionType)"
              >
                {{ getTypeLabel(transaction.transactionType) }}
              </span>
            </td>

            <!-- Capability -->
            <td class="py-3 px-4 hidden md:table-cell">
              <span v-if="transaction.aiCapabilityName" class="text-sm text-muted-foreground">
                {{ transaction.aiCapabilityName }}
                <span v-if="transaction.qualityLevelName" class="text-xs">
                  ({{ transaction.qualityLevelName }})
                </span>
              </span>
              <span v-else class="text-sm text-muted-foreground/50">-</span>
            </td>

            <!-- Credits -->
            <td class="py-3 px-4 text-right">
              <span
                class="text-sm font-medium font-mono"
                :class="transaction.creditsAmount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
              >
                {{ formatCredits(transaction.creditsAmount) }}
              </span>
            </td>

            <!-- Balance After -->
            <td class="py-3 px-4 text-right hidden sm:table-cell">
              <span class="text-sm text-muted-foreground font-mono">
                {{ transaction.balanceAfter.toLocaleString() }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div
        v-if="pagination.totalPages > 1"
        class="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20"
      >
        <div class="text-sm text-muted-foreground">
          Page {{ pagination.page }} of {{ pagination.totalPages }}
          <span class="hidden sm:inline">
            ({{ pagination.total }} total transactions)
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="!canGoPrev || loading"
            data-testid="pagination-prev"
            @click="prevPage"
          >
            <Icon icon="heroicons:chevron-left" class="h-4 w-4 mr-1" />
            Previous
          </button>

          <button
            class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="!canGoNext || loading"
            data-testid="pagination-next"
            @click="nextPage"
          >
            Next
            <Icon icon="heroicons:chevron-right" class="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>

    <!-- Loading overlay for pagination -->
    <div
      v-if="loading && hasTransactions"
      class="fixed inset-0 bg-background/50 flex items-center justify-center z-50"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  </div>
</template>
