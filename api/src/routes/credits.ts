/**
 * Credits Routes
 *
 * Provides credit balance and transaction history for organizations.
 *
 * **Data Access Strategy (ADR-023):**
 * - READ operations (balance, transactions): GraphQL via Hasura
 *   - Leverages Hasura's row-level security for organization isolation
 *   - Type-safe via generated operations
 * - WRITE operations (purchase checkout): Drizzle ORM
 *   - Complex Stripe integration with conditional updates
 *
 * Part of ADR-023 AI Capabilities Plan Integration
 */

import { OpenAPIHono, createRoute } from '@hono/zod-openapi';

import { authMiddleware, type AuthContext } from '@/shared/middleware/auth';
import { getClient } from '@/db';
import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import {
  GetCreditBalanceDocument,
  GetCreditTransactionsDocument,
  type GetCreditBalanceQuery,
  type GetCreditTransactionsQuery,
} from '@/graphql/generated/operations';
import {
  GetTransactionsQuerySchema,
  GetTransactionsResponseSchema,
  GetBalanceResponseSchema,
  CreditsErrorResponseSchema,
  PurchaseCreditsRequestSchema,
  PurchaseCreditsResponseSchema,
} from '@/shared/schemas/credits';
import { ErrorResponseSchema, NotFoundResponseSchema } from '@/shared/schemas/common';
import Stripe from 'stripe';

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

// Initialize Stripe client (lazy initialization to avoid issues during module load)
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

const credits = new OpenAPIHono();

// Apply auth middleware to all routes
credits.use('/*', authMiddleware);

// ============================================================
// GET /credits/transactions - Get paginated credit transaction history
// ============================================================

