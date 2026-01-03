import type {
  WelcomeContent,
  ThankYouContent,
  ContactInfoContent,
  ConsentContent,
  RewardContent,
} from '../models/stepContent';

/**
 * Factory functions for creating default step content
 * Used when adding new steps to a form
 */

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
