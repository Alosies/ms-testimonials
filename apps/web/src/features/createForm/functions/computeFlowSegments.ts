/**
 * Flow Segment Computation - ADR-020
 *
 * Groups flows and steps into segments for generic canvas rendering.
 * Supports any sequence of shared/branch flows:
 * Shared(intro) → Branch → Shared(outro) → Branch → Shared
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Minimal flow interface for segment computation
 */
export interface SegmentableFlow {
  id: string;
  flowType: 'shared' | 'branch';
  displayOrder: number;
}

/**
 * Minimal step interface for segment computation
 */
export interface SegmentableStep {
  id: string;
  flowId: string;
}

/**
 * Shared segment - contains steps from one or more consecutive shared flows
 */
export interface SharedSegment {
  type: 'shared';
  flows: SegmentableFlow[];
  steps: SegmentableStep[];
}

/**
 * Branch segment - contains steps grouped by flow (testimonial/improvement columns)
 */
export interface BranchSegment {
  type: 'branch';
  flows: SegmentableFlow[];
  stepsByFlow: Map<string, SegmentableStep[]>;
}

/**
 * Union type for all segment types
 */
export type FlowSegment = SharedSegment | BranchSegment;

/**
 * Result of computing flow segments
 */
export interface ComputeSegmentsResult {
  segments: FlowSegment[];
  hasIntro: boolean;
  hasOutro: boolean;
  hasBranches: boolean;
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard for shared segments
 */
export function isSharedSegment(segment: FlowSegment): segment is SharedSegment {
  return segment.type === 'shared';
}

/**
 * Type guard for branch segments
 */
export function isBranchSegment(segment: FlowSegment): segment is BranchSegment {
  return segment.type === 'branch';
}

// =============================================================================
// Computation
// =============================================================================

/**
 * Compute flow segments from flows sorted by display_order.
 * Groups consecutive shared flows and branch flows into segments.
 *
 * @param flows - Array of flows with flowType and displayOrder
 * @param steps - Array of steps with flowId
 * @returns Computed segments and metadata
 */
export function computeFlowSegments<
  F extends SegmentableFlow,
  S extends SegmentableStep
>(flows: F[], steps: S[]): ComputeSegmentsResult {
  if (flows.length === 0) {
    return {
      segments: [],
      hasIntro: false,
      hasOutro: false,
      hasBranches: false,
    };
  }

  // Sort flows by display_order
  const sortedFlows = [...flows].sort((a, b) => a.displayOrder - b.displayOrder);
  const segments: FlowSegment[] = [];

  let i = 0;
  while (i < sortedFlows.length) {
    const flow = sortedFlows[i];

    if (flow.flowType === 'shared') {
      // Collect consecutive shared flows
      const sharedFlows: F[] = [];
      while (i < sortedFlows.length && sortedFlows[i].flowType === 'shared') {
        sharedFlows.push(sortedFlows[i]);
        i++;
      }

      // Get steps belonging to these shared flows
      const sharedFlowIds = new Set(sharedFlows.map(f => f.id));
      const sharedSteps = steps.filter(s => sharedFlowIds.has(s.flowId));

      segments.push({
        type: 'shared',
        flows: sharedFlows,
        steps: sharedSteps,
      });
    } else {
      // Collect consecutive branch flows
      const branchFlows: F[] = [];
      while (i < sortedFlows.length && sortedFlows[i].flowType === 'branch') {
        branchFlows.push(sortedFlows[i]);
        i++;
      }

      // Group steps by flow
      const stepsByFlow = new Map<string, S[]>();
      for (const bf of branchFlows) {
        stepsByFlow.set(bf.id, steps.filter(s => s.flowId === bf.id));
      }

      segments.push({
        type: 'branch',
        flows: branchFlows,
        stepsByFlow,
      });
    }
  }

  // Determine metadata
  const hasIntro = segments.length > 0 && segments[0].type === 'shared';
  const hasOutro = segments.length > 1 && segments[segments.length - 1].type === 'shared';
  const hasBranches = segments.some(s => s.type === 'branch');

  return {
    segments,
    hasIntro,
    hasOutro,
    hasBranches,
  };
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Get all steps from all segments in display order
 */
export function getAllSegmentSteps(segments: FlowSegment[]): SegmentableStep[] {
  const allSteps: SegmentableStep[] = [];

  for (const segment of segments) {
    if (isSharedSegment(segment)) {
      allSteps.push(...segment.steps);
    } else {
      // For branch segments, interleave steps from each flow
      for (const steps of segment.stepsByFlow.values()) {
        allSteps.push(...steps);
      }
    }
  }

  return allSteps;
}

/**
 * Find which segment a step belongs to
 */
export function findSegmentForStep(
  segments: FlowSegment[],
  stepId: string
): FlowSegment | null {
  for (const segment of segments) {
    if (isSharedSegment(segment)) {
      if (segment.steps.some(s => s.id === stepId)) {
        return segment;
      }
    } else {
      for (const steps of segment.stepsByFlow.values()) {
        if (steps.some(s => s.id === stepId)) {
          return segment;
        }
      }
    }
  }
  return null;
}
