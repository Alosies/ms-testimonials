/**
 * Form Step Entity - Type Definitions
 *
 * These types define the structure for form steps and their content.
 * Moved from shared/stepCards/models/ per FSD architecture (ADR-014 Phase 1).
 *
 * IMPORTANT: JSONB content types are now derived from Zod schemas.
 * This ensures runtime validation matches TypeScript types (single source of truth).
 *
 * @see entities/formStep/schemas/ for Zod schemas and validation functions
 */
import type {
  StepType as _StepType,
  StepContent as _StepContent,
} from '../schemas';

// =================================================================
// Re-export JSONB content types from Zod schemas (single source of truth)
// Parse/validate functions are exported from schemas/ (not models per FSD)
// =================================================================
export type {
  StepType,
  StepContent,
  WelcomeContent,
  ConsentContent,
  ContactInfoContent,
  ContactField,
  RewardContent,
  RewardType,
  ThankYouContent,
  TestimonialWriteContent,
  EmptyContent,
} from '../schemas';

// =================================================================
// Non-JSONB Types (not stored in content field)
// =================================================================

/**
 * Flow IDs for step creation
 * Maps flow position to actual database flow IDs
 *
 * ADR-009: 4 flows with display_order:
 * - intro (display_order=0): shared steps before branches
 * - testimonial (display_order=1): positive rating branch
 * - improvement (display_order=2): negative rating branch
 * - ending (display_order=3): shared steps after branches
 *
 * Note: Both intro and ending have flow_type='shared' in the database.
 * The distinction is by display_order, not flow_type.
 */
export interface FlowIds {
  intro?: string;
  testimonial?: string;
  improvement?: string;
  ending?: string;
}

/**
 * Context for creating dynamic step content
 * Contains form-specific information for personalized defaults
 */
export interface FormContext {
  productName?: string;
  productDescription?: string;
  /** Flow IDs for assigning steps to flows (ADR-009) */
  flowIds?: FlowIds;
}

/**
 * Flow membership for conditional branching
 * - 'shared': Step appears in all flows (both intro AND ending)
 * - 'testimonial': Step appears only in positive rating flow
 * - 'improvement': Step appears only in negative rating flow
 *
 * ADR-009: Position (intro vs ending) is determined by the flow's display_order,
 * not by a separate membership value. Both intro and ending flows have flow_type='shared'.
 */
export type FlowMembership = 'shared' | 'testimonial' | 'improvement';

// =================================================================
// Question data for linked questions
// =================================================================

export interface LinkedQuestionType {
  id: string;
  uniqueName: string;
  name: string;
  category: string;
  inputComponent: string;
}

export interface QuestionOption {
  id: string;
  optionValue: string;
  optionLabel: string;
  displayOrder: number;
  isDefault: boolean;
}

export interface LinkedQuestion {
  id: string;
  questionText: string;
  placeholder?: string | null;
  helpText?: string | null;
  isRequired: boolean;
  minValue?: number | null;
  maxValue?: number | null;
  minLength?: number | null;
  maxLength?: number | null;
  scaleMinLabel?: string | null;
  scaleMaxLabel?: string | null;
  questionType: LinkedQuestionType;
  options: QuestionOption[];
}

// =================================================================
// Form Step Interface (local state representation)
// =================================================================

export interface FormStep {
  id: string;
  // ADR-013: Steps belong to flows, not forms directly (removed formId)
  flowId: string;
  stepType: _StepType;
  stepOrder: number;
  // ADR-013: Question now references step via step_id (inverted relationship)
  // In GraphQL, accessed via questions[0] array; transformed to single question here
  question?: LinkedQuestion | null;
  content: _StepContent;
  tips: string[];
  isActive: boolean;
  // Flow membership for conditional branching (derived from flow.flow_type)
  flowMembership: FlowMembership;
  // Local UI state
  isNew?: boolean;
  isModified?: boolean;
}
