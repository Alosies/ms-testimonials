<script setup lang="ts">
/**
 * Question Step Card - Text input question
 *
 * Displays question text with input field.
 * Matches Form Studio layout for visual consistency.
 */
import { computed } from 'vue';
import { QuestionInput } from '@/shared/formInputs';
import type { FormStep, StepCardMode } from '../models';
import { studioTestIds } from '@/shared/constants/testIds';

interface Props {
  step: FormStep;
  mode?: StepCardMode;
  questionText?: string;
  questionType?: string;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'preview',
});

const modelValue = defineModel<string>({ default: '' });

// Extract from step.question if props not provided
const displayText = computed(() =>
  props.questionText ||
  props.step.question?.questionText ||
  (props.mode === 'edit' ? 'Question text...' : ''),
);

// Get question type ID for input component
const questionTypeId = computed(() =>
  props.step.question?.questionType?.uniqueName || 'text_long',
);

// Get placeholder text
const placeholderText = computed(() =>
  props.step.question?.placeholder || 'Your answer...',
);

// Get help text (hint shown below question)
const helpText = computed(() => props.step.question?.helpText ?? null);

// Input is disabled in edit mode, interactive in preview
const isInputDisabled = computed(() => props.mode === 'edit');
</script>

<template>
  <div class="text-center w-full">
    <!-- Question text as heading -->
    <h3
      class="text-2xl md:text-3xl font-bold text-gray-900 leading-tight"
      :class="helpText ? 'mb-3' : 'mb-8'"
      :data-testid="studioTestIds.questionText"
    >
      {{ displayText }}
    </h3>

    <!-- Help text (hint) shown below question -->
    <p
      v-if="helpText"
      class="text-base text-gray-500 mb-8 max-w-lg mx-auto"
    >
      {{ helpText }}
    </p>

    <!-- Input field - wider for better UX -->
    <div class="w-full max-w-lg mx-auto">
      <QuestionInput
        v-model="modelValue"
        :question-id="step.question?.id ?? step.id"
        :question_type_id="questionTypeId"
        :placeholder="placeholderText"
        :disabled="isInputDisabled"
      />
    </div>

    <!-- Tips preview (only in edit mode) -->
    <div v-if="mode === 'edit' && step.tips.length > 0" class="mt-8 text-left max-w-lg mx-auto">
      <div class="text-xs font-medium text-muted-foreground mb-2">Tips:</div>
      <ul class="text-sm text-muted-foreground space-y-1.5">
        <li
          v-for="(tip, i) in step.tips.slice(0, 2)"
          :key="i"
          class="flex items-start gap-2"
        >
          <span class="text-amber-500">💡</span>
          <span>{{ tip }}</span>
        </li>
        <li v-if="step.tips.length > 2" class="text-xs">
          +{{ step.tips.length - 2 }} more
        </li>
      </ul>
    </div>
  </div>
</template>
