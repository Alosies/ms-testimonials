import { computed, ref, watch, toRefs, type Ref } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { useOrganizationStore } from '@/entities/organization';
import { useConfirmationModal } from '@/shared/widgets';
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

  // Global confirmation modal
  const { showConfirmation } = useConfirmationModal();

  // Local editing state for immediate feedback
  const localQuestion = ref<QuestionData | null>(null);

  // Keyboard navigation state - only active when header is focused
  const isNavigationEnabled = ref(false);

  // Detect if device has keyboard (pointer: fine indicates mouse/trackpad, typical of keyboard devices)
  const hasKeyboard = useMediaQuery('(pointer: fine)');

  // Track if content is transitioning (for smooth animations)
  const isTransitioning = ref(false);

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

  // Map icon names to iconify format (supports heroicons:, lucide:, etc.)
  function getHeroIconName(iconName: string | null | undefined): string {
    if (!iconName) return 'heroicons:minus';
    // If icon already has a prefix (contains `:`) use it as-is
    if (iconName.includes(':')) return iconName;
    // Default to heroicons for unprefixed icon names
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

  // Navigate with smooth transition
  function navigateWithTransition(direction: 'prev' | 'next') {
    isTransitioning.value = true;
    // Small delay to allow fade-out, then navigate
    setTimeout(() => {
      onNavigate(direction);
      // Content will fade back in after navigation
      setTimeout(() => {
        isTransitioning.value = false;
      }, 50);
    }, 150);
  }

  // Keyboard navigation - only works when header is focused
  function handleHeaderKeydown(event: KeyboardEvent) {
    if (!isNavigationEnabled.value) return;

    if (event.key === 'ArrowUp' && questionIndex.value > 0) {
      event.preventDefault();
      navigateWithTransition('prev');
    } else if (event.key === 'ArrowDown' && questionIndex.value < totalQuestions.value - 1) {
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

  // Delete confirmation handler
  function handleDeleteClick() {
    showConfirmation({
      actionType: 'delete_question',
      entityName: localQuestion.value?.question_text || 'Untitled question',
      onConfirm: () => {
        onRemove();
      },
    });
  }

  function closePanel() {
    onOpenChange(false);
  }

  return {
    // State
    localQuestion,
    questionTypes,
    isNavigationEnabled,
    hasKeyboard,
    isTransitioning,

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
    handleHeaderKeydown,
    navigateWithTransition,
    enableNavigation,
    disableNavigation,
    handleDeleteClick,
    closePanel,
  };
}
