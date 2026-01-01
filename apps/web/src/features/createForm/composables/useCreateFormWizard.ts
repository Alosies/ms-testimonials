import { ref, computed, reactive } from 'vue';
import type { AIQuestion, AIContext } from '@/shared/api';
import type { WizardStep, FormData, QuestionData } from '../models';

/**
 * Composable for managing the create form wizard state
 */
export function useCreateFormWizard() {
  // Current step
  const currentStep = ref<WizardStep>('product-info');

  // Form data
  const formData = reactive<FormData>({
    name: '',
    slug: '',
    product_name: '',
    product_description: '',
    focus_areas: '',
  });

  // Questions (AI-generated + user modifications)
  const questions = ref<QuestionData[]>([]);

  // AI inferred context
  const aiContext = ref<AIContext | null>(null);

  // Created form ID (set after Step 1 save)
  const formId = ref<string | null>(null);

  // Loading and error states
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Step navigation
  const steps: WizardStep[] = ['product-info', 'ai-suggestions', 'customize', 'preview'];

  const currentStepIndex = computed(() => steps.indexOf(currentStep.value));
  const isFirstStep = computed(() => currentStepIndex.value === 0);
  const isLastStep = computed(() => currentStepIndex.value === steps.length - 1);

  function nextStep() {
    if (!isLastStep.value) {
      currentStep.value = steps[currentStepIndex.value + 1];
    }
  }

  function prevStep() {
    if (!isFirstStep.value) {
      currentStep.value = steps[currentStepIndex.value - 1];
    }
  }

  function goToStep(step: WizardStep) {
    currentStep.value = step;
  }

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
    const newQuestion: QuestionData = {
      question_text: question.question_text || '',
      question_key: question.question_key || `custom_${Date.now()}`,
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
    currentStep,
    formData,
    questions,
    aiContext,
    formId,
    isLoading,
    error,

    // Navigation
    nextStep,
    prevStep,
    goToStep,
    isFirstStep,
    isLastStep,
    currentStepIndex,

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

    // Validation
    canProceedFromProductInfo,
    canProceedFromAISuggestions,
    canProceedFromCustomize,
  };
}
