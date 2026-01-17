/**
 * Timeline Editor Types (ADR-014 Phase 5, Code Review CR-002)
 *
 * FSD-compliant type definitions for timeline editor composables.
 * Types are defined here in the models/ folder per FSD architecture.
 * Composables import these types; consumers can import from models/index.ts.
 */
import type { ComputedRef, Ref, WritableComputedRef } from 'vue';
import type { FormStep, StepType, StepContent, FlowMembership } from '@/entities/formStep';
import type { useDirtyTracker } from '../composables/autoSave/useDirtyTracker';

// =============================================================================
// Timeline State (useTimelineState)
// =============================================================================

/** Timeline state interface for type-safe composition */
export interface TimelineState {
  // Core state
  steps: Ref<FormStep[]>;
  originalSteps: Ref<FormStep[]>;
  selectedIndex: Ref<number>;

  // Computed
  currentStep: ComputedRef<FormStep | null>;
  isDirty: ComputedRef<boolean>;
  hasSteps: ComputedRef<boolean>;

  // State management
  initialize: (newSteps: FormStep[]) => void;
  reset: () => void;
  setSteps: (newSteps: FormStep[]) => void;
  updateStepInState: (index: number, updates: Partial<FormStep>) => void;
  getStepById: (id: string) => FormStep | undefined;
  markClean: () => void;
}

// =============================================================================
// Timeline Selection (useTimelineSelection)
// =============================================================================

/** Selection interface for type-safe composition */
export interface TimelineSelection {
  selectedIndex: ComputedRef<number>;
  currentStep: ComputedRef<FormStep | null>;
  canGoNext: ComputedRef<boolean>;
  canGoPrev: ComputedRef<boolean>;
  isSelectionValid: ComputedRef<boolean>;
  selectStep: (index: number) => void;
  selectStepById: (id: string) => void;
  selectNextStep: () => void;
  selectPreviousStep: () => void;
  resetSelection: () => void;
}

/**
 * @deprecated Use TimelineSelection instead - backward compat for useTimelineEditor
 *
 * Uses WritableComputedRef instead of Ref to bridge the singleton's ComputedRef<number>
 * to a mutable interface expected by legacy code. The writable computed reads from
 * the singleton and writes to the underlying state. CR-003 fix.
 */
export interface TimelineSelectionReturn {
  selectedIndex: WritableComputedRef<number>;
  selectedStep: ComputedRef<FormStep | null>;
  canGoNext: ComputedRef<boolean>;
  canGoPrev: ComputedRef<boolean>;
  selectStep: (index: number) => void;
  selectStepById: (id: string) => void;
  resetSelection: () => void;
}

// =============================================================================
// Timeline Step Operations (useTimelineStepOps)
// =============================================================================

/** Options for adding a step */
export interface StepAddOptions {
  /** Position after which to insert (default: end of list) */
  afterIndex?: number;
  /** Select the new step after adding (default: true) */
  select?: boolean;
  /** Flow membership for the new step (default: 'shared') */
  flowMembership?: FlowMembership;
  /** Flow ID for the new step (required for persistence) */
  flowId?: string;
}

/** Step operations interface (local + persist combined) */
export interface TimelineStepOps {
  // Read operations
  hasSteps: ComputedRef<boolean>;
  stepCount: ComputedRef<number>;
  getStepById: (id: string) => FormStep | undefined;
  getStepIndex: (id: string) => number;

  // Write operations (local state only)
  addStepLocal: (type: StepType, options?: StepAddOptions) => FormStep;
  removeStepLocal: (index: number) => void;
  updateStep: (index: number, updates: Partial<FormStep>) => void;
  updateStepContent: (index: number, content: StepContent) => void;
  updateStepById: (id: string, updates: Partial<FormStep>) => void;
  moveStepLocal: (fromIndex: number, toIndex: number) => void;
  duplicateStepLocal: (index: number) => FormStep | null;

  // Persisted operations (uses unified persistence layer)
  addStepWithPersist: (type: StepType, options?: StepAddOptions) => Promise<FormStep | null>;
  removeStepWithPersist: (index: number) => Promise<boolean>;
  reorderStepsWithPersist: (fromIndex: number, toIndex: number) => Promise<boolean>;
  duplicateStepWithPersist: (index: number) => Promise<FormStep | null>;

  // Persistence state
  isPersisting: Readonly<Ref<boolean>>;
}

/** Local-only step operations interface */
export interface TimelineStepOpsLocal {
  hasSteps: ComputedRef<boolean>;
  stepCount: ComputedRef<number>;
  getStepById: (id: string) => FormStep | undefined;
  getStepIndex: (id: string) => number;
  addStepLocal: (type: StepType, options?: StepAddOptions) => FormStep;
  removeStepLocal: (index: number) => void;
  updateStep: (index: number, updates: Partial<FormStep>) => void;
  updateStepContent: (index: number, content: StepContent) => void;
  updateStepById: (id: string, updates: Partial<FormStep>) => void;
  moveStepLocal: (fromIndex: number, toIndex: number) => void;
  duplicateStepLocal: (index: number) => FormStep | null;
  reorderLocalSteps: () => void;
}

/** Persisted step operations interface */
export interface TimelineStepOpsPersist {
  addStepWithPersist: (type: StepType, options?: StepAddOptions) => Promise<FormStep | null>;
  removeStepWithPersist: (index: number) => Promise<boolean>;
  reorderStepsWithPersist: (fromIndex: number, toIndex: number) => Promise<boolean>;
  duplicateStepWithPersist: (index: number) => Promise<FormStep | null>;
  isPersisting: Readonly<Ref<boolean>>;
}

// =============================================================================
// Timeline Persistence (useTimelinePersistence)
// =============================================================================

/** Persistence coordination interface */
export interface TimelinePersistence {
  /** Whether a save operation is in progress */
  isSaving: ComputedRef<boolean>;
  /** Current lock reason if locked */
  lockReason: Ref<string | null>;
  /** Whether any step has pending changes */
  hasPendingStepChanges: ComputedRef<boolean>;
  /** Mark a step as dirty */
  markStepDirty: (stepId: string) => void;
  /** Check if a step is dirty */
  isStepDirty: (stepId: string) => boolean;
  /** Execute with save lock */
  withLock: <T>(key: string, fn: () => Promise<T>) => Promise<T>;
  /** Mark current state as clean (after save) */
  markClean: () => void;
  /** Get all dirty step IDs */
  getDirtyStepIds: () => string[];
  /** Capture and clear dirty state (for save operations) */
  snapshotDirtyState: () => ReturnType<ReturnType<typeof useDirtyTracker>['snapshot']>;
}

// =============================================================================
// Timeline Computed (useTimelineComputed)
// =============================================================================

/** Computed step groupings interface */
export interface TimelineComputed {
  /** Steps in shared flow */
  sharedSteps: ComputedRef<FormStep[]>;
  /** Steps in testimonial flow */
  testimonialSteps: ComputedRef<FormStep[]>;
  /** Steps in improvement flow */
  improvementSteps: ComputedRef<FormStep[]>;
  /** Welcome step (first step, usually) */
  welcomeStep: ComputedRef<FormStep | null>;
  /** Rating step (branch point) */
  ratingStep: ComputedRef<FormStep | null>;
  /** Thank you steps (may be multiple for different flows) */
  thankYouSteps: ComputedRef<FormStep[]>;
  /** Total step count */
  stepCount: ComputedRef<number>;
  /** Whether form has a rating step */
  hasRatingStep: ComputedRef<boolean>;
  /** Whether form has multiple flows (branching enabled) */
  hasMultipleFlows: ComputedRef<boolean>;
}
