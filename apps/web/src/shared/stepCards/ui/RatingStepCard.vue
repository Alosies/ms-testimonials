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
  <div class="text-center w-full">
    <!-- Question text as heading -->
    <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
      {{ displayText }}
    </h3>

    <!-- Star rating container -->
    <div
      class="inline-flex items-center gap-3 rounded-2xl bg-gray-50/80 px-5 py-4"
      @mouseleave="handleMouseLeave"
    >
      <button
        v-for="n in starCount"
        :key="n"
        type="button"
        class="group relative rounded-lg p-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        :class="{
          'cursor-pointer hover:-translate-y-0.5 hover:scale-110 active:scale-95': mode === 'preview',
          'cursor-default': mode !== 'preview',
        }"
        :disabled="mode !== 'preview'"
        @click="handleClick(n)"
        @mouseenter="handleMouseEnter(n)"
      >
        <Icon
          :icon="isStarFilled(n) ? 'heroicons:star-solid' : 'heroicons:star'"
          class="w-10 h-10 transition-all duration-200"
          :class="{
            'text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.4)]': isStarFilled(n),
            'text-gray-300 group-hover:text-amber-300': !isStarFilled(n) && mode === 'preview',
            'text-gray-300': !isStarFilled(n) && mode !== 'preview',
          }"
        />
      </button>
    </div>

    <!-- Show selected rating text -->
    <p
      v-if="modelValue !== null && mode === 'preview'"
      class="mt-4 text-base font-medium text-gray-600"
    >
      You rated {{ modelValue }} out of {{ maxValue }}
    </p>
  </div>
</template>
