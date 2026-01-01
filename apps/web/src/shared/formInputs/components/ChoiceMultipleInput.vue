<script setup lang="ts">
import { computed } from 'vue';
import { Checkbox, Label } from '@testimonials/ui';
import type { QuestionInputProps } from '../models';

const props = defineProps<QuestionInputProps>();
const modelValue = defineModel<string[]>({ default: () => [] });

const sortedOptions = computed(() => {
  if (!props.options) return [];
  return [...props.options].sort((a, b) => a.display_order - b.display_order);
});

function isChecked(optionValue: string): boolean {
  return modelValue.value.includes(optionValue);
}

function toggleOption(optionValue: string, checked: boolean) {
  if (props.disabled) return;

  if (checked) {
    modelValue.value = [...modelValue.value, optionValue];
  } else {
    modelValue.value = modelValue.value.filter((v) => v !== optionValue);
  }
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="option in sortedOptions"
      :key="option.option_value"
      class="flex items-center gap-3"
    >
      <Checkbox
        :id="`${questionId}-${option.option_value}`"
        :checked="isChecked(option.option_value)"
        :disabled="disabled"
        @update:checked="toggleOption(option.option_value, $event)"
      />
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
  </div>
</template>
