/**
 * Save Form Steps - Handles persisting form steps and branching config
 *
 * This composable coordinates saving:
 * 1. Branching config to the forms table
 * 2. Form steps with flow_id assignment (ADR-009 Phase 2)
 * 3. New improvement flow steps when branching is enabled
 * 4. Deletion of improvement flow steps when branching is disabled
 * 5. Creating question records for question/rating steps that need them
 *
 * Updated for ADR-009 Phase 2: Persists flow_id instead of flow_membership.
 * flow_membership is derived from flow.flow_type on load.
 */
import { ref, computed } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { useUpdateForm } from '@/entities/form';
import { useUpsertFormSteps, useDeleteFormSteps } from '@/entities/formStep';
import { useCreateFormQuestion } from '@/entities/formQuestion';
import { useGetQuestionTypes } from '@/entities/questionType';
import { useClearFlowBranchColumns, useDeleteFlow } from '@/entities/flow';
import { useTimelineEditor } from './useTimelineEditor';
import { serializeBranchingConfig } from '@/entities/form';

export const useSaveFormSteps = createSharedComposable(() => {
  const editor = useTimelineEditor();
  const { updateForm, loading: formLoading } = useUpdateForm();
  const { upsertFormSteps, loading: upsertLoading } = useUpsertFormSteps();
  const { deleteFormSteps, loading: deleteLoading } = useDeleteFormSteps();
  const { createFormQuestion, loading: questionLoading } = useCreateFormQuestion();
  const { clearFlowBranchColumns, loading: clearBranchLoading } = useClearFlowBranchColumns();
  const { deleteFlow, loading: deleteFlowLoading } = useDeleteFlow();
  const { questionTypes } = useGetQuestionTypes();

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

  // Save state
  const isSaving = ref(false);
  const saveError = ref<string | null>(null);
  const lastSavedAt = ref<Date | null>(null);

  // Track additional IDs of steps that have been manually deleted (not just from disableBranching)
  const manuallyDeletedStepIds = ref<string[]>([]);

  /**
   * Compute deleted step IDs by comparing original steps with current steps
   * This automatically detects steps removed via disableBranching or other means
   */
  const deletedStepIds = computed(() => {
    // Get IDs from original steps (these are the ones that exist in DB)
    const originalIds = new Set(
      editor.originalSteps.value
        .filter(s => !s.id.startsWith('temp_'))
        .map(s => s.id),
    );

    // Get current step IDs
    const currentIds = new Set(
      editor.steps.value
        .filter(s => !s.id.startsWith('temp_'))
        .map(s => s.id),
    );

    // Find IDs that were in original but not in current
    const autoDetectedDeleted = [...originalIds].filter(id => !currentIds.has(id));

    // Combine with manually tracked deletions (deduplicated)
    const allDeleted = new Set([...autoDetectedDeleted, ...manuallyDeletedStepIds.value]);
    return [...allDeleted].filter(id => !id.startsWith('temp_'));
  });

  // Combined loading state
  const isLoading = computed(() =>
    isSaving.value || formLoading.value || upsertLoading.value || deleteLoading.value || questionLoading.value || clearBranchLoading.value || deleteFlowLoading.value,
  );

  /**
   * Default question configurations for steps that need questions created
   */
  const DEFAULT_QUESTIONS: Record<string, { questionType: string; questionText: string; questionKey: string }> = {
    improvement_question: {
      questionType: 'text_long',
      questionText: 'What could we improve?',
      questionKey: 'improvement_feedback',
    },
  };

  /**
   * Create form_questions database records for new question/rating steps.
   * Required because the database constraint enforces question_id NOT NULL
   * for question/rating step types.
   */
  async function createQuestionRecordsForNewSteps(
    organizationId: string,
    _userId?: string,
  ): Promise<Map<string, string>> {
    const stepToQuestionMap = new Map<string, string>();
    const formId = editor.currentFormId.value;

    if (!formId) return stepToQuestionMap;

    // Find question/rating steps that need questions created
    const stepsNeedingQuestions = editor.steps.value.filter(step =>
      (step.stepType === 'question' || step.stepType === 'rating') &&
      !step.questionId &&
      step.isNew,
    );

    if (stepsNeedingQuestions.length === 0) {
      return stepToQuestionMap;
    }

    // Get the text_long question type ID for improvement questions
    const textLongTypeId = getQuestionTypeId('text_long');
    if (!textLongTypeId) {
      console.error('Could not find text_long question type');
      return stepToQuestionMap;
    }

    // Create questions for each step that needs one
    for (const step of stepsNeedingQuestions) {
      try {
        // Determine question config based on flow membership
        const config = step.flowMembership === 'improvement'
          ? DEFAULT_QUESTIONS.improvement_question
          : {
            questionType: 'text_long',
            questionText: 'Please share your feedback',
            questionKey: `feedback_${step.stepOrder}`,
          };

        const questionTypeId = getQuestionTypeId(config.questionType) ?? textLongTypeId;

        const result = await createFormQuestion({
          input: {
            form_id: formId,
            organization_id: organizationId,
            question_type_id: questionTypeId,
            question_key: `${config.questionKey}_${Date.now()}`,
            question_text: config.questionText,
            display_order: step.stepOrder,
            is_required: false,
            is_active: true,
          },
        });

        if (result?.id) {
          stepToQuestionMap.set(step.id, result.id);
          // Update the step's questionId in the editor
          const stepIndex = editor.steps.value.findIndex(s => s.id === step.id);
          if (stepIndex >= 0) {
            editor.updateStep(stepIndex, { questionId: result.id });
          }
        }
      } catch (err) {
        console.error(`Failed to create question for step ${step.id}:`, err);
        // Continue with other steps even if one fails
      }
    }

    return stepToQuestionMap;
  }

  /**
   * Mark a step ID as deleted (for manual deletions not captured by originalSteps comparison)
   */
  function markStepDeleted(stepId: string) {
    // Only track real step IDs (not temp IDs)
    if (!stepId.startsWith('temp_') && !manuallyDeletedStepIds.value.includes(stepId)) {
      manuallyDeletedStepIds.value.push(stepId);
    }
  }

  /**
   * Clear manually tracked deletions after successful save
   */
  function clearDeletedSteps() {
    manuallyDeletedStepIds.value = [];
  }

  /**
   * Step data required for mapping to database input
   * Explicitly typed to avoid readonly issues
   *
   * Updated for ADR-009 Phase 2: Includes flowId for persistence.
   */
  interface StepForMapping {
    id: string;
    formId: string;
    stepType: string;
    stepOrder: number;
    questionId?: string | null;
    content: Record<string, unknown>;
    tips: string[];
    flowId?: string;
    flowMembership: string;
    isActive: boolean;
    isNew?: boolean;
  }

  /**
   * Convert FormStep to form_steps_insert_input format
   *
   * Updated for ADR-009 Phase 2: Includes flow_id for step-flow assignment.
   * flow_membership is kept for backward compatibility but flow_id is the source of truth.
   */
  function mapStepToInput(step: StepForMapping, organizationId: string, userId?: string) {
    return {
      id: step.id.startsWith('temp_') ? undefined : step.id,
      form_id: step.formId,
      organization_id: organizationId,
      step_type: step.stepType,
      step_order: step.stepOrder,
      question_id: step.questionId || null,
      content: step.content || {},
      tips: step.tips || [],
      // ADR-009 Phase 2: flow_id is the source of truth for step-flow assignment
      flow_id: step.flowId || null,
      // Keep flow_membership for backward compatibility during migration
      flow_membership: step.flowMembership,
      is_active: step.isActive,
      created_by: step.isNew ? userId : undefined,
      updated_by: userId,
    };
  }

  /**
   * Save branching config to forms table
   */
  async function saveBranchingConfig(): Promise<boolean> {
    const formId = editor.currentFormId.value;
    if (!formId) {
      saveError.value = 'No form ID available';
      return false;
    }

    try {
      const branchingConfig = serializeBranchingConfig(editor.branchingConfig.value);
      const result = await updateForm({
        id: formId,
        changes: {
          branching_config: branchingConfig,
        },
      });

      return result !== null;
    } catch (err) {
      saveError.value = err instanceof Error ? err.message : 'Failed to save branching config';
      return false;
    }
  }

  /**
   * Save all form steps (upsert pattern)
   */
  async function saveSteps(organizationId: string, userId?: string): Promise<boolean> {
    const steps = editor.steps.value;
    if (steps.length === 0) {
      return true;
    }

    try {
      // Filter to only steps that need saving (new or modified)
      // Extract only the properties we need to avoid readonly issues
      // ADR-009 Phase 2: Include flowId for persistence
      const stepsToSave = steps
        .filter(step => step.isNew || step.isModified)
        .map(step => ({
          id: step.id,
          formId: step.formId,
          stepType: step.stepType,
          stepOrder: step.stepOrder,
          questionId: step.questionId,
          content: step.content as Record<string, unknown>,
          tips: [...(step.tips || [])],
          flowId: step.flowId,
          flowMembership: step.flowMembership,
          isActive: step.isActive,
          isNew: step.isNew,
        }));

      if (stepsToSave.length === 0) {
        return true;
      }

      const inputs = stepsToSave.map(step => mapStepToInput(step, organizationId, userId));

      const result = await upsertFormSteps({ inputs });

      if (result && result.length > 0) {
        // Update local step IDs for newly created steps using editor methods
        result.forEach(savedStep => {
          // Find matching step by ID or by step_order for new steps
          const matchingStep = stepsToSave.find(s =>
            s.id === savedStep.id ||
            (s.isNew && s.stepOrder === savedStep.step_order),
          );

          if (matchingStep) {
            if (matchingStep.id.startsWith('temp_')) {
              // New step - update ID via editor method
              editor.markStepSavedByOrder(savedStep.step_order, savedStep.id);
            } else {
              // Existing step - just mark as saved
              editor.markStepSaved(savedStep.id);
            }
          }
        });
        return true;
      }

      return false;
    } catch (err) {
      saveError.value = err instanceof Error ? err.message : 'Failed to save steps';
      return false;
    }
  }

  /**
   * Delete steps that were removed during editing
   */
  async function deleteRemovedSteps(): Promise<boolean> {
    // deletedStepIds is already filtered to exclude temp_ IDs
    const idsToDelete = deletedStepIds.value;

    if (idsToDelete.length === 0) {
      return true;
    }

    try {
      const result = await deleteFormSteps({ ids: idsToDelete });
      // Clear manually tracked deletions (auto-detected ones will clear when originalSteps updates)
      clearDeletedSteps();
      return result.affectedRows >= 0; // Success even if 0 (steps might already be deleted)
    } catch (err) {
      saveError.value = err instanceof Error ? err.message : 'Failed to delete steps';
      return false;
    }
  }

  /**
   * Delete flows that have become empty after step deletions.
   * Only deletes branch flows (display_order > 0), never the shared flow (display_order 0).
   *
   * Logic:
   * 1. Find all unique flowIds that had steps in originalSteps
   * 2. Find all unique flowIds that have steps in current steps
   * 3. Flows that existed in original but not in current are now empty
   * 4. Delete those empty flows (except the shared flow)
   */
  async function deleteEmptyFlows(): Promise<boolean> {
    // Get the shared flow ID from context (this should never be deleted)
    const sharedFlowId = editor.formContext.value.flowIds?.shared;

    // Get all unique flowIds from original steps (steps that existed in DB)
    const originalFlowIds = new Set(
      editor.originalSteps.value
        .filter(s => s.flowId && !s.id.startsWith('temp_'))
        .map(s => s.flowId as string),
    );

    // Get all unique flowIds from current steps
    const currentFlowIds = new Set(
      editor.steps.value
        .filter(s => s.flowId)
        .map(s => s.flowId as string),
    );

    // Find flowIds that existed before but have no steps now
    const emptyFlowIds = [...originalFlowIds].filter(flowId => {
      // Skip the shared flow - never delete it
      if (flowId === sharedFlowId) return false;
      // Include if this flow no longer has any steps
      return !currentFlowIds.has(flowId);
    });

    if (emptyFlowIds.length === 0) {
      return true;
    }

    // Delete each empty flow
    try {
      for (const flowId of emptyFlowIds) {
        await deleteFlow({ flowId });
      }
      return true;
    } catch (err) {
      // Log but don't fail the save - empty flow cleanup is not critical
      console.error('Failed to delete empty flows:', err);
      return true; // Continue with save even if flow deletion fails
    }
  }

  /**
   * Save everything - branching config and all steps
   */
  async function saveAll(organizationId: string, userId?: string): Promise<boolean> {
    const formId = editor.currentFormId.value;
    if (!formId) {
      saveError.value = 'No form ID available';
      return false;
    }

    isSaving.value = true;
    saveError.value = null;

    try {
      // 1. Clear branch columns from flows before deleting steps
      // This prevents FK violations when deleting rating steps that are branch points
      // ADR-009 Phase 2: branch_question_id has ON DELETE RESTRICT
      if (deletedStepIds.value.length > 0) {
        await clearFlowBranchColumns(formId);
      }

      // 2. Delete any removed steps
      const deleteSuccess = await deleteRemovedSteps();
      if (!deleteSuccess) {
        return false;
      }

      // 3. Delete empty flows (flows with no remaining steps, except shared flow)
      // This must happen after step deletion to correctly identify empty flows
      await deleteEmptyFlows();

      // 4. Save branching config
      const configSuccess = await saveBranchingConfig();
      if (!configSuccess) {
        return false;
      }

      // 5. Create question records for new question/rating steps
      // This must happen BEFORE saving steps due to the question_id constraint
      await createQuestionRecordsForNewSteps(organizationId, userId);

      // 6. Save all steps (now with questionIds populated)
      const stepsSuccess = await saveSteps(organizationId, userId);
      if (!stepsSuccess) {
        return false;
      }

      // Mark editor as clean
      editor.markClean();
      lastSavedAt.value = new Date();

      return true;
    } catch (err) {
      saveError.value = err instanceof Error ? err.message : 'Unknown error during save';
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  /**
   * Check if there are any changes to save
   */
  const hasChangesToSave = computed(() => {
    return (
      editor.isDirty.value ||
      editor.steps.value.some(s => s.isNew || s.isModified) ||
      deletedStepIds.value.length > 0
    );
  });

  return {
    // State
    isSaving,
    isLoading,
    saveError,
    lastSavedAt,
    hasChangesToSave,
    deletedStepIds,

    // Methods
    markStepDeleted,
    clearDeletedSteps,
    saveBranchingConfig,
    saveSteps,
    deleteRemovedSteps,
    saveAll,
  };
});
