/**
 * Reward Step Content Schema
 *
 * Validates the JSONB content for reward step type.
 * Offers incentives to customers for completing the testimonial.
 *
 * @see DB migration: 1767425106405_form_steps__create_table
 */
import { z } from 'zod';

/**
 * Reward types determine which optional fields are relevant
 */
export const RewardTypeSchema = z.enum(['coupon', 'download', 'link', 'custom']);

export type RewardType = z.infer<typeof RewardTypeSchema>;

export const RewardContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  rewardType: RewardTypeSchema,
  // Coupon-specific fields
  couponCode: z.string().optional(),
  couponDescription: z.string().optional(),
  // Download-specific fields
  downloadUrl: z.string().optional(),
  downloadLabel: z.string().optional(),
  // Link-specific fields
  linkUrl: z.string().optional(),
  linkLabel: z.string().optional(),
  // Custom reward HTML
  customHtml: z.string().optional(),
});

export type RewardContent = z.infer<typeof RewardContentSchema>;

/**
 * Default content for new reward steps
 */
export const defaultRewardContent: RewardContent = {
  title: 'Thank you! Here\'s a gift.',
  description: 'As a token of our appreciation, we\'d like to offer you:',
  rewardType: 'coupon',
  couponCode: 'THANKYOU10',
  couponDescription: '10% off your next purchase',
};
