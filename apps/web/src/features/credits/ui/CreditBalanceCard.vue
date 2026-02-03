<script setup lang="ts">
/**
 * Credit Balance Card
 *
 * Displays organization's credit balance with Apple Storage-style visualization.
 * Shows total credit pool with segments for used, plan remaining, and bonus.
 * Part of ADR-023 AI Capabilities Plan Integration.
 */
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { Skeleton } from '@testimonials/ui';
import { useCreditBalance } from '../composables';
import { CREDIT_POSITIVE_CLASS, CREDIT_NEGATIVE_CLASS } from '../functions';
import { creditTestIds } from '@/shared/constants/testIds';

const {
  balance,
  loading,
  error,
  refresh,
  isLow,
} = useCreditBalance({ refreshInterval: 60000 });

function formatNumber(value: number): string {
  return value.toLocaleString();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateRange(startDate: string, endDate: string): string {
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

/**
 * Compute original plan allocation.
 * Since monthly credits are consumed first, we can approximate:
 * original = current monthly + usage (assuming all usage came from monthly first)
 */
const originalPlanCredits = computed(() => {
  if (!balance.value) return 0;
  return balance.value.monthlyCredits + balance.value.usedThisPeriod;
});

/**
 * Total credit pool = original plan allocation + bonus credits
 */
const totalPool = computed(() => {
  if (!balance.value) return 0;
  return originalPlanCredits.value + balance.value.bonusCredits;
});

/**
 * Segment percentages for the stacked bar (Apple Storage style)
 * Order: Used (consumed) | Plan Remaining | Bonus
 */
const segments = computed(() => {
  if (!balance.value || totalPool.value === 0) {
    return { used: 0, planRemaining: 0, bonus: 0 };
  }

  const used = balance.value.usedThisPeriod;
  const planRemaining = balance.value.monthlyCredits;
  const bonus = balance.value.bonusCredits;
  const total = totalPool.value;

  return {
    used: (used / total) * 100,
    planRemaining: (planRemaining / total) * 100,
    bonus: (bonus / total) * 100,
  };
});
</script>

<template>
  <div
    class="rounded-xl border border-border bg-card p-6"
    :data-testid="creditTestIds.balanceWidget"
  >
    <!-- Loading State -->
    <template v-if="loading && !balance">
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <Skeleton class="h-5 w-5 rounded" />
          <Skeleton class="h-6 w-24" />
        </div>
        <Skeleton class="h-10 w-32" />
        <Skeleton class="h-2 w-full rounded-full" />
        <div class="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
          <div>
            <Skeleton class="h-3 w-12 mb-2" />
            <Skeleton class="h-4 w-16" />
          </div>
          <div>
            <Skeleton class="h-3 w-12 mb-2" />
            <Skeleton class="h-4 w-10" />
          </div>
          <div>
            <Skeleton class="h-3 w-16 mb-2" />
            <Skeleton class="h-4 w-14" />
          </div>
        </div>
      </div>
    </template>

    <!-- Error State -->
    <template v-else-if="error">
      <div class="text-center py-8">
        <Icon
          icon="heroicons:exclamation-triangle"
          class="h-10 w-10 text-destructive mx-auto mb-3"
        />
        <p class="text-sm text-destructive mb-3">Failed to load credit balance</p>
        <button class="text-sm text-primary hover:underline" @click="refresh">
          Try again
        </button>
      </div>
    </template>

    <!-- Content -->
    <template v-else-if="balance">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <Icon icon="heroicons:bolt" class="h-5 w-5 text-primary" />
          <h3 class="text-lg font-semibold text-foreground">AI Credits</h3>
        </div>
        <span
          v-if="isLow"
          class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        >
          <Icon icon="heroicons:exclamation-triangle" class="h-3.5 w-3.5" />
          Low Balance
        </span>
      </div>

      <!-- Available Credits -->
      <div class="flex items-baseline gap-2 mb-4">
        <span class="text-4xl font-bold text-foreground" :data-testid="creditTestIds.balanceAvailable">
          {{ formatNumber(balance.available) }}
        </span>
        <span class="text-sm text-muted-foreground">credits available</span>
      </div>

      <!-- Credit Pool Bar (Apple Storage style) -->
      <div class="mb-5">
        <!-- Stacked bar -->
        <div class="w-full h-3 rounded-full bg-muted overflow-hidden flex">
          <!-- Used segment (coral/red) -->
          <div
            v-if="segments.used > 0"
            class="h-full bg-red-400 dark:bg-red-500 transition-all duration-500"
            :style="{ width: `${segments.used}%` }"
          />
          <!-- Plan remaining segment (teal) -->
          <div
            v-if="segments.planRemaining > 0"
            class="h-full bg-teal-500 dark:bg-teal-400 transition-all duration-500"
            :style="{ width: `${segments.planRemaining}%` }"
          />
          <!-- Bonus segment (violet) -->
          <div
            v-if="segments.bonus > 0"
            class="h-full bg-violet-500 dark:bg-violet-400 transition-all duration-500"
            :style="{ width: `${segments.bonus}%` }"
          />
        </div>

        <!-- Legend -->
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs text-muted-foreground">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-sm bg-red-400 dark:bg-red-500" />
            <span>Used</span>
            <span class="font-medium text-foreground tabular-nums">{{ formatNumber(balance.usedThisPeriod) }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-sm bg-teal-500 dark:bg-teal-400" />
            <span>Plan</span>
            <span class="font-medium text-foreground tabular-nums">{{ formatNumber(balance.monthlyCredits) }}</span>
          </div>
          <div v-if="balance.bonusCredits > 0" class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-sm bg-violet-500 dark:bg-violet-400" />
            <span>Bonus</span>
            <span class="font-medium text-foreground tabular-nums">{{ formatNumber(balance.bonusCredits) }}</span>
          </div>
          <div class="ml-auto text-muted-foreground">
            Resets {{ formatDate(balance.periodEndsAt) }}
          </div>
        </div>
      </div>

      <!-- Credit Breakdown -->
      <div class="p-4 rounded-lg bg-muted/50 space-y-4 text-sm">
        <!-- Credits Section -->
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Credits</p>
          <div class="flex items-center justify-between">
            <div>
              <span class="text-foreground">Plan</span>
              <span class="text-muted-foreground ml-1 text-xs">({{ formatDateRange(balance.periodStartsAt, balance.periodEndsAt) }})</span>
            </div>
            <span :class="['font-medium tabular-nums', CREDIT_POSITIVE_CLASS]">{{ formatNumber(originalPlanCredits) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-foreground">Bonus</span>
            <span :class="['font-medium tabular-nums', CREDIT_POSITIVE_CLASS]">{{ formatNumber(balance.bonusCredits) }}</span>
          </div>
        </div>

        <!-- Usage Section -->
        <div class="space-y-2 pt-2 border-t border-border/50">
          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Usage</p>
          <div class="flex items-center justify-between">
            <div>
              <span class="text-foreground">Used</span>
              <span class="text-muted-foreground ml-1 text-xs">({{ formatDateRange(balance.periodStartsAt, balance.periodEndsAt) }})</span>
            </div>
            <span :class="['font-medium tabular-nums', CREDIT_NEGATIVE_CLASS]">−{{ formatNumber(balance.usedThisPeriod) }}</span>
          </div>
        </div>

        <!-- Remaining Section -->
        <div class="pt-3 border-t border-border">
          <div class="flex items-center justify-between">
            <span class="font-medium text-foreground">Remaining</span>
            <span class="font-semibold text-primary tabular-nums">{{ formatNumber(balance.available) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
