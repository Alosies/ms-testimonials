<script setup lang="ts">
/**
 * Preview Step Card
 *
 * Read-only card showing a step in the preview flow.
 * Supports flow membership styling for branching visualization.
 */
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { FLOW_METADATA, type FlowMembership } from '@/entities/form';
import type { PreviewStepType } from '@/features/createForm/models';

const props = defineProps<{
  stepNumber: number;
  stepType: PreviewStepType;
  title: string;
  subtitle?: string;
  /** Flow membership for color coding (shared, testimonial, improvement) */
  flowMembership?: FlowMembership;
  /** Whether this step is the branch point */
  isBranchPoint?: boolean;
}>();

const stepConfig = computed(() => {
  switch (props.stepType) {
    case 'welcome':
      return {
        label: 'Welcome',
        icon: 'heroicons:hand-raised',
        color: 'text-purple-600 bg-purple-100',
      };
    case 'question':
      return {
        label: 'Question',
        icon: 'heroicons:chat-bubble-bottom-center-text',
        color: 'text-blue-600 bg-blue-100',
      };
    case 'rating':
      return {
        label: 'Rating',
        icon: 'heroicons:star',
        color: 'text-amber-600 bg-amber-100',
      };
    case 'testimonial_write':
      return {
        label: 'Testimonial',
        icon: 'heroicons:pencil-square',
        color: 'text-teal-600 bg-teal-100',
      };
    case 'consent':
      return {
        label: 'Consent',
        icon: 'heroicons:check-circle',
        color: 'text-emerald-600 bg-emerald-100',
      };
    case 'contact_info':
      return {
        label: 'Contact Info',
        icon: 'heroicons:user',
        color: 'text-indigo-600 bg-indigo-100',
      };
    case 'thank_you':
      return {
        label: 'Thank You',
        icon: 'heroicons:sparkles',
        color: 'text-green-600 bg-green-100',
      };
  }
});

// Get flow metadata for styling (uses centralized colors from FLOW_METADATA)
const flowMetadata = computed(() => {
  if (props.flowMembership === 'testimonial') {
    return FLOW_METADATA.testimonial;
  }
  if (props.flowMembership === 'improvement') {
    return FLOW_METADATA.improvement;
  }
  return null;
});

// Card border color based on flow membership
const cardBorderClass = computed(() => {
  if (flowMetadata.value) {
    // Use FLOW_METADATA colors with lighter variants for card background
    return `${flowMetadata.value.borderClass} ${flowMetadata.value.bgClass}`;
  }
  return 'border-gray-200 bg-white';
});

// Step number badge color based on flow membership
const badgeClass = computed(() => {
  if (flowMetadata.value) {
    return `${flowMetadata.value.bgClass} ${flowMetadata.value.colorClass}`;
  }
  return 'bg-gray-100 text-gray-600';
});
</script>

<template>
  <div
    class="flex items-start gap-4 rounded-xl border p-4 shadow-sm transition-colors"
    :class="cardBorderClass"
  >
    <!-- Step Number -->
    <div
      class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium"
      :class="badgeClass"
    >
      {{ stepNumber }}
    </div>

    <!-- Content -->
    <div class="min-w-0 flex-1">
      <!-- Step Type Badge -->
      <div class="mb-1 flex items-center gap-1.5">
        <span
          class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
          :class="stepConfig.color"
        >
          <Icon :icon="stepConfig.icon" class="h-3 w-3" />
          {{ stepConfig.label }}
        </span>
        <!-- Branch Point Indicator -->
        <span
          v-if="isBranchPoint"
          class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
        >
          <Icon icon="lucide:network" class="h-3 w-3" />
          Branch Point
        </span>
      </div>

      <!-- Title -->
      <p class="font-medium text-gray-900">
        {{ title }}
      </p>

      <!-- Subtitle -->
      <p
        v-if="subtitle"
        class="mt-0.5 text-sm text-gray-500"
      >
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>
