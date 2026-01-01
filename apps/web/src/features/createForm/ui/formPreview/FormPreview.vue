<script setup lang="ts">
import { Input, Textarea, Label, Button } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import type { FormData, QuestionData } from '../../models';

defineProps<{
  formData: FormData;
  questions: QuestionData[];
}>();

function getInputComponent(questionTypeId: string) {
  switch (questionTypeId) {
    case 'text_long':
      return 'textarea';
    case 'text_short':
    case 'text_email':
    case 'text_url':
      return 'input';
    case 'rating_star':
      return 'stars';
    case 'rating_scale':
      return 'scale';
    case 'choice_single':
    case 'choice_multiple':
    case 'choice_dropdown':
      return 'choice';
    case 'input_checkbox':
    case 'input_switch':
      return 'boolean';
    default:
      return 'input';
  }
}
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
      <div v-for="question in questions" :key="question.question_key">
        <Label class="text-base">
          {{ question.question_text }}
          <span v-if="question.is_required" class="text-red-500">*</span>
        </Label>

        <!-- Help Text -->
        <p v-if="question.help_text" class="mt-1 text-sm text-gray-500">
          {{ question.help_text }}
        </p>

        <!-- Input based on type -->
        <template v-if="getInputComponent(question.question_type_id) === 'textarea'">
          <Textarea
            class="mt-2"
            :placeholder="question.placeholder ?? ''"
            rows="4"
            disabled
          />
        </template>

        <template v-else-if="getInputComponent(question.question_type_id) === 'input'">
          <Input
            class="mt-2"
            :placeholder="question.placeholder ?? ''"
            disabled
          />
        </template>

        <template v-else-if="getInputComponent(question.question_type_id) === 'stars'">
          <div class="mt-2 flex gap-1">
            <button
              v-for="star in 5"
              :key="star"
              class="text-gray-300 transition-colors hover:text-yellow-400"
              disabled
            >
              <Icon icon="lucide:star" class="h-8 w-8" />
            </button>
          </div>
        </template>

        <template v-else-if="getInputComponent(question.question_type_id) === 'scale'">
          <div class="mt-2 flex justify-between gap-1">
            <button
              v-for="n in 10"
              :key="n"
              class="flex h-10 w-10 items-center justify-center rounded border text-sm font-medium transition-colors hover:border-primary hover:bg-primary/10"
              disabled
            >
              {{ n }}
            </button>
          </div>
          <div class="mt-1 flex justify-between text-xs text-gray-500">
            <span>Low</span>
            <span>High</span>
          </div>
        </template>

        <template v-else-if="getInputComponent(question.question_type_id) === 'boolean'">
          <div class="mt-2 flex items-center gap-2">
            <div class="h-5 w-5 rounded border border-gray-300" />
            <span class="text-sm text-gray-500">Yes / No</span>
          </div>
        </template>
      </div>
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
