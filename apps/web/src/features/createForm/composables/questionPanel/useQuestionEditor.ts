import { ref, computed } from 'vue';
import type { QuestionData } from '../../models';

/**
 * Composable for managing question editing state
 */
export function useQuestionEditor() {
  // Currently editing question index
  const editingIndex = ref<number | null>(null);

  // Editing state
  const isEditing = computed(() => editingIndex.value !== null);

  function startEditing(index: number) {
    editingIndex.value = index;
  }

  function stopEditing() {
    editingIndex.value = null;
  }

  function isEditingQuestion(index: number) {
    return editingIndex.value === index;
  }

  // Validation helpers
  function validateQuestion(question: QuestionData): string[] {
    const errors: string[] = [];

    if (!question.question_text.trim()) {
      errors.push('Question text is required');
    }

    if (!question.question_key.trim()) {
      errors.push('Question key is required');
    } else if (!/^[a-z][a-z0-9_]*$/.test(question.question_key)) {
      errors.push('Question key must start with a letter and contain only lowercase letters, numbers, and underscores');
    }

    if (!question.question_type_id) {
      errors.push('Question type is required');
    }

    return errors;
  }

  function isQuestionValid(question: QuestionData): boolean {
    return validateQuestion(question).length === 0;
  }

  return {
    editingIndex,
    isEditing,
    startEditing,
    stopEditing,
    isEditingQuestion,
    validateQuestion,
    isQuestionValid,
  };
}
