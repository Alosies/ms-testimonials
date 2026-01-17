/**
 * Timeline Step Operations - Orchestrator (ADR-014 Phase 5, 6, Code Review)
 *
 * Thin orchestrator composable that composes from:
 * - useTimelineStepOpsLocal: Local-only state operations
 * - useTimelineStepOpsPersist: Persisted operations with database sync
 *
 * This file was refactored per CR-001 to comply with the 300-line max limit.
 *
 * @see useTimelineStepOpsLocal for local state operations
 * @see useTimelineStepOpsPersist for database persistence operations
 */
import { createSharedComposable } from '@vueuse/core';
import { useTimelineStepOpsLocal } from './useTimelineStepOpsLocal';
import { useTimelineStepOpsPersist } from './useTimelineStepOpsPersist';
import type { TimelineStepOps } from '../../models/timeline';

// Re-export types for consumers (CR-002: types from models/)
export type { StepAddOptions, TimelineStepOps, TimelineStepOpsLocal, TimelineStepOpsPersist } from '../../models/timeline';

// =============================================================================
// Composable Implementation
// =============================================================================

export const useTimelineStepOps = createSharedComposable((): TimelineStepOps => {
  const localOps = useTimelineStepOpsLocal();
  const persistOps = useTimelineStepOpsPersist();

  return {
    // Read operations (from local)
    hasSteps: localOps.hasSteps,
    stepCount: localOps.stepCount,
    getStepById: localOps.getStepById,
    getStepIndex: localOps.getStepIndex,

    // Write operations - local only (from local)
    addStepLocal: localOps.addStepLocal,
    removeStepLocal: localOps.removeStepLocal,
    updateStep: localOps.updateStep,
    updateStepContent: localOps.updateStepContent,
    updateStepById: localOps.updateStepById,
    moveStepLocal: localOps.moveStepLocal,
    duplicateStepLocal: localOps.duplicateStepLocal,

    // Write operations - with persistence (from persist)
    addStepWithPersist: persistOps.addStepWithPersist,
    removeStepWithPersist: persistOps.removeStepWithPersist,
    reorderStepsWithPersist: persistOps.reorderStepsWithPersist,
    duplicateStepWithPersist: persistOps.duplicateStepWithPersist,

    // Persistence state (from persist)
    isPersisting: persistOps.isPersisting,
  };
});
