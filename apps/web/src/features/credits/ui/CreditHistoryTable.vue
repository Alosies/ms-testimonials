<script setup lang="ts">
/**
 * Credit History Table
 *
 * Displays paginated credit transaction history with filtering.
 * Uses CreditHistoryRow for individual row rendering.
 */
import { onMounted } from 'vue';
import { Icon } from '@testimonials/icons';
import { useCreditHistory } from '../composables';
import { type TransactionType } from '../models';
import { creditTestIds } from '@/shared/constants/testIds';
import CreditHistoryTableSkeleton from './CreditHistoryTableSkeleton.vue';
import CreditHistoryEmptyState from './CreditHistoryEmptyState.vue';
import CreditHistoryRow from './CreditHistoryRow.vue';

interface Props {
  /** Show the filter/refresh header. Set to false when embedding in another component. */
  showHeader?: boolean;
}

withDefaults(defineProps<Props>(), {
  showHeader: true,
});

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
    <div v-if="showHeader" class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <label for="type-filter" class="text-sm text-muted-foreground">Filter by:</label>
        <select
          id="type-filter"
          :value="typeFilter || ''"
          class="px-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          :data-testid="creditTestIds.historyFilter"
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

      <!-- Refresh Button -->
      <button
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg bg-background hover:bg-muted transition-colors disabled:opacity-50"
        :disabled="loading"
        :data-testid="creditTestIds.historyRefresh"
        @click="fetchTransactions()"
      >
        <Icon
          icon="heroicons:arrow-path"
          class="h-4 w-4"
          :class="{ 'animate-spin': loading }"
        />
        Refresh
      </button>
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
      :data-testid="creditTestIds.historyTable"
    >
      <table class="w-full table-fixed">
        <!-- Column widths (percentage-based for balanced distribution) -->
        <colgroup>
          <col style="width: 15%" /><!-- Date -->
          <col style="width: 12%" /><!-- Type -->
          <col class="hidden lg:table-column" style="width: 25%" /><!-- Actor -->
          <col class="hidden md:table-column" style="width: 20%" /><!-- Capability -->
          <col style="width: 10%" /><!-- Credits -->
          <col class="hidden sm:table-column" style="width: 10%" /><!-- Balance -->
        </colgroup>

        <!-- Table Header -->
        <thead>
          <tr class="border-b border-border bg-muted/30">
            <th class="text-left py-2.5 px-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Date
            </th>
            <th class="text-left py-2.5 px-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Type
            </th>
            <th class="text-left py-2.5 px-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
              Actor
            </th>
            <th class="text-left py-2.5 px-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
              Capability
            </th>
            <th class="text-right py-2.5 px-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Credits
            </th>
            <th class="text-right py-2.5 px-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
              Balance
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="divide-y divide-border/50">
          <CreditHistoryRow
            v-for="transaction in transactions"
            :key="transaction.id"
            :transaction="transaction"
          />
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
