/**
 * Auto-Save Handlers
 *
 * Factory functions that create save handlers with pre-bound mutation functions.
 * This pattern is required because GraphQL composables must be called during
 * Vue component setup, not inside async callbacks.
 *
 * IMPORTANT: All handlers use UPDATE mutations with minimal response (id + updated_at only)
 * to prevent Apollo cache from overwriting local state. See ADR-003 and ADR-010.
 *
 * Usage:
 * - Call create*Handler() during setup to get a handler function
 * - The returned handler can be called anytime with dirty entity IDs
 *
 * Note: These handlers look up current entity data from the timeline editor state.
 */

import type { useUpdateFormAutoSave } from '@/entities/form';
import type { useUpdateFormQuestionAutoSave } from '@/entities/formQuestion';
import type { useUpdateFormStepAutoSave } from '@/entities/formStep';
import { useTimelineEditor } from '../timeline/useTimelineEditor';

// Type aliases for mutation functions (all use minimal response pattern)
type UpdateFormAutoSaveFn = ReturnType<typeof useUpdateFormAutoSave>['updateFormAutoSave'];
type UpdateFormQuestionAutoSaveFn = ReturnType<
  typeof useUpdateFormQuestionAutoSave
>['updateFormQuestionAutoSave'];
type UpdateFormStepAutoSaveFn = ReturnType<
  typeof useUpdateFormStepAutoSave
>['updateFormStepAutoSave'];

/**
 * Create form info save handler
 *
 * Saves: name, product_name, product_description
 * Uses: UpdateFormAutoSave (minimal response)
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
 * Uses: UpdateFormQuestionAutoSave (minimal response)
 *
 * Looks up questions from all steps in the timeline editor.
 */
export const createQuestionsHandler = (
  updateFormQuestionAutoSave: UpdateFormQuestionAutoSaveFn
) => {
  const editor = useTimelineEditor();

  return async (questionIds: Set<string>) => {
    if (questionIds.size === 0) return;

    // Build save entries: pairs of (stepId, question) for steps with dirty questions
    const saveEntries = editor.steps.value
      .filter((step) => step.question && questionIds.has(step.question.id))
      .map((step) => ({
        stepId: step.id,
        question: step.question, // Already filtered to ensure question exists
      }))
      .filter((entry): entry is { stepId: string; question: NonNullable<typeof entry.question> } =>
        entry.question !== undefined
      );

    if (saveEntries.length === 0) return;

    // Save each question's text fields using minimal response mutation
    await Promise.all(
      saveEntries.map(({ question }) =>
        updateFormQuestionAutoSave({
          id: question.id,
          changes: {
            question_text: question.questionText,
            placeholder: question.placeholder,
            help_text: question.helpText,
            scale_min_label: question.scaleMinLabel,
            scale_max_label: question.scaleMaxLabel,
          },
        })
      )
    );

    // Mark parent steps as saved to clear isModified flag
    for (const { stepId } of saveEntries) {
      editor.markStepSaved(stepId);
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
 * A useUpdateQuestionOptionAutoSave composable needs to be created.
 *
 * For now, this handler logs a warning and skips saving.
 */
export const createOptionsHandler = () => {
  return async (optionIds: Set<string>) => {
    if (optionIds.size === 0) return;

    // TODO: Implement when useUpdateQuestionOptionAutoSave composable is created
    console.warn(
      '[AutoSave] Option saving not yet implemented.',
      `Dirty option IDs: ${[...optionIds].join(', ')}`
    );
  };
};

/**
 * Create step content save handler
 *
 * Saves: tips (array), content (JSONB for welcome/thank_you/consent/etc.)
 * Uses: UpdateFormStepAutoSave (minimal response)
 *
 * IMPORTANT: Uses UPDATE mutation with minimal response, NOT upsert.
 * The upsert mutation returns fragments which would overwrite Apollo cache.
 */
export const createStepsHandler = (updateFormStepAutoSave: UpdateFormStepAutoSaveFn) => {
  const editor = useTimelineEditor();

  return async (stepIds: Set<string>) => {
    if (stepIds.size === 0) return;

    // Filter to only dirty steps
    const toSave = editor.steps.value.filter((s) => stepIds.has(s.id));
    if (toSave.length === 0) return;

    // Save each step's content using minimal response mutation
    await Promise.all(
      toSave.map((step) =>
        updateFormStepAutoSave({
          id: step.id,
          changes: {
            tips: [...step.tips],
            content: step.content as Record<string, unknown>,
          },
        })
      )
    );

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
    // 1. Create UpdateFlowAutoSave.gql with minimal response
    // 2. Get flow data from shared flow state
    // 3. Filter to dirty flow IDs
    // 4. Call updateFlowAutoSave for each
    //
    // For now, flows are not editable in the studio UI

    console.warn(
      '[AutoSave] Flow name saving not implemented - flows not editable in current UI.',
      `Dirty flow IDs: ${[...flowIds].join(', ')}`
    );
  };
};
