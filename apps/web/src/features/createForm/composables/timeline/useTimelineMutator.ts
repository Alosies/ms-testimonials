/**
 * Timeline Mutator - Write operations for timeline state
 *
 * ADR-014 Phase 3: Interface Segregation Principle (ISP) compliance.
 *
 * Use this in components that need to modify step data.
 * Operations trigger appropriate save mechanisms (immediate or deferred).
 *
 * @deprecated This Phase 3 composable wraps the legacy useTimelineEditor.
 * In Phase 7, it should be refactored to compose from Phase 5 singletons directly:
 * - useTimelineStepOps for local mutations
 * - useTimelineStepOpsPersist for persisted operations
 *
 * TODO (Phase 7): Refactor to compose from Phase 5 singletons directly.
 *
 * @example
 * ```ts
 * // In PropertiesPanel.vue
 * const { updateStep, updateStepContent, updateStepQuestion } = useTimelineMutator();
 * ```
 */
import { useTimelineEditor } from './useTimelineEditor';
import type { FormStep, StepType, StepContent } from '@/entities/formStep';

/**
 * Write operations interface for timeline mutation.
 * All operations trigger appropriate save mechanisms.
 */
export interface TimelineMutator {
  /** Update a step by index with partial changes */
  updateStep: (index: number, updates: Partial<FormStep>) => void;

  /** Update step content by index */
  updateStepContent: (index: number, content: StepContent) => void;

  /** Update step tips by index */
  updateStepTips: (index: number, tips: string[]) => void;

  /** Update question for a step by index */
  updateStepQuestion: (index: number, questionUpdates: Partial<FormStep['question']>) => void;

  /** Add a step with immediate persistence */
  addStep: (type: StepType, afterIndex?: number) => Promise<FormStep>;

  /** Remove a step with immediate persistence */
  removeStep: (index: number) => Promise<void>;

  /** Reorder steps with immediate persistence */
  reorderSteps: (fromIndex: number, toIndex: number) => Promise<void>;

  /** Duplicate a step with immediate persistence */
  duplicateStep: (index: number) => Promise<FormStep | null>;

  /** Change step type */
  changeStepType: (index: number, newType: StepType) => void;
}

/**
 * Write operations for timeline.
 *
 * Use this in components that need to modify step data.
 * Operations trigger appropriate save mechanisms.
 */
export function useTimelineMutator(): TimelineMutator {
  const editor = useTimelineEditor();

  return {
    // Local mutation operations (trigger auto-save via isDirty)
    updateStep: editor.updateStep,
    updateStepContent: editor.updateStepContent,
    updateStepTips: editor.updateStepTips,
    updateStepQuestion: editor.updateStepQuestion,
    changeStepType: editor.changeStepType,

    // Immediate persistence operations
    addStep: editor.addStepWithPersist,
    removeStep: editor.removeStepWithPersist,
    reorderSteps: editor.reorderStepsWithPersist,
    duplicateStep: editor.duplicateStepWithPersist,
  };
}
