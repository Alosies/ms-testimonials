/**
 * Billing Zod schemas for API validation
 * Part of ADR-023 AI Capabilities Plan Integration (T7.5, T7.6)
 */

import { z } from '@hono/zod-openapi';

// =============================================================================
// Plan Upgrade (T7.5)
// =============================================================================

/**
 * Request body for POST /billing/upgrade
 */
export const UpgradePlanRequestSchema = z.object({
  newPlanId: z.string().min(1).openapi({
    description: 'ID of the plan to upgrade to',
    example: 'plan_pro_id123',
  }),
}).openapi('UpgradePlanRequest');

export type UpgradePlanRequest = z.infer<typeof UpgradePlanRequestSchema>;

/**
 * Successful response for POST /billing/upgrade
 */
export const UpgradePlanResponseSchema = z.object({
  success: z.literal(true).openapi({
    description: 'Indicates the upgrade was successful',
    example: true,
  }),
  newPlanId: z.string().openapi({
    description: 'ID of the new plan',
    example: 'plan_pro_id123',
  }),
  newMonthlyCredits: z.number().openapi({
    description: 'New monthly AI credit allocation',
    example: 500,
  }),
  creditsAdded: z.number().openapi({
    description: 'Credits added due to the upgrade (difference between new and old allocation)',
    example: 490,
  }),
}).openapi('UpgradePlanResponse');

export type UpgradePlanResponse = z.infer<typeof UpgradePlanResponseSchema>;

/**
 * Error response for billing endpoints
 */
export const BillingErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string().openapi({
    description: 'Error message',
    example: 'Cannot upgrade: new plan is not higher tier than current plan',
  }),
  code: z.string().optional().openapi({
    description: 'Error code for programmatic handling',
    example: 'INVALID_UPGRADE',
  }),
}).openapi('BillingErrorResponse');

export type BillingErrorResponse = z.infer<typeof BillingErrorResponseSchema>;

// =============================================================================
// Plan Downgrade (T7.6) - Scheduled for period end
// =============================================================================

/**
 * Request body for POST /billing/downgrade
 */
export const DowngradePlanRequestSchema = z.object({
  newPlanId: z.string().min(1).openapi({
    description: 'ID of the plan to downgrade to',
    example: 'plan_free_id123',
  }),
}).openapi('DowngradePlanRequest');

export type DowngradePlanRequest = z.infer<typeof DowngradePlanRequestSchema>;

/**
 * Successful response for POST /billing/downgrade
 */
export const DowngradePlanResponseSchema = z.object({
  success: z.literal(true).openapi({
    description: 'Indicates the downgrade was scheduled',
    example: true,
  }),
  scheduledPlanId: z.string().openapi({
    description: 'ID of the plan that will take effect at period end',
    example: 'plan_free_id123',
  }),
  effectiveAt: z.string().datetime().openapi({
    description: 'When the downgrade will take effect (ISO 8601)',
    example: '2025-02-01T00:00:00Z',
  }),
  currentCredits: z.number().openapi({
    description: 'Current monthly AI credit allocation (unchanged until period end)',
    example: 500,
  }),
  newCredits: z.number().openapi({
    description: 'Monthly AI credits after downgrade takes effect',
    example: 10,
  }),
}).openapi('DowngradePlanResponse');

export type DowngradePlanResponse = z.infer<typeof DowngradePlanResponseSchema>;
