<script setup lang="ts">
/**
 * Public Form Flow — customer-facing form rendering with branching and AI testimonial support.
 * @see PRD-005: AI Testimonial Generation
 */
import { computed, toRef, type Component } from 'vue';
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
  TestimonialWriteStepCard,
} from '@/shared/stepCards';
import { OrganizationLogo } from '@/entities/organization';
import { publicFormTestIds } from '@/shared/constants/testIds';
import {
  usePublicFormFlow,
  useCustomerGoogleAuth,
  usePublicAIAvailability,
  useTestimonialAIFlow,
  useStepResponseBindings,
} from '../composables';
import TestimonialWriteSection from './TestimonialWriteSection.vue';
import PublicFormNavigation from './PublicFormNavigation.vue';

interface Props {
  steps: FormStep[];
  formName?: string;
  branchingConfig?: BranchingConfig | null;
  logoUrl?: string | null;
  primaryColorHsl?: string | null;
  formId?: string;
  organizationId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  branchingConfig: null,
  logoUrl: null,
  primaryColorHsl: null,
  formId: '',
  organizationId: '',
});

// Composables (called at setup root)
const googleAuth = useCustomerGoogleAuth();

const stepsRef = toRef(props, 'steps');
const branchingConfigRef = toRef(props, 'branchingConfig');
const formIdRef = toRef(props, 'formId');
const organizationIdRef = toRef(props, 'organizationId');

const {
  currentStep, currentStepIndex, isFirstStep, isLastStep, isStepBeforeThankYou,
  progress, visibleSteps,
  goToNext, goToPrevious, goToStep, setResponse, getResponse, handleSubmission,
} = usePublicFormFlow({
  steps: stepsRef,
  branchingConfig: branchingConfigRef,
  formId: formIdRef,
  organizationId: organizationIdRef,
});

const { isAIAvailable } = usePublicAIAvailability(formIdRef);

const { ratingResponse, questionResponse, testimonialResponse } = useStepResponseBindings({
  currentStep,
  getResponse,
  setResponse,
});

const {
  selectedPath, isGeneratingTestimonial, generatedTestimonial,
  testimonialSuggestions, testimonialMetadata, regenerationsRemaining, aiCreditsError,
  isTestimonialWriteStep, testimonialWriteState, previousAnswers,
  handlePathSelect, handleGoogleAuth: aiHandleGoogleAuth,
  handleRegenerate, handleApplySuggestion, handleAcceptTestimonial, resetTestimonialState,
} = useTestimonialAIFlow({
  formId: formIdRef,
  currentStep,
  visibleSteps,
  getResponse,
  setResponse,
  goToNext,
  isAIAvailable,
  ratingResponse,
});

const customPrimaryStyles = computed(() => {
  if (!props.primaryColorHsl) return {};
  return { '--primary': props.primaryColorHsl };
});

const stepCardComponents: Record<StepType, Component> = {
  welcome: WelcomeStepCard,
  question: QuestionStepCard,
  rating: RatingStepCard,
  consent: ConsentStepCard,
  contact_info: ContactInfoStepCard,
  reward: RewardStepCard,
  thank_you: ThankYouStepCard,
  testimonial_write: TestimonialWriteStepCard,
};

const isWelcomeStep = computed(() => currentStep.value?.stepType === 'welcome');
const isThankYouStep = computed(() => currentStep.value?.stepType === 'thank_you');
const isQuestionStep = computed(() => currentStep.value?.stepType === 'question');
const isRatingStep = computed(() => currentStep.value?.stepType === 'rating');

// Navigation visibility
const showNavigation = computed(() => {
  if (isWelcomeStep.value || isThankYouStep.value) return false;
  if (testimonialWriteState.value === 'generating' || testimonialWriteState.value === 'review') return false;
  return true;
});
const showBackButton = computed(() => !isFirstStep.value && showNavigation.value);
const showNextButton = computed(() => {
  if (isTestimonialWriteStep.value && selectedPath.value !== 'manual') return false;
  if (isRatingStep.value && ratingResponse.value !== null) return true;
  if (!isLastStep.value && showNavigation.value) return true;
  return false;
});
const isNextDisabled = computed(() => {
  if (isRatingStep.value) return ratingResponse.value === null;
  if (isTestimonialWriteStep.value && selectedPath.value === 'manual') {
    const content = currentStep.value?.content as { minLength?: number } | undefined;
    const minLength = content?.minLength ?? 50;
    return testimonialResponse.value.length < minLength;
  }
  return false;
});

function handleGoogleAuth() {
  aiHandleGoogleAuth(googleAuth.signInWithGoogle);
}

async function handleSubmit() {
  await handleSubmission();
  goToNext();
}

function handleBack() {
  if (isTestimonialWriteStep.value && selectedPath.value && isAIAvailable.value) {
    resetTestimonialState();
  } else {
    goToPrevious();
  }
}
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50"
    :style="customPrimaryStyles"
    :data-testid="publicFormTestIds.container"
  >
    <div v-if="logoUrl" class="fixed top-6 left-6 z-10">
      <OrganizationLogo :logo-url="logoUrl" size="lg" :show-placeholder="false" />
    </div>

    <div class="fixed top-0 left-0 right-0 h-1 bg-gray-200">
      <div
        class="h-full bg-primary transition-all duration-300"
        :style="{ width: `${progress}%` }"
        :data-testid="publicFormTestIds.progressBar"
      />
    </div>

    <div class="w-full max-w-4xl px-4">
      <div
        v-if="currentStep"
        :data-testid="publicFormTestIds.stepCard"
        :data-step-type="currentStep.stepType"
        :data-step-index="currentStepIndex"
      >
        <StepCardContainer mode="preview" :step-type="currentStep.stepType">
          <WelcomeStepCard
            v-if="isWelcomeStep"
            :step="currentStep"
            mode="preview"
            @start="goToNext"
          />

          <QuestionStepCard
            v-else-if="isQuestionStep"
            v-model="questionResponse"
            :step="currentStep"
            mode="preview"
          />

          <RatingStepCard
            v-else-if="isRatingStep"
            v-model="ratingResponse"
            :step="currentStep"
            mode="preview"
          />

          <TestimonialWriteSection
            v-else-if="isTestimonialWriteStep"
            v-model="testimonialResponse"
            :step="currentStep"
            :state="testimonialWriteState"
            :is-google-auth-loading="googleAuth.isLoading.value"
            :is-ai-available="isAIAvailable"
            :ai-credits-error="aiCreditsError"
            :previous-answers="previousAnswers"
            :generated-testimonial="generatedTestimonial"
            :suggestions="testimonialSuggestions"
            :metadata="testimonialMetadata"
            :regenerations-remaining="regenerationsRemaining"
            :is-generating="isGeneratingTestimonial"
            @select-path="handlePathSelect"
            @google-auth="handleGoogleAuth"
            @accept="handleAcceptTestimonial"
            @regenerate="handleRegenerate"
            @apply-suggestion="handleApplySuggestion"
          />

          <component
            v-else
            :is="stepCardComponents[currentStep.stepType]"
            :step="currentStep"
            mode="preview"
          />
        </StepCardContainer>
      </div>

      <PublicFormNavigation
        v-if="showNavigation"
        :show-back="showBackButton"
        :show-next="showNextButton"
        :show-submit="isStepBeforeThankYou"
        :is-next-disabled="isNextDisabled"
        :visible-steps="visibleSteps"
        :current-step-index="currentStepIndex"
        @back="handleBack"
        @next="goToNext"
        @submit="handleSubmit"
        @go-to-step="goToStep"
      />
    </div>
  </div>
</template>
