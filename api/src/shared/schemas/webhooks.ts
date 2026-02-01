/**
 * Webhook Zod schemas for API validation
 * Part of ADR-023 AI Capabilities Plan Integration (T7.2)
 */

import { z } from '@hono/zod-openapi';

// =============================================================================
// Stripe Webhook Schemas
// =============================================================================

/**
 * Stripe checkout session metadata for credit topup purchases.
 * This metadata is attached when creating the checkout session in T7.1.
 */
export const StripeTopupMetadataSchema = z.object({
  organizationId: z.string().min(1).openapi({
    description: 'Organization ID that purchased the credits',
    example: 'org_abc123def',
  }),
  packageId: z.string().min(1).openapi({
    description: 'Credit topup package ID',
    example: 'pkg_xyz789',
  }),
  packageUniqueName: z.string().min(1).openapi({
    description: 'Unique name of the package (e.g., "starter", "popular", "power")',
    example: 'popular',
  }),
  packageCredits: z.string().transform((val) => parseInt(val, 10)).openapi({
    description: 'Number of credits in the package (stored as string in Stripe)',
    example: '500',
  }),
  userId: z.string().min(1).optional().openapi({
    description: 'User ID who initiated the purchase',
    example: 'usr_abc123',
  }),
});

export type StripeTopupMetadata = z.infer<typeof StripeTopupMetadataSchema>;

/**
 * Stripe event type enum for webhooks we handle.
 */
export const StripeEventTypeSchema = z.enum([
  'checkout.session.completed',
  'checkout.session.expired',
  // Add more event types as needed
]).openapi({
  description: 'Stripe webhook event type',
  example: 'checkout.session.completed',
});

export type StripeEventType = z.infer<typeof StripeEventTypeSchema>;

/**
 * Generic success response for webhook handlers.
 */
export const WebhookSuccessResponseSchema = z.object({
  received: z.literal(true).openapi({
    description: 'Indicates the webhook was received and processed',
  }),
  eventId: z.string().optional().openapi({
    description: 'Stripe event ID for logging/debugging',
    example: 'evt_abc123',
  }),
  action: z.string().optional().openapi({
    description: 'Description of the action taken',
    example: 'credits_added',
  }),
}).openapi('WebhookSuccessResponse');

export type WebhookSuccessResponse = z.infer<typeof WebhookSuccessResponseSchema>;

/**
 * Error response for webhook handlers.
 */
export const WebhookErrorResponseSchema = z.object({
  received: z.literal(false).openapi({
    description: 'Indicates the webhook was not processed successfully',
  }),
  error: z.string().openapi({
    description: 'Error message',
    example: 'Invalid signature',
  }),
  code: z.string().optional().openapi({
    description: 'Error code for programmatic handling',
    example: 'INVALID_SIGNATURE',
  }),
}).openapi('WebhookErrorResponse');

export type WebhookErrorResponse = z.infer<typeof WebhookErrorResponseSchema>;
