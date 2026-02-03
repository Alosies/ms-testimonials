/**
 * GET /credits/balance - Get current credit balance
 *
 * Part of ADR-023 AI Capabilities Plan Integration
 */

import { createRoute } from '@hono/zod-openapi';
import type { Context } from 'hono';
import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import {
  GetCreditBalanceDocument,
  type GetCreditBalanceQuery,
} from '@/graphql/generated/operations';
import {
  GetBalanceResponseSchema,
  CreditsErrorResponseSchema,
} from '@/shared/schemas/credits';
import { ErrorResponseSchema } from '@/shared/schemas/common';
import type { AuthContext } from '@/shared/middleware/auth';

export const getBalanceRoute = createRoute({
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

export async function getBalanceHandler(c: Context): Promise<Response> {
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
}
