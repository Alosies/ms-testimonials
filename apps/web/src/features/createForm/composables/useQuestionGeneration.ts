import { ref, toRefs, nextTick, computed, type Ref } from 'vue';
import { useApiForAI, getErrorMessage } from '@/shared/api';
import { useCreateForm } from '@/entities/form';
import {
  useCreateFormQuestion,
  useCreateFormQuestions,
  useUpdateFormQuestion,
  useDeactivateFormQuestions,
} from '@/entities/formQuestion';
import { useGetQuestionTypes } from '@/entities/questionType';
import { useCurrentContextStore } from '@/shared/currentContext';
import { createSlugFromString } from '@/shared/urls';
import type { AIContext, AIQuestion } from '@/shared/api';
import type { FormData, QuestionData } from '../models';

interface UseQuestionGenerationOptions {
  formData: FormData;
  formId: Ref<string | null>;
  questions: Ref<QuestionData[]>;
  onQuestionsGenerated: (questions: AIQuestion[], context: AIContext | null) => void;
  onQuestionsSaved: (questions: QuestionData[]) => void;
  onFormCreated: (id: string) => void;
  onError: (error: string) => void;
}

/**
 * Composable for AI question generation logic
 *
 * Handles:
 * - Initial question generation
 * - Question regeneration (with deactivation of old questions)
 * - Saving questions to database after generation
 */
