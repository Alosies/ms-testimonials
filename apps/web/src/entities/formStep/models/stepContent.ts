/**
 * Form Step Entity - Type Definitions
 *
 * These types define the structure for form steps and their content.
 * Moved from shared/stepCards/models/ per FSD architecture (ADR-014 Phase 1).
 */

/**
 * Flow IDs for step creation
 * Maps flow membership to actual database flow IDs
 */
export interface FlowIds {
  shared?: string;
  testimonial?: string;
  improvement?: string;
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
 * Step type literal union
 */
export type StepType =
  | 'welcome'
  | 'question'
  | 'rating'
  | 'consent'
  | 'contact_info'
  | 'reward'
  | 'thank_you';

/**
 * Flow membership for conditional branching
 * - 'shared': Step appears in all flows (before branch point)
 * - 'testimonial': Step appears only in positive rating flow
 * - 'improvement': Step appears only in negative rating flow
 */
export type FlowMembership = 'shared' | 'testimonial' | 'improvement';

/**
 * Contact field options
 */
export type ContactField =
  | 'name'
  | 'email'
  | 'photo'
  | 'jobTitle'
  | 'company'
  | 'website'
  | 'linkedin'
  | 'twitter';

// =================================================================
// JSONB Content Interfaces
// =================================================================

export interface WelcomeContent {
  title: string;
  subtitle: string;
  buttonText: string;
}

export interface ConsentContent {
  title: string;
  description: string;
  options: {
    public: { label: string; description: string };
    private: { label: string; description: string };
  };
  defaultOption: 'public' | 'private';
  required: boolean;
}

export interface ContactInfoContent {
  title: string;
  subtitle?: string;
  enabledFields: ContactField[];
  requiredFields: ContactField[];
}

export interface RewardContent {
  title: string;
  description: string;
  rewardType: 'coupon' | 'download' | 'link' | 'custom';
  couponCode?: string;
  couponDescription?: string;
  downloadUrl?: string;
  downloadLabel?: string;
  linkUrl?: string;
  linkLabel?: string;
  customHtml?: string;
}

export interface ThankYouContent {
  title: string;
  message: string;
  showSocialShare: boolean;
  socialShareMessage?: string;
  redirectUrl?: string;
  redirectDelay?: number;
}

/**
 * Union type for all step content types
 */
export type StepContent =
  | WelcomeContent
  | ConsentContent
  | ContactInfoContent
  | RewardContent
  | ThankYouContent
  | Record<string, never>; // Empty for question/rating (data in form_questions)

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
  stepType: StepType;
  stepOrder: number;
  // ADR-013: Question now references step via step_id (inverted relationship)
  // In GraphQL, accessed via questions[0] array; transformed to single question here
  question?: LinkedQuestion | null;
  content: StepContent;
  tips: string[];
  isActive: boolean;
  // Flow membership for conditional branching (derived from flow.flow_type)
  flowMembership: FlowMembership;
  // Local UI state
  isNew?: boolean;
  isModified?: boolean;
}
