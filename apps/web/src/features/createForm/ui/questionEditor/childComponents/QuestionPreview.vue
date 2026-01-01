<script setup lang="ts">
import { Icon } from '@testimonials/icons';
import { QuestionInput } from '@/shared/formInputs';
import type { QuestionData } from '../../../models';

defineProps<{
  question: QuestionData;
}>();
</script>

<template>
  <div class="bg-gray-50 p-6">
    <div class="mb-4 flex items-center gap-2">
      <div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
        <Icon icon="lucide:eye" class="h-3.5 w-3.5 text-primary" />
      </div>
      <span class="text-xs font-semibold uppercase tracking-wide text-gray-500">Live Preview</span>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div class="space-y-3">
        <!-- Question Text -->
        <div class="flex items-start gap-2">
          <span class="text-sm font-medium text-gray-900">
            {{ question.question_text || 'Enter your question...' }}
          </span>
          <span v-if="question.is_required" class="text-red-500">*</span>
        </div>

        <!-- Input Preview (disabled mode) -->
        <div class="pointer-events-none">
          <QuestionInput
            :question-id="question.id ?? question.question_key"
            :question_type_id="question.question_type_id"
            :placeholder="question.placeholder"
            :is_required="question.is_required"
            :options="question.options"
            :min_value="question.min_value"
            :max_value="question.max_value"
            :scale-min-label="question.scale_min_label"
            :scale-max-label="question.scale_max_label"
            :disabled="true"
          />
        </div>

        <!-- Help Text -->
        <p v-if="question.help_text" class="text-xs text-gray-500">
          {{ question.help_text }}
        </p>
      </div>
    </div>
  </div>
</template>
