/**
 * Step Question Service - Creates form_questions for question/rating steps
 *
 * This composable provides a service for creating form_questions when new
 * question or rating type steps are created. The question is created immediately
 * rather than waiting for save time, ensuring the questionId is available
 * for the step right away.
 *
 * Used by useTimelineStepCrud to create questions for new question/rating steps.
 */
import { computed } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { useCreateFormQuestion } from '@/entities/formQuestion';
import { stepTypeRequiresQuestion } from '@/entities/formStep';
import { useGetQuestionTypes } from '@/entities/questionType';
import { useCurrentContextStore } from '@/shared/currentContext';
import type { StepType, FlowMembership } from '@/shared/stepCards';

export interface CreateQuestionParams {
  // ADR-013: Question now references step via step_id (not form_id)
  stepId: string;
  stepType: StepType;
  stepOrder: number;
  flowMembership: FlowMembership;
  /**
   * Optional explicit display_order. If not provided, uses stepOrder.
   * Use this when stepOrder (array index) might conflict with existing DB values.
   */
  displayOrder?: number;
}

export interface CreateQuestionResult {
  questionId: string;
  questionText: string;
}

/**
 * Default question configurations based on flow membership
 */
const DEFAULT_QUESTION_CONFIGS: Record<
  string,
  { questionType: string; questionText: string; questionKeyPrefix: string }
> = {
  improvement: {
    questionType: 'text_long',
    questionText: 'What could we improve?',
    questionKeyPrefix: 'improvement_feedback',
  },
  testimonial: {
    questionType: 'text_long',
    questionText: 'Please share your experience',
    questionKeyPrefix: 'testimonial_feedback',
  },
  shared: {
    questionType: 'text_long',
    questionText: 'Please share your feedback',
    questionKeyPrefix: 'feedback',
  },
};

export const useStepQuestionService = createSharedComposable(() => {
  const { createFormQuestion, loading: questionLoading } = useCreateFormQuestion();
  const { questionTypes } = useGetQuestionTypes();
  const contextStore = useCurrentContextStore();

  // Map question type unique_name to ID
  const questionTypeMap = computed(() => {
    const map = new Map<string, string>();
    for (const qt of questionTypes.value) {
      map.set(qt.unique_name, qt.id);
    }
    return map;
  });

  /**
   * Get question type ID from unique_name
   */
  function getQuestionTypeId(uniqueName: string): string | null {
    return questionTypeMap.value.get(uniqueName) ?? null;
  }

  /**
   * Check if a step type requires a question.
   * Uses the step type registry (ADR-014 Phase 2).
   */
  function requiresQuestion(stepType: StepType): boolean {
    return stepTypeRequiresQuestion(stepType);
  }

  /**
   * Create a form_question for a new question/rating step.
   * ADR-013: Questions now reference steps via step_id (step must exist first).
   * Returns the created question's ID and text, or null if creation fails.
   */
  async function createQuestionForStep(
    params: CreateQuestionParams,
  ): Promise<CreateQuestionResult | null> {
    const { stepId, stepType, stepOrder, flowMembership, displayOrder } = params;

    // Only create questions for question/rating step types
    if (!requiresQuestion(stepType)) {
      return null;
    }

    const organizationId = contextStore.currentOrganizationId;
    if (!organizationId) {
      console.error('[useStepQuestionService] No organization ID available');
      return null;
    }

    // Get the text_long question type ID (default for new questions)
    const textLongTypeId = getQuestionTypeId('text_long');
    if (!textLongTypeId) {
      console.error('[useStepQuestionService] Could not find text_long question type');
      return null;
    }

    // Determine question config based on flow membership
    const config = DEFAULT_QUESTION_CONFIGS[flowMembership] ?? DEFAULT_QUESTION_CONFIGS.shared;
    const questionTypeId = getQuestionTypeId(config.questionType) ?? textLongTypeId;

    try {
      const result = await createFormQuestion({
        input: {
          // ADR-013: Question now references step via step_id (not form_id)
          step_id: stepId,
          organization_id: organizationId,
          question_type_id: questionTypeId,
          question_key: `${config.questionKeyPrefix}_${Date.now()}`,
          question_text: config.questionText,
          display_order: displayOrder ?? stepOrder, // Use explicit order if provided
          is_required: false,
          is_active: true,
        },
      });

      if (result?.id) {
        return {
          questionId: result.id,
          questionText: config.questionText,
        };
      }

      return null;
    } catch (err) {
      console.error('[useStepQuestionService] Failed to create question:', err);
      return null;
    }
  }

  return {
    // State
    loading: questionLoading,

    // Methods
    requiresQuestion,
    createQuestionForStep,
  };
});
