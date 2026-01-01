<script setup lang="ts">
import { computed } from 'vue';
import {
  RadioGroupRoot,
  RadioGroupItem,
  RadioGroupIndicator,
} from 'reka-ui';
import { Label } from '@testimonials/ui';
import { cn } from '@testimonials/ui';
import type { QuestionInputProps } from '../models';

const props = defineProps<QuestionInputProps>();
const modelValue = defineModel<string>({ default: '' });

const sortedOptions = computed(() => {
  if (!props.options) return [];
  return [...props.options].sort((a, b) => a.display_order - b.display_order);
});
</script>

<template>
  <RadioGroupRoot
    v-model="modelValue"
    :disabled="disabled"
    class="space-y-2"
  >
    <div
      v-for="option in sortedOptions"
      :key="option.option_value"
      class="flex items-center gap-3"
    >
      <RadioGroupItem
        :id="`${questionId}-${option.option_value}`"
        :value="option.option_value"
        :class="
          cn(
            'h-4 w-4 rounded-full border border-primary shadow',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )
        "
      >
        <RadioGroupIndicator class="flex items-center justify-center">
          <div class="h-2 w-2 rounded-full bg-primary" />
        </RadioGroupIndicator>
      </RadioGroupItem>
      <Label
        :for="`${questionId}-${option.option_value}`"
        class="text-sm font-normal"
      >
        {{ option.option_label }}
      </Label>
    </div>
    <div
      v-if="!sortedOptions.length"
      class="text-sm italic text-gray-400"
    >
      No options available
    </div>
  </RadioGroupRoot>
</template>
