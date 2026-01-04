import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue';
import type { FormStep, StepContent } from '@/shared/stepCards';

export interface UseStepEditorPanelOptions {
  selectedStep: Ref<FormStep | null>;
  onSave: (content: StepContent) => void;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function useStepEditorPanel(options: UseStepEditorPanelOptions) {
  const { selectedStep, onSave, onClose, onNavigate } = options;

  const localContent = ref<StepContent>({});
  const isDirty = ref(false);

  // Sync local content when step changes
  watch(selectedStep, (step) => {
    if (step) {
      localContent.value = JSON.parse(JSON.stringify(step.content)) as StepContent;
      isDirty.value = false;
    }
  }, { immediate: true });

  function updateContent(updates: Record<string, unknown>) {
    localContent.value = { ...localContent.value, ...updates } as StepContent;
    isDirty.value = true;
  }

  function save() {
    onSave(localContent.value);
    isDirty.value = false;
  }

  function saveAndClose() {
    save();
    onClose();
  }

  // Keyboard shortcuts
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
    if ((event.metaKey || event.ctrlKey) && event.key === 's') {
      event.preventDefault();
      save();
    }
    if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowUp') {
      event.preventDefault();
      onNavigate('prev');
    }
    if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowDown') {
      event.preventDefault();
      onNavigate('next');
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
  });

  return {
    localContent,
    isDirty,
    updateContent,
    save,
    saveAndClose,
  };
}
