<script setup lang="ts">
/**
 * RatingStarInput - Modern interactive star rating
 *
 * Features smooth animations, hover preview, and polished visual feedback.
 */
import { computed, ref } from 'vue';
import { Icon } from '@testimonials/icons';
import { cn } from '@testimonials/ui';
import type { QuestionInputProps } from '../models';

const props = defineProps<QuestionInputProps>();
const modelValue = defineModel<number | null>({ default: null });

const maxStars = computed(() => props.max_value ?? 5);
const hoverValue = ref<number | null>(null);

// Show hovered value or selected value
const displayValue = computed(() => hoverValue.value ?? modelValue.value);

function setRating(value: number) {
  if (!props.disabled) {
    modelValue.value = value;
  }
}

function handleMouseEnter(value: number) {
  if (!props.disabled) {
    hoverValue.value = value;
  }
}

function handleMouseLeave() {
  hoverValue.value = null;
}
</script>

<template>
  <div
    class="inline-flex items-center gap-2 rounded-2xl bg-gray-50/80 px-4 py-3"
    role="radiogroup"
    :aria-label="`Rating out of ${maxStars}`"
    @mouseleave="handleMouseLeave"
  >
    <button
      v-for="star in maxStars"
      :key="star"
      type="button"
      :disabled="disabled"
      :aria-checked="modelValue !== null && modelValue >= star"
      :aria-label="`${star} star${star > 1 ? 's' : ''}`"
      :class="
        cn(
          'group relative rounded-lg p-1.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          disabled
            ? 'cursor-default'
            : 'cursor-pointer hover:-translate-y-0.5 hover:scale-110 active:scale-95',
        )
      "
      @click="setRating(star)"
      @mouseenter="handleMouseEnter(star)"
    >
      <Icon
        icon="lucide:star"
        :class="
          cn(
            'h-10 w-10 transition-all duration-200',
            displayValue !== null && displayValue >= star
              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.4)]'
              : 'fill-transparent text-gray-300 group-hover:text-amber-300',
          )
        "
      />
    </button>
  </div>
</template>
