import type { StepType, HelpContent } from '../models';

export const STEP_HELP_CONTENT: Record<StepType, HelpContent> = {
  welcome: {
    title: 'Welcome Step',
    description: 'Introduce your form and set expectations. This is the first thing customers see.',
    tips: [
      'Keep the title short and compelling',
      'Explain why their feedback matters',
      'Set expectations for time required',
    ],
  },
  question: {
    title: 'Question Step',
    description: 'Collect testimonial content with guided prompts. Customers can respond with text or video.',
    tips: [
      'Ask open-ended questions',
      'Focus on outcomes and results',
      'Add tips to guide better responses',
    ],
  },
  rating: {
    title: 'Rating Step',
    description: 'Gauge customer satisfaction before collecting their testimonial.',
    tips: [
      'Place early in the form',
      'Use to filter negative feedback',
      'Keep the scale simple (1-5)',
    ],
  },
  consent: {
    title: 'Consent Step',
    description: 'Let customers choose how their testimonial is shared - publicly or privately.',
    tips: [
      'Be transparent about usage',
      'Explain the difference clearly',
      'Default to public for more content',
    ],
  },
  contact_info: {
    title: 'Contact Info Step',
    description: 'Collect customer details for attribution on their testimonial.',
    tips: [
      'Only ask for what you need',
      'Email should usually be required',
      'Photo adds credibility',
    ],
  },
  reward: {
    title: 'Reward Step',
    description: 'Incentivize testimonials with coupons, downloads, or special offers.',
    tips: [
      'Mention the reward upfront',
      'Make it genuinely valuable',
      'Set clear redemption instructions',
    ],
  },
  thank_you: {
    title: 'Thank You Step',
    description: 'Thank customers and optionally encourage social sharing.',
    tips: [
      'Express genuine gratitude',
      'Consider social sharing prompts',
      'Optional redirect to your site',
    ],
  },
};
