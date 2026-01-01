<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { cn } from '@testimonials/ui';
import type { QuestionInputProps } from '../models';

const props = defineProps<QuestionInputProps>();
const modelValue = defineModel<number | null>({ default: null });

const maxStars = computed(() => props.max_value ?? 5);

function setRating(value: number) {
  if (!props.disabled) {
    modelValue.value = value;
  }
}
</script>

<template>
  <div
    class="flex gap-1"
    role="radiogroup"
    :aria-label="`Rating out of ${maxStars}`"
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
          'rounded p-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110',
        )
      "
      @click="setRating(star)"
    >
      <Icon
        icon="lucide:star"
        :class="
          cn(
            'h-8 w-8 transition-colors',
            modelValue !== null && modelValue >= star
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 hover:text-yellow-300',
          )
        "
      />
    </button>
  </div>
</template>
