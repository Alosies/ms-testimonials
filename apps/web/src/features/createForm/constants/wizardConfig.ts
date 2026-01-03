import type { ConceptType } from '../composables/useFormWizard';

// ============================================================================
// Concept Type Configuration
// ============================================================================

export interface ConceptTypeConfig {
  label: string;
  icon: string;
  description: string;
  namePlaceholder: string;
  descriptionPrompt: string;
}

export const CONCEPT_TYPE_CONFIG: Record<ConceptType, ConceptTypeConfig> = {
  product: {
    label: 'Product',
    icon: 'heroicons:cube',
    description: 'Apps, tools, physical goods',
    namePlaceholder: 'e.g., "TaskFlow", "iPhone 15", "Notion"',
    descriptionPrompt: 'What does it do and who is it for?',
  },
  service: {
    label: 'Service',
    icon: 'heroicons:wrench-screwdriver',
    description: 'Consulting, agencies, freelance',
    namePlaceholder: 'e.g., "Web Design Services", "Tax Consulting"',
    descriptionPrompt: 'What do you offer and who do you help?',
  },
  event: {
    label: 'Event',
    icon: 'heroicons:calendar-days',
    description: 'Conferences, workshops, webinars',
    namePlaceholder: 'e.g., "DevCon 2025", "Marketing Masterclass"',
    descriptionPrompt: "What's it about and who should attend?",
  },
} as const;

export const CONCEPT_TYPES: ConceptType[] = ['product', 'service', 'event'];

// ============================================================================
// Focus Areas Configuration
// ============================================================================

export const FOCUS_AREAS_BY_TYPE: Record<ConceptType, string[]> = {
  product: [
    'Pain points solved',
    'Key features',
    'Time/cost savings',
    'Ease of use',
    'Customer support',
    'ROI & results',
    'Onboarding experience',
    'Team collaboration',
  ],
  service: [
    'Problem solved',
    'Quality of work',
    'Communication',
    'Timeliness',
    'Value for money',
    'Expertise shown',
    'Ongoing support',
    'Would recommend',
  ],
  event: [
    'Key takeaways',
    'Speaker quality',
    'Networking value',
    'Organization',
    'Venue/platform',
    'Worth the time',
    'Would attend again',
    'Best moment',
  ],
};

// ============================================================================
// Validation Constants
// ============================================================================

export const WIZARD_VALIDATION = {
  conceptName: {
    minLength: 2,
    maxLength: 100,
  },
  description: {
    minLength: 20,
    maxLength: 1000,
  },
  customFocusAreas: {
    maxLength: 500,
  },
} as const;

// ============================================================================
// Default Content for Generated Steps
// ============================================================================

export function getDefaultWelcomeContent(conceptName: string) {
  return {
    title: `Share your experience with ${conceptName}`,
    subtitle: 'It only takes a couple of minutes',
    buttonText: 'Get Started',
  };
}

export function getDefaultThankYouContent() {
  return {
    title: 'Thank you!',
    subtitle: 'We really appreciate your feedback',
  };
}
