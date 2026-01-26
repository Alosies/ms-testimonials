/**
 * Timeline Step Operations - Local State Only (ADR-014 Phase 5, Code Review)
 *
 * Single-responsibility composable for local step operations.
 * These operations modify local state only without persistence.
 * Use useTimelineStepOpsPersist for operations that need database sync.
 *
 * Extracted from useTimelineStepOps per CR-001 (300-line max compliance).
 */
import { computed } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import type { FormStep, StepType, StepContent } from '@/entities/formStep';
import { getStepTypeConfig, getStepTypeDefaultContent, useStepPersistence } from '@/entities/formStep';
import { useTimelineState } from './useTimelineState';
import { useTimelineSelection } from './useTimelineSelection';
import type { StepAddOptions, TimelineStepOpsLocal } from '../../models/timeline';

// Re-export types for consumers (CR-002: types from models/)
export type { StepAddOptions, TimelineStepOpsLocal } from '../../models/timeline';

// =============================================================================
// Helper: Generate temporary ID
// =============================================================================

export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// =============================================================================
// Composable Implementation
// =============================================================================

export const useTimelineStepOpsLocal = createSharedComposable((): TimelineStepOpsLocal => {
  const state = useTimelineState();
  const selection = useTimelineSelection();
  const stepPersistence = useStepPersistence();

  // Computed properties
  const hasSteps = computed(() => state.steps.value.length > 0);
  const stepCount = computed(() => state.steps.value.length);

  // Read operations
  function getStepById(id: string): FormStep | undefined {
    return state.steps.value.find(s => s.id === id);
  }

  function getStepIndex(id: string): number {
    return state.steps.value.findIndex(s => s.id === id);
  }

  // Reorder helper - updates stepOrder for all steps
  function reorderLocalSteps(): void {
    state.steps.value.forEach((step, index) => {
      step.stepOrder = index;
    });
  }

  function addStepLocal(type: StepType, options: StepAddOptions = {}): FormStep {
    const { afterIndex, select = true, flowMembership = 'shared', flowId = '' } = options;
    const config = getStepTypeConfig(type);

    // Validate flow membership - use first allowed flow as fallback if requested flow not allowed
    const actualFlowMembership = config.allowedFlows.includes(flowMembership)
      ? flowMembership
      : config.allowedFlows[0] ?? 'shared';
    if (!config.allowedFlows.includes(flowMembership)) {
      console.warn(`Step type "${type}" not allowed in flow "${flowMembership}", using '${actualFlowMembership}'`);
    }

    const insertIndex = afterIndex !== undefined
      ? Math.min(afterIndex + 1, state.steps.value.length)
      : state.steps.value.length;

    const newStep: FormStep = {
      id: generateTempId(),
      flowId,
      stepType: type,
      stepOrder: insertIndex,
      content: getStepTypeDefaultContent(type) as StepContent,
      tips: [],
      flowMembership: actualFlowMembership,
      isActive: true,
      isNew: true,
      isModified: false,
      question: null,
    };

    // Insert and reorder
    state.steps.value.splice(insertIndex, 0, newStep);
    reorderLocalSteps();

    // Select if requested
    if (select) {
      selection.selectStep(insertIndex);
    }

    return newStep;
  }

  function removeStepLocal(index: number): void {
    if (index >= 0 && index < state.steps.value.length) {
      state.steps.value.splice(index, 1);
      reorderLocalSteps();
    }
  }

  function updateStep(index: number, updates: Partial<FormStep>): void {
    if (index >= 0 && index < state.steps.value.length) {
      state.steps.value[index] = {
        ...state.steps.value[index],
        ...updates,
        isModified: true,
      };
    }
  }

  function updateStepContent(index: number, content: StepContent): void {
    updateStep(index, { content });

    // Mark as dirty for deferred save (auto-save handles)
    const step = state.steps.value[index];
    if (step && !step.isNew) {
      stepPersistence.updateStep(step.id, { content }, { mode: 'deferred' });
    }
  }

  function updateStepById(id: string, updates: Partial<FormStep>): void {
    const index = getStepIndex(id);
    if (index !== -1) {
      updateStep(index, updates);
    }
  }

  function moveStepLocal(fromIndex: number, toIndex: number): void {
    if (
      fromIndex >= 0 && fromIndex < state.steps.value.length &&
      toIndex >= 0 && toIndex < state.steps.value.length &&
      fromIndex !== toIndex
    ) {
      const [removed] = state.steps.value.splice(fromIndex, 1);
      state.steps.value.splice(toIndex, 0, removed);
      reorderLocalSteps();
    }
  }

  function duplicateStepLocal(index: number): FormStep | null {
    const original = state.steps.value[index];
    if (!original) return null;

    const duplicate: FormStep = {
      ...original,
      id: generateTempId(),
      stepOrder: index + 1,
      content: structuredClone(original.content),
      tips: [...(original.tips || [])],
      isNew: true,
      isModified: false,
      question: null, // Question must be created separately
    };

    state.steps.value.splice(index + 1, 0, duplicate);
    reorderLocalSteps();
    selection.selectStep(index + 1);

    return duplicate;
  }

  return {
    // Read
    hasSteps,
    stepCount,
    getStepById,
    getStepIndex,

    // Write (local only)
    addStepLocal,
    removeStepLocal,
    updateStep,
    updateStepContent,
    updateStepById,
    moveStepLocal,
    duplicateStepLocal,

    // Helper
    reorderLocalSteps,
  };
});
