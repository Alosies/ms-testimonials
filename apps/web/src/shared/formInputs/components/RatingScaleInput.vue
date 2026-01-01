<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@testimonials/ui';
import type { QuestionInputProps } from '../models';

const props = defineProps<QuestionInputProps>();
const modelValue = defineModel<number | null>({ default: null });

const minVal = computed(() => props.min_value ?? 1);
const maxVal = computed(() => props.max_value ?? 10);

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
</script>

<template>
  <div>
    <div class="flex flex-wrap justify-between gap-1">
      <button
        v-for="n in scaleValues"
        :key="n"
        type="button"
        :disabled="disabled"
        :aria-pressed="modelValue === n"
        :class="
          cn(
            'flex h-10 w-10 items-center justify-center rounded border text-sm font-medium transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            modelValue === n
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-gray-200 bg-gray-50 hover:border-primary hover:bg-primary/10',
            disabled && 'cursor-default opacity-60',
          )
        "
        @click="selectValue(n)"
      >
        {{ n }}
      </button>
    </div>
    <div class="mt-2 flex justify-between text-xs text-gray-500">
      <span>{{ scaleMinLabel || 'Low' }}</span>
      <span>{{ scaleMaxLabel || 'High' }}</span>
    </div>
  </div>
</template>
