<script setup lang="ts">
/**
 * Testimonial Write Step Card - Manual Path
 *
 * Displays a textarea for customers to write their testimonial manually.
 * Shows character count with min/max validation.
 * Optionally displays previous answers for reference.
 *
 * @see PRD-005: AI Testimonial Generation
 */
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { FormStep, TestimonialWriteContent, StepCardMode } from '../models';
import { isTestimonialWriteStep } from '../functions';

interface PreviousAnswer {
  questionText: string;
  answer: string;
}

interface Props {
  step: FormStep;
  mode?: StepCardMode;
  previousAnswers?: PreviousAnswer[];
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'preview',
  previousAnswers: () => [],
});

const modelValue = defineModel<string>({ default: '' });

const content = computed((): TestimonialWriteContent | null => {
  if (isTestimonialWriteStep(props.step)) {
    return props.step.content;
  }
  return null;
});

// Character count validation
const characterCount = computed(() => modelValue.value.length);
const minLength = computed(() => content.value?.minLength ?? 50);
const maxLength = computed(() => content.value?.maxLength ?? 1000);
const isUnderMin = computed(() => characterCount.value < minLength.value);
const isOverMax = computed(() => characterCount.value > maxLength.value);
const isValid = computed(() => !isUnderMin.value && !isOverMax.value);

// Counter color based on validation state
const counterColorClass = computed(() => {
  if (isOverMax.value) return 'text-red-500';
  if (isUnderMin.value && characterCount.value > 0) return 'text-amber-500';
  if (isValid.value) return 'text-green-600';
  return 'text-muted-foreground';
});

// Show previous answers section
const showPreviousAnswersSection = computed(() =>
  content.value?.showPreviousAnswers &&
  props.previousAnswers.length > 0 &&
  props.mode === 'preview',
);

// Previous answers collapsed state
const previousAnswersExpanded = defineModel<boolean>('expanded', { default: false });

// Input is disabled in edit mode
const isInputDisabled = computed(() => props.mode === 'edit');
</script>

<template>
  <div v-if="content" class="w-full">
    <!-- Title and subtitle -->
    <div class="text-center mb-6">
      <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
        {{ content.title }}
      </h3>
      <p class="text-gray-600">
        {{ content.subtitle }}
      </p>
    </div>

    <!-- Previous answers reference (collapsible) -->
    <div
      v-if="showPreviousAnswersSection"
      class="mb-6 max-w-2xl mx-auto"
    >
      <button
        type="button"
        class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center"
        @click="previousAnswersExpanded = !previousAnswersExpanded"
      >
        <Icon
          :icon="previousAnswersExpanded ? 'heroicons:chevron-up' : 'heroicons:chevron-down'"
          class="w-4 h-4"
        />
        {{ content.previousAnswersLabel }}
      </button>

      <div
        v-if="previousAnswersExpanded"
        class="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
      >
        <div class="space-y-3">
          <div
            v-for="(answer, index) in previousAnswers"
            :key="index"
            class="text-sm"
          >
            <div class="font-medium text-gray-700 mb-1">
              {{ answer.questionText }}
            </div>
            <div class="text-gray-600 pl-3 border-l-2 border-gray-300">
              {{ answer.answer }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Textarea for testimonial -->
    <div class="max-w-2xl mx-auto">
      <textarea
        v-model="modelValue"
        :placeholder="content.placeholder"
        :disabled="isInputDisabled"
        :maxlength="maxLength + 50"
        class="w-full min-h-[200px] p-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-y disabled:opacity-50 disabled:cursor-not-allowed"
        :class="{
          'border-red-300 focus:ring-red-500 focus:border-red-500': isOverMax,
          'border-amber-300 focus:ring-amber-500 focus:border-amber-500': isUnderMin && characterCount > 0,
        }"
      />

      <!-- Character counter -->
      <div class="mt-2 flex justify-between items-center text-sm">
        <span :class="counterColorClass">
          {{ characterCount }} / {{ maxLength }} characters
        </span>
        <span
          v-if="isUnderMin && characterCount > 0"
          class="text-amber-500"
        >
          {{ minLength - characterCount }} more characters needed
        </span>
        <span
          v-else-if="isOverMax"
          class="text-red-500"
        >
          {{ characterCount - maxLength }} characters over limit
        </span>
        <span
          v-else-if="isValid"
          class="text-green-600 flex items-center gap-1"
        >
          <Icon icon="heroicons:check" class="w-4 h-4" />
          Good length
        </span>
      </div>
    </div>
  </div>
</template>
