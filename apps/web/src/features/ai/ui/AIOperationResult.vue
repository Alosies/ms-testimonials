<script setup lang="ts">
/**
 * AIOperationResult Component
 *
 * Displays credit consumption information after a successful AI operation.
 * Shows credits used and remaining balance.
 *
 * @see ADR-023 AI Capabilities Plan Integration
 */
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';

// ============================================================================
// Types
// ============================================================================

interface Props {
  /** Credits consumed by the operation */
  creditsUsed: number;
  /** Remaining balance after the operation */
  balanceRemaining?: number;
  /** Custom success message */
  message?: string;
  /** Compact mode - inline display */
  compact?: boolean;
  /** Show as a toast/notification style */
  toast?: boolean;
}

// ============================================================================
// Props
// ============================================================================

const props = withDefaults(defineProps<Props>(), {
  balanceRemaining: undefined,
  message: '',
  compact: false,
  toast: false,
});

// ============================================================================
// Computed
// ============================================================================

const displayMessage = computed(() => {
  if (props.message) return props.message;
  if (props.creditsUsed === 1) return '1 credit used';
  return `${props.creditsUsed} credits used`;
});

const balanceMessage = computed(() => {
  if (props.balanceRemaining === undefined) return '';
  if (props.balanceRemaining === 1) return '1 credit remaining';
  return `${props.balanceRemaining} credits remaining`;
});

const isLowBalance = computed(() => {
  if (props.balanceRemaining === undefined) return false;
  // Consider low if less than 5 credits remaining
  return props.balanceRemaining < 5;
});
</script>

<template>
  <!-- Toast Style -->
  <div
    v-if="toast"
    class="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg text-sm"
    data-testid="ai-operation-result-toast"
  >
    <Icon icon="lucide:check-circle" class="h-4 w-4 text-teal-600 shrink-0" />
    <span class="text-teal-700">{{ displayMessage }}</span>
    <span v-if="balanceRemaining !== undefined" class="text-teal-500">
      &middot; {{ balanceMessage }}
    </span>
  </div>

  <!-- Compact Inline Style -->
  <span
    v-else-if="compact"
    class="inline-flex items-center gap-1 text-xs text-gray-500"
    data-testid="ai-operation-result-compact"
  >
    <Icon icon="lucide:coins" class="h-3 w-3" />
    <span>{{ displayMessage }}</span>
  </span>

  <!-- Default Card Style -->
  <div
    v-else
    class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
    data-testid="ai-operation-result"
  >
    <!-- Credits Used -->
    <div class="flex items-center gap-2">
      <div class="p-1.5 bg-teal-100 rounded-full">
        <Icon icon="lucide:sparkles" class="h-4 w-4 text-teal-600" />
      </div>
      <div>
        <span class="text-sm font-medium text-gray-900">{{ displayMessage }}</span>
      </div>
    </div>

    <!-- Remaining Balance -->
    <div
      v-if="balanceRemaining !== undefined"
      class="flex items-center gap-1.5"
    >
      <Icon
        icon="lucide:wallet"
        :class="[
          'h-4 w-4',
          isLowBalance ? 'text-amber-500' : 'text-gray-400',
        ]"
      />
      <span
        :class="[
          'text-sm',
          isLowBalance ? 'text-amber-600 font-medium' : 'text-gray-600',
        ]"
        data-testid="ai-operation-result-balance"
      >
        {{ balanceMessage }}
      </span>
      <span
        v-if="isLowBalance"
        class="ml-1 text-xs text-amber-500"
        data-testid="ai-operation-result-low-warning"
      >
        (low)
      </span>
    </div>
  </div>
</template>
