import type { StepType } from '../models';

/**
 * Configuration for each step type including display properties
 * This is the single source of truth for step type icons, labels, and descriptions
 */

export interface StepTypeConfig {
  type: StepType;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
}

export const STEP_TYPE_CONFIGS: Record<StepType, StepTypeConfig> = {
  welcome: {
    type: 'welcome',
    label: 'Welcome',
    shortLabel: 'Welcome',
    description: 'Introduce your form',
    icon: 'heroicons:hand-raised',
  },
  question: {
    type: 'question',
    label: 'Question',
    shortLabel: 'Question',
    description: 'Text or video response',
    icon: 'heroicons:chat-bubble-bottom-center-text',
  },
  rating: {
    type: 'rating',
    label: 'Rating',
    shortLabel: 'Rating',
    description: 'Star or scale rating',
    icon: 'heroicons:star',
  },
  consent: {
    type: 'consent',
    label: 'Consent',
    shortLabel: 'Consent',
    description: 'Public/private choice',
    icon: 'heroicons:check-circle',
  },
  contact_info: {
    type: 'contact_info',
    label: 'Contact Info',
    shortLabel: 'Contact',
    description: 'Name, email, company',
    icon: 'heroicons:user',
  },
  reward: {
    type: 'reward',
    label: 'Reward',
    shortLabel: 'Reward',
    description: 'Coupon or download',
    icon: 'heroicons:gift',
  },
  thank_you: {
    type: 'thank_you',
    label: 'Thank You',
    shortLabel: 'Thanks',
    description: 'Confirmation message',
    icon: 'heroicons:sparkles',
  },
  testimonial_write: {
    type: 'testimonial_write',
    label: 'Testimonial Write',
    shortLabel: 'Write',
    description: 'Manual or AI-assisted writing',
    icon: 'heroicons:pencil-square',
  },
};

/**
 * Ordered list of step type configs for dropdown menus
 */
export const STEP_TYPE_OPTIONS: StepTypeConfig[] = [
  STEP_TYPE_CONFIGS.welcome,
  STEP_TYPE_CONFIGS.question,
  STEP_TYPE_CONFIGS.rating,
  STEP_TYPE_CONFIGS.testimonial_write,
  STEP_TYPE_CONFIGS.consent,
  STEP_TYPE_CONFIGS.contact_info,
  STEP_TYPE_CONFIGS.reward,
  STEP_TYPE_CONFIGS.thank_you,
];
