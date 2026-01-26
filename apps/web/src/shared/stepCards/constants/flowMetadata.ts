/**
 * Flow Metadata Constants
 * Centralized styling definitions for testimonial and improvement flows
 *
 * ADR-018: Position (intro vs outro) is determined by display_order, not membership.
 */

import type { FlowMembership } from '../models/stepContent';
import type { FlowMetadata } from '../models/flowMetadata';

/**
 * UI metadata for testimonial and improvement flows
 * Note: 'shared' flows are excluded as they're not branch-specific
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
