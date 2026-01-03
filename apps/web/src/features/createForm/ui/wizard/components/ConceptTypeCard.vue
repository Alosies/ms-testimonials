<script setup lang="ts">
/**
 * Concept Type Card
 *
 * Selectable card for choosing between Product/Service/Event.
 */
import { Icon } from '@testimonials/icons';
import type { ConceptType } from '../../../composables/useFormWizard';
import type { ConceptTypeConfig } from '../../../constants/wizardConfig';

defineProps<{
  type: ConceptType;
  config: ConceptTypeConfig;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  select: [type: ConceptType];
}>();
</script>

<template>
  <button
    type="button"
    class="group flex flex-col items-center rounded-xl border-2 p-6 text-center transition-all"
    :class="[
      isSelected
        ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20'
        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
    ]"
    @click="emit('select', type)"
  >
    <!-- Icon -->
    <div
      class="mb-3 flex h-12 w-12 items-center justify-center rounded-xl transition-colors"
      :class="[
        isSelected
          ? 'bg-teal-500 text-white'
          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
      ]"
    >
      <Icon :icon="config.icon" class="h-6 w-6" />
    </div>

    <!-- Label -->
    <span
      class="font-medium transition-colors"
      :class="isSelected ? 'text-teal-700' : 'text-gray-900'"
    >
      {{ config.label }}
    </span>

    <!-- Description -->
    <span class="mt-1 text-xs text-gray-500">
      {{ config.description }}
    </span>
  </button>
</template>
