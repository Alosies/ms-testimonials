/**
 * Webhook Routes
 *
 * Handles incoming webhooks from external services like Stripe.
 * These endpoints do NOT use standard auth middleware since they
 * are called by external services with their own authentication.
 *
 * Part of ADR-023 AI Capabilities Plan Integration (T7.2)
 */

import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import Stripe from 'stripe';

import { getClient } from '@/db';
import {
  StripeTopupMetadataSchema,
  WebhookSuccessResponseSchema,
  WebhookErrorResponseSchema,
} from '@/shared/schemas/webhooks';
import { ErrorResponseSchema } from '@/shared/schemas/common';

// =============================================================================
// Types
// =============================================================================

/**
 * Row type for checking existing transaction (idempotency check)
 */
interface ExistingTransactionRow {
  id: string;
}

/**
 * Row type for organization credit balance
 */
interface BalanceRow {
  organization_id: string;
  bonus_credits: string;
}

/**
 * Row type for inserted transaction result
 */
interface TransactionInsertRow {
  id: string;
}

// =============================================================================
// Stripe Client Initialization
// =============================================================================

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    stripeClient = new Stripe(secretKey);
  }
  return stripeClient;
}

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
  }
  return secret;
}

// =============================================================================
// Route Definitions
// =============================================================================

const webhooks = new OpenAPIHono();

// ============================================================
// POST /webhooks/stripe - Handle Stripe webhook events
// ============================================================

