<script setup lang="ts">
/**
 * RatingScaleInput - Modern numeric scale rating (NPS-style)
 *
 * Features a polished pill-shaped design with smooth hover and selection states.
 */
import { computed, ref } from 'vue';
import { cn } from '@testimonials/ui';
import type { QuestionInputProps } from '../models';

const props = defineProps<QuestionInputProps>();
const modelValue = defineModel<number | null>({ default: null });

const minVal = computed(() => props.min_value ?? 1);
const maxVal = computed(() => props.max_value ?? 10);
const hoverValue = ref<number | null>(null);

const scaleValues = computed(() => {
  const values: number[] = [];
  for (let i = minVal.value; i <= maxVal.value; i++) {
    values.push(i);
  }
  return values;
});

function selectValue(value: number) {
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
  <div class="w-full">
    <div
      class="inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-gray-50/80 p-3"
      @mouseleave="handleMouseLeave"
    >
      <button
        v-for="n in scaleValues"
        :key="n"
        type="button"
        :disabled="disabled"
        :aria-pressed="modelValue === n"
        :class="
          cn(
            'flex h-11 w-11 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            modelValue === n
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105'
              : hoverValue === n
                ? 'bg-primary/20 text-primary scale-105'
                : 'bg-white text-gray-600 shadow-sm hover:bg-gray-100',
            disabled ? 'cursor-default opacity-60' : 'cursor-pointer active:scale-95',
          )
        "
        @click="selectValue(n)"
        @mouseenter="handleMouseEnter(n)"
      >
        {{ n }}
      </button>
    </div>
    <div class="mt-3 flex justify-between px-1 text-sm text-gray-500">
      <span class="font-medium">{{ scaleMinLabel || 'Not likely' }}</span>
      <span class="font-medium">{{ scaleMaxLabel || 'Very likely' }}</span>
    </div>
  </div>
</template>
