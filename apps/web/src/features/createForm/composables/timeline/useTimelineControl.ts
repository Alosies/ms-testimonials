/**
 * Timeline Control - Workflow control for toolbar/navigation
 *
 * ADR-014 Phase 3: Interface Segregation Principle (ISP) compliance.
 *
 * Use this in toolbar and navigation components that need to control
 * the timeline workflow (selection, saving, navigation).
 *
 * @deprecated This Phase 3 composable wraps the legacy useTimelineEditor.
 * In Phase 7, it should be refactored to compose from Phase 5 singletons directly:
 * - useTimelineSelection for selection/navigation
 * - useTimelinePersistence for save state
 *
 * TODO (Phase 7): Refactor to compose from Phase 5 singletons directly.
 *
 * @example
 * ```ts
 * // In FormStudioToolbar.vue
 * const { selectStep, selectNextStep, canGoNext, canGoPrev } = useTimelineControl();
 * ```
 */
import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';
import { useTimelineEditor } from './useTimelineEditor';

/**
 * Workflow control interface for timeline navigation.
 */
export interface TimelineControl {
  /** Select a step by index */
  selectStep: (index: number) => void;

  /** Select a step by ID */
  selectStepById: (id: string) => void;

  /** Whether can navigate to next step */
  canGoNext: ComputedRef<boolean>;

  /** Whether can navigate to previous step */
  canGoPrev: ComputedRef<boolean>;

  /** Current selection index */
  selectedIndex: ComputedRef<number>;

  /** Whether form has unsaved changes */
  isDirty: ComputedRef<boolean>;

  /** Reset state to original values */
  resetState: () => void;

  /** Mark changes as saved/clean */
  markClean: () => void;

  /** Whether the editor panel is open */
  isEditorOpen: Ref<boolean>;

  /** Current editor mode */
  editorMode: Ref<'edit' | 'add'>;

  /** Close the editor panel */
  handleCloseEditor: () => void;

  /** Open editor for a specific step */
  handleEditStep: (index: number) => void;
}

/**
 * Workflow control for timeline.
 *
 * Use this in toolbar and navigation components.
 */
export function useTimelineControl(): TimelineControl {
  const editor = useTimelineEditor();

  return {
    // Selection
    selectStep: editor.selectStep,
    selectStepById: editor.selectStepById,
    selectedIndex: computed(() => editor.selectedIndex.value),

    // Navigation checks
    canGoNext: computed(() => editor.canGoNext.value),
    canGoPrev: computed(() => editor.canGoPrev.value),

    // Dirty state
    isDirty: computed(() => editor.isDirty.value),
    markClean: editor.markClean,

    // Reset
    resetState: editor.resetState,

    // Editor panel state
    isEditorOpen: editor.isEditorOpen,
    editorMode: editor.editorMode,
    handleCloseEditor: editor.handleCloseEditor,
    handleEditStep: editor.handleEditStep,
  };
}
