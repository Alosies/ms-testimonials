<script setup lang="ts">
/**
 * QuestionField - Full field wrapper
 *
 * Wraps QuestionInput with label, required indicator, and help text.
 * Used for rendering complete question fields in forms.
 */
import { Label } from '@testimonials/ui';
import QuestionInput from './QuestionInput.vue';
import type { QuestionFieldProps, QuestionAnswerValue } from './models';

defineProps<QuestionFieldProps>();
const modelValue = defineModel<QuestionAnswerValue>();
</script>

<template>
  <div class="space-y-2">
    <Label class="text-base font-medium text-gray-900">
      {{ questionText }}
      <span v-if="is_required" class="text-red-500">*</span>
    </Label>

    <QuestionInput
      v-model="modelValue"
      :question-id="questionId"
      :question_type_id="question_type_id"
      :placeholder="placeholder"
      :disabled="disabled"
      :is_required="is_required"
      :options="options"
      :min_value="min_value"
      :max_value="max_value"
      :scale-min-label="scaleMinLabel"
      :scale-max-label="scaleMaxLabel"
    />

    <p v-if="helpText" class="text-sm text-gray-500">
      {{ helpText }}
    </p>
  </div>
</template>
