/**
 * Branching Configuration Types
 * Defines the structure for conditional flow branching in forms
 */

import type { FlowMembership } from '@/shared/stepCards/models';

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
 * Metadata for each flow type (used in UI)
 */
export interface FlowMetadata {
  id: Exclude<FlowMembership, 'shared'>;
  label: string;
  description: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  dotClass: string;
  icon: string;
}

/**
 * UI metadata for testimonial and improvement flows
 */
export const FLOW_METADATA: Record<Exclude<FlowMembership, 'shared'>, FlowMetadata> = {
  testimonial: {
    id: 'testimonial',
    label: 'Testimonial Flow',
    description: 'Rating \u2265 threshold',
    colorClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-400',
    dotClass: 'bg-emerald-500',
    icon: 'heroicons:face-smile',
  },
  improvement: {
    id: 'improvement',
    label: 'Improvement Flow',
    description: 'Rating < threshold',
    colorClass: 'text-sky-700',
    bgClass: 'bg-sky-50',
    borderClass: 'border-sky-400',
    dotClass: 'bg-sky-500',
    icon: 'heroicons:chat-bubble-left-right',
  },
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