export function useQuestionGeneration(options: UseQuestionGenerationOptions) {
  const {
    formData,
    formId,
    questions,
    onQuestionsGenerated,
    onQuestionsSaved,
    onFormCreated,
    onError,
  } = options;

  const aiApi = useApiForAI();
  const { createForm } = useCreateForm();
  const { createFormQuestion } = useCreateFormQuestion();
  const { createFormQuestions } = useCreateFormQuestions();
  const { updateFormQuestion } = useUpdateFormQuestion();
  const { deactivateFormQuestions } = useDeactivateFormQuestions();
  const { questionTypes } = useGetQuestionTypes();
  const contextStore = useCurrentContextStore();
  const { currentOrganizationId } = toRefs(contextStore);

  // Create mapping from unique_name to id for question types
  // AI API returns unique_name (e.g., "text_long") but DB expects id
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

  // State
  const isGenerating = ref(false);
  const isSaving = ref(false);

  // Animation states for staggered reveal
  const showSuccess = ref(false);
  const revealQuestions = ref(false);
  const visibleCards = ref<number[]>([]);

  /**
   * Generate questions using AI
   */
  async function generateQuestions(): Promise<boolean> {
    if (isGenerating.value) return false;

    isGenerating.value = true;
    showSuccess.value = false;
    revealQuestions.value = false;
    visibleCards.value = [];

    try {
      const result = await aiApi.suggestQuestions({
        product_name: formData.product_name,
        product_description: formData.product_description,
        focus_areas: formData.focus_areas || undefined,
      });

      onQuestionsGenerated(result.questions, result.inferred_context);

      // Trigger success animation sequence
      await nextTick();
      showSuccess.value = true;

      // After success animation, reveal questions
      setTimeout(() => {
        showSuccess.value = false;
        revealQuestions.value = true;

        // Stagger reveal each card
        result.questions.forEach((_, index) => {
          setTimeout(() => {
            visibleCards.value = [...visibleCards.value, index];
          }, index * 120);
        });
      }, 800);

      // Save questions to database
      await saveGeneratedQuestions(result.questions);

      return true;
    } catch (error) {
      onError(getErrorMessage(error));
      return false;
    } finally {
      isGenerating.value = false;
    }
  }

  /**
   * Regenerate questions - deactivate old and generate new
   */
  async function regenerateQuestions(): Promise<boolean> {
    if (isGenerating.value) return false;

    // Always deactivate existing questions in DB before generating new ones
    // This handles cases where local questions don't have IDs (e.g., after failed save)
    // Partial unique index allows deactivated questions to not block new ones
    if (formId.value) {
      try {
        await deactivateFormQuestions({ formId: formId.value });
      } catch (error) {
        onError(`Failed to clear existing questions: ${getErrorMessage(error)}`);
        return false;
      }
    }

    return generateQuestions();
  }

  /**
   * Save generated questions to database
   */
  async function saveGeneratedQuestions(generatedQuestions: AIQuestion[]): Promise<void> {
    if (isSaving.value) return;

    isSaving.value = true;

    try {
      let formIdToUse = formId.value;

      // Create the form if not already created
      if (!formIdToUse) {
        const slug = createSlugFromString(formData.product_name);
        const formResult = await createForm({
          form: {
            name: formData.product_name,
            slug,
            product_name: formData.product_name,
            product_description: formData.product_description,
            organization_id: currentOrganizationId.value,
          },
        });

        if (!formResult) {
          throw new Error('Failed to create form');
        }

        formIdToUse = formResult.id;
        onFormCreated(formIdToUse);
      } else {
        // Form already exists - deactivate any existing questions before inserting new ones
        // This handles the case where user generates questions for an existing form
        // Partial unique index allows deactivated questions to not block new ones
        await deactivateFormQuestions({ formId: formIdToUse });
      }

      // Create the questions in the database
      // Map question_type_id from unique_name to actual database id
      const questionInputs = generatedQuestions.map((q, index) => ({
        form_id: formIdToUse,
        organization_id: currentOrganizationId.value,
        question_type_id: resolveQuestionTypeId(q.question_type_id),
        question_key: q.question_key,
        question_text: q.question_text,
        placeholder: q.placeholder,
        help_text: q.help_text,
        display_order: index + 1,
        is_required: q.is_required,
      }));

      const questionsResult = await createFormQuestions({
        inputs: questionInputs,
      });

      if (!questionsResult || questionsResult.length === 0) {
        throw new Error('Failed to save questions');
      }

      // Update local questions with DB IDs
      const updatedQuestions = generatedQuestions.map((q, index) => ({
        ...q,
        id: questionsResult[index].id,
      }));
      onQuestionsGenerated(updatedQuestions as AIQuestion[], null);

    } catch (error) {
      onError(getErrorMessage(error));
    } finally {
      isSaving.value = false;
    }
  }

  /**
   * Initialize animation state (for when returning to this section)
   */
  function initializeAnimationState() {
    if (questions.value.length > 0) {
      revealQuestions.value = true;
      visibleCards.value = questions.value.map((_, i) => i);
    }
  }

  /**
   * Save custom questions (new and modified) to the database
   *
   * - Creates new questions that have isNew=true
   * - Updates existing questions that have isModified=true
   * - Clears isNew/isModified flags after successful save
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
      // Nothing to save
      return true;
    }

    isSaving.value = true;

    try {
      const formIdToUse = formId.value;
      const updatedQuestions = [...questions.value];

      // Create new questions
      for (const question of newQuestions) {
        const result = await createFormQuestion({
          input: {
            form_id: formIdToUse,
            organization_id: currentOrganizationId.value,
            question_type_id: resolveQuestionTypeId(question.question_type_id),
            question_key: question.question_key,
            question_text: question.question_text,
            placeholder: question.placeholder,
            help_text: question.help_text,
            display_order: question.display_order,
            is_required: question.is_required,
          },
        });

        if (!result) {
          throw new Error('Failed to create question');
        }

        // Update local question with DB ID and clear flags
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
        if (!question.id) continue;

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

        if (!result) {
          throw new Error('Failed to update question');
        }

        // Clear isModified flag
        const index = updatedQuestions.findIndex((q) => q.id === question.id);
        if (index !== -1) {
          updatedQuestions[index] = {
            ...updatedQuestions[index],
            isModified: false,
          };
        }
      }

      // Notify parent with updated questions
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
    // State
    isGenerating,
    isSaving,

    // Animation state
    showSuccess,
    revealQuestions,
    visibleCards,

    // Actions
    generateQuestions,
    regenerateQuestions,
    saveQuestions,
    initializeAnimationState,
  };
}
