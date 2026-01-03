<script setup lang="ts">
/**
 * Screen 5: Preview
 *
 * Shows the generated testimonial flow with:
 * - Welcome step
 * - AI-generated question steps
 * - Thank you step
 *
 * User can regenerate or proceed to Form Studio.
 */
import { inject, computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { FormWizardContext } from '../../../composables/useFormWizard';
import { getDefaultWelcomeContent, getDefaultThankYouContent } from '../../../constants/wizardConfig';
import PreviewStepCard from '../components/PreviewStepCard.vue';

const props = defineProps<{
  isCreating?: boolean;
}>();

const wizard = inject<FormWizardContext>('wizardContext')!;

const emit = defineEmits<{
  customize: [];
}>();

// Build preview steps from generated questions
const previewSteps = computed(() => {
  const steps: Array<{
    type: 'welcome' | 'question' | 'rating' | 'thank_you';
    title: string;
    subtitle?: string;
  }> = [];

  // Welcome step
  const welcomeContent = getDefaultWelcomeContent(wizard.conceptName.value);
  steps.push({
    type: 'welcome',
    title: welcomeContent.title,
    subtitle: welcomeContent.subtitle,
  });

  // Question/Rating steps
  for (const question of wizard.generatedQuestions.value) {
    const isRating = question.question_type_id.startsWith('rating');
    steps.push({
      type: isRating ? 'rating' : 'question',
      title: question.question_text,
    });
  }

  // Thank you step
  const thankYouContent = getDefaultThankYouContent();
  steps.push({
    type: 'thank_you',
    title: thankYouContent.title,
    subtitle: thankYouContent.subtitle,
  });

  return steps;
});

function handleRegenerate() {
  wizard.regenerate();
}

function handleCustomize() {
  emit('customize');
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <div class="mb-2 inline-flex items-center gap-1 text-teal-600">
        <Icon icon="heroicons:sparkles" class="h-5 w-5" />
        <span class="text-sm font-medium">AI Generated</span>
      </div>
      <h1 class="text-2xl font-semibold text-gray-900">
        Here's your testimonial flow
      </h1>
      <p class="mt-2 text-gray-500">
        Preview the journey your customers will experience
      </p>
    </div>

    <!-- Step Cards -->
    <div class="space-y-3">
      <PreviewStepCard
        v-for="(step, index) in previewSteps"
        :key="index"
        :step-number="index + 1"
        :step-type="step.type"
        :title="step.title"
        :subtitle="step.subtitle"
      />
    </div>

    <!-- AI Context -->
    <div
      v-if="wizard.aiContext.value"
      class="rounded-lg bg-teal-50 px-4 py-3"
    >
      <div class="flex items-center gap-2 text-sm text-teal-700">
        <Icon icon="heroicons:sparkles" class="h-4 w-4" />
        <span class="font-medium">AI detected:</span>
        <span>
          {{ wizard.aiContext.value.industry }} &bull;
          {{ wizard.aiContext.value.audience }} &bull;
          {{ wizard.aiContext.value.tone }} tone
        </span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center justify-between pt-4">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
        @click="handleRegenerate"
      >
        <Icon icon="heroicons:arrow-path" class="h-4 w-4" />
        Regenerate
      </button>

      <button
        type="button"
        :disabled="props.isCreating"
        class="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-6 py-3 font-medium text-white transition-all hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-70"
        @click="handleCustomize"
      >
        <Icon
          v-if="props.isCreating"
          icon="heroicons:arrow-path"
          class="h-4 w-4 animate-spin"
        />
        <Icon
          v-else
          icon="heroicons:paint-brush"
          class="h-4 w-4"
        />
        {{ props.isCreating ? 'Creating...' : 'Customize in Form Studio' }}
      </button>
    </div>
  </div>
</template>
