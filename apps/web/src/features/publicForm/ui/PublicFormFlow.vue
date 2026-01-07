<script setup lang="ts">
/**
 * Public Form Flow - Customer-facing form rendering
 *
 * Renders form steps in preview mode for testimonial collection.
 * Uses shared step card components with mode="preview".
 * Supports conditional branching based on rating responses.
 */
import { computed, toRef, type Component } from 'vue';
import { Button } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import type { FormStep, StepType } from '@/shared/stepCards';
import type { BranchingConfig } from '@/entities/form';
import {
  StepCardContainer,
  WelcomeStepCard,
  QuestionStepCard,
  RatingStepCard,
  ConsentStepCard,
  ContactInfoStepCard,
  RewardStepCard,
  ThankYouStepCard,
} from '@/shared/stepCards';
import { OrganizationLogo } from '@/entities/organization';
import { usePublicFormFlow } from '../composables';

interface Props {
  steps: FormStep[];
  formName?: string;
  branchingConfig?: BranchingConfig | null;
  logoUrl?: string | null;
  /** Custom primary color in HSL CSS variable format (e.g., "175 84% 32%") */
  primaryColorHsl?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  branchingConfig: null,
  logoUrl: null,
  primaryColorHsl: null,
});

// Custom styles for the entire public form (applies custom primary color)
// Applied at root level so all elements (buttons, dots, progress bar) inherit the brand color
const customPrimaryStyles = computed(() => {
  if (!props.primaryColorHsl) return {};
  return {
    '--primary': props.primaryColorHsl,
  };
});

const stepsRef = toRef(props, 'steps');
const branchingConfigRef = toRef(props, 'branchingConfig');
const flow = usePublicFormFlow({
  steps: stepsRef,
  branchingConfig: branchingConfigRef,
});

// Rating response for v-model binding
const ratingResponse = computed({
  get: () => {
    const stepId = flow.currentStep.value?.id;
    if (!stepId) return null;
    const value = flow.getResponse(stepId);
    return typeof value === 'number' ? value : null;
  },
  set: (value: number | null) => {
    const stepId = flow.currentStep.value?.id;
    if (stepId && value !== null) {
      flow.setResponse(stepId, value);
    }
  },
});

const stepCardComponents: Record<StepType, Component> = {
  welcome: WelcomeStepCard,
  question: QuestionStepCard,
  rating: RatingStepCard,
  consent: ConsentStepCard,
  contact_info: ContactInfoStepCard,
  reward: RewardStepCard,
  thank_you: ThankYouStepCard,
};

const isWelcomeStep = computed(() => flow.currentStep.value?.stepType === 'welcome');
const isThankYouStep = computed(() => flow.currentStep.value?.stepType === 'thank_you');
const isRatingStep = computed(() => flow.currentStep.value?.stepType === 'rating');

// Navigation visibility - hide on welcome (has its own button) and thank you (end state)
const showNavigation = computed(() => !isWelcomeStep.value && !isThankYouStep.value);
const showBackButton = computed(() => !flow.isFirstStep.value && showNavigation.value);
const showNextButton = computed(() => !flow.isLastStep.value && showNavigation.value);

// Disable next on rating step if no rating selected yet
const isNextDisabled = computed(() => {
  if (isRatingStep.value && ratingResponse.value === null) {
    return true;
  }
  return false;
});

function handleWelcomeStart() {
  flow.goToNext();
}
</script>

<template>
  <!-- Root container with custom primary color applied at top level -->
  <div
    class="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50"
    :style="customPrimaryStyles"
  >
    <!-- Logo (fixed position, top-left) -->
    <div v-if="logoUrl" class="fixed top-6 left-6 z-10">
      <OrganizationLogo
        :logo-url="logoUrl"
        size="lg"
        :show-placeholder="false"
      />
    </div>

    <!-- Progress bar -->
    <div class="fixed top-0 left-0 right-0 h-1 bg-gray-200">
      <div
        class="h-full bg-primary transition-all duration-300"
        :style="{ width: `${flow.progress.value}%` }"
      />
    </div>

    <div class="w-full max-w-4xl px-4">
      <!-- Step card -->
      <StepCardContainer
        v-if="flow.currentStep.value"
        mode="preview"
        :step-type="flow.currentStep.value.stepType"
      >
        <!-- Welcome step with start handler -->
        <WelcomeStepCard
          v-if="isWelcomeStep"
          :step="flow.currentStep.value"
          mode="preview"
          @start="handleWelcomeStart"
        />
        <!-- Rating step with v-model for response -->
        <RatingStepCard
          v-else-if="isRatingStep"
          v-model="ratingResponse"
          :step="flow.currentStep.value"
          mode="preview"
        />
        <!-- Other step types -->
        <component
          v-else
          :is="stepCardComponents[flow.currentStep.value.stepType]"
          :step="flow.currentStep.value"
          mode="preview"
        />
      </StepCardContainer>

      <!-- Navigation buttons (hidden on welcome and thank you steps) -->
      <div
        v-if="showNavigation"
        class="mt-8 flex justify-between items-center"
      >
        <!-- Back button (neutral color, not affected by custom primary) -->
        <Button
          v-if="showBackButton"
          variant="outline"
          class="border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-700"
          @click="flow.goToPrevious"
        >
          <Icon icon="heroicons:arrow-left" class="w-4 h-4 mr-2" />
          Back
        </Button>
        <div v-else />

        <!-- Next/Continue button -->
        <Button
          v-if="showNextButton"
          :disabled="isNextDisabled"
          @click="flow.goToNext"
        >
          Continue
          <Icon icon="heroicons:arrow-right" class="w-4 h-4 ml-2" />
        </Button>

        <!-- Submit button (on last non-thank-you step) -->
        <Button
          v-else-if="!isThankYouStep"
          :disabled="isNextDisabled"
          @click="flow.goToNext"
        >
          Submit
          <Icon icon="heroicons:check" class="w-4 h-4 ml-2" />
        </Button>
      </div>

      <!-- Step indicator (uses visible steps for branching) -->
      <div class="mt-6 flex justify-center gap-2">
        <button
          v-for="(step, index) in flow.visibleSteps.value"
          :key="step.id"
          class="w-2 h-2 rounded-full transition-colors"
          :class="{
            'bg-primary': index === flow.currentStepIndex.value,
            'bg-gray-300': index !== flow.currentStepIndex.value,
          }"
          @click="flow.goToStep(index)"
        />
      </div>
    </div>
  </div>
</template>
