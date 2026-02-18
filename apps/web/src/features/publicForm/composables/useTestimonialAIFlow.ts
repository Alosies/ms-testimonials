/**
 * Testimonial AI Flow Composable
 *
 * Manages the testimonial write step state machine: path selection,
 * AI generation, regeneration, suggestions, and manual fallback.
 *
 * @see PRD-005: AI Testimonial Generation
 * @see ADR-023: AI Credits
 */
import { computed, ref, watch, type Ref } from 'vue';
import type { FormStep } from '@/shared/stepCards';
import type { TestimonialPath } from '@/shared/stepCards';
import { useApiForAI, AIApiError } from '@/shared/api/ai';
import type {
  TestimonialSuggestion,
  TestimonialMetadata,
  TestimonialAnswer,
} from '@/shared/api/ai';

interface UseTestimonialAIFlowOptions {
  formId: Ref<string>;
  currentStep: Ref<FormStep | null>;
  visibleSteps: Ref<FormStep[]>;
  getResponse: (stepId: string) => unknown;
  setResponse: (stepId: string, value: unknown) => void;
  goToNext: () => void;
  isAIAvailable: Ref<boolean>;
  ratingResponse: Ref<number | null>;
}

export function useTestimonialAIFlow({
  formId,
  currentStep,
  visibleSteps,
  getResponse,
  setResponse,
  goToNext,
  isAIAvailable,
  ratingResponse,
}: UseTestimonialAIFlowOptions) {
  // API composable (called at setup root)
  const aiApi = useApiForAI();

  // State
  const selectedPath = ref<TestimonialPath | null>(null);
  const isGeneratingTestimonial = ref(false);
  const generatedTestimonial = ref<string | null>(null);
  const testimonialSuggestions = ref<TestimonialSuggestion[]>([]);
  const testimonialMetadata = ref<TestimonialMetadata | null>(null);
  const regenerationsRemaining = ref(3);
  const aiCreditsError = ref<string | null>(null);

  // When AI is unavailable, skip path selection and go straight to manual
  watch(isAIAvailable, (available) => {
    if (!available && selectedPath.value === null) {
      selectedPath.value = 'manual';
    }
  });

  const isTestimonialWriteStep = computed(
    () => currentStep.value?.stepType === 'testimonial_write',
  );

  const testimonialWriteState = computed(() => {
    if (!isTestimonialWriteStep.value) return 'none';
    if (selectedPath.value === null) return 'path_selection';
    if (selectedPath.value === 'manual') return 'manual';
    if (isGeneratingTestimonial.value) return 'generating';
    if (generatedTestimonial.value) return 'review';
    return 'path_selection';
  });

  const previousAnswers = computed(() => {
    if (!isTestimonialWriteStep.value) return [];

    const answers: { questionText: string; answer: string }[] = [];
    for (const step of visibleSteps.value) {
      if (step.stepType === 'question' && step.question) {
        const response = getResponse(step.id);
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

  function buildAnswersForAI(): TestimonialAnswer[] {
    const answers: TestimonialAnswer[] = [];
    for (const step of visibleSteps.value) {
      if (step.stepType === 'question' && step.question) {
        const response = getResponse(step.id);
        if (response && typeof response === 'string') {
          answers.push({
            question_text: step.question.questionText,
            question_key: step.id,
            answer: response,
          });
        }
      }
    }
    return answers;
  }

  function handlePathSelect(path: TestimonialPath) {
    selectedPath.value = path;
  }

  async function handleGoogleAuth(signInWithGoogle: () => Promise<{ success: boolean }>) {
    const result = await signInWithGoogle();
    if (result.success) {
      selectedPath.value = 'ai';
      await generateTestimonial();
    }
  }

  /**
   * Generate testimonial using AI
   *
   * Credits are consumed from the form owner's account (ADR-023).
   * If the form owner has insufficient credits, we gracefully fall back to manual mode.
   */
  async function generateTestimonial(modification?: { suggestion_id: string }) {
    if (!formId.value) {
      console.error('Form ID is required for AI testimonial generation');
      return;
    }

    isGeneratingTestimonial.value = true;
    aiCreditsError.value = null;

    try {
      const answers = buildAnswersForAI();
      const rating = ratingResponse.value ?? undefined;

      const response = await aiApi.assembleTestimonial({
        form_id: formId.value,
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

      const isCapabilityError =
        error instanceof AIApiError &&
        (error.code === 'CAPABILITY_DENIED' ||
          error.code === 'INSUFFICIENT_CREDITS' ||
          error.statusCode === 403);

      if (isCapabilityError) {
        aiCreditsError.value =
          'AI testimonial generation is temporarily unavailable. Please write your testimonial manually.';
      }

      selectedPath.value = 'manual';
    } finally {
      isGeneratingTestimonial.value = false;
    }
  }

  async function handleRegenerate() {
    if (regenerationsRemaining.value <= 0) return;
    regenerationsRemaining.value--;
    await generateTestimonial();
  }

  async function handleApplySuggestion(suggestionId: string) {
    await generateTestimonial({ suggestion_id: suggestionId });
  }

  function handleAcceptTestimonial(testimonial: string) {
    const stepId = currentStep.value?.id;
    if (stepId) {
      setResponse(stepId, testimonial);
    }
    goToNext();
  }

  function resetTestimonialState() {
    selectedPath.value = null;
    generatedTestimonial.value = null;
    testimonialSuggestions.value = [];
    testimonialMetadata.value = null;
  }

  return {
    // State
    selectedPath,
    isGeneratingTestimonial,
    generatedTestimonial,
    testimonialSuggestions,
    testimonialMetadata,
    regenerationsRemaining,
    aiCreditsError,
    // Computed
    isTestimonialWriteStep,
    testimonialWriteState,
    previousAnswers,
    // Actions
    handlePathSelect,
    handleGoogleAuth,
    handleRegenerate,
    handleApplySuggestion,
    handleAcceptTestimonial,
    resetTestimonialState,
  };
}
