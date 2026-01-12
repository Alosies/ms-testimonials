/**
 * Form Question Entity - QuestionData Type
 *
 * Extended question data with local editing state.
 * Moved from features/createForm/models per FSD architecture (ADR-014 Phase 1).
 */
import type { AIQuestion } from '@/shared/api';

/**
 * Question Data with local editing state
 * Extends AIQuestion with database ID and local state tracking
 */
export interface QuestionData extends AIQuestion {
  id?: string;
  isNew?: boolean;
  isModified?: boolean;
  // Rating type fields
  min_value?: number | null;
  max_value?: number | null;
  // Linear scale label customization
  scale_min_label?: string | null;
  scale_max_label?: string | null;
}
