import { ref, toRefs, computed, readonly, type DeepReadonly } from 'vue';
import { getErrorMessage } from '@/shared/api';
import type { AIQuestion, StepContent, FlowMembership } from '@/shared/api';
import type { WizardAIContext } from './useFormWizard';
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
  aiContext: DeepReadonly<WizardAIContext> | null;
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

      // 3. Create form_steps with branching support
      const stepInputs = buildFormSteps(
        form.id,
        currentOrganizationId.value!,
        currentUserId.value!,
        params.conceptName,
        createdQuestions,
        params.questions,
        params.aiContext?.step_content ?? null
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
   * Step input type for creating form steps
   */
  interface FormStepInput {
    form_id: string;
    organization_id: string;
    created_by: string;
    step_type: string;
    step_order: number;
    question_id: string | null;
    content: Record<string, unknown>;
    flow_membership: FlowMembership;
    is_active: boolean;
  }

  /**
   * Build form steps array for insertion with branching support
   *
   * Creates steps with proper flow_membership:
   * - Shared: welcome + questions before/including branch point
   * - Testimonial: questions after branch + consent + thank_you
   * - Improvement: questions after branch + thank_you
   *
   * Uses global step_order to satisfy UNIQUE(form_id, step_order) constraint
   */
  function buildFormSteps(
    formId: string,
    organizationId: string,
    userId: string,
    conceptName: string,
    createdQuestions: readonly { id: string; question_type_id: string }[],
    originalQuestions: DeepReadonly<AIQuestion[]>,
    stepContent: DeepReadonly<StepContent> | null
  ): FormStepInput[] {
    const steps: FormStepInput[] = [];
    let globalOrder = 0;

    // Helper to create a step
    const createStep = (
      stepType: string,
      flowMembership: FlowMembership,
      content: Record<string, unknown>,
      questionId: string | null = null
    ): FormStepInput => ({
      form_id: formId,
      organization_id: organizationId,
      created_by: userId,
      step_type: stepType,
      step_order: globalOrder++,
      question_id: questionId,
      content,
      flow_membership: flowMembership,
      is_active: true,
    });

    // =========================================================================
    // 1. Welcome step (shared)
    // =========================================================================
    const welcomeContent = getDefaultWelcomeContent(conceptName);
    steps.push(createStep('welcome', 'shared', welcomeContent));

    // =========================================================================
    // 2. Question/Rating steps grouped by flow_membership
    // =========================================================================

    // 2a. Shared questions (including branch point)
    for (let i = 0; i < createdQuestions.length; i++) {
      const originalQuestion = originalQuestions[i];
      if (originalQuestion.flow_membership !== 'shared') continue;

      const createdQuestion = createdQuestions[i];
      const isRating = originalQuestion.question_type_id.startsWith('rating');
      const stepType = isRating ? 'rating' : 'question';

      steps.push(createStep(stepType, 'shared', {}, createdQuestion.id));
    }

    // =========================================================================
    // 3. Testimonial flow steps
    // =========================================================================

    // 3a. Testimonial questions
    for (let i = 0; i < createdQuestions.length; i++) {
      const originalQuestion = originalQuestions[i];
      if (originalQuestion.flow_membership !== 'testimonial') continue;

      const createdQuestion = createdQuestions[i];
      steps.push(createStep('question', 'testimonial', {}, createdQuestion.id));
    }

    // 3b. Consent step (testimonial flow only)
    const consentContent = stepContent?.consent
      ? {
          title: stepContent.consent.title,
          description: stepContent.consent.description,
          options: {
            public: {
              label: stepContent.consent.public_label,
              description: stepContent.consent.public_description,
            },
            private: {
              label: stepContent.consent.private_label,
              description: stepContent.consent.private_description,
            },
          },
        }
      : {
          title: 'One last thing...',
          description: 'Would you like us to share your testimonial publicly?',
          options: {
            public: {
              label: 'Yes, share publicly',
              description: 'Your testimonial may be featured on our website',
            },
            private: {
              label: 'Keep it private',
              description: 'Only the team will see your feedback',
            },
          },
        };
    steps.push(createStep('consent', 'testimonial', consentContent));

    // 3c. Thank you step (testimonial flow)
    const testimonialThankYouContent = getDefaultThankYouContent();
    steps.push(createStep('thank_you', 'testimonial', testimonialThankYouContent));

    // =========================================================================
    // 4. Improvement flow steps
    // =========================================================================

    // 4a. Improvement questions
    for (let i = 0; i < createdQuestions.length; i++) {
      const originalQuestion = originalQuestions[i];
      if (originalQuestion.flow_membership !== 'improvement') continue;

      const createdQuestion = createdQuestions[i];
      steps.push(createStep('question', 'improvement', {}, createdQuestion.id));
    }

    // 4b. Thank you step (improvement flow)
    const improvementThankYouContent = stepContent?.improvement_thank_you
      ? {
          title: stepContent.improvement_thank_you.title,
          subtitle: stepContent.improvement_thank_you.message,
        }
      : {
          title: 'Thank you for your feedback',
          subtitle: 'We take your feedback seriously and will work to improve.',
        };
    steps.push(createStep('thank_you', 'improvement', improvementThankYouContent));

    return steps;
  }

  return {
    createFormWithSteps,
    isCreating: readonly(isCreating),
    error: readonly(error),
  };
}
