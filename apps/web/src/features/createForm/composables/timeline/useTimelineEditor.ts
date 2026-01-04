import { ref, readonly, computed, nextTick } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import type { FormStep, StepType, StepContent, FormContext } from '@/shared/stepCards';
import {
  createDefaultWelcomeContent,
  createDefaultThankYouContent,
  createDefaultContactInfoContent,
  createDefaultConsentContent,
  createDefaultRewardContent,
} from '../../functions';

function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Timeline Editor - Shared Composable
 *
 * Single source of truth for form timeline editing.
 * Uses createSharedComposable for singleton pattern with full type safety.
 *
 * Usage:
 * - Page: const editor = useTimelineEditor(); editor.setFormId(formId);
 * - Components: const editor = useTimelineEditor(); // Just import and use
 */
export const useTimelineEditor = createSharedComposable(() => {
  // ============================================
  // Core State
  // ============================================
  const currentFormId = ref<string | null>(null);
  const steps = ref<FormStep[]>([]);
  const originalSteps = ref<FormStep[]>([]);
  const selectedIndex = ref(0);
  const isEditorOpen = ref(false);
  const editorMode = ref<'edit' | 'add'>('edit');

  // Form context for dynamic step defaults (e.g., product name)
  const formContext = ref<FormContext>({});

  // Flag to prevent scroll detection from overriding programmatic selections
  const isProgrammaticScroll = ref(false);
  let programmaticScrollTimeout: ReturnType<typeof setTimeout> | null = null;

  // ============================================
  // Computed
  // ============================================
  const isDirty = computed(() => {
    return JSON.stringify(steps.value) !== JSON.stringify(originalSteps.value);
  });

  const hasSteps = computed(() => steps.value.length > 0);

  const selectedStep = computed(() => {
    return steps.value[selectedIndex.value] ?? null;
  });

  const canGoNext = computed(() => {
    return selectedIndex.value < steps.value.length - 1;
  });

  const canGoPrev = computed(() => {
    return selectedIndex.value > 0;
  });

  // ============================================
  // Form ID Management
  // ============================================
  function setFormId(formId: string) {
    if (currentFormId.value === formId) return;

    // Reset all state for new form
    currentFormId.value = formId;
    steps.value = [];
    originalSteps.value = [];
    selectedIndex.value = 0;
    isEditorOpen.value = false;
    editorMode.value = 'edit';
  }

  function resetState() {
    currentFormId.value = null;
    steps.value = [];
    originalSteps.value = [];
    selectedIndex.value = 0;
    isEditorOpen.value = false;
    editorMode.value = 'edit';
    formContext.value = {};
  }

  /**
   * Set form context for dynamic step defaults.
   * Call this when the form's product name changes.
   */
  function setFormContext(ctx: FormContext) {
    formContext.value = ctx;
  }

  // ============================================
  // Step State Management
  // ============================================
  function setSteps(newSteps: FormStep[]) {
    steps.value = [...newSteps];
    originalSteps.value = JSON.parse(JSON.stringify(newSteps));
  }

  function markClean() {
    originalSteps.value = JSON.parse(JSON.stringify(steps.value));
  }

  function getStepById(id: string): FormStep | undefined {
    return steps.value.find(s => s.id === id);
  }

  // ============================================
  // Navigation
  // ============================================
  function selectStep(index: number) {
    if (index >= 0 && index < steps.value.length) {
      selectedIndex.value = index;
    }
  }

  function selectStepById(id: string) {
    const index = steps.value.findIndex(s => s.id === id);
    if (index !== -1) {
      selectStep(index);
    }
  }

  function goNext() {
    if (canGoNext.value) {
      selectStep(selectedIndex.value + 1);
    }
  }

  function goPrev() {
    if (canGoPrev.value) {
      selectStep(selectedIndex.value - 1);
    }
  }

  /**
   * Scroll to a step element in the timeline canvas.
   * Uses data-attribute selector to stay loosely coupled from render implementation.
   * Sets isProgrammaticScroll flag to prevent scroll detection from overriding selection.
   *
   * Uses scrollTo on the container instead of scrollIntoView to work better with scroll-snap.
   */
  function scrollToStep(index: number) {
    // Set flag to prevent scroll detection from fighting this
    isProgrammaticScroll.value = true;
    if (programmaticScrollTimeout) {
      clearTimeout(programmaticScrollTimeout);
    }

    const container = document.querySelector('.timeline-scroll');
    const element = document.querySelector(`[data-step-index="${index}"]`);

    if (container && element) {
      // Calculate scroll position to center the element in the container
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // Current scroll position + element's position relative to container - offset to center
      const scrollTop = container.scrollTop
        + (elementRect.top - containerRect.top)
        - (containerRect.height / 2)
        + (elementRect.height / 2);

      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth',
      });
    }

    // Clear flag after animation completes (~500ms for smooth scroll)
    programmaticScrollTimeout = setTimeout(() => {
      isProgrammaticScroll.value = false;
    }, 600);
  }

  // ============================================
  // Step Operations
  // ============================================
  function createStep(type: StepType, order: number): FormStep {
    const ctx = formContext.value;

    const baseStep: FormStep = {
      id: generateTempId(),
      formId: currentFormId.value ?? '',
      stepType: type,
      stepOrder: order,
      questionId: null,
      content: {},
      tips: [],
      isActive: true,
      isNew: true,
      isModified: false,
    };

    // Set default content based on type, using form context for personalization
    switch (type) {
      case 'welcome':
        baseStep.content = createDefaultWelcomeContent(ctx);
        break;
      case 'thank_you':
        baseStep.content = createDefaultThankYouContent(ctx);
        break;
      case 'contact_info':
        baseStep.content = createDefaultContactInfoContent(ctx);
        break;
      case 'consent':
        baseStep.content = createDefaultConsentContent(ctx);
        break;
      case 'reward':
        baseStep.content = createDefaultRewardContent(ctx);
        break;
      case 'question':
      case 'rating':
        // These need question_id, handled separately
        break;
    }

    return baseStep;
  }

  function reorderSteps() {
    steps.value.forEach((step, index) => {
      step.stepOrder = index;
    });
  }

  function addStep(type: StepType, afterIndex?: number): FormStep {
    const insertIndex = afterIndex !== undefined
      ? afterIndex + 1
      : steps.value.length;

    const newStep = createStep(type, insertIndex);

    steps.value.splice(insertIndex, 0, newStep);
    reorderSteps();

    return newStep;
  }

  function removeStep(index: number) {
    if (index >= 0 && index < steps.value.length) {
      steps.value.splice(index, 1);
      reorderSteps();
    }
  }

  function updateStep(index: number, updates: Partial<FormStep>) {
    if (index >= 0 && index < steps.value.length) {
      steps.value[index] = {
        ...steps.value[index],
        ...updates,
        isModified: true,
      };
    }
  }

  function updateStepContent(index: number, content: StepContent) {
    updateStep(index, { content });
  }

  function updateStepTips(index: number, tips: string[]) {
    updateStep(index, { tips });
  }

  function moveStep(fromIndex: number, toIndex: number) {
    if (
      fromIndex >= 0 && fromIndex < steps.value.length &&
      toIndex >= 0 && toIndex < steps.value.length
    ) {
      const [removed] = steps.value.splice(fromIndex, 1);
      steps.value.splice(toIndex, 0, removed);
      reorderSteps();
    }
  }

  function duplicateStep(index: number): FormStep | null {
    const original = steps.value[index];
    if (!original) return null;

    const duplicate = createStep(original.stepType, index + 1);
    duplicate.content = JSON.parse(JSON.stringify(original.content));
    duplicate.tips = [...original.tips];

    steps.value.splice(index + 1, 0, duplicate);
    reorderSteps();

    return duplicate;
  }

  function changeStepType(index: number, newType: StepType) {
    const step = steps.value[index];
    if (!step || step.stepType === newType) return;

    const ctx = formContext.value;

    // Create default content for the new type, using form context
    let newContent: StepContent = {};

    switch (newType) {
      case 'welcome':
        newContent = createDefaultWelcomeContent(ctx);
        break;
      case 'thank_you':
        newContent = createDefaultThankYouContent(ctx);
        break;
      case 'contact_info':
        newContent = createDefaultContactInfoContent(ctx);
        break;
      case 'consent':
        newContent = createDefaultConsentContent(ctx);
        break;
      case 'reward':
        newContent = createDefaultRewardContent(ctx);
        break;
      case 'question':
      case 'rating':
        // These need question_id, content is empty
        newContent = {};
        break;
    }

    steps.value[index] = {
      ...step,
      stepType: newType,
      content: newContent,
      questionId: null, // Reset question association
      isModified: true,
    };
  }

  // ============================================
  // Coordinated Actions (UI handlers)
  // ============================================
  function handleAddStep(type: StepType, afterIndex?: number) {
    const newStep = addStep(type, afterIndex);
    const newIndex = steps.value.indexOf(newStep);
    selectStep(newIndex);

    // Scroll to new step after DOM updates
    nextTick(() => {
      scrollToStep(newIndex);
    });
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
      scrollToStep(selectedIndex.value);
    } else if (direction === 'next' && canGoNext.value) {
      goNext();
      scrollToStep(selectedIndex.value);
    }
  }

  return {
    // Form ID
    currentFormId: readonly(currentFormId),
    setFormId,
    resetState,

    // Form Context (for dynamic step defaults)
    formContext: readonly(formContext),
    setFormContext,

    // State (readonly where appropriate)
    steps: readonly(steps),
    selectedIndex,
    selectedStep,
    isDirty,
    hasSteps,
    isEditorOpen,
    editorMode,
    isProgrammaticScroll: readonly(isProgrammaticScroll),

    // Navigation
    canGoNext,
    canGoPrev,
    selectStep,
    selectStepById,
    goNext,
    goPrev,
    scrollToStep,

    // Step State
    setSteps,
    markClean,
    getStepById,

    // Operations
    addStep,
    removeStep,
    updateStep,
    updateStepContent,
    updateStepTips,
    moveStep,
    duplicateStep,
    changeStepType,

    // Coordinated Actions
    handleAddStep,
    handleEditStep,
    handleRemoveStep,
    handleCloseEditor,
    handleNavigateEditor,
  };
});

// Export type for consumers
export type TimelineEditorContext = ReturnType<typeof useTimelineEditor>;
