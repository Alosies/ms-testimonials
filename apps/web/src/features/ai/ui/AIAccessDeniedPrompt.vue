<script setup lang="ts">
/**
 * AIAccessDeniedPrompt Component
 *
 * Displays contextual prompts when AI access is denied due to:
 * - Plan restrictions (upgradeRequired)
 * - Insufficient credits (topupRequired)
 *
 * @see ADR-023 AI Capabilities Plan Integration
 */
import { computed } from 'vue';
import { Button } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';

// ============================================================================
// Types
// ============================================================================

interface Props {
  /** Whether an upgrade is required to access this feature */
  upgradeRequired?: boolean;
  /** Whether a credit topup is required */
  topupRequired?: boolean;
  /** Estimated credits needed for the operation */
  creditsNeeded?: number;
  /** Custom upgrade hint message from API */
  upgradeHint?: string;
  /** Custom topup hint message from API */
  topupHint?: string;
  /** Compact mode - smaller text and padding */
  compact?: boolean;
}

// ============================================================================
// Props & Emits
// ============================================================================

const props = withDefaults(defineProps<Props>(), {
  upgradeRequired: false,
  topupRequired: false,
  creditsNeeded: 0,
  upgradeHint: '',
  topupHint: '',
  compact: false,
});

const emit = defineEmits<{
  (e: 'upgrade'): void;
  (e: 'topup'): void;
  (e: 'dismiss'): void;
}>();

// ============================================================================
// Computed
// ============================================================================

const title = computed(() => {
  if (props.upgradeRequired) {
    return 'Upgrade Required';
  }
  if (props.topupRequired) {
    return 'More Credits Needed';
  }
  return 'Access Restricted';
});

const description = computed(() => {
  if (props.upgradeRequired && props.upgradeHint) {
    return props.upgradeHint;
  }
  if (props.upgradeRequired) {
    return 'This AI feature is not available on your current plan. Upgrade to access premium AI capabilities.';
  }
  if (props.topupRequired && props.topupHint) {
    return props.topupHint;
  }
  if (props.topupRequired && props.creditsNeeded > 0) {
    return `You need ${props.creditsNeeded} credits for this operation. Purchase additional credits to continue.`;
  }
  if (props.topupRequired) {
    return 'You have run out of credits. Purchase additional credits to continue using AI features.';
  }
  return 'Access to this feature is currently restricted.';
});

const icon = computed(() => {
  if (props.upgradeRequired) return 'lucide:arrow-up-circle';
  if (props.topupRequired) return 'lucide:coins';
  return 'lucide:lock';
});

const actionLabel = computed(() => {
  if (props.upgradeRequired) return 'Upgrade Plan';
  if (props.topupRequired) return 'Get Credits';
  return 'Learn More';
});

// ============================================================================
// Methods
// ============================================================================

function handleAction() {
  if (props.upgradeRequired) {
    emit('upgrade');
  } else if (props.topupRequired) {
    emit('topup');
  }
}
</script>

<template>
  <div
    :class="[
      'ai-access-denied-prompt rounded-lg border',
      compact ? 'p-3' : 'p-4',
      upgradeRequired ? 'bg-amber-50 border-amber-200' : '',
      topupRequired ? 'bg-blue-50 border-blue-200' : '',
    ]"
    data-testid="ai-access-denied-prompt"
  >
    <div class="flex items-start gap-3">
      <!-- Icon -->
      <div
        class="shrink-0 rounded-full p-2"
        :class="[
          upgradeRequired ? 'bg-amber-100 text-amber-600' : '',
          topupRequired ? 'bg-blue-100 text-blue-600' : '',
        ]"
      >
        <Icon :icon="icon" :class="compact ? 'h-4 w-4' : 'h-5 w-5'" />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h4
          :class="[
            'font-semibold',
            compact ? 'text-sm' : 'text-base',
            upgradeRequired ? 'text-amber-800' : '',
            topupRequired ? 'text-blue-800' : '',
          ]"
          data-testid="ai-access-denied-title"
        >
          {{ title }}
        </h4>
        <p
          :class="[
            compact ? 'text-xs mt-0.5' : 'text-sm mt-1',
            upgradeRequired ? 'text-amber-700' : '',
            topupRequired ? 'text-blue-700' : '',
          ]"
          data-testid="ai-access-denied-description"
        >
          {{ description }}
        </p>

        <!-- Actions -->
        <div
          :class="[
            'flex items-center gap-2',
            compact ? 'mt-2' : 'mt-3',
          ]"
        >
          <Button
            :size="compact ? 'sm' : 'default'"
            :variant="upgradeRequired ? 'default' : 'outline'"
            :class="[
              upgradeRequired ? 'bg-amber-600 hover:bg-amber-700 text-white' : '',
              topupRequired ? 'border-blue-600 text-blue-600 hover:bg-blue-50' : '',
            ]"
            data-testid="ai-access-denied-action"
            @click="handleAction"
          >
            <Icon :icon="icon" class="h-4 w-4 mr-1.5" />
            {{ actionLabel }}
          </Button>

          <Button
            v-if="!compact"
            variant="ghost"
            size="sm"
            class="text-gray-500"
            data-testid="ai-access-denied-dismiss"
            @click="emit('dismiss')"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
