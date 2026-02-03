<script setup lang="ts">
/**
 * Billing Plan Card
 *
 * Displays the current subscription plan with status, pricing, and billing details.
 * Part of ADR-023 AI Capabilities Plan Integration.
 */
import { computed, toRefs } from 'vue';
import { Icon } from '@testimonials/icons';
import { Skeleton } from '@testimonials/ui';
import { useCurrentContextStore } from '@/shared/currentContext';
import { useGetOrganizationBilling } from '@/entities/organization';

// Get organization context
const contextStore = useCurrentContextStore();
const { currentOrganizationId } = toRefs(contextStore);

// Fetch billing data
const {
  activePlan,
  isLoading,
  error,
  refetch,
} = useGetOrganizationBilling(computed(() => ({
  organizationId: currentOrganizationId.value ?? '',
})));

// Format currency from base units (cents)
function formatPrice(amountInCents: number, currencyCode: string): string {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date nicely
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Days until period ends
const daysUntilRenewal = computed(() => {
  if (!activePlan.value?.current_period_ends_at) return null;
  const endDate = new Date(activePlan.value.current_period_ends_at);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Status badge styling
const statusStyles = computed(() => {
  const status = activePlan.value?.status ?? 'active';
  switch (status) {
    case 'trial':
      return 'bg-amber-50 text-amber-700';
    case 'active':
      return 'bg-emerald-50 text-emerald-700';
    case 'cancelled':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
});

// Billing cycle label
const billingCycleLabel = computed(() => {
  const cycle = activePlan.value?.billing_cycle;
  switch (cycle) {
    case 'monthly':
      return 'Monthly';
    case 'yearly':
      return 'Annual';
    case 'lifetime':
      return 'Lifetime';
    default:
      return cycle || 'Monthly';
  }
});

// Price display based on billing cycle
const priceDisplay = computed(() => {
  if (!activePlan.value) return null;
  const { price_in_base_unit, currency_code, billing_cycle } = activePlan.value;
  const formattedPrice = formatPrice(price_in_base_unit, currency_code);

  if (price_in_base_unit === 0) return 'Free';
  if (billing_cycle === 'lifetime') return formattedPrice;
  if (billing_cycle === 'yearly') return `${formattedPrice}/year`;
  return `${formattedPrice}/month`;
});

// Check if on trial
const isOnTrial = computed(() => activePlan.value?.status === 'trial');

// Trial days remaining
const trialDaysRemaining = computed(() => {
  if (!isOnTrial.value || !activePlan.value?.trial_ends_at) return null;
  const trialEnd = new Date(activePlan.value.trial_ends_at);
  const now = new Date();
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Pending downgrade info
const hasPendingDowngrade = computed(() => !!activePlan.value?.pending_plan_id);

// Handler for retry button
function handleRefresh(): void {
  refetch();
}
</script>

<template>
  <div class="max-w-xl">
    <!-- Current Plan Card -->
    <div class="rounded-xl border border-border bg-card p-6">
      <template v-if="isLoading">
        <div class="flex items-center justify-between mb-4">
          <Skeleton class="h-5 w-24" />
          <Skeleton class="h-5 w-16" />
        </div>
        <Skeleton class="h-10 w-32 mb-4" />
        <Skeleton class="h-4 w-48 mb-6" />
        <div class="space-y-3">
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-3/4" />
        </div>
      </template>

      <template v-else-if="error">
        <div class="text-center py-8">
          <Icon icon="heroicons:exclamation-triangle" class="h-8 w-8 text-destructive mx-auto mb-2" />
          <p class="text-sm text-destructive mb-2">Failed to load billing info</p>
          <button class="text-sm text-primary hover:underline" @click="handleRefresh">
            Try again
          </button>
        </div>
      </template>

      <template v-else-if="activePlan">
        <!-- Header with status badge -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <Icon icon="heroicons:credit-card" class="h-5 w-5 text-primary" />
            <span class="text-base font-semibold text-foreground">Current Plan</span>
          </div>
          <span
            :class="[
              'text-xs font-medium px-2.5 py-1 rounded-full capitalize',
              statusStyles
            ]"
          >
            {{ activePlan.status }}
          </span>
        </div>

        <!-- Plan name and price -->
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-3xl font-bold text-foreground">
            {{ activePlan.plan?.name || 'Free' }}
          </span>
          <span v-if="priceDisplay" class="text-lg text-muted-foreground">
            {{ priceDisplay }}
          </span>
        </div>

        <!-- Plan description -->
        <p v-if="activePlan.plan?.description" class="text-sm text-muted-foreground mb-5">
          {{ activePlan.plan.description }}
        </p>

        <!-- Trial warning -->
        <div
          v-if="isOnTrial && trialDaysRemaining !== null"
          class="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 mb-5"
        >
          <Icon icon="heroicons:clock" class="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span class="text-sm text-amber-800">
            Your trial ends in {{ trialDaysRemaining }} {{ trialDaysRemaining === 1 ? 'day' : 'days' }}
            <span class="text-amber-600">({{ formatDate(activePlan.trial_ends_at) }})</span>
          </span>
        </div>

        <!-- Pending downgrade notice -->
        <div
          v-if="hasPendingDowngrade"
          class="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 mb-5"
        >
          <Icon icon="heroicons:information-circle" class="h-4 w-4 text-blue-600 flex-shrink-0" />
          <span class="text-sm text-blue-800">
            Plan change scheduled for {{ formatDate(activePlan.pending_change_at) }}
          </span>
        </div>

        <!-- Billing details -->
        <div class="space-y-2.5 text-sm border-t border-border/50 pt-5">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Billing cycle</span>
            <span class="font-medium text-foreground">{{ billingCycleLabel }}</span>
          </div>
          <div v-if="activePlan.billing_cycle !== 'lifetime'" class="flex items-center justify-between">
            <span class="text-muted-foreground">Next billing</span>
            <span class="font-medium text-foreground">
              {{ formatDate(activePlan.current_period_ends_at) }}
              <span v-if="daysUntilRenewal !== null" class="text-muted-foreground font-normal">
                ({{ daysUntilRenewal }} {{ daysUntilRenewal === 1 ? 'day' : 'days' }})
              </span>
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Member since</span>
            <span class="font-medium text-foreground">{{ formatDate(activePlan.starts_at) }}</span>
          </div>
        </div>

        <!-- Footer: Manage subscription link -->
        <div class="flex items-center justify-between pt-5 mt-5 border-t border-border/50">
          <span class="text-xs text-muted-foreground">
            Need more? Upgrade your plan.
          </span>
          <button
            class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon icon="heroicons:arrow-up-right" class="h-3.5 w-3.5" />
            <span>Manage Plan</span>
          </button>
        </div>
      </template>

      <!-- No plan state -->
      <template v-else>
        <div class="text-center py-8">
          <Icon icon="heroicons:credit-card" class="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
          <p class="text-sm text-muted-foreground">No active subscription</p>
        </div>
      </template>
    </div>
  </div>
</template>