const stripeWebhookRoute = createRoute({
  method: 'post',
  path: '/stripe',
  tags: ['Webhooks'],
  summary: 'Handle Stripe webhook events',
  description: `
Receives and processes Stripe webhook events.

**Authentication:** Uses Stripe signature verification instead of JWT auth.

**Supported Events:**
- \`checkout.session.completed\` - Processes credit topup purchases

**Idempotency:**
- Uses Stripe session ID to prevent duplicate processing
- If a transaction with the same session ID exists, returns success without adding credits again

**Security:**
- Verifies Stripe webhook signature using STRIPE_WEBHOOK_SECRET
- Rejects requests with invalid signatures
  `,
  request: {
    // Note: We don't define body schema here because we need raw body for signature verification
  },
  responses: {
    200: {
      description: 'Webhook processed successfully',
      content: {
        'application/json': {
          schema: WebhookSuccessResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request or signature',
      content: {
        'application/json': {
          schema: WebhookErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Type assertion needed: OpenAPI handler type inference is complex with @hono/zod-openapi.
// Runtime type safety is ensured by Stripe signature verification and Zod schema validation.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
webhooks.openapi(stripeWebhookRoute, async (c: any) => {
  try {
    const stripe = getStripeClient();
    const endpointSecret = getWebhookSecret();

    // Get the raw body for signature verification
    // Stripe requires the raw body to verify the webhook signature
    const body = await c.req.text();
    const signature = c.req.header('stripe-signature');

    if (!signature) {
      console.warn('[Stripe Webhook] Missing stripe-signature header');
      return c.json(
        {
          received: false as const,
          error: 'Missing stripe-signature header',
          code: 'MISSING_SIGNATURE',
        },
        400
      );
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown signature verification error';
      console.warn('[Stripe Webhook] Signature verification failed:', errorMessage);
      return c.json(
        {
          received: false as const,
          error: 'Invalid signature',
          code: 'INVALID_SIGNATURE',
        },
        400
      );
    }

    console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

    // Handle the event based on type
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const result = await handleCheckoutSessionCompleted(session, event.id);
        return c.json(result, 200);
      }

      case 'checkout.session.expired': {
        // Log but don't process - no action needed for expired sessions
        console.log(`[Stripe Webhook] Checkout session expired: ${event.data.object.id}`);
        return c.json(
          {
            received: true as const,
            eventId: event.id,
            action: 'session_expired_logged',
          },
          200
        );
      }

      default: {
        // Acknowledge receipt of unhandled event types
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        return c.json(
          {
            received: true as const,
            eventId: event.id,
            action: 'event_type_not_handled',
          },
          200
        );
      }
    }
  } catch (error) {
    console.error('[Stripe Webhook] Processing error:', error);
    return c.json(
      {
        error: 'Failed to process webhook',
        code: 'PROCESSING_ERROR',
      },
      500
    );
  }
});

// =============================================================================
// Event Handlers
// =============================================================================

/**
 * Handle checkout.session.completed event for credit topup purchases.
 *
 * This function:
 * 1. Validates the session metadata contains required topup info
 * 2. Checks for idempotency (prevents duplicate credit additions)
 * 3. Adds credits to the organization's bonus_credits balance
 * 4. Creates a credit_transaction record for audit trail
 *
 * @param session - Stripe checkout session object
 * @param eventId - Stripe event ID for logging
 * @returns WebhookSuccessResponse
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  eventId: string
): Promise<{ received: true; eventId: string; action: string }> {
  const sessionId = session.id;

  // Validate metadata
  const metadataResult = StripeTopupMetadataSchema.safeParse(session.metadata);
  if (!metadataResult.success) {
    // This might be a checkout session for something other than credit topups
    // (e.g., subscription payments). Log and acknowledge without processing.
    console.log(`[Stripe Webhook] Session ${sessionId} has no/invalid topup metadata, skipping`);
    return {
      received: true as const,
      eventId,
      action: 'not_credit_topup',
    };
  }

  const { organizationId, packageId, packageUniqueName, packageCredits, userId } = metadataResult.data;

  console.log(`[Stripe Webhook] Processing credit topup for org ${organizationId}: ${packageCredits} credits (${packageUniqueName})`);

  const sql = getClient();

  // Idempotency check: Look for existing transaction with this session ID
  // We store the Stripe session ID in the description field as a unique identifier
  const idempotencyKey = `stripe_session:${sessionId}`;

  const existingTx = await sql.unsafe(
    `SELECT id FROM credit_transactions WHERE idempotency_key = $1`,
    [idempotencyKey]
  ) as ExistingTransactionRow[];

  if (existingTx && existingTx.length > 0) {
    console.log(`[Stripe Webhook] Idempotent: transaction already exists for session ${sessionId}`);
    return {
      received: true as const,
      eventId,
      action: 'already_processed',
    };
  }

  // Begin transaction: Update balance and create transaction record atomically
  // Note: Using raw SQL transaction since getDb() transactions work differently
  try {
    await sql.begin(async (tx) => {
      // Step 1: Get current balance to calculate balance_after
      const balanceResult = await tx.unsafe(
        `SELECT organization_id, bonus_credits::text
         FROM organization_credit_balances
         WHERE organization_id = $1
         FOR UPDATE`,
        [organizationId]
      ) as BalanceRow[];

      if (!balanceResult || balanceResult.length === 0) {
        // Organization doesn't have a credit balance record
        // This shouldn't happen if org was properly initialized, but handle gracefully
        console.error(`[Stripe Webhook] No credit balance found for org ${organizationId}`);
        throw new Error(`No credit balance found for organization ${organizationId}`);
      }

      const currentBonusCredits = parseFloat(balanceResult[0].bonus_credits) || 0;
      const newBonusCredits = currentBonusCredits + packageCredits;

      // Step 2: Update bonus_credits in organization_credit_balances
      await tx.unsafe(
        `UPDATE organization_credit_balances
         SET bonus_credits = bonus_credits + $1,
             updated_at = NOW()
         WHERE organization_id = $2`,
        [packageCredits, organizationId]
      );

      // Step 3: Calculate balance_after for transaction record
      // Get the updated available balance
      const balanceAfterResult = await tx.unsafe(
        `SELECT (monthly_credits + bonus_credits - reserved_credits)::text as balance_after
         FROM organization_credit_balances
         WHERE organization_id = $1`,
        [organizationId]
      ) as { balance_after: string }[];

      const balanceAfter = balanceAfterResult && balanceAfterResult.length > 0
        ? parseFloat(balanceAfterResult[0].balance_after) || 0
        : newBonusCredits;

      // Step 4: Insert credit_transaction record
      const description = `Credit topup: ${packageCredits} credits (${packageUniqueName}) - Stripe session ${sessionId}`;

      await tx.unsafe(
        `INSERT INTO credit_transactions (
          organization_id,
          transaction_type,
          credits_amount,
          balance_after,
          description,
          idempotency_key,
          provider_metadata
        ) VALUES (
          $1,
          'topup_purchase',
          $2,
          $3,
          $4,
          $5,
          $6::jsonb
        )`,
        [
          organizationId,
          packageCredits, // Positive amount for topup
          balanceAfter,
          description,
          idempotencyKey,
          JSON.stringify({
            stripe_session_id: sessionId,
            stripe_event_id: eventId,
            package_id: packageId,
            package_unique_name: packageUniqueName,
            user_id: userId || null,
            amount_paid_cents: session.amount_total,
            currency: session.currency,
          }),
        ]
      ) as TransactionInsertRow[];

      console.log(`[Stripe Webhook] Successfully added ${packageCredits} credits to org ${organizationId}`);
    });

    return {
      received: true as const,
      eventId,
      action: 'credits_added',
    };
  } catch (error) {
    console.error(`[Stripe Webhook] Failed to process topup for org ${organizationId}:`, error);
    throw error;
  }
}

export { webhooks };
export type WebhooksRoutes = typeof webhooks;
