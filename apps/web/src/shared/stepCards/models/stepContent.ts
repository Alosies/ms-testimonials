/**
 * Step Content Types
 * Defines the structure for each step type's content in a form
 */

/**
 * Context for creating dynamic step content
 * Contains form-specific information for personalized defaults
 */
export interface FormContext {
  productName?: string;
  productDescription?: string;
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
  formId: string;
  stepType: StepType;
  stepOrder: number;
  questionId?: string | null;
  question?: LinkedQuestion | null;
  content: StepContent;
  tips: string[];
  isActive: boolean;
  // Flow assignment (ADR-009) - optional during migration, required for DB persistence
  flowId?: string;
  // Flow membership for conditional branching (derived from flow.flow_type)
  flowMembership: FlowMembership;
  // Local UI state
  isNew?: boolean;
  isModified?: boolean;
}
