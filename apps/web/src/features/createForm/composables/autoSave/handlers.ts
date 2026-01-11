/**
 * Auto-Save Handlers
 *
 * Factory functions that create save handlers with pre-bound mutation functions.
 * This pattern is required because GraphQL composables must be called during
 * Vue component setup, not inside async callbacks.
 *
 * Usage:
 * - Call create*Handler() during setup to get a handler function
 * - The returned handler can be called anytime with dirty entity IDs
 *
 * Note: These handlers look up current entity data from the timeline editor state.
 */

import type { useUpdateFormAutoSave } from '@/entities/form';
import type { useUpdateFormQuestion } from '@/entities/formQuestion';
import type { useUpsertFormSteps } from '@/entities/formStep';
import { useTimelineEditor } from '../timeline/useTimelineEditor';

// Type aliases for mutation functions
type UpdateFormAutoSaveFn = ReturnType<typeof useUpdateFormAutoSave>['updateFormAutoSave'];
type UpdateFormQuestionFn = ReturnType<typeof useUpdateFormQuestion>['updateFormQuestion'];
type UpsertFormStepsFn = ReturnType<typeof useUpsertFormSteps>['upsertFormSteps'];

/**
 * Create form info save handler
 *
 * Saves: name, product_name, product_description
 *
 * Note: Currently uses formContext which is read-only.
 * The form name is managed separately in useFormStudioData.
 * Full form info saving requires shared form state implementation.
 */
export const createFormInfoHandler = (updateFormAutoSave: UpdateFormAutoSaveFn) => {
  const editor = useTimelineEditor();

  return async (formId: string) => {
    const context = editor.formContext.value;
    if (!context.productName && !context.productDescription) {
      return; // Nothing to save
    }

    await updateFormAutoSave({
      id: formId,
      changes: {
        product_name: context.productName ?? '',
        product_description: context.productDescription ?? '',
        // Note: form name is managed separately in useFormStudioData
      },
    });
  };
};

/**
 * Create question text fields save handler
 *
 * Saves: question_text, placeholder, help_text, scale_min_label, scale_max_label
 *
 * Looks up questions from all steps in the timeline editor.
 */
export const createQuestionsHandler = (updateFormQuestion: UpdateFormQuestionFn) => {
  const editor = useTimelineEditor();

  return async (questionIds: Set<string>) => {
    if (questionIds.size === 0) return;

    // Get all questions from steps
    const allQuestions = editor.steps.value
      .filter((step) => step.question)
      .map((step) => step.question!);

    // Filter to only dirty questions
    const toSave = allQuestions.filter((q) => questionIds.has(q.id));
    if (toSave.length === 0) return;

    // Save each question's text fields
    for (const question of toSave) {
      await updateFormQuestion({
        id: question.id,
        input: {
          question_text: question.questionText,
          placeholder: question.placeholder,
          help_text: question.helpText,
          scale_min_label: question.scaleMinLabel,
          scale_max_label: question.scaleMaxLabel,
        },
      });
    }
  };
};

/**
 * Create option text fields save handler (stub)
 *
 * Saves: option_label, option_value
 *
 * TODO: Currently no mutation composable exists for question_options.
 * The GraphQL schema has update_question_options mutations.
 * A useUpdateQuestionOptions composable needs to be created in the questionOption entity.
 *
 * For now, this handler logs a warning and skips saving.
 * Options are currently saved as part of the step save process.
 */
export const createOptionsHandler = () => {
  return async (optionIds: Set<string>) => {
    if (optionIds.size === 0) return;

    // TODO: Implement when useUpdateQuestionOptions composable is created
    console.warn(
      '[AutoSave] Option saving not yet implemented. Options will be saved with next step save.',
      `Dirty option IDs: ${[...optionIds].join(', ')}`
    );
  };
};

/**
 * Create step tips save handler
 *
 * Saves: tips (string array)
 *
 * Uses the existing useUpsertFormSteps mutation which handles
 * updating step data including tips.
 */
export const createStepsHandler = (upsertFormSteps: UpsertFormStepsFn) => {
  const editor = useTimelineEditor();

  return async (stepIds: Set<string>, organizationId: string) => {
    if (stepIds.size === 0) return;

    // Filter to only dirty steps
    const toSave = editor.steps.value.filter((s) => stepIds.has(s.id));
    if (toSave.length === 0) return;

    // Build inputs for upsert - only include tips field for auto-save
    const inputs = toSave.map((step) => ({
      id: step.id,
      form_id: step.formId,
      organization_id: organizationId,
      step_type: step.stepType,
      step_order: step.stepOrder,
      question_id: step.questionId ?? null,
      content: step.content as Record<string, unknown>,
      tips: [...step.tips],
      flow_id: step.flowId ?? null,
      flow_membership: step.flowMembership,
      is_active: step.isActive,
    }));

    await upsertFormSteps({ inputs });

    // Mark steps as saved
    for (const step of toSave) {
      editor.markStepSaved(step.id);
    }
  };
};

/**
 * Create flow name save handler (stub)
 *
 * Saves: name
 *
 * Note: Flow names are not currently editable in the Form Studio UI.
 * This handler is prepared for when flow name editing is implemented.
 */
export const createFlowsHandler = () => {
  return async (flowIds: Set<string>) => {
    if (flowIds.size === 0) return;

    // TODO: When flow name editing is added, implement:
    // 1. Get flow data from shared flow state
    // 2. Filter to dirty flow IDs
    // 3. Call updateFlow for each
    //
    // For now, flows are not editable in the studio UI

    console.warn(
      '[AutoSave] Flow name saving not implemented - flows not editable in current UI.',
      `Dirty flow IDs: ${[...flowIds].join(', ')}`
    );
  };
};
