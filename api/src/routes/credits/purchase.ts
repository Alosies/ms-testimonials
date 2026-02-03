/**
 * POST /credits/purchase - Create Stripe checkout session for credit topup
 *
 * Part of ADR-023 AI Capabilities Plan Integration
 */

import { createRoute } from '@hono/zod-openapi';
import type { Context } from 'hono';
import Stripe from 'stripe';
import { getClient } from '@/db';
import {
  PurchaseCreditsRequestSchema,
  PurchaseCreditsResponseSchema,
  CreditsErrorResponseSchema,
} from '@/shared/schemas/credits';
import { ErrorResponseSchema, NotFoundResponseSchema } from '@/shared/schemas/common';
import type { AuthContext } from '@/shared/middleware/auth';

/**
 * Row type for credit topup package query result
 */
interface TopupPackageRow {
  id: string;
  unique_name: string;
  name: string;
  description: string | null;
  credits: number;
  price_usd_cents: number;
  is_active: boolean;
}

/**
 * Row type for organization query result (for Stripe customer ID)
 */
interface OrganizationRow {
  id: string;
  name: string;
  settings: Record<string, unknown>;
}

/**
 * Row type for user email query result
 */
interface UserEmailRow {
  email: string;
}

// Initialize Stripe client (lazy initialization)
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

export const purchaseCreditsRoute = createRoute({
  method: 'post',
  path: '/purchase',
  tags: ['Credits'],
  summary: 'Purchase credit topup package',
  description: `
Create a Stripe checkout session for purchasing a credit topup package.

**Authentication required** - Must have access to the organization.

**Flow:**
1. Validate the package ID exists and is active
2. Get or create a Stripe customer for the organization
3. Create a Stripe checkout session
4. Return the checkout URL for redirect

**Note:** Credits are added to bonus_credits after successful payment via webhook.
  `,
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: PurchaseCreditsRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Stripe checkout session created successfully',
      content: {
        'application/json': {
          schema: PurchaseCreditsResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request - package not found or inactive',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: 'Access denied - organization context required',
      content: {
        'application/json': {
          schema: CreditsErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Package not found',
      content: {
        'application/json': {
          schema: NotFoundResponseSchema,
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

export async function purchaseCreditsHandler(c: Context): Promise<Response> {
  const { packageId } = c.req.valid('json' as never) as { packageId: string };
  const auth = c.get('auth') as AuthContext;

  // Verify organization context
  if (!auth.organizationId) {
    return c.json(
      {
        success: false as const,
        error: 'Organization context required',
      },
      403
    );
  }

  const organizationId = auth.organizationId;
  const userId = auth.userId;

  try {
    const sql = getClient();
    const stripe = getStripeClient();

    // 1. Verify package exists and is active
    const packageQuery = `
      SELECT id, unique_name, name, description, credits, price_usd_cents, is_active
      FROM credit_topup_packages
      WHERE id = $1
    `;
    const packageResult = (await sql.unsafe(packageQuery, [
      packageId,
    ])) as TopupPackageRow[];

    if (!packageResult || packageResult.length === 0) {
      return c.json(
        {
          error: 'Credit topup package not found',
          code: 'NOT_FOUND',
        },
        404
      );
    }

    const topupPackage = packageResult[0];

    if (!topupPackage.is_active) {
      return c.json(
        {
          error: 'Credit topup package is no longer available',
          code: 'PACKAGE_INACTIVE',
        },
        400
      );
    }

    // 2. Get organization details and Stripe customer ID
    const orgQuery = `
      SELECT id, name, settings
      FROM organizations
      WHERE id = $1
    `;
    const orgResult = (await sql.unsafe(orgQuery, [
      organizationId,
    ])) as OrganizationRow[];

    if (!orgResult || orgResult.length === 0) {
      return c.json(
        {
          error: 'Organization not found',
          code: 'NOT_FOUND',
        },
        404
      );
    }

    const organization = orgResult[0];
    const settings = organization.settings || {};
    let stripeCustomerId = settings.stripeCustomerId as string | undefined;

    // 3. Get user email for Stripe customer (if creating new)
    const userQuery = `
      SELECT email FROM users WHERE id = $1
    `;
    const userResult = (await sql.unsafe(userQuery, [userId])) as UserEmailRow[];
    const userEmail = userResult[0]?.email;

    // 4. Get or create Stripe customer
    if (!stripeCustomerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        name: organization.name,
        metadata: {
          organizationId,
          createdByUserId: userId,
        },
      });

      stripeCustomerId = customer.id;

      // Save Stripe customer ID to organization settings
      const updatedSettings = {
        ...settings,
        stripeCustomerId,
      };

      await sql.unsafe(
        `UPDATE organizations SET settings = $1, updated_at = NOW() WHERE id = $2`,
        [JSON.stringify(updatedSettings), organizationId]
      );
    }

    // 5. Build URLs for checkout
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = `${frontendUrl}/settings/billing/credits/purchase/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendUrl}/settings/billing/credits/purchase/cancelled`;

    // 6. Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: topupPackage.name,
              description:
                topupPackage.description || `${topupPackage.credits} AI Credits`,
            },
            unit_amount: topupPackage.price_usd_cents,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        organizationId,
        packageId: topupPackage.id,
        packageUniqueName: topupPackage.unique_name,
        packageCredits: String(topupPackage.credits),
        userId,
      },
    });

    if (!session.url) {
      throw new Error('Stripe session created without checkout URL');
    }

    return c.json(
      {
        checkoutUrl: session.url,
        sessionId: session.id,
      },
      200
    );
  } catch (error) {
    console.error('Credit purchase error:', error);

    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      return c.json(
        {
          error: `Payment processing error: ${error.message}`,
          code: 'STRIPE_ERROR',
        },
        500
      );
    }

    return c.json(
      {
        error: 'Failed to create checkout session',
        code: 'INTERNAL_ERROR',
      },
      500
    );
  }
}
