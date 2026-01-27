<script setup lang="ts">
/**
 * Screen 5: Preview
 *
 * Shows the generated testimonial flow with:
 * - Welcome step
 * - AI-generated question steps with branching visualization
 * - Consent step (testimonial flow)
 * - Thank you steps for each flow
 *
 * User can regenerate or proceed to Form Studio.
 *
 * ADR-009 Phase 2: Uses flow_membership from wizard questions (not flowId)
 * because this is a preview before form creation. flowId is assigned when
 * questions are converted to form steps in useCreateFormWithSteps.
 */
import { inject, computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { FormWizardContext } from '../../../composables/wizard/useFormWizard';
import type { PreviewStep } from '@/features/createForm/models';
import {
  getDefaultWelcomeContent,
  getDefaultThankYouContent,
  getDefaultTestimonialWriteContent,
} from '../../../constants/wizardConfig';
import PreviewStepCard from '../components/PreviewStepCard.vue';
import BranchingFlowPreview from '../components/BranchingFlowPreview.vue';

const props = defineProps<{
  isCreating?: boolean;
}>();

const wizard = inject<FormWizardContext>('wizardContext')!;

const emit = defineEmits<{
  customize: [];
}>();

// Build preview steps from generated questions with branching
const sharedSteps = computed(() => {
  const steps: PreviewStep[] = [];

  // Welcome step
  const welcomeContent = getDefaultWelcomeContent(wizard.conceptName.value);
  steps.push({
    type: 'welcome',
    title: welcomeContent.title,
    subtitle: welcomeContent.subtitle,
    flowMembership: 'shared',
  });

  // Shared question steps (before and including rating)
  for (const question of wizard.generatedQuestions.value) {
    if (question.flow_membership !== 'shared') continue;

    const isRating = question.question_type_id.startsWith('rating');
    steps.push({
      type: isRating ? 'rating' : 'question',
      title: question.question_text,
      flowMembership: 'shared',
      isBranchPoint: question.is_branch_point,
    });
  }

  return steps;
});

// Testimonial flow steps (after rating, for happy customers)
const testimonialSteps = computed(() => {
  const steps: PreviewStep[] = [];

  // Testimonial Write step (AI assembles testimonial or user writes manually)
  const stepContent = wizard.aiContext.value?.step_content;
  const defaultContent = getDefaultTestimonialWriteContent();
  steps.push({
    type: 'testimonial_write',
    title: stepContent?.testimonial_write?.title ?? defaultContent.title,
    subtitle: stepContent?.testimonial_write?.subtitle ?? defaultContent.subtitle,
    flowMembership: 'testimonial',
  });

  // Consent step (from step_content if available)
  if (stepContent?.consent) {
    steps.push({
      type: 'consent',
      title: stepContent.consent.title,
      subtitle: stepContent.consent.description,
      flowMembership: 'testimonial',
    });
  } else {
    // Default consent step
    steps.push({
      type: 'consent',
      title: 'One last thing...',
      subtitle: 'Would you like us to share your testimonial publicly?',
      flowMembership: 'testimonial',
    });
  }

  // Thank you step
  const thankYouContent = getDefaultThankYouContent();
  steps.push({
    type: 'thank_you',
    title: thankYouContent.title,
    subtitle: thankYouContent.subtitle,
    flowMembership: 'testimonial',
  });

  return steps;
});

// Improvement flow steps (after rating, for unhappy customers)
const improvementSteps = computed(() => {
  const steps: PreviewStep[] = [];

  // Improvement flow questions
  for (const question of wizard.generatedQuestions.value) {
    if (question.flow_membership !== 'improvement') continue;

    steps.push({
      type: 'question',
      title: question.question_text,
      flowMembership: 'improvement',
    });
  }

  // Thank you step (from step_content if available)
  const stepContent = wizard.aiContext.value?.step_content;
  if (stepContent?.improvement_thank_you) {
    steps.push({
      type: 'thank_you',
      title: stepContent.improvement_thank_you.title,
      subtitle: stepContent.improvement_thank_you.message,
      flowMembership: 'improvement',
    });
  } else {
    // Default improvement thank you
    steps.push({
      type: 'thank_you',
      title: 'Thank you for your feedback',
      subtitle: 'We take your feedback seriously and will work to improve.',
      flowMembership: 'improvement',
    });
  }

  return steps;
});

// Check if we have branching (testimonial or improvement questions)
const hasBranching = computed(() => {
  return testimonialSteps.value.length > 1 || improvementSteps.value.length > 1;
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

    <!-- Timeline with Branching -->
    <div>
      <!-- Shared Steps (before branch) -->
      <div class="space-y-3">
        <PreviewStepCard
          v-for="(step, index) in sharedSteps"
          :key="`shared-${index}`"
          :step-number="index + 1"
          :step-type="step.type"
          :title="step.title"
          :subtitle="step.subtitle"
          :flow-membership="step.flowMembership"
          :is-branch-point="step.isBranchPoint"
        />
      </div>

      <!-- Branching Flow (branch indicator + side-by-side columns) -->
      <BranchingFlowPreview
        v-if="hasBranching"
        :shared-steps-count="sharedSteps.length"
        :testimonial-steps="testimonialSteps"
        :improvement-steps="improvementSteps"
      />

      <!-- Non-branching flow (simple list) -->
      <div v-else class="space-y-3">
        <PreviewStepCard
          v-for="(step, index) in [...testimonialSteps, ...improvementSteps]"
          :key="`linear-${index}`"
          :step-number="sharedSteps.length + index + 1"
          :step-type="step.type"
          :title="step.title"
          :subtitle="step.subtitle"
        />
      </div>
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
