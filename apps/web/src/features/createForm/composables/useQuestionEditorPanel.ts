import { computed, ref, watch, toRefs, type Ref } from 'vue';
import { useOrganizationStore } from '@/entities/organization';
import type { AIQuestionOption } from '@/shared/api';
import type { QuestionData } from '../models';

interface UseQuestionEditorPanelOptions {
  question: Ref<QuestionData | null>;
  questionIndex: Ref<number>;
  totalQuestions: Ref<number>;
  onUpdate: (updates: Partial<QuestionData>) => void;
  onRemove: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onOpenChange: (value: boolean) => void;
}

export function useQuestionEditorPanel(options: UseQuestionEditorPanelOptions) {
  const { question, questionIndex, totalQuestions, onUpdate, onRemove, onNavigate, onOpenChange } =
    options;

  // Get allowed question types from organization's plan
  const organizationStore = useOrganizationStore();
  const { questionTypeOptions: questionTypes } = toRefs(organizationStore);

  // Local editing state for immediate feedback
  const localQuestion = ref<QuestionData | null>(null);

  // Delete confirmation state
  const showDeleteConfirm = ref(false);

  // Sync local state with prop changes
  watch(
    question,
    (newQuestion) => {
      if (newQuestion) {
        localQuestion.value = { ...newQuestion };
      }
    },
    { immediate: true, deep: true }
  );

  // Find current question type details
  const currentQuestionType = computed(() =>
    questionTypes.value.find((t) => t.id === localQuestion.value?.question_type_id)
  );

  const questionTypeIcon = computed(() => currentQuestionType.value?.icon ?? 'minus');
  const supportsOptions = computed(() => currentQuestionType.value?.supportsOptions ?? false);

  // Map icon names to heroicons format
  function getHeroIconName(iconName: string | null | undefined): string {
    if (!iconName) return 'heroicons:minus';
    return `heroicons:${iconName}`;
  }

  // Update local state and emit to parent
  function updateField<K extends keyof QuestionData>(field: K, value: QuestionData[K]) {
    if (!localQuestion.value) return;
    localQuestion.value = { ...localQuestion.value, [field]: value };
    onUpdate({ [field]: value });
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

  // Keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp' && questionIndex.value > 0) {
      event.preventDefault();
      onNavigate('prev');
    } else if (event.key === 'ArrowDown' && questionIndex.value < totalQuestions.value - 1) {
      event.preventDefault();
      onNavigate('next');
    }
  }

  // Delete confirmation handlers
  function handleDeleteClick() {
    showDeleteConfirm.value = true;
  }

  function handleConfirmDelete() {
    showDeleteConfirm.value = false;
    onRemove();
  }

  function handleCancelDelete() {
    showDeleteConfirm.value = false;
  }

  function closePanel() {
    onOpenChange(false);
  }

  return {
    // State
    localQuestion,
    showDeleteConfirm,
    questionTypes,

    // Computed
    questionTypeIcon,
    supportsOptions,

    // Methods
    getHeroIconName,
    updateField,
    generateOptionValue,
    addOption,
    updateOption,
    removeOption,
    handleKeydown,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    closePanel,
  };
}