const getTransactionsRoute = createRoute({
  method: 'get',
  path: '/transactions',
  tags: ['Credits'],
  summary: 'Get credit transaction history',
  description: `
Retrieve paginated credit transaction history for the current organization.

**Authentication required** - Must have access to the organization.

**Filters:**
- \`transaction_type\` - Filter by type (ai_consumption, plan_allocation, topup_purchase, promo_bonus, admin_adjustment, plan_change_adjustment, expiration)
- \`from_date\`, \`to_date\` - Filter by date range (ISO 8601 format)

**Pagination:**
- \`page\` - Page number (default: 1)
- \`limit\` - Items per page (default: 20, max: 100)

**Response includes:**
- Transaction details with credit amounts
- Joined AI capability and quality level names for AI operations
- Balance after each transaction for audit trail
  `,
  security: [{ BearerAuth: [] }],
  request: {
    query: GetTransactionsQuerySchema,
  },
  responses: {
    200: {
      description: 'Credit transactions retrieved successfully',
      content: {
        'application/json': {
          schema: GetTransactionsResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request parameters',
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
// Runtime type safety is ensured by Zod schema validation inside the handler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
credits.openapi(getTransactionsRoute, async (c: any) => {
  const { page, limit, transaction_type, from_date, to_date } = c.req.valid('query');
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
  const offset = (page - 1) * limit;

  try {
    // Use GraphQL for read operations - benefits:
    // - Type-safe with generated types
    // - Hasura handles joins and filtering
    // - Consistent with frontend data patterns
    //
    // Build where clause dynamically to handle optional filters.
    // In Hasura, passing null to _eq means "equals null", not "skip filter".
    // We build the where clause as a variable to include only active filters.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      organization_id: { _eq: organizationId },
    };

    if (transaction_type) {
      where.transaction_type = { _eq: transaction_type };
    }
    if (from_date) {
      where.created_at = { ...where.created_at, _gte: from_date };
    }
    if (to_date) {
      where.created_at = { ...where.created_at, _lte: to_date };
    }

    const { data, error } = await executeGraphQLAsAdmin<GetCreditTransactionsQuery>(
      GetCreditTransactionsDocument,
      {
        limit,
        offset,
        where,
      }
    );

    if (error || !data) {
      console.error('Credit transactions GraphQL error:', error);
      return c.json(
        {
          error: 'Failed to retrieve credit transactions',
        },
        500
      );
    }

    const transactions = data.credit_transactions;
    const total = data.credit_transactions_aggregate.aggregate?.count ?? 0;
    const totalPages = Math.ceil(total / limit);

    // Transform to camelCase response format
    const responseData = transactions.map((tx) => ({
      id: tx.id,
      transactionType: tx.transaction_type,
      creditsAmount: tx.credits_amount,
      balanceAfter: tx.balance_after,
      description: tx.description,
      aiCapabilityName: tx.ai_capability?.name ?? null,
      qualityLevelName: tx.quality_level?.name ?? null,
      createdAt: tx.created_at,
      // Audit context (ADR-023 Decision 8)
      userId: tx.user_id ?? null,
      userEmail: tx.user_email ?? null,
      formId: tx.form_id ?? null,
      formName: tx.form_name ?? null,
    }));

    return c.json(
      {
        data: responseData,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      200
    );
  } catch (error) {
    console.error('Credit transactions query error:', error);
    return c.json(
      {
        error: 'Failed to retrieve credit transactions',
      },
      500
    );
  }
});

// ============================================================
// GET /credits/balance - Get current credit balance
// ============================================================

const getBalanceRoute = createRoute({
  method: 'get',
  path: '/balance',
  tags: ['Credits'],
  summary: 'Get current credit balance',
  description: `
Retrieve the current credit balance for the organization.

**Authentication required** - Must have access to the organization.

**Response includes:**
- Available credits (before overdraft)
- Spendable credits (including overdraft allowance)
- Monthly allocation and bonus credits
- Reserved credits for in-flight operations
- Usage during current billing period
- Billing period dates
  `,
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: 'Credit balance retrieved successfully',
      content: {
        'application/json': {
          schema: GetBalanceResponseSchema,
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
      description: 'Credit balance not found for organization',
      content: {
        'application/json': {
          schema: CreditsErrorResponseSchema,
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
// Runtime type safety is ensured by Zod schema validation inside the handler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
credits.openapi(getBalanceRoute, async (c: any) => {
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

  try {
    // Use GraphQL for read operations - benefits:
    // - Type-safe with generated types
    // - Consistent with frontend data patterns
    // - Hasura RLS for organization isolation
    const { data, error } = await executeGraphQLAsAdmin<GetCreditBalanceQuery>(
      GetCreditBalanceDocument,
      { organizationId }
    );

    if (error) {
      console.error('Credit balance GraphQL error:', error);
      return c.json(
        {
          error: 'Failed to retrieve credit balance',
        },
        500
      );
    }

    const balances = data?.organization_credit_balances;

    // Handle case where organization has no credit balance record
    if (!balances || balances.length === 0) {
      return c.json(
        {
          success: false as const,
          error: 'Credit balance not found for organization',
        },
        404
      );
    }

    const row = balances[0];

    return c.json(
      {
        available: row.available_credits ?? 0,
        spendable: row.spendable_credits ?? 0,
        monthlyCredits: row.monthly_credits,
        bonusCredits: row.bonus_credits,
        reservedCredits: row.reserved_credits,
        usedThisPeriod: row.used_this_period ?? 0,
        overdraftLimit: row.overdraft_limit,
        periodStartsAt: row.period_start,
        periodEndsAt: row.period_end,
      },
      200
    );
  } catch (error) {
    console.error('Credit balance query error:', error);
    return c.json(
      {
        error: 'Failed to retrieve credit balance',
      },
      500
    );
  }
});

// ============================================================
// POST /credits/purchase - Create Stripe checkout session for credit topup
// ============================================================

const purchaseCreditsRoute = createRoute({
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

// Type assertion needed: OpenAPI handler type inference is complex with @hono/zod-openapi.
// Runtime type safety is ensured by Zod schema validation inside the handler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
credits.openapi(purchaseCreditsRoute, async (c: any) => {
  const { packageId } = c.req.valid('json');
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
    const packageResult = await sql.unsafe(packageQuery, [packageId]) as TopupPackageRow[];

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
    const orgResult = await sql.unsafe(orgQuery, [organizationId]) as OrganizationRow[];

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
    const userResult = await sql.unsafe(userQuery, [userId]) as UserEmailRow[];
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
              description: topupPackage.description || `${topupPackage.credits} AI Credits`,
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
});

export { credits };
export type CreditsRoutes = typeof credits;
