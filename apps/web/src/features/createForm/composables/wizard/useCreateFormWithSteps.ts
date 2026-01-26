import { ref, toRefs, computed, readonly, type DeepReadonly } from 'vue';
import { getErrorMessage } from '@/shared/api';
import type { AIQuestion } from '@/shared/api';
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
  buildStepsFromQuestions,
  stripInternalFields,
  mapQuestionsToSteps,
  getBranchFlowUpdates,
} from '../../functions';

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
 *
 * ADR-014: Uses buildStepsFromQuestions from functions layer for step building
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

      // 3. Create intro flow first (branch flows need question_id which doesn't exist yet)
      // ADR-009: Intro is a shared flow at display_order=0
      const introFlowInput = {
        form_id: form.id,
        organization_id: currentOrganizationId.value,
        name: 'Intro',
        flow_type: 'shared',
        display_order: 0,
        branch_question_id: null,
        branch_field: null as ResponseField | null,
        branch_operator: null as BranchOperator | null,
        branch_value: null as BranchValue,
        is_primary: true,
      };

      const [introFlow] = await createFlows({ inputs: [introFlowInput] }) ?? [];

      if (!introFlow) {
        throw new Error('Failed to create intro flow');
      }

      // 4. Build step inputs using extracted function (ADR-014)
      const { steps: stepInputs } = buildStepsFromQuestions({
        organizationId: currentOrganizationId.value!,
        userId: currentUserId.value!,
        conceptName: params.conceptName,
        questions: params.questions,
        stepContent: params.aiContext?.step_content ?? null,
        sharedFlowId: introFlow.id,
      });

      // 5. Create steps (ADR-013 order: step → question)
      // Strip internal tracking fields before sending to API
      const apiStepInputs = stripInternalFields(stepInputs);
      const createdSteps = await createFormSteps({
        inputs: apiStepInputs,
      });

      if (!createdSteps || createdSteps.length === 0) {
        throw new Error('Failed to create steps');
      }

      // 6. Create questions with step_id (ADR-013: questions reference steps)
      const questionStepMap = mapQuestionsToSteps(stepInputs, createdSteps);

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

      // 7b. ADR-009: Create ending flow (shared flow at display_order=3 for all users)
      const endingFlowInput = {
        form_id: form.id,
        organization_id: currentOrganizationId.value,
        name: 'Ending',
        flow_type: 'shared',
        display_order: 3,
        branch_question_id: null,
        branch_field: null as ResponseField | null,
        branch_operator: null as BranchOperator | null,
        branch_value: null as BranchValue,
        is_primary: false,
      };

      const [endingFlow] = await createFlows({ inputs: [endingFlowInput] }) ?? [];

      if (!endingFlow) {
        throw new Error('Failed to create ending flow');
      }

      // 8. Update branch/ending steps to point to their actual flows with correct step_order
      // ADR-009: Reassign steps from intro flow to their target flows
      const flowUpdates = getBranchFlowUpdates(
        stepInputs,
        createdSteps,
        testimonialFlow?.id ?? null,
        improvementFlow?.id ?? null,
        endingFlow.id
      );

      if (flowUpdates.length > 0) {
        await Promise.all(
          flowUpdates.map(update =>
            updateFormStepAutoSave({
              id: update.stepId,
              changes: {
                flow_id: update.flowId,
                step_order: update.stepOrder,
              },
            })
          )
        );
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

  return {
    createFormWithSteps,
    isCreating: readonly(isCreating),
    error: readonly(error),
  };
}
