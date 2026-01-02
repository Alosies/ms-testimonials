import { computed, ref, watch, toRefs, type Ref } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { useOrganizationStore } from '@/entities/organization';
import { useConfirmationModal } from '@/shared/widgets';
import type { AIQuestionOption, QuestionTypeId } from '@/shared/api';
import type { QuestionData } from '../models';

export type PanelMode = 'add' | 'edit';

interface UseQuestionEditorPanelBaseOptions {
  onOpenChange: (value: boolean) => void;
}

interface UseQuestionEditorPanelEditOptions extends UseQuestionEditorPanelBaseOptions {
  mode: 'edit';
  question: Ref<QuestionData | null>;
  questionIndex: Ref<number>;
  totalQuestions: Ref<number>;
  onUpdate: (updates: Partial<QuestionData>) => void;
  onRemove: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

interface UseQuestionEditorPanelAddOptions extends UseQuestionEditorPanelBaseOptions {
  mode: 'add';
  onAdd: (question: QuestionData) => void;
  /** Display order for the new question (defaults to 1) */
  nextDisplayOrder?: number;
}

type UseQuestionEditorPanelOptions = UseQuestionEditorPanelEditOptions | UseQuestionEditorPanelAddOptions;

// Helper to generate question_key from question text
function generateQuestionKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 50) || `custom_${Date.now()}`;
}

// Create a blank question template for add mode
function createBlankQuestion(displayOrder: number): QuestionData {
  return {
    question_text: '',
    question_key: '',
    question_type_id: 'text_long' as QuestionTypeId,
    placeholder: null,
    help_text: null,
    is_required: true,
    display_order: displayOrder,
    options: null,
    isNew: true,
  };
}

