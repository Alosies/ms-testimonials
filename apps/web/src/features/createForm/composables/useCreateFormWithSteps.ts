import { ref, toRefs, computed, readonly, type DeepReadonly } from 'vue';
import { getErrorMessage } from '@/shared/api';
import type { AIQuestion, AIContext } from '@/shared/api';
import { useCreateForm } from '@/entities/form';
import { useCreateFormQuestions } from '@/entities/formQuestion';
import { useCreateFormSteps } from '@/entities/formStep';
import { useGetQuestionTypes } from '@/entities/questionType';
import { useCurrentContextStore } from '@/shared/currentContext';
import {
  getDefaultWelcomeContent,
  getDefaultThankYouContent,
} from '../constants/wizardConfig';

// ============================================================================
// Types
// ============================================================================

export interface CreateFormWithStepsParams {
  conceptName: string;
  description: string;
  questions: DeepReadonly<AIQuestion[]>;
  aiContext: DeepReadonly<AIContext> | null;
}

export interface CreateFormWithStepsResult {
  formId: string;
  formName: string;
}

// ============================================================================
// Composable
// ============================================================================

/**
 * Create a complete form with questions and steps
 *
 * This composable handles the full form creation process:
 * 1. Creates the form record
 * 2. Creates form_questions for each generated question
 * 3. Creates form_steps (welcome → questions → thank_you)
 */
export function useCreateFormWithSteps() {
  const { createForm } = useCreateForm();
  const { createFormQuestions } = useCreateFormQuestions();
  const { createFormSteps } = useCreateFormSteps();
  const { questionTypes } = useGetQuestionTypes();
  const contextStore = useCurrentContextStore();
  const { currentOrganizationId, currentUserId } = toRefs(contextStore);

  const isCreating = ref(false);
  const error = ref<string | null>(null);

  // Create mapping from unique_name to id for question types
  const questionTypeMap = computed(() => {
    const map = new Map<string, string>();
    for (const qt of questionTypes.value) {
      map.set(qt.unique_name, qt.id);
    }
    return map;
  });

  /**
   * Resolve question_type_id from unique_name to actual database id
   */
  function resolveQuestionTypeId(uniqueName: string): string {
    const id = questionTypeMap.value.get(uniqueName);
    if (!id) {
      console.warn(`Unknown question type: ${uniqueName}, using as-is`);
      return uniqueName;
    }
    return id;
  }

  /**
   * Create form with all questions and steps
   */
  async function createFormWithSteps(
    params: CreateFormWithStepsParams
  ): Promise<CreateFormWithStepsResult | null> {
    if (isCreating.value) return null;
    if (!currentOrganizationId.value || !currentUserId.value) {
      error.value = 'Missing organization or user context';
      return null;
    }

    isCreating.value = true;
    error.value = null;

    try {
      // 1. Create the form
      const form = await createForm({
        form: {
          name: params.conceptName,
          product_name: params.conceptName,
          product_description: params.description,
          organization_id: currentOrganizationId.value,
          created_by: currentUserId.value,
        },
      });

      if (!form) {
        throw new Error('Failed to create form');
      }

      // 2. Create form_questions
      const questionInputs = params.questions.map((q, index) => ({
        form_id: form.id,
        organization_id: currentOrganizationId.value,
        question_type_id: resolveQuestionTypeId(q.question_type_id),
        question_key: q.question_key,
        question_text: q.question_text,
        placeholder: q.placeholder,
        help_text: q.help_text,
        display_order: index + 1,
        is_required: q.is_required,
        is_active: true,
      }));

      const createdQuestions = await createFormQuestions({
        inputs: questionInputs,
      });

      if (!createdQuestions || createdQuestions.length === 0) {
        throw new Error('Failed to create questions');
      }

      // 3. Create form_steps
      const stepInputs = buildFormSteps(
        form.id,
        currentOrganizationId.value!,
        currentUserId.value!,
        params.conceptName,
        createdQuestions,
        params.questions
      );

      const createdSteps = await createFormSteps({
        inputs: stepInputs,
      });

      if (!createdSteps || createdSteps.length === 0) {
        throw new Error('Failed to create steps');
      }

      return {
        formId: form.id,
        formName: form.name,
      };
    } catch (e) {
      error.value = getErrorMessage(e);
      console.error('Failed to create form with steps:', e);
      return null;
    } finally {
      isCreating.value = false;
    }
  }

  /**
   * Build form steps array for insertion
   */
  function buildFormSteps(
    formId: string,
    organizationId: string,
    userId: string,
    conceptName: string,
    createdQuestions: readonly { id: string; question_type_id: string }[],
    originalQuestions: DeepReadonly<AIQuestion[]>
  ) {
    const steps: Array<{
      form_id: string;
      organization_id: string;
      created_by: string;
      step_type: string;
      step_order: number;
      question_id: string | null;
      content: Record<string, unknown>;
      is_active: boolean;
    }> = [];

    let order = 0;

    // Welcome step
    const welcomeContent = getDefaultWelcomeContent(conceptName);
    steps.push({
      form_id: formId,
      organization_id: organizationId,
      created_by: userId,
      step_type: 'welcome',
      step_order: order++,
      question_id: null,
      content: welcomeContent,
      is_active: true,
    });

    // Question/Rating steps
    for (let i = 0; i < createdQuestions.length; i++) {
      const createdQuestion = createdQuestions[i];
      const originalQuestion = originalQuestions[i];

      // Determine step type based on question type
      const isRating = originalQuestion.question_type_id.startsWith('rating');
      const stepType = isRating ? 'rating' : 'question';

      steps.push({
        form_id: formId,
        organization_id: organizationId,
        created_by: userId,
        step_type: stepType,
        step_order: order++,
        question_id: createdQuestion.id,
        content: {},
        is_active: true,
      });
    }

    // Thank you step
    const thankYouContent = getDefaultThankYouContent();
    steps.push({
      form_id: formId,
      organization_id: organizationId,
      created_by: userId,
      step_type: 'thank_you',
      step_order: order++,
      question_id: null,
      content: thankYouContent,
      is_active: true,
    });

    return steps;
  }

  return {
    createFormWithSteps,
    isCreating: readonly(isCreating),
    error: readonly(error),
  };
}
