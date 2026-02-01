<script setup lang="ts">
/**
 * Credit History Row
 *
 * Renders a single row in the credit history table.
 * Extracted to keep CreditHistoryTable under 250 lines.
 */
import {
  getActorInfo,
  hasActorInfo,
  TRANSACTION_TYPE_LABELS,
} from '../functions';
import type { CreditTransaction, TransactionType } from '../models';

defineProps<{
  transaction: CreditTransaction;
}>();

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
</script>

<template>
  <tr
    class="group hover:bg-muted/30 transition-colors"
    data-testid="transaction-row"
  >
    <!-- Date -->
    <td class="py-2.5 px-4">
      <span class="text-xs text-foreground">
        {{ formatDate(transaction.createdAt) }}
      </span>
    </td>

    <!-- Type -->
    <td class="py-2.5 px-4">
      <span
        class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium"
        :class="getTypeBadgeClass(transaction.transactionType)"
      >
        {{ getTypeLabel(transaction.transactionType) }}
      </span>
    </td>

    <!-- Actor (Form / User context) -->
    <td class="py-2.5 px-4 hidden lg:table-cell">
      <div v-if="hasActorInfo(transaction)" class="flex flex-col gap-0.5 min-w-0">
        <span
          v-if="getActorInfo(transaction).form"
          class="text-xs text-muted-foreground truncate"
          :title="getActorInfo(transaction).form || undefined"
        >
          {{ getActorInfo(transaction).form }}
        </span>
        <span
          v-if="getActorInfo(transaction).user"
          class="text-xs text-muted-foreground/70 truncate"
          :title="getActorInfo(transaction).user || undefined"
        >
          {{ getActorInfo(transaction).user }}
        </span>
      </div>
      <span v-else class="text-xs text-muted-foreground/50">-</span>
    </td>

    <!-- Capability -->
    <td class="py-2.5 px-4 hidden md:table-cell">
      <span v-if="transaction.aiCapabilityName" class="text-xs text-muted-foreground truncate block">
        {{ transaction.aiCapabilityName }}
        <span v-if="transaction.qualityLevelName" class="text-[10px]">
          ({{ transaction.qualityLevelName }})
        </span>
      </span>
      <span v-else class="text-xs text-muted-foreground/50">-</span>
    </td>

    <!-- Credits -->
    <td class="py-2.5 px-4 text-right">
      <span
        class="text-xs font-medium font-mono"
        :class="transaction.creditsAmount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
      >
        {{ formatCredits(transaction.creditsAmount) }}
      </span>
    </td>

    <!-- Balance -->
    <td class="py-2.5 px-4 text-right hidden sm:table-cell">
      <span class="text-xs text-muted-foreground font-mono">
        {{ transaction.balanceAfter.toLocaleString() }}
      </span>
    </td>
  </tr>
</template>
