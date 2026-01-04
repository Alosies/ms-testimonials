<script setup lang="ts">
/**
 * Public Form Flow - Customer-facing form rendering
 *
 * Renders form steps in preview mode for testimonial collection.
 * Uses shared step card components with mode="preview".
 */
import { computed, toRef } from 'vue';
import { Button } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import type { FormStep } from '@/shared/stepCards';
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
import { usePublicFormFlow } from '../composables';

interface Props {
  steps: FormStep[];
  formName?: string;
}

const props = defineProps<Props>();

const stepsRef = toRef(props, 'steps');
const flow = usePublicFormFlow(stepsRef.value);

const stepCardComponents: Record<string, unknown> = {
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

// Navigation visibility - hide on welcome (has its own button) and thank you (end state)
const showNavigation = computed(() => !isWelcomeStep.value && !isThankYouStep.value);
const showBackButton = computed(() => !flow.isFirstStep.value && showNavigation.value);
const showNextButton = computed(() => !flow.isLastStep.value && showNavigation.value);

function handleWelcomeStart() {
  flow.goToNext();
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
    <!-- Progress bar -->
    <div class="fixed top-0 left-0 right-0 h-1 bg-gray-200">
      <div
        class="h-full bg-primary transition-all duration-300"
        :style="{ width: `${flow.progress.value}%` }"
      />
    </div>

    <div class="w-full max-w-xl">
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
        <!-- Back button -->
        <Button
          v-if="showBackButton"
          variant="ghost"
          @click="flow.goToPrevious"
        >
          <Icon icon="heroicons:arrow-left" class="w-4 h-4 mr-2" />
          Back
        </Button>
        <div v-else />

        <!-- Next/Continue button -->
        <Button
          v-if="showNextButton"
          @click="flow.goToNext"
        >
          Continue
          <Icon icon="heroicons:arrow-right" class="w-4 h-4 ml-2" />
        </Button>

        <!-- Submit button (on last non-thank-you step) -->
        <Button
          v-else-if="!isThankYouStep"
          @click="flow.goToNext"
        >
          Submit
          <Icon icon="heroicons:check" class="w-4 h-4 ml-2" />
        </Button>
      </div>

      <!-- Step indicator -->
      <div class="mt-6 flex justify-center gap-2">
        <button
          v-for="(step, index) in steps"
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
