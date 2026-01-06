/**
 * Flow Metadata Types
 * Type definitions for flow styling metadata
 */

import type { FlowMembership } from '@/shared/stepCards/models';

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
