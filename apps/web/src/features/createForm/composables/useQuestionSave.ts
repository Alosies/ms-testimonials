import { ref, toRefs, computed, type Ref } from 'vue';
import { getErrorMessage } from '@/shared/api';
import {
  useCreateFormQuestion,
  useUpdateFormQuestion,
} from '@/entities/formQuestion';
import { useGetQuestionTypes } from '@/entities/questionType';
import { useCurrentContextStore } from '@/shared/currentContext';
import type { QuestionData } from '../models';

interface UseQuestionSaveOptions {
  formId: Ref<string | null>;
  questions: Ref<QuestionData[]>;
  onQuestionsSaved: (questions: QuestionData[]) => void;
  onError: (error: string) => void;
}

/**
 * Composable for saving questions to the database
 *
 * Handles:
 * - Saving individual questions (new or modified)
 * - Bulk saving all dirty questions
 * - Resolving question type IDs from unique_name to database ID
 */
export function useQuestionSave(options: UseQuestionSaveOptions) {
  const { formId, questions, onQuestionsSaved, onError } = options;

  const { createFormQuestion } = useCreateFormQuestion();
  const { updateFormQuestion } = useUpdateFormQuestion();
  const { questionTypes } = useGetQuestionTypes();
  const contextStore = useCurrentContextStore();
  const { currentOrganizationId } = toRefs(contextStore);

  const isSaving = ref(false);

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
   * Build input object for creating/updating a question
   */
  function buildQuestionInput(question: QuestionData, formIdToUse: string) {
    return {
      form_id: formIdToUse,
      organization_id: currentOrganizationId.value,
      question_type_id: resolveQuestionTypeId(question.question_type_id),
      question_key: question.question_key,
      question_text: question.question_text,
      placeholder: question.placeholder,
      help_text: question.help_text,
      display_order: question.display_order,
      is_required: question.is_required,
    };
  }

  /**
   * Create a new question in the database
   */
  async function createQuestion(
    question: QuestionData,
    formIdToUse: string
  ): Promise<{ id: string } | null> {
    const result = await createFormQuestion({
      input: buildQuestionInput(question, formIdToUse),
    });
    return result;
  }

  /**
   * Update an existing question in the database
   */
  async function updateQuestion(question: QuestionData): Promise<boolean> {
    if (!question.id) return false;

    const result = await updateFormQuestion({
      id: question.id,
      input: {
        question_type_id: resolveQuestionTypeId(question.question_type_id),
        question_text: question.question_text,
        placeholder: question.placeholder,
        help_text: question.help_text,
        display_order: question.display_order,
        is_required: question.is_required,
      },
    });
    return !!result;
  }

  /**
   * Save a single question by index
   */
  async function saveQuestion(index: number): Promise<boolean> {
    if (isSaving.value) return false;
    if (!formId.value) {
      onError('Cannot save question: No form ID');
      return false;
    }

    const question = questions.value[index];
    if (!question) {
      onError('Cannot save question: Invalid index');
      return false;
    }

    if (!question.isNew && !question.isModified) {
      return true; // Nothing to save
    }

    isSaving.value = true;

    try {
      const formIdToUse = formId.value;
      const updatedQuestions = [...questions.value];

      if (question.isNew && !question.id) {
        const result = await createQuestion(question, formIdToUse);
        if (!result) {
          throw new Error('Failed to create question');
        }
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          id: result.id,
          isNew: false,
          isModified: false,
        };
      } else if (question.isModified && question.id) {
        const success = await updateQuestion(question);
        if (!success) {
          throw new Error('Failed to update question');
        }
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          isModified: false,
        };
      }

      onQuestionsSaved(updatedQuestions);
      return true;
    } catch (error) {
      onError(getErrorMessage(error));
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  /**
   * Save all dirty questions (new and modified)
   */
  async function saveQuestions(): Promise<boolean> {
    if (isSaving.value) return false;
    if (!formId.value) {
      onError('Cannot save questions: No form ID');
      return false;
    }

    const newQuestions = questions.value.filter((q) => q.isNew && !q.id);
    const modifiedQuestions = questions.value.filter((q) => q.isModified && q.id);

    if (newQuestions.length === 0 && modifiedQuestions.length === 0) {
      return true; // Nothing to save
    }

    isSaving.value = true;

    try {
      const formIdToUse = formId.value;
      const updatedQuestions = [...questions.value];

      // Create new questions
      for (const question of newQuestions) {
        const result = await createQuestion(question, formIdToUse);
        if (!result) {
          throw new Error('Failed to create question');
        }

        const index = updatedQuestions.findIndex(
          (q) => q.question_key === question.question_key
        );
        if (index !== -1) {
          updatedQuestions[index] = {
            ...updatedQuestions[index],
            id: result.id,
            isNew: false,
            isModified: false,
          };
        }
      }

      // Update modified questions
      for (const question of modifiedQuestions) {
        const success = await updateQuestion(question);
        if (!success) {
          throw new Error('Failed to update question');
        }

        const index = updatedQuestions.findIndex((q) => q.id === question.id);
        if (index !== -1) {
          updatedQuestions[index] = {
            ...updatedQuestions[index],
            isModified: false,
          };
        }
      }

      onQuestionsSaved(updatedQuestions);
      return true;
    } catch (error) {
      onError(getErrorMessage(error));
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  return {
    isSaving,
    resolveQuestionTypeId,
    saveQuestion,
    saveQuestions,
  };
}
