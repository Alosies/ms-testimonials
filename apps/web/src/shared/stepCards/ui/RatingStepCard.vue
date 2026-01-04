<script setup lang="ts">
/**
 * Rating Step Card - Interactive star rating
 *
 * Displays a star rating input. In preview mode, allows selection.
 * In edit mode, shows static preview.
 */
import { ref, computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { FormStep, StepCardMode } from '../models';

interface Props {
  step: FormStep;
  mode?: StepCardMode;
  questionText?: string;
  minValue?: number;
  maxValue?: number;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'preview',
  minValue: 1,
  maxValue: 5,
});

const modelValue = defineModel<number | null>({ default: null });

// Hover state for preview mode
const hoverValue = ref<number | null>(null);

const displayText = computed(() =>
  props.questionText ||
  (props.step.content as { questionText?: string })?.questionText ||
  'How would you rate your experience?',
);

// Compute star count
const starCount = computed(() => props.maxValue - props.minValue + 1);

// Get the value for a star position (1-indexed)
function getStarValue(position: number): number {
  return props.minValue + position - 1;
}

// Check if a star should be filled
function isStarFilled(position: number): boolean {
  const starValue = getStarValue(position);
  // When hovering, show filled up to hover position
  if (hoverValue.value !== null) {
    return starValue <= hoverValue.value;
  }
  // Otherwise show filled up to selected value
  if (modelValue.value !== null) {
    return starValue <= modelValue.value;
  }
  return false;
}

function handleClick(position: number) {
  if (props.mode !== 'preview') return;
  modelValue.value = getStarValue(position);
}

function handleMouseEnter(position: number) {
  if (props.mode !== 'preview') return;
  hoverValue.value = getStarValue(position);
}

function handleMouseLeave() {
  hoverValue.value = null;
}
</script>

<template>
  <div class="text-center">
    <p class="font-medium mb-4">
      {{ displayText }}
    </p>
    <div
      class="flex justify-center gap-2"
      @mouseleave="handleMouseLeave"
    >
      <button
        v-for="n in starCount"
        :key="n"
        type="button"
        class="w-10 h-10 rounded-lg border flex items-center justify-center transition-colors"
        :class="{
          'hover:bg-muted cursor-pointer': mode === 'preview',
          'bg-yellow-50 border-yellow-300': isStarFilled(n),
          'cursor-default': mode !== 'preview',
        }"
        :disabled="mode !== 'preview'"
        @click="handleClick(n)"
        @mouseenter="handleMouseEnter(n)"
      >
        <Icon
          :icon="isStarFilled(n) ? 'heroicons:star-solid' : 'heroicons:star'"
          class="w-5 h-5 transition-colors"
          :class="{
            'text-yellow-500': isStarFilled(n),
            'text-muted-foreground': !isStarFilled(n),
          }"
        />
      </button>
    </div>
    <!-- Show selected rating text -->
    <p
      v-if="modelValue !== null && mode === 'preview'"
      class="mt-3 text-sm text-muted-foreground"
    >
      You rated {{ modelValue }} out of {{ maxValue }}
    </p>
  </div>
</template>
