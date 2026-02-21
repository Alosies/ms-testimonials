/**
 * Testimonial AI Flow Composable
 *
 * Manages the testimonial write step state machine: path selection,
 * AI generation, regeneration, suggestions, and manual fallback.
 *
 * @see PRD-005: AI Testimonial Generation
 * @see ADR-023: AI Credits
 */
import { computed, onMounted, ref, watch, type Ref } from 'vue';
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
  customerCredential: Ref<string | null>;
}

/**
 * SessionStorage key for per-form AI generation exhaustion state.
 * Prevents showing the AI path when the customer already used all generations.
 */
function getExhaustionKey(fId: string): string {
  return `testimonials_ai_exhausted_${fId}`;
}

function markFormExhausted(fId: string): void {
  try {
    sessionStorage.setItem(getExhaustionKey(fId), String(Date.now()));
  } catch { /* ignore */ }
}

function isFormExhausted(fId: string): boolean {
  try {
    const ts = sessionStorage.getItem(getExhaustionKey(fId));
    if (!ts) return false;
    // Expire after 24 hours (matches server-side window)
    const WINDOW_MS = 24 * 60 * 60 * 1000;
    return Date.now() - Number(ts) < WINDOW_MS;
  } catch {
    return false;
  }
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
  customerCredential,
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

  // On mount, check if this customer already exhausted their generations for this form
  onMounted(() => {
    if (formId.value && customerCredential.value && isFormExhausted(formId.value)) {
      regenerationsRemaining.value = 0;
      aiCreditsError.value = 'AI generation limit reached. Please write your testimonial below.';
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
  async function generateTestimonial(modification?: {
    suggestion_id: string;
    suggestion_label?: string;
    suggestion_description?: string;
  }) {
    if (!formId.value) {
      console.error('Form ID is required for AI testimonial generation');
      return;
    }

    isGeneratingTestimonial.value = true;
    aiCreditsError.value = null;

    try {
      const answers = buildAnswersForAI();
      const rating = ratingResponse.value ?? undefined;

      const credentialToSend = customerCredential.value ?? undefined;

      const response = await aiApi.assembleTestimonial({
        form_id: formId.value,
        answers,
        rating,
        modification: modification
          ? {
              type: 'suggestion',
              suggestion_id: modification.suggestion_id,
              suggestion_label: modification.suggestion_label,
              suggestion_description: modification.suggestion_description,
              previous_testimonial: generatedTestimonial.value || '',
            }
          : undefined,
        customer_credential: credentialToSend,
      });

      generatedTestimonial.value = response.testimonial;
      testimonialSuggestions.value = response.suggestions;
      testimonialMetadata.value = response.metadata;

      // Use server-side generation count if available, otherwise decrement client-side
      if (response.generations_remaining !== undefined && response.generations_remaining !== null) {
        regenerationsRemaining.value = response.generations_remaining;
        // Persist exhaustion state so refresh skips AI path
        if (response.generations_remaining <= 0) {
          markFormExhausted(formId.value);
        }
      } else {
        regenerationsRemaining.value = Math.max(0, regenerationsRemaining.value - 1);
      }
    } catch (error) {
      console.error('Failed to generate testimonial:', error);

      // Handle per-customer generation limit exceeded
      const isLimitExceeded =
        error instanceof AIApiError &&
        error.code === 'CUSTOMER_LIMIT_EXCEEDED';

      if (isLimitExceeded) {
        regenerationsRemaining.value = 0;
        aiCreditsError.value =
          'AI generation limit reached. Please write your testimonial below.';
        markFormExhausted(formId.value);
        selectedPath.value = 'manual';
        return;
      }

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
    await generateTestimonial();
  }

  async function handleApplySuggestion(suggestionId: string) {
    if (regenerationsRemaining.value <= 0) return;
    const suggestion = testimonialSuggestions.value.find((s) => s.id === suggestionId);
    await generateTestimonial({
      suggestion_id: suggestionId,
      suggestion_label: suggestion?.label,
      suggestion_description: suggestion?.description,
    });
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
    // Note: do NOT clear exhaustion flag here — it should persist across resets
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
