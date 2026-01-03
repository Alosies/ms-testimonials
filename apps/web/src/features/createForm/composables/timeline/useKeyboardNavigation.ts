import { onKeyStroke } from '@vueuse/core';
import { useTimelineEditor } from './useTimelineEditor';

/**
 * Keyboard navigation for timeline editor.
 *
 * Provides vim-style and arrow key navigation:
 * - ↑/k: Previous step
 * - ↓/j: Next step
 * - Enter/Space/e: Open editor
 * - Backspace/Delete: Delete selected step
 * - n: Add new step (welcome if empty, question otherwise)
 */
export function useKeyboardNavigation() {
  const editor = useTimelineEditor();

  function isInputFocused(): boolean {
    const el = document.activeElement;
    return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
  }

  function navigateNext() {
    if (isInputFocused()) return;
    const stepsCount = editor.steps.value.length;
    const currentIndex = editor.selectedIndex.value ?? 0;
    if (stepsCount > 0 && currentIndex < stepsCount - 1) {
      const newIndex = currentIndex + 1;
      editor.selectStep(newIndex);
      editor.scrollToStep(newIndex);
    }
  }

  function navigatePrev() {
    if (isInputFocused()) return;
    const currentIndex = editor.selectedIndex.value ?? 0;
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      editor.selectStep(newIndex);
      editor.scrollToStep(newIndex);
    }
  }

  function openEditor() {
    if (isInputFocused()) return;
    const currentIndex = editor.selectedIndex.value ?? 0;
    if (editor.steps.value.length > 0) {
      editor.handleEditStep(currentIndex);
    }
  }

  function deleteSelectedStep() {
    if (isInputFocused()) return;
    if (editor.isEditorOpen.value) return;
    const currentIndex = editor.selectedIndex.value ?? 0;
    if (editor.steps.value.length > 0) {
      editor.handleRemoveStep(currentIndex);
    }
  }

  function addNewStep() {
    if (isInputFocused()) return;
    if (editor.isEditorOpen.value) return;
    const stepType = editor.steps.value.length === 0 ? 'welcome' : 'question';
    editor.handleAddStep(stepType);
  }

  // Register keyboard handlers
  onKeyStroke(['ArrowDown', 'j'], navigateNext, { eventName: 'keydown' });
  onKeyStroke(['ArrowUp', 'k'], navigatePrev, { eventName: 'keydown' });
  onKeyStroke(['Enter', ' ', 'e'], openEditor, { eventName: 'keydown' });
  onKeyStroke(['Backspace', 'Delete'], deleteSelectedStep, { eventName: 'keydown' });
  onKeyStroke('n', addNewStep, { eventName: 'keydown' });

  return {
    navigateNext,
    navigatePrev,
    openEditor,
    deleteSelectedStep,
    addNewStep,
  };
}
