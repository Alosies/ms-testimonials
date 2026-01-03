<script setup lang="ts">
/**
 * Preview Step Card
 *
 * Read-only card showing a step in the preview flow.
 */
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';

const props = defineProps<{
  stepNumber: number;
  stepType: 'welcome' | 'question' | 'rating' | 'thank_you';
  title: string;
  subtitle?: string;
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
    case 'thank_you':
      return {
        label: 'Thank You',
        icon: 'heroicons:sparkles',
        color: 'text-green-600 bg-green-100',
      };
  }
});
</script>

<template>
  <div class="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <!-- Step Number -->
    <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
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
