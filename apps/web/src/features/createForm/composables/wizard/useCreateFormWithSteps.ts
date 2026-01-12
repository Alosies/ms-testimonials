import { ref, toRefs, computed, readonly, type DeepReadonly } from 'vue';
import { getErrorMessage } from '@/shared/api';
import type { AIQuestion, StepContent, FlowMembership } from '@/shared/api';
import type { WizardAIContext } from './useFormWizard';
import { useCreateForm, useUpdateForm, serializeBranchingConfig } from '@/entities/form';
import type { BranchingConfig } from '@/entities/form';
import { useCreateFlows } from '@/entities/flow';
import type { BranchValue, ResponseField, BranchOperator } from '@/entities/flow';
import { useCreateFormQuestions } from '@/entities/formQuestion';
import { useCreateFormSteps, useUpdateFormStepAutoSave } from '@/entities/formStep';
import { useGetQuestionTypes } from '@/entities/questionType';
import { useCurrentContextStore } from '@/shared/currentContext';
import {
  getDefaultWelcomeContent,
  getDefaultThankYouContent,
} from '../../constants/wizardConfig';

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
 * ADR-013 + constraint-aware Creation Order:
 * 1. Create form
 * 2. Create ONLY shared flow (is_primary = true) - branch flows created later
 * 3. Create ALL steps pointing to shared flow temporarily
 * 4. Create questions with step_id
 * 5. Create branch flows WITH branch_question_id (constraint satisfied!)
 * 6. Update branch steps to point to their actual branch flows
 * 7. Update form branching_config
 */
