<script setup lang="ts">
/**
 * Focus Area Tag
 *
 * Toggleable pill for selecting focus areas.
 */
import { wizardTestIds } from '@/shared/constants/testIds';

const props = defineProps<{
  label: string;
  isSelected: boolean;
  index: number;
}>();

const emit = defineEmits<{
  toggle: [];
}>();
</script>

<template>
  <button
    type="button"
    class="rounded-full border px-4 py-2 text-sm font-medium transition-all"
    :class="[
      isSelected
        ? 'border-teal-500 bg-teal-50 text-teal-700'
        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
    ]"
    :data-testid="wizardTestIds.focusAreaChip(props.index)"
    @click="emit('toggle')"
  >
    {{ label }}
  </button>
</template>
