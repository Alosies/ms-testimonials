<script setup lang="ts">
import { Checkbox } from '@testimonials/ui';
import type { QuestionInputProps } from '../models';

defineProps<QuestionInputProps>();
const modelValue = defineModel<boolean>({ default: false });
</script>

<template>
  <div class="flex items-center gap-3">
    <Checkbox
      :id="questionId"
      :checked="modelValue"
      :disabled="disabled"
      @update:checked="modelValue = $event"
    />
  </div>
</template>
