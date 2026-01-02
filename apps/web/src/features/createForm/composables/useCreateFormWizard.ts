import { ref, computed, reactive } from 'vue';
import type { AIQuestion, AIContext } from '@/shared/api';
import type { FormData, QuestionData } from '../models';

/**
 * Composable for managing form editor state.
 * Provides core state and question management for the single-page form builder.
 */
export function useCreateFormWizard() {
  // Form data
  const formData = reactive<FormData>({
    name: '',
    product_name: '',
    product_description: '',
    focus_areas: '',
  });

  // Questions (AI-generated + user modifications)
  const questions = ref<QuestionData[]>([]);

  // AI inferred context
  const aiContext = ref<AIContext | null>(null);

  // Created form ID
  const formId = ref<string | null>(null);

  // Loading and error states
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Question management
  function setAIQuestions(aiQuestions: AIQuestion[], context: AIContext | null) {
    questions.value = aiQuestions.map((q) => ({
      ...q,
      isNew: false,
      isModified: false,
    }));
    aiContext.value = context;
  }

  function addQuestion(question: Partial<QuestionData>) {
    // Generate unique key using crypto.randomUUID() (8 chars from UUID)
    const uniqueId = crypto.randomUUID().slice(0, 8);
    const newQuestion: QuestionData = {
      question_text: question.question_text || '',
      question_key: question.question_key || `custom_${uniqueId}`,
      question_type_id: question.question_type_id || 'text_long',
      placeholder: question.placeholder || null,
      help_text: question.help_text || null,
      is_required: question.is_required ?? false,
      display_order: questions.value.length + 1,
      options: question.options || null,
      isNew: true,
      isModified: false,
    };
    questions.value.push(newQuestion);
  }

  function updateQuestion(index: number, updates: Partial<QuestionData>) {
    if (questions.value[index]) {
      Object.assign(questions.value[index], updates, { isModified: true });
    }
  }

  function removeQuestion(index: number) {
    questions.value.splice(index, 1);
    // Reorder remaining questions
    questions.value.forEach((q, i) => {
      q.display_order = i + 1;
    });
  }

  function reorderQuestions(fromIndex: number, toIndex: number) {
    const [moved] = questions.value.splice(fromIndex, 1);
    questions.value.splice(toIndex, 0, moved);
    // Update display_order
    questions.value.forEach((q, i) => {
      q.display_order = i + 1;
      q.isModified = true;
    });
  }

  // State setters
  function setFormId(id: string) {
    formId.value = id;
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function setError(errorMessage: string | null) {
    error.value = errorMessage;
  }

  function setQuestions(newQuestions: QuestionData[]) {
    questions.value = newQuestions;
  }

  // Validation
  const canProceedFromProductInfo = computed(() => {
    return (
      formData.product_name.trim().length >= 2 &&
      formData.product_description.trim().length >= 10
    );
  });

  const canProceedFromAISuggestions = computed(() => {
    return questions.value.length > 0;
  });

  const canProceedFromCustomize = computed(() => {
    return (
      questions.value.length >= 1 &&
      questions.value.every((q) => q.question_text.trim().length > 0)
    );
  });

  return {
    // State
    formData,
    questions,
    aiContext,
    formId,
    isLoading,
    error,

    // Questions
    setAIQuestions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    reorderQuestions,

    // State setters
    setFormId,
    setLoading,
    setError,
    setQuestions,

    // Validation
    canProceedFromProductInfo,
    canProceedFromAISuggestions,
    canProceedFromCustomize,
  };
}
