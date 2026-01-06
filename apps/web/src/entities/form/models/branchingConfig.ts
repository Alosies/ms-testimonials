/**
 * Branching Configuration Types
 * Defines the structure for conditional flow branching in forms
 */

// Re-export FlowMembership for convenience
export type { FlowMembership } from '@/shared/stepCards/models';

/**
 * Configuration for conditional branching based on rating
 */
export interface BranchingConfig {
  /** Whether branching is enabled for this form */
  enabled: boolean;
  /** Rating threshold: >=threshold goes to testimonial, <threshold goes to improvement */
  threshold: number;
  /** ID of the rating step that triggers the branch */
  ratingStepId: string | null;
}

/**
 * Default branching configuration
 */
export const DEFAULT_BRANCHING_CONFIG: BranchingConfig = {
  enabled: false,
  threshold: 4,
  ratingStepId: null,
};

/**
 * Parse branching config from JSONB (handles snake_case from DB)
 */
export function parseBranchingConfig(raw: unknown): BranchingConfig {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_BRANCHING_CONFIG;
  }

  const config = raw as Record<string, unknown>;

  return {
    enabled: Boolean(config.enabled),
    threshold: typeof config.threshold === 'number' ? config.threshold : 4,
    ratingStepId:
      typeof config.ratingStepId === 'string' || config.ratingStepId === null
        ? (config.ratingStepId as string | null)
        : null,
  };
}

/**
 * Serialize branching config to JSONB format for DB
 */
export function serializeBranchingConfig(config: BranchingConfig): Record<string, unknown> {
  return {
    enabled: config.enabled,
    threshold: config.threshold,
    ratingStepId: config.ratingStepId,
  };
}
