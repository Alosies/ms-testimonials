import type {
  WelcomeContent,
  ThankYouContent,
  ContactInfoContent,
  ConsentContent,
  RewardContent,
  FormContext,
} from '@/shared/stepCards';

/**
 * Factory functions for creating default step content
 * Used when adding new steps to a form
 *
 * All factories accept optional FormContext to personalize defaults
 * based on the product being reviewed.
 */

export function createDefaultWelcomeContent(ctx?: FormContext): WelcomeContent {
  const productName = ctx?.productName?.trim();

  return {
    title: productName
      ? `Share your experience with ${productName}`
      : 'Share your experience',
    subtitle: 'Your feedback helps others make better decisions.',
    buttonText: 'Get Started',
  };
}

export function createDefaultThankYouContent(ctx?: FormContext): ThankYouContent {
  const productName = ctx?.productName?.trim();

  return {
    title: 'Thank you!',
    message: productName
      ? `Thanks for sharing your experience with ${productName}. Your feedback means a lot to us!`
      : 'Your testimonial has been submitted successfully.',
    showSocialShare: false,
  };
}

export function createDefaultContactInfoContent(_ctx?: FormContext): ContactInfoContent {
  return {
    title: 'A little about you',
    subtitle: 'Help us put a face to your feedback',
    enabledFields: ['name', 'email'],
    requiredFields: ['email'],
  };
}

export function createDefaultConsentContent(_ctx?: FormContext): ConsentContent {
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

export function createDefaultRewardContent(ctx?: FormContext): RewardContent {
  const productName = ctx?.productName?.trim();

  return {
    title: productName
      ? `A thank you from ${productName}`
      : 'Thank you for your feedback!',
    description: "Here's a small token of our appreciation.",
    rewardType: 'coupon',
    couponCode: '',
    couponDescription: '',
  };
}
