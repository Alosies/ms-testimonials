import { ref, toRefs, computed, readonly, type DeepReadonly } from 'vue';
import { getErrorMessage } from '@/shared/api';
import type { AIQuestion, StepContent, FlowMembership } from '@/shared/api';
import type { WizardAIContext } from './useFormWizard';
import { useCreateForm, useUpdateForm, serializeBranchingConfig } from '@/entities/form';
import type { BranchingConfig } from '@/entities/form';
import { useCreateFlows } from '@/entities/flow';
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
  const { updateForm } = useUpdateForm();
  const { createFlows } = useCreateFlows();
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

      // 2. Create shared flow for the form
      // Note: Branch flows require branch_question_id which references a question.
      // The database constraint chk_flows_condition_completeness enforces this.
      // For now, we only create the shared flow. FE-003 will add branch flow creation
      // after questions are created.
      const sharedFlowInput = {
        form_id: form.id,
        organization_id: currentOrganizationId.value,
        name: 'Shared Steps',
        flow_type: 'shared',
        display_order: 0,
        branch_question_id: null,
        branch_field: null,
        branch_operator: null,
        branch_value: null,
      };

      const createdFlows = await createFlows({ inputs: [sharedFlowInput] });

      if (!createdFlows || createdFlows.length !== 1) {
        throw new Error('Failed to create shared flow');
      }

      // Create a map of flow membership to flow_id
      // TODO (FE-003): Add testimonial and improvement flows after questions are created
      const flowMap = new Map<string, string>();
      flowMap.set('shared', createdFlows[0].id);
      // Temporarily map branch flows to shared flow until FE-003 is implemented
      flowMap.set('testimonial', createdFlows[0].id);
      flowMap.set('improvement', createdFlows[0].id);

      // 3. Create form_questions
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

      // 4. Create form_steps with branching support
      const stepInputs = buildFormSteps(
        form.id,
        currentOrganizationId.value!,
        currentUserId.value!,
        params.conceptName,
        createdQuestions,
        params.questions,
        params.aiContext?.step_content ?? null,
        flowMap
      );

      const createdSteps = await createFormSteps({
        inputs: stepInputs,
      });

      if (!createdSteps || createdSteps.length === 0) {
        throw new Error('Failed to create steps');
      }

      // 5. Set branching_config on form with rating step ID
      // Find the rating step index from stepInputs
      const ratingStepIndex = stepInputs.findIndex(s => s.step_type === 'rating');
      if (ratingStepIndex >= 0) {
        const ratingStepId = createdSteps[ratingStepIndex]?.id;
        if (ratingStepId) {
          const branchingConfig: BranchingConfig = {
            enabled: true,
            threshold: 4,
            ratingStepId,
          };
          await updateForm({
            id: form.id,
            changes: {
              branching_config: serializeBranchingConfig(branchingConfig),
            },
          });
        }
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
    flow_id: string;
    flow_membership: FlowMembership;
    is_active: boolean;
  }

  /**
   * Build form steps array for insertion with branching support
   *
   * Creates steps with proper flow_id:
   * - Shared: welcome + questions before/including branch point
   * - Testimonial: questions after branch + consent + thank_you
   * - Improvement: questions after branch + thank_you
   *
   * Uses per-flow step_order: UNIQUE(form_id, flow_id, step_order)
   */
  function buildFormSteps(
    formId: string,
    organizationId: string,
    userId: string,
    conceptName: string,
    createdQuestions: readonly { id: string; question_type_id: string }[],
    originalQuestions: DeepReadonly<AIQuestion[]>,
    stepContent: DeepReadonly<StepContent> | null,
    flowMap: Map<string, string>
  ): FormStepInput[] {
    const steps: FormStepInput[] = [];

    // Per-flow step ordering (each flow starts at 0)
    const flowStepOrder = {
      shared: 0,
      testimonial: 0,
      improvement: 0,
    };

    // Helper to create a step with per-flow ordering
    const createStep = (
      stepType: string,
      flowMembership: FlowMembership,
      content: Record<string, unknown>,
      questionId: string | null = null
    ): FormStepInput => {
      const flowId = flowMap.get(flowMembership);
      if (!flowId) {
        throw new Error(`Flow not found for membership: ${flowMembership}`);
      }
      return {
        form_id: formId,
        organization_id: organizationId,
        created_by: userId,
        step_type: stepType,
        step_order: flowStepOrder[flowMembership]++,
        question_id: questionId,
        content,
        flow_id: flowId,
        flow_membership: flowMembership,
        is_active: true,
      };
    };

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
