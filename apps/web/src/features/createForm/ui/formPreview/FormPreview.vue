<script setup lang="ts">
import { Button } from '@testimonials/ui';
import { QuestionField } from '@/shared/formInputs';
import type { FormData, QuestionData } from '../../models';

defineProps<{
  formData: FormData;
  questions: QuestionData[];
}>();
</script>

<template>
  <div class="mx-auto max-w-lg space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900">
        Share your experience with {{ formData.product_name }}
      </h2>
      <p class="mt-2 text-gray-600">
        Your feedback helps others make better decisions.
      </p>
    </div>

    <!-- Questions -->
    <div class="space-y-6">
      <QuestionField
        v-for="question in questions"
        :key="question.question_key"
        :question-id="question.id ?? question.question_key"
        :question-text="question.question_text"
        :question_type_id="question.question_type_id"
        :help-text="question.help_text"
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

    <!-- Submit Button (Preview) -->
    <div class="pt-4">
      <Button class="w-full" disabled>
        Submit Testimonial
      </Button>
      <p class="mt-2 text-center text-xs text-gray-400">
        Preview only - form is not active
      </p>
    </div>
  </div>
</template>
