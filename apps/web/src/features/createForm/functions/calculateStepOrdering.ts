/**
 * Calculate Step Ordering - Pure Functions for Step Reordering
 *
 * ADR-014 Phase 4: Extract step reordering logic as standalone functions.
 * These are pure functions that calculate new step orderings without side effects.
 *
 * Per-flow ordering constraint:
 * - Steps within the same flow must have unique step_order values
 * - Moving a step may affect orders within its flow only
 * - Cross-flow moves require flow assignment update + order recalculation
 */

import type {
  OrderableStep,
  ReorderResult,
  StepOrderUpdate,
  CalculateOrderingParams,
  RecalculateFlowOrderParams,
} from '../models/functionTypes';

/**
 * Calculate new step ordering after moving a step from one position to another
 *
 * This is a pure function that returns new ordering without mutating input.
 * All steps get sequential stepOrder values (0, 1, 2, ...) after reorder.
 *
 * @param params - Steps array and indices for move operation
 * @returns Result with reordered steps and changed step IDs
 *
 * @example
 * ```ts
 * const { reorderedSteps, changedStepIds } = calculateStepOrdering({
 *   steps: [...currentSteps],
 *   fromIndex: 2,
 *   toIndex: 0,
 * });
 *
 * // Use changedStepIds to determine which steps need persistence
 * const updates = getStepOrderUpdates(reorderedSteps, changedStepIds);
 * ```
 */
export function calculateStepOrdering<T extends OrderableStep>(
  params: CalculateOrderingParams<T>
): ReorderResult<T> {
  const { steps, fromIndex, toIndex } = params;

  // Validate indices
  if (
    fromIndex < 0 || fromIndex >= steps.length ||
    toIndex < 0 || toIndex >= steps.length
  ) {
    return {
      reorderedSteps: [...steps],
      changedStepIds: new Set(),
      success: false,
    };
  }

  // No change needed if same position
  if (fromIndex === toIndex) {
    return {
      reorderedSteps: [...steps],
      changedStepIds: new Set(),
      success: true,
    };
  }

  // Create a copy and perform the move
  const result = [...steps];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);

  // Track which steps changed order
  const changedStepIds = new Set<string>();

  // Update stepOrder for all steps and track changes
  const reorderedSteps = result.map((step, index) => {
    if (step.stepOrder !== index) {
      changedStepIds.add(step.id);
      return { ...step, stepOrder: index };
    }
    return step;
  });

  return {
    reorderedSteps,
    changedStepIds,
    success: true,
  };
}

/**
 * Recalculate step ordering within a specific flow
 *
 * Filters steps by flow membership, then assigns sequential orders
 * within that flow (0, 1, 2, ...).
 *
 * @param params - Steps array and target flow membership
 * @returns Steps in the flow with recalculated orders and changed IDs
 */
export function recalculateFlowOrdering<T extends OrderableStep>(
  params: RecalculateFlowOrderParams<T>
): ReorderResult<T> {
  const { steps, flowMembership } = params;

  // Filter to steps in the target flow
  const flowSteps = steps.filter(s => s.flowMembership === flowMembership);

  // Track changes
  const changedStepIds = new Set<string>();

  // Assign sequential orders
  const reorderedSteps = flowSteps.map((step, index) => {
    if (step.stepOrder !== index) {
      changedStepIds.add(step.id);
      return { ...step, stepOrder: index };
    }
    return step;
  });

  return {
    reorderedSteps,
    changedStepIds,
    success: true,
  };
}

/**
 * Get step order updates for database persistence
 *
 * Converts changed steps to the format needed for upsert mutations.
 * Only includes steps whose order actually changed.
 *
 * @param steps - All steps (with updated orders)
 * @param changedStepIds - Set of step IDs that changed
 * @returns Array of step order updates for persistence
 */
export function getStepOrderUpdates<T extends OrderableStep>(
  steps: T[],
  changedStepIds: Set<string>
): StepOrderUpdate[] {
  return steps
    .filter(step => changedStepIds.has(step.id))
    .map(step => ({
      id: step.id,
      step_order: step.stepOrder,
    }));
}

/**
 * Get all step order updates for database persistence
 *
 * Converts all steps to the format needed for upsert mutations.
 * Use this when you need to sync all orders (e.g., after major changes).
 *
 * @param steps - All steps (with updated orders)
 * @returns Array of step order updates for all steps
 */
export function getAllStepOrderUpdates<T extends OrderableStep>(
  steps: T[]
): StepOrderUpdate[] {
  return steps.map((step, index) => ({
    id: step.id,
    step_order: index,
  }));
}

/**
 * Validate that step orders within each flow are unique
 *
 * Checks the per-flow uniqueness constraint that exists in the database.
 * Uses dynamic Map to support any flow membership value (ADR-018 generic approach).
 *
 * @param steps - Steps to validate
 * @returns Whether all flows have unique step orders
 */
export function validateStepOrders<T extends OrderableStep>(
  steps: T[]
): { valid: boolean; duplicates: { flowMembership: string; order: number }[] } {
  // Use Map for dynamic flow membership support (no hardcoded values)
  const ordersByFlow = new Map<string, Set<number>>();

  const duplicates: { flowMembership: string; order: number }[] = [];

  for (const step of steps) {
    // Initialize set for flow if not exists
    if (!ordersByFlow.has(step.flowMembership)) {
      ordersByFlow.set(step.flowMembership, new Set());
    }

    const flowOrders = ordersByFlow.get(step.flowMembership)!;
    if (flowOrders.has(step.stepOrder)) {
      duplicates.push({
        flowMembership: step.flowMembership,
        order: step.stepOrder,
      });
    }
    flowOrders.add(step.stepOrder);
  }

  return {
    valid: duplicates.length === 0,
    duplicates,
  };
}

/**
 * Normalize step orders to be sequential within each flow
 *
 * Ensures each flow has steps ordered 0, 1, 2, ... without gaps.
 * Use after operations that may create gaps (e.g., deletions).
 * Uses dynamic Map to support any flow membership value (ADR-018 generic approach).
 *
 * @param steps - Steps to normalize
 * @returns Steps with normalized orders and changed IDs
 */
export function normalizeStepOrders<T extends OrderableStep>(
  steps: T[]
): ReorderResult<T> {
  const changedStepIds = new Set<string>();

  // Group steps by flow using Map (no hardcoded values)
  const flowGroups = new Map<string, T[]>();

  for (const step of steps) {
    if (!flowGroups.has(step.flowMembership)) {
      flowGroups.set(step.flowMembership, []);
    }
    flowGroups.get(step.flowMembership)!.push(step);
  }

  // Normalize each flow's ordering
  const normalizedSteps: T[] = [];

  for (const [_flowMembership, flowSteps] of flowGroups) {
    // Sort by current order to preserve relative positions
    flowSteps.sort((a, b) => a.stepOrder - b.stepOrder);

    for (let i = 0; i < flowSteps.length; i++) {
      const step = flowSteps[i];
      if (step.stepOrder !== i) {
        changedStepIds.add(step.id);
        normalizedSteps.push({ ...step, stepOrder: i });
      } else {
        normalizedSteps.push(step);
      }
    }
  }

  return {
    reorderedSteps: normalizedSteps,
    changedStepIds,
    success: true,
  };
}
