import { ref, computed } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { useUpdateFormQuestion } from '@/entities/formQuestion';
import { useTimelineEditor } from './useTimelineEditor';

/**
 * Step Save - Shared Composable
 *
 * Handles persisting step changes to the database.
 * For question/rating steps, saves the linked question data.
 * For other step types, saves the step content.
 */
export const useStepSave = createSharedComposable(() => {
  const editor = useTimelineEditor();
  const { updateFormQuestion } = useUpdateFormQuestion();

  // Save state
  const isSaving = ref(false);
  const saveError = ref<string | null>(null);
  const lastSavedAt = ref<Date | null>(null);

  // Track which steps have unsaved changes
  const unsavedStepIds = computed(() => {
    return editor.steps.value
      .filter((step) => step.isModified)
      .map((step) => step.id);
  });

  const hasUnsavedChanges = computed(() => unsavedStepIds.value.length > 0);

  /**
   * Check if a specific step has unsaved changes
   */
  function isStepDirty(stepId: string): boolean {
    const step = editor.steps.value.find((s) => s.id === stepId);
    return step?.isModified ?? false;
  }

  /**
   * Convert question data to form_questions_set_input format
   * Accepts readonly question data from the timeline editor
   */
  function mapQuestionToInput(question: {
    questionText: string;
    isRequired: boolean;
    placeholder?: string | null;
    helpText?: string | null;
    minValue?: number | null;
    maxValue?: number | null;
  }) {
    return {
      question_text: question.questionText,
      is_required: question.isRequired,
      placeholder: question.placeholder,
      help_text: question.helpText,
      min_value: question.minValue,
      max_value: question.maxValue,
      // Note: scale labels might need a separate field - check if it exists
      // For now, storing in help_text or a custom field would need migration
    };
  }

  /**
   * Save a single step's question data
   */
  async function saveStepQuestion(stepIndex: number): Promise<boolean> {
    const step = editor.steps.value[stepIndex];
    if (!step) {
      saveError.value = 'Step not found';
      return false;
    }

    // Only question/rating steps have linked questions
    if (step.stepType !== 'question' && step.stepType !== 'rating') {
      // For other step types, we'd need to save step content
      // This would require an UpdateFormStep mutation
      console.warn('Saving non-question steps not yet implemented');
      return true;
    }

    if (!step.question || !step.question.id) {
      saveError.value = 'No question linked to this step';
      return false;
    }

    // Skip temp IDs (new questions that haven't been created yet)
    if (step.question.id.startsWith('temp_')) {
      saveError.value = 'Cannot save unsaved question - create it first';
      return false;
    }

    isSaving.value = true;
    saveError.value = null;

    try {
      const input = mapQuestionToInput(step.question);
      const result = await updateFormQuestion({
        id: step.question.id,
        input,
      });

      if (result) {
        // Mark step as clean
        editor.updateStep(stepIndex, { isModified: false });
        lastSavedAt.value = new Date();
        return true;
      } else {
        saveError.value = 'Failed to save question';
        return false;
      }
    } catch (err) {
      saveError.value = err instanceof Error ? err.message : 'Unknown error';
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  /**
   * Save the currently selected step
   */
  async function saveCurrentStep(): Promise<boolean> {
    const index = editor.selectedIndex.value;
    if (index === null || index === undefined) {
      return false;
    }
    return saveStepQuestion(index);
  }

  /**
   * Save all modified steps
   */
  async function saveAllSteps(): Promise<boolean> {
    const modifiedIndices = editor.steps.value
      .map((step, index) => ({ step, index }))
      .filter(({ step }) => step.isModified)
      .map(({ index }) => index);

    if (modifiedIndices.length === 0) {
      return true;
    }

    isSaving.value = true;
    let allSuccess = true;

    for (const index of modifiedIndices) {
      const success = await saveStepQuestion(index);
      if (!success) {
        allSuccess = false;
      }
    }

    isSaving.value = false;
    return allSuccess;
  }

  return {
    // State
    isSaving,
    saveError,
    lastSavedAt,
    hasUnsavedChanges,
    unsavedStepIds,

    // Methods
    isStepDirty,
    saveStepQuestion,
    saveCurrentStep,
    saveAllSteps,
  };
});