export function useCreateFormWithSteps() {
  const { createForm } = useCreateForm();
  const { updateForm } = useUpdateForm();
  const { createFlows } = useCreateFlows();
  const { createFormQuestions } = useCreateFormQuestions();
  const { createFormSteps } = useCreateFormSteps();
  const { updateFormStepAutoSave } = useUpdateFormStepAutoSave();
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

      // 2. Find rating question index for branching
      const ratingQuestionIndex = params.questions.findIndex(
        q => q.question_type_id.startsWith('rating')
      );
      const hasRatingQuestion = ratingQuestionIndex >= 0;
      const DEFAULT_THRESHOLD = 4;

      // 3. Create ONLY shared flow initially (branch flows need question_id which doesn't exist yet)
      const sharedFlowInput = {
        form_id: form.id,
        organization_id: currentOrganizationId.value,
        name: 'Shared Steps',
        flow_type: 'shared',
        display_order: 0,
        branch_question_id: null,
        branch_field: null as ResponseField | null,
        branch_operator: null as BranchOperator | null,
        branch_value: null as BranchValue,
        is_primary: true,
      };

      const [sharedFlow] = await createFlows({ inputs: [sharedFlowInput] }) ?? [];

      if (!sharedFlow) {
        throw new Error('Failed to create shared flow');
      }

      // 4. Build step inputs - ALL steps point to shared flow initially
      // We'll update branch flow steps after creating branch flows
      const stepInputs = buildFormSteps(
        currentOrganizationId.value!,
        currentUserId.value!,
        params.conceptName,
        params.questions,
        params.aiContext?.step_content ?? null,
        sharedFlow.id // All steps go to shared flow initially
      );

      // 5. Create steps (ADR-013 order: step → question)
      // Strip internal tracking fields before sending to API
      const apiStepInputs = stepInputs.map(({ _originalQuestionIndex, _flowMembership, _intendedStepOrder, ...rest }) => rest);
      const createdSteps = await createFormSteps({
        inputs: apiStepInputs,
      });

      if (!createdSteps || createdSteps.length === 0) {
        throw new Error('Failed to create steps');
      }

      // 6. Create questions with step_id (ADR-013: questions reference steps)
      const questionStepMap = new Map<number, string>(); // originalQuestionIndex -> stepId

      for (let stepIdx = 0; stepIdx < stepInputs.length; stepIdx++) {
        const stepInput = stepInputs[stepIdx];
        if (stepInput.step_type === 'question' || stepInput.step_type === 'rating') {
          const originalQuestionIdx = stepInput._originalQuestionIndex;
          if (originalQuestionIdx !== undefined) {
            questionStepMap.set(originalQuestionIdx, createdSteps[stepIdx].id);
          }
        }
      }

      // Build question inputs with step_id
      const questionInputs = params.questions.map((q, index) => {
        const stepId = questionStepMap.get(index);
        if (!stepId) {
          throw new Error(`No step found for question index ${index}`);
        }
        return {
          step_id: stepId,
          organization_id: currentOrganizationId.value,
          question_type_id: resolveQuestionTypeId(q.question_type_id),
          question_key: q.question_key,
          question_text: q.question_text,
          placeholder: q.placeholder,
          help_text: q.help_text,
          display_order: index + 1,
          is_required: q.is_required,
          is_active: true,
        };
      });

      const createdQuestions = await createFormQuestions({
        inputs: questionInputs,
      });

      if (!createdQuestions || createdQuestions.length === 0) {
        throw new Error('Failed to create questions');
      }

      // 7. Now create branch flows WITH branch_question_id (constraint satisfied!)
      let testimonialFlow: { id: string } | null = null;
      let improvementFlow: { id: string } | null = null;

      if (hasRatingQuestion) {
        const ratingQuestion = createdQuestions[ratingQuestionIndex];
        if (ratingQuestion) {
          const branchFlowInputs = [
            // Testimonial flow (rating >= threshold)
            {
              form_id: form.id,
              organization_id: currentOrganizationId.value,
              name: 'Testimonial Flow',
              flow_type: 'branch',
              display_order: 1,
              branch_question_id: ratingQuestion.id, // Now we have the question!
              branch_field: 'answer_integer' as ResponseField,
              branch_operator: 'greater_than_or_equal_to' as BranchOperator,
              branch_value: { type: 'number', value: DEFAULT_THRESHOLD } as BranchValue,
              is_primary: false,
            },
            // Improvement flow (rating < threshold)
            {
              form_id: form.id,
              organization_id: currentOrganizationId.value,
              name: 'Improvement Flow',
              flow_type: 'branch',
              display_order: 2,
              branch_question_id: ratingQuestion.id, // Now we have the question!
              branch_field: 'answer_integer' as ResponseField,
              branch_operator: 'less_than' as BranchOperator,
              branch_value: { type: 'number', value: DEFAULT_THRESHOLD } as BranchValue,
              is_primary: false,
            },
          ];

          const branchFlows = await createFlows({ inputs: branchFlowInputs });

          if (branchFlows && branchFlows.length === 2) {
            testimonialFlow = branchFlows.find(
              f => f.branch_operator === 'greater_than_or_equal_to'
            ) ?? null;
            improvementFlow = branchFlows.find(
              f => f.branch_operator === 'less_than'
            ) ?? null;
          }
        }
      }

      // 8. Update branch steps to point to their actual branch flows with correct step_order
      if (testimonialFlow && improvementFlow) {
        const updatePromises: Promise<unknown>[] = [];

        for (let stepIdx = 0; stepIdx < stepInputs.length; stepIdx++) {
          const stepInput = stepInputs[stepIdx];
          const createdStep = createdSteps[stepIdx];

          if (stepInput._flowMembership === 'testimonial') {
            updatePromises.push(
              updateFormStepAutoSave({
                id: createdStep.id,
                changes: {
                  flow_id: testimonialFlow.id,
                  step_order: stepInput._intendedStepOrder ?? 0,
                },
              })
            );
          } else if (stepInput._flowMembership === 'improvement') {
            updatePromises.push(
              updateFormStepAutoSave({
                id: createdStep.id,
                changes: {
                  flow_id: improvementFlow.id,
                  step_order: stepInput._intendedStepOrder ?? 0,
                },
              })
            );
          }
        }

        if (updatePromises.length > 0) {
          await Promise.all(updatePromises);
        }
      }

      // 9. Set branching_config on form with rating step ID
      const ratingStepIndex = stepInputs.findIndex(s => s.step_type === 'rating');
      if (ratingStepIndex >= 0) {
        const ratingStepId = createdSteps[ratingStepIndex]?.id;
        if (ratingStepId) {
          const branchingConfig: BranchingConfig = {
            enabled: true,
            threshold: DEFAULT_THRESHOLD,
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
   * Step input type for creating form steps (ADR-013: no question_id)
   */
  interface FormStepInput {
    organization_id: string;
    created_by: string;
    step_type: string;
    step_order: number;
    content: Record<string, unknown>;
    flow_id: string;
    flow_membership: FlowMembership;
    is_active: boolean;
    _originalQuestionIndex?: number; // Internal tracking, not sent to API
    _flowMembership?: FlowMembership; // Internal: actual intended flow membership
    _intendedStepOrder?: number; // Internal: step_order within intended flow
  }

  /**
   * Build form steps array for insertion with branching support
   *
   * ADR-013: Steps no longer have question_id - questions reference steps
   *
   * All steps initially point to sharedFlowId. Branch flow steps will be
   * updated to their actual flow_id after branch flows are created.
   */
  function buildFormSteps(
    organizationId: string,
    userId: string,
    conceptName: string,
    originalQuestions: DeepReadonly<AIQuestion[]>,
    stepContent: DeepReadonly<StepContent> | null,
    sharedFlowId: string // All steps go here initially
  ): FormStepInput[] {
    const steps: FormStepInput[] = [];

    // Global step order counter - ALL steps go to shared flow initially
    // so we need unique step_order values across the entire form
    let globalStepOrder = 0;

    // Also track per-flow ordering for when steps get moved to their actual flows
    const flowStepOrder = {
      shared: 0,
      testimonial: 0,
      improvement: 0,
    };

    // Helper to create a step
    // Uses global order for initial creation, stores intended flow order for later update
    const createStep = (
      stepType: string,
      flowMembership: FlowMembership,
      content: Record<string, unknown>,
      originalQuestionIndex?: number
    ): FormStepInput => {
      const intendedOrder = flowStepOrder[flowMembership]++;
      return {
        organization_id: organizationId,
        created_by: userId,
        step_type: stepType,
        step_order: globalStepOrder++, // Use global order for shared flow
        content,
        flow_id: sharedFlowId, // All go to shared initially
        flow_membership: flowMembership,
        is_active: true,
        _originalQuestionIndex: originalQuestionIndex,
        _flowMembership: flowMembership, // Track actual intended flow
        _intendedStepOrder: intendedOrder, // Track intended order within actual flow
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
    for (let i = 0; i < originalQuestions.length; i++) {
      const originalQuestion = originalQuestions[i];
      if (originalQuestion.flow_membership !== 'shared') continue;

      const isRating = originalQuestion.question_type_id.startsWith('rating');
      const stepType = isRating ? 'rating' : 'question';

      steps.push(createStep(stepType, 'shared', {}, i));
    }

    // =========================================================================
    // 3. Testimonial flow steps
    // =========================================================================

    // 3a. Testimonial questions
    for (let i = 0; i < originalQuestions.length; i++) {
      const originalQuestion = originalQuestions[i];
      if (originalQuestion.flow_membership !== 'testimonial') continue;

      steps.push(createStep('question', 'testimonial', {}, i));
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
    for (let i = 0; i < originalQuestions.length; i++) {
      const originalQuestion = originalQuestions[i];
      if (originalQuestion.flow_membership !== 'improvement') continue;

      steps.push(createStep('question', 'improvement', {}, i));
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
