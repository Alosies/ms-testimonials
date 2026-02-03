<script setup lang="ts">
/**
 * Credit Balance Widget
 *
 * Displays current credit balance with usage progress and period information.
 * Part of ADR-023 AI Capabilities Plan Integration.
 */
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { Button, Skeleton } from '@testimonials/ui';
import { useCreditBalance } from '../composables';
import { creditTestIds } from '@/shared/constants/testIds';

interface Props {
  /** Smaller version for sidebar placement */
  compact?: boolean;
}

withDefaults(defineProps<Props>(), {
  compact: false,
});

const emit = defineEmits<{
  (e: 'get-credits'): void;
}>();

const {
  balance,
  loading,
  error,
  refresh,
  percentUsed,
  isLow,
  daysUntilReset,
} = useCreditBalance({ refreshInterval: 60000 }); // Refresh every minute

/**
 * Format number with commas for display
 */
function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Format date for period reset display
 */
function formatResetDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Progress bar color based on usage level
 */
const progressBarColor = computed(() => {
  if (percentUsed.value >= 90) {
    return 'bg-red-500';
  }
  if (percentUsed.value >= 80) {
    return 'bg-amber-500';
  }
  return 'bg-emerald-500';
});

/**
 * Handle get credits button click
 */
function handleGetCredits(): void {
  emit('get-credits');
}
</script>

<template>
  <div
    class="rounded-xl border border-border bg-card"
    :class="compact ? 'p-3' : 'p-5'"
    :data-testid="creditTestIds.balanceWidget"
  >
    <!-- Loading State -->
    <template v-if="loading && !balance">
      <div :class="compact ? 'space-y-2' : 'space-y-4'">
        <!-- Header skeleton -->
        <div class="flex items-center justify-between">
          <Skeleton :class="compact ? 'h-4 w-20' : 'h-5 w-24'" />
          <Skeleton class="h-4 w-16" />
        </div>

        <!-- Credits skeleton -->
        <div class="flex items-baseline gap-2">
          <Skeleton :class="compact ? 'h-7 w-16' : 'h-10 w-24'" />
          <Skeleton class="h-4 w-20" />
        </div>

        <!-- Progress skeleton -->
        <Skeleton :class="compact ? 'h-1.5 w-full' : 'h-2 w-full'" />

        <!-- Breakdown skeleton -->
        <div v-if="!compact" class="flex justify-between">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-4 w-24" />
        </div>
      </div>
    </template>

    <!-- Error State -->
    <template v-else-if="error">
      <div class="text-center" :class="compact ? 'py-2' : 'py-4'">
        <Icon
          icon="heroicons:exclamation-triangle"
          :class="compact ? 'h-6 w-6' : 'h-8 w-8'"
          class="text-destructive mx-auto mb-2"
        />
        <p :class="compact ? 'text-xs' : 'text-sm'" class="text-destructive mb-2">
          Failed to load balance
        </p>
        <button
          class="text-xs text-primary hover:underline"
          @click="refresh"
        >
          Try again
        </button>
      </div>
    </template>

    <!-- Content -->
    <template v-else-if="balance">
      <!-- Header Row -->
      <div class="flex items-center justify-between" :class="compact ? 'mb-2' : 'mb-3'">
        <div class="flex items-center gap-2">
          <Icon
            icon="heroicons:bolt"
            :class="compact ? 'h-4 w-4' : 'h-5 w-5'"
            class="text-primary"
          />
          <span
            :class="compact ? 'text-xs' : 'text-sm'"
            class="font-medium text-muted-foreground"
          >
            AI Credits
          </span>
        </div>

        <!-- Low balance warning badge -->
        <span
          v-if="isLow"
          class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        >
          <Icon icon="heroicons:exclamation-triangle" class="h-3 w-3" />
          Low
        </span>
      </div>

      <!-- Available Credits (Prominent Display) -->
      <div class="flex items-baseline gap-2" :class="compact ? 'mb-2' : 'mb-3'">
        <span
          :class="compact ? 'text-2xl' : 'text-3xl'"
          class="font-bold text-foreground"
          :data-testid="creditTestIds.balanceAvailable"
        >
          {{ formatNumber(balance.available) }}
        </span>
        <span :class="compact ? 'text-xs' : 'text-sm'" class="text-muted-foreground">
          available
        </span>
      </div>

      <!-- Usage Progress Bar -->
      <div :class="compact ? 'mb-2' : 'mb-4'">
        <div
          class="w-full rounded-full bg-muted"
          :class="compact ? 'h-1.5' : 'h-2'"
        >
          <div
            :class="[progressBarColor, compact ? 'h-1.5' : 'h-2']"
            class="rounded-full transition-all duration-500"
            :style="{ width: `${Math.min(percentUsed, 100)}%` }"
          />
        </div>
        <div class="flex justify-between mt-1">
          <span class="text-[10px] text-muted-foreground" :data-testid="creditTestIds.balanceUsed">
            {{ percentUsed }}% used
          </span>
          <span class="text-[10px] text-muted-foreground" :data-testid="creditTestIds.balanceResetDate">
            Resets {{ formatResetDate(balance.periodEndsAt) }}
          </span>
        </div>
      </div>

      <!-- Credit Breakdown (Full version only) -->
      <div v-if="!compact" class="grid grid-cols-2 gap-3 mb-4">
        <!-- Monthly Credits -->
        <div class="flex items-center gap-2" :data-testid="creditTestIds.balancePlan">
          <div class="w-2 h-2 rounded-full bg-primary" />
          <div>
            <p class="text-xs text-muted-foreground">Monthly</p>
            <p class="text-sm font-medium text-foreground">
              {{ formatNumber(balance.monthlyCredits - balance.usedThisPeriod) }}
              <span class="text-muted-foreground font-normal">
                / {{ formatNumber(balance.monthlyCredits) }}
              </span>
            </p>
          </div>
        </div>

        <!-- Bonus Credits -->
        <div class="flex items-center gap-2" :data-testid="creditTestIds.balanceBonus">
          <div class="w-2 h-2 rounded-full bg-purple-500" />
          <div>
            <p class="text-xs text-muted-foreground">Bonus</p>
            <p class="text-sm font-medium text-foreground">
              {{ formatNumber(balance.bonusCredits) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Compact breakdown -->
      <div v-else class="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
        <span>Monthly: {{ formatNumber(balance.monthlyCredits - balance.usedThisPeriod) }}</span>
        <span>Bonus: {{ formatNumber(balance.bonusCredits) }}</span>
      </div>

      <!-- Days until reset -->
      <div
        v-if="!compact"
        class="flex items-center gap-2 text-xs text-muted-foreground mb-4"
      >
        <Icon icon="heroicons:clock" class="h-4 w-4" />
        <span>
          {{ daysUntilReset }} {{ daysUntilReset === 1 ? 'day' : 'days' }} until period resets
        </span>
      </div>

      <!-- Get More Credits Button (when low) -->
      <Button
        v-if="isLow"
        :size="compact ? 'sm' : 'default'"
        class="w-full"
        data-testid="get-credits-button"
        @click="handleGetCredits"
      >
        <Icon icon="heroicons:plus" :class="compact ? 'h-3.5 w-3.5' : 'h-4 w-4'" />
        Get More Credits
      </Button>
    </template>
  </div>
</template>
