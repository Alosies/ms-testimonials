import { ref, computed, onMounted, type Ref } from 'vue';
import type { FormStep, FlowMembership } from '@/shared/stepCards';
import type { BranchingConfig } from '@/entities/form';
import { useFormPersistence } from './useFormPersistence';
import { useFormAnalytics } from './useFormAnalytics';

/**
 * Options for the public form flow composable
 */
export interface UsePublicFormFlowOptions {
  steps: Ref<FormStep[]>;
  branchingConfig?: Ref<BranchingConfig | null>;
  /** Form ID for persistence and analytics */
  formId?: Ref<string>;
  /** Organization ID for analytics */
  organizationId?: Ref<string>;
}

/**
 * Composable for managing the public form flow state
 * Handles step navigation, response collection, conditional branching,
 * form persistence (localStorage), and analytics tracking.
 *
 * @param options - Configuration including steps, branching config, formId, organizationId
 */
export function usePublicFormFlow(options: UsePublicFormFlowOptions) {
  const { steps, branchingConfig, formId, organizationId } = options;

  const currentStepIndex = ref(0);
  const responses = ref<Record<string, unknown>>({});

  // Track the determined flow after rating step
  const determinedFlow = ref<FlowMembership | null>(null);

  // Check if branching is enabled
  const isBranchingEnabled = computed(() =>
    branchingConfig?.value?.enabled ?? false,
  );

  // Get the rating step ID from branching config
  const ratingStepId = computed(() =>
    branchingConfig?.value?.ratingStepId ?? null,
  );

  // Get the threshold for determining flow
  const threshold = computed(() =>
    branchingConfig?.value?.threshold ?? 4,
  );

  /**
   * Compute visible steps based on branching state
   * - Before rating: show shared steps only (up to and including rating)
   * - After rating: show shared + determined flow steps
   */
  const visibleSteps = computed((): FormStep[] => {
    if (!isBranchingEnabled.value) {
      return steps.value;
    }

    // Find rating step index
    const ratingIndex = steps.value.findIndex(s => s.id === ratingStepId.value);
    if (ratingIndex === -1) {
      // No rating step found, show all steps
      return steps.value;
    }

    // If flow not determined yet, show steps up to and including rating
    if (determinedFlow.value === null) {
      return steps.value.filter((step, index) => {
        // Include all shared steps up to rating
        if (index <= ratingIndex) {
          return step.flowMembership === 'shared';
        }
        return false;
      });
    }

    // Flow determined - show shared + flow-specific steps
    return steps.value.filter((step) => {
      if (step.flowMembership === 'shared') return true;
      return step.flowMembership === determinedFlow.value;
    });
  });

  const currentStep = computed(() => visibleSteps.value[currentStepIndex.value] ?? null);
  const isFirstStep = computed(() => currentStepIndex.value === 0);
  const isLastStep = computed(() => currentStepIndex.value === visibleSteps.value.length - 1);
  const progress = computed(() => ((currentStepIndex.value + 1) / visibleSteps.value.length) * 100);

  // Check if the next step is thank_you (used to show Submit button instead of Continue)
  const isStepBeforeThankYou = computed(() => {
    const nextStep = visibleSteps.value[currentStepIndex.value + 1];
    return nextStep?.stepType === 'thank_you';
  });

  // =========================================================================
  // Persistence & Analytics Setup
  // =========================================================================

  // Create a local ref for formId to ensure reactivity works
  const formIdRef = computed(() => formId?.value ?? '');
  const organizationIdRef = computed(() => organizationId?.value ?? '');

  // Initialize persistence composable
  const persistence = useFormPersistence({
    formId: formIdRef,
    answers: responses,
    currentStepIndex,
    determinedFlow,
  });

  // Initialize analytics composable
  const analytics = useFormAnalytics({
    formId: formIdRef,
    organizationId: organizationIdRef,
    sessionId: persistence.sessionId,
  });

  /**
   * Determine which flow to take based on rating value
   */
  function determineFlowFromRating(rating: number) {
    if (rating >= threshold.value) {
      determinedFlow.value = 'testimonial';
    } else {
      determinedFlow.value = 'improvement';
    }
  }

  /**
   * Check if we just completed the rating step and should determine flow
   */
  function checkAndDetermineFlow() {
    if (!isBranchingEnabled.value) return;
    if (determinedFlow.value !== null) return; // Already determined

    const current = currentStep.value;
    if (!current) return;

    // Check if current step is the rating step
    if (current.id === ratingStepId.value) {
      const ratingValue = responses.value[current.id];
      if (typeof ratingValue === 'number') {
        determineFlowFromRating(ratingValue);
      }
    }
  }

  /**
   * Update analytics with current step context
   */
  function updateAnalyticsStepContext() {
    const step = currentStep.value;
    if (step) {
      analytics.setCurrentStep(
        currentStepIndex.value,
        step.id,
        step.stepType
      );
    }
  }

  function goToNext() {
    const previousStep = currentStep.value;

    // Check if we need to determine flow before moving on
    checkAndDetermineFlow();

    if (currentStepIndex.value < visibleSteps.value.length - 1) {
      // Track step completion before moving
      if (previousStep) {
        analytics.trackStepCompleted(
          currentStepIndex.value,
          previousStep.id,
          previousStep.stepType
        );
      }

      currentStepIndex.value++;

      // Update analytics context for new step
      updateAnalyticsStepContext();
    }
  }

  function goToPrevious() {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--;
      updateAnalyticsStepContext();
    }
  }

  function goToStep(index: number) {
    if (index >= 0 && index < visibleSteps.value.length) {
      currentStepIndex.value = index;
      updateAnalyticsStepContext();
    }
  }

  function setResponse(stepId: string, value: unknown) {
    responses.value[stepId] = value;
  }

  function getResponse(stepId: string) {
    return responses.value[stepId];
  }

  /** Handle form submission - tracks event, prevents abandonment, clears state */
  async function handleSubmission() {
    await analytics.trackFormSubmitted();
    analytics.markAsSubmitted();
    persistence.clearState();
  }

  // =========================================================================
  // Initialization on Mount
  // =========================================================================

  onMounted(async () => {
    persistence.init();
    persistence.setupAutoSave();
    analytics.setupUnloadHandler();

    // Restore persisted data or track form started
    if (persistence.hasPersistedData.value) {
      const restored = persistence.restoreState();
      await (restored
        ? analytics.trackFormResumed(currentStepIndex.value)
        : analytics.trackFormStarted());
    } else {
      await analytics.trackFormStarted();
    }

    updateAnalyticsStepContext();
  });

  return {
    // State
    currentStepIndex, currentStep, isFirstStep, isLastStep, isStepBeforeThankYou,
    progress, responses, visibleSteps, determinedFlow, isBranchingEnabled,
    // Persistence & Analytics
    sessionId: persistence.sessionId, hasPersistedData: persistence.hasPersistedData,
    // Navigation & Actions
    goToNext, goToPrevious, goToStep, setResponse, getResponse, handleSubmission,
  };
}
