<script setup lang="ts">
import { Icon } from '@testimonials/icons';
import type { QuestionData } from '../../../models';

defineProps<{
  question: QuestionData;
  supportsOptions: boolean;
}>();
</script>

<template>
  <div class="border-b bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
    <div class="mb-4 flex items-center gap-2">
      <div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
        <Icon icon="lucide:eye" class="h-3.5 w-3.5 text-primary" />
      </div>
      <span class="text-sm font-medium text-gray-700">Live Preview</span>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <!-- Question Preview -->
      <div class="space-y-3">
        <div class="flex items-start gap-2">
          <span class="text-sm font-medium text-gray-900">
            {{ question.question_text || 'Enter your question...' }}
          </span>
          <span v-if="question.is_required" class="text-red-500">*</span>
        </div>

        <!-- Input Preview based on type -->
        <div class="pointer-events-none">
          <!-- Text Input Preview -->
          <div
            v-if="question.question_type_id === 'text_short'"
            class="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-400"
          >
            {{ question.placeholder || 'Short answer text' }}
          </div>

          <!-- Textarea Preview -->
          <div
            v-else-if="question.question_type_id === 'text_long'"
            class="min-h-[80px] rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-400"
          >
            {{ question.placeholder || 'Long answer text' }}
          </div>

          <!-- Star Rating Preview -->
          <div
            v-else-if="question.question_type_id === 'rating_star'"
            class="flex gap-1"
          >
            <Icon
              v-for="i in 5"
              :key="i"
              icon="lucide:star"
              class="h-6 w-6 text-gray-300"
            />
          </div>

          <!-- Linear Scale Preview -->
          <div v-else-if="question.question_type_id === 'rating_scale'">
            <div class="flex justify-between gap-1">
              <div
                v-for="n in ((question.max_value ?? 10) - (question.min_value ?? 1) + 1)"
                :key="n"
                class="flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-gray-50 text-xs font-medium text-gray-500"
              >
                {{ (question.min_value ?? 1) + n - 1 }}
              </div>
            </div>
            <div class="mt-1 flex justify-between text-xs text-gray-400">
              <span>{{ question.scale_min_label || 'Low' }}</span>
              <span>{{ question.scale_max_label || 'High' }}</span>
            </div>
          </div>

          <!-- Switch Preview -->
          <div
            v-else-if="question.question_type_id === 'input_switch'"
            class="flex items-center gap-3"
          >
            <div class="h-6 w-11 rounded-full bg-gray-200 p-0.5">
              <div class="h-5 w-5 rounded-full bg-white shadow" />
            </div>
          </div>

          <!-- Single Checkbox Preview -->
          <div
            v-else-if="question.question_type_id === 'input_checkbox'"
            class="flex items-center gap-2"
          >
            <div class="h-5 w-5 rounded border-2 border-gray-300" />
          </div>

          <!-- Choice Preview -->
          <div v-else-if="supportsOptions" class="space-y-2">
            <div
              v-for="(option, idx) in question.options || []"
              :key="idx"
              class="flex items-center gap-2 text-sm"
            >
              <div
                :class="[
                  'h-4 w-4 border',
                  question.question_type_id === 'choice_single'
                    ? 'rounded-full'
                    : 'rounded',
                ]"
              />
              <span class="text-gray-700">{{
                option.option_label || `Option ${idx + 1}`
              }}</span>
            </div>
            <div
              v-if="!question.options?.length"
              class="text-sm italic text-gray-400"
            >
              Add options below...
            </div>
          </div>

          <!-- Default Preview -->
          <div
            v-else
            class="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-400"
          >
            {{ question.placeholder || 'Answer input' }}
          </div>
        </div>

        <!-- Help Text Preview -->
        <p v-if="question.help_text" class="text-xs text-gray-500">
          {{ question.help_text }}
        </p>
      </div>
    </div>
  </div>
</template>
