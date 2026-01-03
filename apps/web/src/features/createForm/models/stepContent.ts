// Re-export generated types (will exist after DB migration)
// For now, define placeholders that match expected schema
// export type { Form_Steps, Contacts } from '@/shared/graphql/generated/operations';

/**
 * Context for creating dynamic step content
 * Contains form-specific information for personalized defaults
 */
export interface FormContext {
  productName?: string;
  productDescription?: string;
}

// Step type literal union
export type StepType =
  | 'welcome'
  | 'question'
  | 'rating'
  | 'consent'
  | 'contact_info'
  | 'reward'
  | 'thank_you';

// Contact field options
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
// JSONB Content Interfaces (can't be generated)
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

// Union type
export type StepContent =
  | WelcomeContent
  | ConsentContent
  | ContactInfoContent
  | RewardContent
  | ThankYouContent
  | Record<string, never>; // Empty for question/rating (data in form_questions)

// =================================================================
// Form Step Interface (local state representation)
// =================================================================

export interface FormStep {
  id: string;
  formId: string;
  stepType: StepType;
  stepOrder: number;
  questionId?: string | null;
  content: StepContent;
  tips: string[];
  isActive: boolean;
  // Local UI state
  isNew?: boolean;
  isModified?: boolean;
}
