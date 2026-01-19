/**
 * Function Types - Type definitions for pure functions
 *
 * Types extracted from functions/ folder per FSD guidelines:
 * - models/ exports only types
 * - functions/ exports only pure functions
 *
 * @see ADR-014, ADR-017
 */

import type { FlowMembership as EntityFlowMembership } from '@/entities/formStep';
import type { AIQuestion, StepContent as AIStepContent } from '@/shared/api';
import type { BranchingConfig } from '@/entities/form';
import type { DeepReadonly } from 'vue';

// =============================================================================
// analyzeQuestionTypeChange Types (ADR-017)
// =============================================================================

/**
 * Analysis result for a question type change operation.
 * Indicates what data will be lost and whether a warning should be shown.
 */
export interface TypeChangeAnalysis {
  /** True if changing from a choice type to non-choice type */
  willLoseOptions: boolean;
  /** Number of options that will be deleted (0 if not losing options) */
  optionCount: number;
  /** True if changing from a text type to non-text type */
  willLoseTextValidation: boolean;
  /** True if changing from a rating type to non-rating type */
  willLoseRatingConfig: boolean;
  /** True if user should see a warning dialog before proceeding */
  requiresWarning: boolean;
}

/**
 * Question data needed for type change analysis.
 * Minimal interface to support various question representations.
 */
export interface AnalyzableQuestion {
  options?: unknown[] | null;
}

// =============================================================================
// getTransferableQuestionFields Types (ADR-017)
// =============================================================================

/**
 * Represents a question type's supported field flags.
 * Derived from question_types table capabilities.
 */
export interface QuestionTypeCapabilities {
  supports_min_length?: boolean;
  supports_max_length?: boolean;
  supports_min_value?: boolean;
  supports_max_value?: boolean;
  supports_options?: boolean;
  supports_pattern?: boolean;
  supports_file_types?: boolean;
  supports_max_file_size?: boolean;
}

/**
 * Input fields from the current question that may be transferred.
 * Nullable fields match the database schema.
 */
export interface TransferableQuestionInput {
  step_id?: string | null;
  display_order: number;
  question_text: string;
  question_key: string;
  is_required: boolean;
  help_text?: string | null;
  organization_id: string;
  placeholder?: string | null;
  min_length?: number | null;
  max_length?: number | null;
  min_value?: number | null;
  max_value?: number | null;
  scale_min_label?: string | null;
  scale_max_label?: string | null;
  validation_pattern?: string | null;
  allowed_file_types?: string[] | null;
  max_file_size_kb?: number | null;
}

/**
 * Output fields that can be transferred to the new question.
 * Uses Partial to indicate which fields are conditionally included.
 */
export interface TransferableQuestionFields {
  step_id?: string | null;
  display_order: number;
  question_text: string;
  question_key: string;
  is_required: boolean;
  help_text?: string | null;
  organization_id: string;
  placeholder?: string | null;
  min_length?: number | null;
  max_length?: number | null;
  min_value?: number | null;
  max_value?: number | null;
  scale_min_label?: string | null;
  scale_max_label?: string | null;
  validation_pattern?: string | null;
  allowed_file_types?: string[] | null;
  max_file_size_kb?: number | null;
}

// =============================================================================
// buildStepsFromQuestions Types (ADR-014 Phase 4)
// =============================================================================

/**
 * Parameters for building form steps from AI-generated questions
 */
export interface BuildStepsParams {
  /** Organization ID for the form owner */
  organizationId: string;
  /** User ID of the form creator */
  userId: string;
  /** Concept/product name for default content */
  conceptName: string;
  /** AI-generated questions to build steps from */
  questions: DeepReadonly<AIQuestion[]>;
  /** AI-generated step content for system steps */
  stepContent: DeepReadonly<AIStepContent> | null;
  /** Shared flow ID - all steps point here initially */
  sharedFlowId: string;
}

/**
 * Form step input for database insertion
 *
 * ADR-013: No question_id - questions reference steps via step_id
 *
 * Internal tracking fields (_prefixed) are stripped before API calls:
 * - _originalQuestionIndex: Maps step to original question for question creation
 * - _flowMembership: Actual intended flow for branch step updates
 * - _intendedStepOrder: Step order within actual flow after updates
 */
export interface FormStepInput {
  organization_id: string;
  created_by: string;
  step_type: string;
  step_order: number;
  content: Record<string, unknown>;
  flow_id: string;
  flow_membership: EntityFlowMembership;
  is_active: boolean;
  /** Internal: original question index for mapping after question creation */
  _originalQuestionIndex?: number;
  /** Internal: actual intended flow membership for branch flow updates */
  _flowMembership?: EntityFlowMembership;
  /** Internal: step_order within intended flow for branch flow updates */
  _intendedStepOrder?: number;
}

/**
 * Result of building steps from questions
 */
export interface BuildStepsResult {
  /** Step inputs ready for database insertion */
  steps: FormStepInput[];
  /** Whether any questions are testimonial-flow specific */
  hasTestimonialSteps: boolean;
  /** Whether any questions are improvement-flow specific */
  hasImprovementSteps: boolean;
}

// =============================================================================
// calculateStepOrdering Types (ADR-014 Phase 4)
// =============================================================================

/**
 * Minimal step representation for ordering calculations
 */
export interface OrderableStep {
  id: string;
  stepOrder: number;
  flowMembership: EntityFlowMembership;
}

/**
 * Result of a reorder operation
 */
export interface ReorderResult<T extends OrderableStep> {
  /** Steps with updated stepOrder values */
  reorderedSteps: T[];
  /** IDs of steps whose order changed */
  changedStepIds: Set<string>;
  /** Whether the reorder was valid and applied */
  success: boolean;
}

/**
 * Step order update for database persistence
 */
export interface StepOrderUpdate {
  id: string;
  step_order: number;
}

/**
 * Parameters for calculating step ordering
 */
export interface CalculateOrderingParams<T extends OrderableStep> {
  steps: T[];
  fromIndex: number;
  toIndex: number;
}

/**
 * Parameters for recalculating flow-specific ordering
 */
export interface RecalculateFlowOrderParams<T extends OrderableStep> {
  steps: T[];
  flowMembership: EntityFlowMembership;
}

// =============================================================================
// validateBranchingConfig Types (ADR-014 Phase 4)
// =============================================================================

/**
 * Minimal step representation for branching validation
 */
export interface ValidatableStep {
  id: string;
  stepType: string;
  flowMembership: EntityFlowMembership;
}

/**
 * Validation error with code and message
 */
export interface BranchingValidationError {
  code: string;
  message: string;
  field?: string;
}

/**
 * Validation warning (non-blocking issues)
 */
export interface BranchingValidationWarning {
  code: string;
  message: string;
}

/**
 * Result of branching configuration validation
 */
export interface BranchingValidationResult {
  /** Whether the configuration is valid */
  isValid: boolean;
  /** Blocking errors that prevent saving */
  errors: BranchingValidationError[];
  /** Non-blocking warnings for user awareness */
  warnings: BranchingValidationWarning[];
}

/**
 * Parameters for branching validation
 */
export interface ValidateBranchingParams {
  /** Current branching configuration */
  config: BranchingConfig;
  /** All steps in the form */
  steps: ValidatableStep[];
}
