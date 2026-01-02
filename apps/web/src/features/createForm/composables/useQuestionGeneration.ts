import { ref, toRefs, nextTick, type Ref } from 'vue';
import { useApiForAI, getErrorMessage } from '@/shared/api';
import { useCreateForm } from '@/entities/form';
import { useCreateFormQuestions, useDeactivateFormQuestions } from '@/entities/formQuestion';
import { useCurrentContextStore } from '@/shared/currentContext';
import { useQuestionSave } from './useQuestionSave';
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
  const { createFormQuestions } = useCreateFormQuestions();
  const { deactivateFormQuestions } = useDeactivateFormQuestions();
  const contextStore = useCurrentContextStore();
  const { currentOrganizationId } = toRefs(contextStore);

  // Use the question save composable for individual/bulk saves
  const questionSave = useQuestionSave({
    formId,
    questions,
    onQuestionsSaved,
    onError,
  });

  // State
  const isGenerating = ref(false);

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
    if (questionSave.isSaving.value) return;

    questionSave.isSaving.value = true;

    try {
      let formIdToUse = formId.value;

      // Create the form if not already created
      if (!formIdToUse) {
        const formResult = await createForm({
          form: {
            name: formData.product_name,
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
        question_type_id: questionSave.resolveQuestionTypeId(q.question_type_id),
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
      questionSave.isSaving.value = false;
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

  return {
    // State
    isGenerating,
    isSaving: questionSave.isSaving,

    // Animation state
    showSuccess,
    revealQuestions,
    visibleCards,

    // Actions
    generateQuestions,
    regenerateQuestions,
    saveQuestions: questionSave.saveQuestions,
    saveQuestion: questionSave.saveQuestion,
    initializeAnimationState,
  };
}
