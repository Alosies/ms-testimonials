<script setup lang="ts">
/**
 * Public Form Flow - Customer-facing form rendering
 *
 * Renders form steps in preview mode for testimonial collection.
 * Uses shared step card components with mode="preview".
 * Supports conditional branching based on rating responses.
 * Supports testimonial writing with manual and AI-assisted paths.
 *
 * @see PRD-005: AI Testimonial Generation
 */
import { computed, ref, toRef, type Component } from 'vue';
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
  TestimonialWriteStepCard,
  TestimonialPathSelector,
  TestimonialReviewStepCard,
  type TestimonialPath,
} from '@/shared/stepCards';
import { OrganizationLogo } from '@/entities/organization';
import { publicFormTestIds } from '@/shared/constants/testIds';
import { useApiForAI } from '@/shared/api/ai';
import type {
  TestimonialSuggestion,
  TestimonialMetadata,
  TestimonialAnswer,
} from '@/shared/api/ai';
import { usePublicFormFlow, useCustomerGoogleAuth } from '../composables';

interface Props {
  steps: FormStep[];
  formName?: string;
  branchingConfig?: BranchingConfig | null;
  logoUrl?: string | null;
  /** Custom primary color in HSL CSS variable format (e.g., "175 84% 32%") */
  primaryColorHsl?: string | null;
  /** Form ID for persistence and analytics */
  formId?: string;
  /** Organization ID for analytics */
  organizationId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  branchingConfig: null,
  logoUrl: null,
  primaryColorHsl: null,
  formId: '',
  organizationId: '',
});