export function useQuestionEditorPanel(options: UseQuestionEditorPanelOptions) {
  const { mode, onOpenChange } = options;

  // Mode flags
  const isAddMode = mode === 'add';
  const isEditMode = mode === 'edit';

  // Get allowed question types from organization's plan
  const organizationStore = useOrganizationStore();
  const { questionTypeOptions: questionTypes } = toRefs(organizationStore);

  // Global confirmation modal
  const { showConfirmation } = useConfirmationModal();

  // Local editing state for immediate feedback
  const localQuestion = ref<QuestionData | null>(null);

  // Separate ref for Switch binding (synced with localQuestion.is_required)
  const isRequired = ref(true);

  // Keyboard navigation state - only active when header is focused (edit mode only)
  const isNavigationEnabled = ref(false);

  // Detect if device has keyboard (pointer: fine indicates mouse/trackpad, typical of keyboard devices)
  const hasKeyboard = useMediaQuery('(pointer: fine)');

  // Track if content is transitioning (for smooth animations)
  const isTransitioning = ref(false);

  // Validation for add mode
  const isValid = computed(() => {
    if (!localQuestion.value) return false;
    return localQuestion.value.question_text.trim().length > 0;
  });

  // Initialize state based on mode
  if (isAddMode) {
    const addOptions = options as UseQuestionEditorPanelAddOptions;
    localQuestion.value = createBlankQuestion(addOptions.nextDisplayOrder ?? 1);
    isRequired.value = true;
  }

  // Sync local state with prop changes (edit mode only)
  if (isEditMode) {
    const editOptions = options as UseQuestionEditorPanelEditOptions;
    watch(
      editOptions.question,
      (newQuestion) => {
        if (newQuestion) {
          localQuestion.value = { ...newQuestion };
          isRequired.value = Boolean(newQuestion.is_required);
        }
      },
      { immediate: true, deep: true }
    );
  }

  // Sync isRequired changes back to localQuestion
  watch(isRequired, (newValue) => {
    if (localQuestion.value && localQuestion.value.is_required !== newValue) {
      localQuestion.value = { ...localQuestion.value, is_required: newValue };
      // In edit mode, emit update immediately
      if (isEditMode) {
        const editOptions = options as UseQuestionEditorPanelEditOptions;
        editOptions.onUpdate({ is_required: newValue });
      }
    }
  });

  // Find current question type details
  const currentQuestionType = computed(() =>
    questionTypes.value.find((t) => t.id === localQuestion.value?.question_type_id)
  );

  const questionTypeIcon = computed(() => currentQuestionType.value?.icon ?? 'minus');
  const supportsOptions = computed(() => currentQuestionType.value?.supportsOptions ?? false);

  // Map icon names to iconify format (supports heroicons:, lucide:, etc.)
  function getHeroIconName(iconName: string | null | undefined): string {
    if (!iconName) return 'heroicons:minus';
    // If icon already has a prefix (contains `:`) use it as-is
    if (iconName.includes(':')) return iconName;
    // Default to heroicons for unprefixed icon names
    return `heroicons:${iconName}`;
  }

  // Update local state and emit to parent (in edit mode)
  function updateField<K extends keyof QuestionData>(field: K, value: QuestionData[K]) {
    if (!localQuestion.value) return;
    localQuestion.value = { ...localQuestion.value, [field]: value };
    // In edit mode, emit updates immediately
    if (isEditMode) {
      const editOptions = options as UseQuestionEditorPanelEditOptions;
      editOptions.onUpdate({ [field]: value });
    }
  }

  // Auto-generate option_value from label
  function generateOptionValue(label: string): string {
    return (
      label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '') || `option_${Date.now()}`
    );
  }

  // Options management for choice questions
  function addOption() {
    if (!localQuestion.value) return;
    const currentOptions = localQuestion.value.options ?? [];
    const newOption: AIQuestionOption = {
      option_value: `option_${currentOptions.length + 1}`,
      option_label: '',
      display_order: currentOptions.length + 1,
    };
    updateField('options', [...currentOptions, newOption]);
  }

  function updateOption(optionIndex: number, updates: Partial<AIQuestionOption>) {
    if (!localQuestion.value) return;
    const currentOptions = localQuestion.value.options ?? [];
    const updatedOptions = currentOptions.map((opt, idx) =>
      idx === optionIndex ? { ...opt, ...updates } : opt
    );
    updateField('options', updatedOptions);
  }

  function removeOption(optionIndex: number) {
    if (!localQuestion.value) return;
    const currentOptions = localQuestion.value.options ?? [];
    const updatedOptions = currentOptions
      .filter((_, idx) => idx !== optionIndex)
      .map((opt, idx) => ({ ...opt, display_order: idx + 1 }));
    updateField('options', updatedOptions.length > 0 ? updatedOptions : null);
  }

  // Navigate with smooth transition (edit mode only)
  function navigateWithTransition(direction: 'prev' | 'next') {
    if (!isEditMode) return;
    const editOptions = options as UseQuestionEditorPanelEditOptions;

    isTransitioning.value = true;
    // Small delay to allow fade-out, then navigate
    setTimeout(() => {
      editOptions.onNavigate(direction);
      // Content will fade back in after navigation
      setTimeout(() => {
        isTransitioning.value = false;
      }, 50);
    }, 150);
  }

  // Keyboard navigation - only works when header is focused (edit mode only)
  function handleHeaderKeydown(event: KeyboardEvent) {
    if (!isEditMode || !isNavigationEnabled.value) return;
    const editOptions = options as UseQuestionEditorPanelEditOptions;

    if (event.key === 'ArrowUp' && editOptions.questionIndex.value > 0) {
      event.preventDefault();
      navigateWithTransition('prev');
    } else if (event.key === 'ArrowDown' && editOptions.questionIndex.value < editOptions.totalQuestions.value - 1) {
      event.preventDefault();
      navigateWithTransition('next');
    }
  }

  function enableNavigation() {
    isNavigationEnabled.value = true;
  }

  function disableNavigation() {
    isNavigationEnabled.value = false;
  }

  // Delete confirmation handler (edit mode only)
  function handleDeleteClick() {
    if (!isEditMode) return;
    const editOptions = options as UseQuestionEditorPanelEditOptions;

    showConfirmation({
      actionType: 'delete_question',
      entityName: localQuestion.value?.question_text || 'Untitled question',
      onConfirm: () => {
        editOptions.onRemove();
      },
    });
  }

  // Add question handler (add mode only)
  function handleAddQuestion() {
    if (!isAddMode || !localQuestion.value || !isValid.value) return;
    const addOptions = options as UseQuestionEditorPanelAddOptions;

    // Generate question_key from question_text
    const finalQuestion: QuestionData = {
      ...localQuestion.value,
      question_key: generateQuestionKey(localQuestion.value.question_text),
    };

    addOptions.onAdd(finalQuestion);
    onOpenChange(false);
  }

  // Reset form for add mode (to add another question)
  function resetForm() {
    if (!isAddMode) return;
    const addOptions = options as UseQuestionEditorPanelAddOptions;
    localQuestion.value = createBlankQuestion(addOptions.nextDisplayOrder ?? 1);
    isRequired.value = true;
  }

  function closePanel() {
    onOpenChange(false);
  }

  return {
    // Mode
    isAddMode,
    isEditMode,

    // State
    localQuestion,
    questionTypes,
    isNavigationEnabled,
    hasKeyboard,
    isTransitioning,

    // Computed
    questionTypeIcon,
    supportsOptions,
    isRequired,
    isValid,

    // Methods
    getHeroIconName,
    updateField,
    generateOptionValue,
    addOption,
    updateOption,
    removeOption,
    handleHeaderKeydown,
    navigateWithTransition,
    enableNavigation,
    disableNavigation,
    handleDeleteClick,
    handleAddQuestion,
    resetForm,
    closePanel,
  };
}
