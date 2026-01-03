import { ref, readonly, type Ref } from 'vue';
import { useStepState } from './useStepState';
import { useStepNavigation } from './useStepNavigation';
import { useStepOperations } from './useStepOperations';
import type { StepType } from '../../models/stepContent';

export function useTimelineEditor(formId: Ref<string>) {
  // Compose from smaller composables
  const { steps, isDirty, hasSteps, setSteps, markClean, getStepById } = useStepState();
  const {
    selectedIndex,
    selectedStep,
    canGoNext,
    canGoPrev,
    selectStep,
    goNext,
    goPrev,
    scrollToStep
  } = useStepNavigation(steps);
  const {
    addStep,
    removeStep,
    updateStep,
    updateStepContent,
    updateStepTips,
    moveStep,
    duplicateStep
  } = useStepOperations(steps, formId);

  // Editor panel state
  const isEditorOpen = ref(false);
  const editorMode = ref<'edit' | 'add'>('edit');

  // Actions that coordinate multiple composables
  function handleAddStep(type: StepType, afterIndex?: number) {
    const newStep = addStep(type, afterIndex);
    const newIndex = steps.value.indexOf(newStep);
    selectStep(newIndex);
    scrollToStep(newIndex);

    // Open editor for new step
    editorMode.value = 'add';
    isEditorOpen.value = true;
  }

  function handleEditStep(index: number) {
    selectStep(index);
    editorMode.value = 'edit';
    isEditorOpen.value = true;
  }

  function handleRemoveStep(index: number) {
    removeStep(index);
    // Select previous step if possible
    if (selectedIndex.value >= steps.value.length) {
      selectStep(Math.max(0, steps.value.length - 1));
    }
  }

  function handleCloseEditor() {
    isEditorOpen.value = false;
  }

  function handleNavigateEditor(direction: 'prev' | 'next') {
    if (direction === 'prev' && canGoPrev.value) {
      goPrev();
    } else if (direction === 'next' && canGoNext.value) {
      goNext();
    }
  }

  return {
    // State (readonly where appropriate)
    steps: readonly(steps),
    selectedIndex,
    selectedStep,
    isDirty,
    hasSteps,
    isEditorOpen,
    editorMode,

    // Navigation
    canGoNext,
    canGoPrev,
    selectStep,
    scrollToStep,

    // Operations
    setSteps,
    markClean,
    getStepById,
    updateStep,
    updateStepContent,
    updateStepTips,
    moveStep,
    duplicateStep,

    // Coordinated actions
    handleAddStep,
    handleEditStep,
    handleRemoveStep,
    handleCloseEditor,
    handleNavigateEditor,
  };
}

// Export type for consumers
export type TimelineEditorContext = ReturnType<typeof useTimelineEditor>;