// API composables (called at setup root)
const aiApi = useApiForAI();
const googleAuth = useCustomerGoogleAuth();

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
const formIdRef = toRef(props, 'formId');
const organizationIdRef = toRef(props, 'organizationId');
const flow = usePublicFormFlow({
  steps: stepsRef,
  branchingConfig: branchingConfigRef,
  formId: formIdRef,
  organizationId: organizationIdRef,
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

// Testimonial response for v-model binding (manual path)
const testimonialResponse = computed({
  get: () => {
    const stepId = flow.currentStep.value?.id;
    if (!stepId) return '';
    const value = flow.getResponse(stepId);
    return typeof value === 'string' ? value : '';
  },
  set: (value: string) => {
    const stepId = flow.currentStep.value?.id;
    if (stepId) {
      flow.setResponse(stepId, value);
    }
  },
});

// Testimonial write step state
const selectedPath = ref<TestimonialPath | null>(null);
const isGeneratingTestimonial = ref(false);
const generatedTestimonial = ref<string | null>(null);
const testimonialSuggestions = ref<TestimonialSuggestion[]>([]);
const testimonialMetadata = ref<TestimonialMetadata | null>(null);
const regenerationsRemaining = ref(3);

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

const isWelcomeStep = computed(() => flow.currentStep.value?.stepType === 'welcome');
const isThankYouStep = computed(() => flow.currentStep.value?.stepType === 'thank_you');
const isRatingStep = computed(() => flow.currentStep.value?.stepType === 'rating');
const isTestimonialWriteStep = computed(() => flow.currentStep.value?.stepType === 'testimonial_write');

// Determine testimonial write step state
const testimonialWriteState = computed(() => {
  if (!isTestimonialWriteStep.value) return 'none';
  if (selectedPath.value === null) return 'path_selection';
  if (selectedPath.value === 'manual') return 'manual';
  if (isGeneratingTestimonial.value) return 'generating';
  if (generatedTestimonial.value) return 'review';
  return 'path_selection';
});

// Previous answers for reference
const previousAnswers = computed(() => {
  if (!isTestimonialWriteStep.value) return [];

  const answers: { questionText: string; answer: string }[] = [];

  for (const step of flow.visibleSteps.value) {
    if (step.stepType === 'question' && step.question) {
      const response = flow.getResponse(step.id);
      if (response && typeof response === 'string') {
        answers.push({
          questionText: step.question.questionText,
          answer: response,
        });
      }
    }
  }

  return answers;
});

// Build answers for AI assembly
function buildAnswersForAI(): TestimonialAnswer[] {
  const answers: TestimonialAnswer[] = [];

  for (const step of flow.visibleSteps.value) {
    if (step.stepType === 'question' && step.question) {
      const response = flow.getResponse(step.id);
      if (response && typeof response === 'string') {
        answers.push({
          question_text: step.question.questionText,
          question_key: step.id, // Using step ID as key
          answer: response,
        });
      }
    }
  }

  return answers;
}

// Navigation visibility
const showNavigation = computed(() => {
  if (isWelcomeStep.value || isThankYouStep.value) return false;
  // Hide navigation in testimonial write states that manage their own flow
  if (testimonialWriteState.value === 'generating' || testimonialWriteState.value === 'review') return false;
  return true;
});
const showBackButton = computed(() => !flow.isFirstStep.value && showNavigation.value);
// Show Continue on rating step when rating selected (flow reveals next steps after determination)
const showNextButton = computed(() => {
  // Don't show next on testimonial write step (it has its own flow)
  if (isTestimonialWriteStep.value && selectedPath.value !== 'manual') return false;
  if (isRatingStep.value && ratingResponse.value !== null) return true;
  if (!flow.isLastStep.value && showNavigation.value) return true;
  return false;
});
const isNextDisabled = computed(() => {
  if (isRatingStep.value) return ratingResponse.value === null;
  if (isTestimonialWriteStep.value && selectedPath.value === 'manual') {
    // Validate manual testimonial length
    const content = flow.currentStep.value?.content as { minLength?: number } | undefined;
    const minLength = content?.minLength ?? 50;
    return testimonialResponse.value.length < minLength;
  }
  return false;
});

function handleWelcomeStart() {
  flow.goToNext();
}

/**
 * Handle path selection for testimonial write step
 */
function handlePathSelect(path: TestimonialPath) {
  selectedPath.value = path;
}

/**
 * Handle Google authentication and start AI generation
 */
async function handleGoogleAuth() {
  const result = await googleAuth.signInWithGoogle();

  if (result.success) {
    selectedPath.value = 'ai';
    await generateTestimonial();
  }
}

/**
 * Generate testimonial using AI
 */
async function generateTestimonial(modification?: { suggestion_id: string }) {
  if (!props.formId) {
    console.error('Form ID is required for AI testimonial generation');
    return;
  }

  isGeneratingTestimonial.value = true;

  try {
    const answers = buildAnswersForAI();
    const rating = ratingResponse.value ?? undefined;

    const response = await aiApi.assembleTestimonial({
      form_id: props.formId,
      answers,
      rating,
      modification: modification
        ? {
            type: 'suggestion',
            suggestion_id: modification.suggestion_id,
            previous_testimonial: generatedTestimonial.value || '',
          }
        : undefined,
    });

    generatedTestimonial.value = response.testimonial;
    testimonialSuggestions.value = response.suggestions;
    testimonialMetadata.value = response.metadata;
  } catch (error) {
    console.error('Failed to generate testimonial:', error);
    // Fall back to manual path on error
    selectedPath.value = 'manual';
  } finally {
    isGeneratingTestimonial.value = false;
  }
}

/**
 * Handle testimonial regeneration
 */
async function handleRegenerate() {
  if (regenerationsRemaining.value <= 0) return;
  regenerationsRemaining.value--;
  await generateTestimonial();
}

/**
 * Handle applying a suggestion
 */
async function handleApplySuggestion(suggestionId: string) {
  await generateTestimonial({ suggestion_id: suggestionId });
}

/**
 * Handle accepting the AI-generated testimonial
 */
function handleAcceptTestimonial(testimonial: string) {
  const stepId = flow.currentStep.value?.id;
  if (stepId) {
    flow.setResponse(stepId, testimonial);
  }
  // Continue to next step
  flow.goToNext();
}

/**
 * Handle form submission (on Submit button click)
 * Tracks submission analytics and clears persisted state before navigating to thank you
 */
async function handleSubmit() {
  await flow.handleSubmission();
  flow.goToNext();
}

/**
 * Handle back button with path reset for testimonial write
 */
function handleBack() {
  if (isTestimonialWriteStep.value && selectedPath.value) {
    // Reset path selection instead of going to previous step
    selectedPath.value = null;
    generatedTestimonial.value = null;
    testimonialSuggestions.value = [];
    testimonialMetadata.value = null;
  } else {
    flow.goToPrevious();
  }
}
</script>

<template>
  <!-- Root container with custom primary color applied at top level -->
  <div
    class="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50"
    :style="customPrimaryStyles"
    :data-testid="publicFormTestIds.container"
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
        :data-testid="publicFormTestIds.progressBar"
      />
    </div>

    <div class="w-full max-w-4xl px-4">
      <!-- Step card -->
      <div
        v-if="flow.currentStep.value"
        :data-testid="publicFormTestIds.stepCard"
        :data-step-type="flow.currentStep.value.stepType"
        :data-step-index="flow.currentStepIndex.value"
      >
        <StepCardContainer
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

          <!-- Testimonial Write Step - Multiple States -->
          <template v-else-if="isTestimonialWriteStep">
            <!-- Path Selection -->
            <TestimonialPathSelector
              v-if="testimonialWriteState === 'path_selection'"
              :step="flow.currentStep.value"
              mode="preview"
              :is-google-auth-loading="googleAuth.isLoading.value"
              @select="handlePathSelect"
              @google-auth="handleGoogleAuth"
            />

            <!-- Manual Path -->
            <TestimonialWriteStepCard
              v-else-if="testimonialWriteState === 'manual'"
              v-model="testimonialResponse"
              :step="flow.currentStep.value"
              mode="preview"
              :previous-answers="previousAnswers"
            />

            <!-- Generating State -->
            <div
              v-else-if="testimonialWriteState === 'generating'"
              class="text-center py-12"
            >
              <Icon
                icon="svg-spinners:90-ring-with-bg"
                class="w-12 h-12 text-primary mx-auto mb-4"
              />
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Crafting your testimonial...
              </h3>
              <p class="text-gray-600">
                Our AI is transforming your answers into a compelling story.
              </p>
            </div>

            <!-- Review State -->
            <TestimonialReviewStepCard
              v-else-if="testimonialWriteState === 'review'"
              :step="flow.currentStep.value"
              mode="preview"
              :testimonial="generatedTestimonial || ''"
              :suggestions="testimonialSuggestions"
              :metadata="testimonialMetadata || undefined"
              :regenerations-remaining="regenerationsRemaining"
              :is-regenerating="isGeneratingTestimonial"
              @accept="handleAcceptTestimonial"
              @regenerate="handleRegenerate"
              @apply-suggestion="handleApplySuggestion"
            />
          </template>

          <!-- Other step types -->
          <component
            v-else
            :is="stepCardComponents[flow.currentStep.value.stepType]"
            :step="flow.currentStep.value"
            mode="preview"
          />
        </StepCardContainer>
      </div>

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
          :data-testid="publicFormTestIds.backButton"
          @click="handleBack"
        >
          <Icon icon="heroicons:arrow-left" class="w-4 h-4 mr-2" />
          Back
        </Button>
        <div v-else />

        <!-- Submit button (on step before thank_you) -->
        <Button
          v-if="flow.isStepBeforeThankYou.value"
          :disabled="isNextDisabled"
          :data-testid="publicFormTestIds.submitButton"
          @click="handleSubmit"
        >
          Submit
          <Icon icon="heroicons:check" class="w-4 h-4 ml-2" />
        </Button>

        <!-- Next/Continue button -->
        <Button
          v-else-if="showNextButton"
          :disabled="isNextDisabled"
          :data-testid="publicFormTestIds.continueButton"
          @click="flow.goToNext"
        >
          Continue
          <Icon icon="heroicons:arrow-right" class="w-4 h-4 ml-2" />
        </Button>
      </div>

      <!-- Step indicator (uses visible steps for branching) -->
      <div
        class="mt-6 flex justify-center gap-2"
        :data-testid="publicFormTestIds.stepIndicator"
      >
        <button
          v-for="(step, index) in flow.visibleSteps.value"
          :key="step.id"
          class="w-2 h-2 rounded-full transition-colors"
          :class="{
            'bg-primary': index === flow.currentStepIndex.value,
            'bg-gray-300': index !== flow.currentStepIndex.value,
          }"
          :data-testid="publicFormTestIds.stepDot"
          :data-step-index="index"
          :data-active="index === flow.currentStepIndex.value"
          @click="flow.goToStep(index)"
        />
      </div>
    </div>
  </div>
</template>
