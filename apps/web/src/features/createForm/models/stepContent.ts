// Re-export generated types (will exist after DB migration)
// For now, define placeholders that match expected schema
// export type { Form_Steps, Contacts } from '@/shared/graphql/generated/operations';

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

// =================================================================
// Type Guards
// =================================================================

export function isWelcomeStep(step: FormStep): step is FormStep & { stepType: 'welcome'; content: WelcomeContent } {
  return step.stepType === 'welcome';
}

export function isQuestionStep(step: FormStep): step is FormStep & { stepType: 'question' } {
  return step.stepType === 'question';
}

export function isRatingStep(step: FormStep): step is FormStep & { stepType: 'rating' } {
  return step.stepType === 'rating';
}

export function isConsentStep(step: FormStep): step is FormStep & { stepType: 'consent'; content: ConsentContent } {
  return step.stepType === 'consent';
}

export function isContactInfoStep(step: FormStep): step is FormStep & { stepType: 'contact_info'; content: ContactInfoContent } {
  return step.stepType === 'contact_info';
}

export function isRewardStep(step: FormStep): step is FormStep & { stepType: 'reward'; content: RewardContent } {
  return step.stepType === 'reward';
}

export function isThankYouStep(step: FormStep): step is FormStep & { stepType: 'thank_you'; content: ThankYouContent } {
  return step.stepType === 'thank_you';
}

// =================================================================
// Default Content Factories
// =================================================================

export function createDefaultWelcomeContent(): WelcomeContent {
  return {
    title: 'Share your experience',
    subtitle: 'Your feedback helps others make better decisions.',
    buttonText: 'Get Started',
  };
}

export function createDefaultThankYouContent(): ThankYouContent {
  return {
    title: 'Thank you!',
    message: 'Your testimonial has been submitted successfully.',
    showSocialShare: false,
  };
}

export function createDefaultContactInfoContent(): ContactInfoContent {
  return {
    title: 'About You',
    subtitle: 'Tell us a bit about yourself',
    enabledFields: ['name', 'email'],
    requiredFields: ['email'],
  };
}

export function createDefaultConsentContent(): ConsentContent {
  return {
    title: 'How can we share your testimonial?',
    description: "Choose how you'd like your feedback to be used.",
    options: {
      public: { label: 'Public', description: 'Display on our website and marketing materials' },
      private: { label: 'Private', description: 'For internal use only' },
    },
    defaultOption: 'public',
    required: true,
  };
}

export function createDefaultRewardContent(): RewardContent {
  return {
    title: 'Thank you for your feedback!',
    description: "Here's a small token of our appreciation.",
    rewardType: 'coupon',
    couponCode: '',
    couponDescription: '',
  };
}

// =================================================================
// Step Label Helpers
// =================================================================

export function getStepLabel(step: FormStep): string {
  switch (step.stepType) {
    case 'welcome': return 'Welcome';
    case 'question': return `Q${step.stepOrder}`;
    case 'rating': return 'Rating';
    case 'consent': return 'Consent';
    case 'contact_info': return 'Contact';
    case 'reward': return 'Reward';
    case 'thank_you': return 'Thanks';
    default: return 'Step';
  }
}

export function getStepIcon(stepType: StepType): string {
  switch (stepType) {
    case 'welcome': return 'heroicons:hand-raised';
    case 'question': return 'heroicons:question-mark-circle';
    case 'rating': return 'heroicons:star';
    case 'consent': return 'heroicons:check-circle';
    case 'contact_info': return 'heroicons:user';
    case 'reward': return 'heroicons:gift';
    case 'thank_you': return 'heroicons:sparkles';
    default: return 'heroicons:document';
  }
}
