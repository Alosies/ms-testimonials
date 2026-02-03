/**
 * GET /credits/transactions - Get paginated credit transaction history
 *
 * Part of ADR-023 AI Capabilities Plan Integration
 */

import { createRoute } from '@hono/zod-openapi';
import type { Context } from 'hono';
import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import {
  GetCreditTransactionsDocument,
  type GetCreditTransactionsQuery,
} from '@/graphql/generated/operations';
import {
  GetTransactionsQuerySchema,
  GetTransactionsResponseSchema,
  CreditsErrorResponseSchema,
} from '@/shared/schemas/credits';
import { ErrorResponseSchema } from '@/shared/schemas/common';
import type { AuthContext } from '@/shared/middleware/auth';

export const getTransactionsRoute = createRoute({
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

export async function getTransactionsHandler(c: Context): Promise<Response> {
  const { page, limit, transaction_type, from_date, to_date } = c.req.valid(
    'query' as never
  ) as {
    page: number;
    limit: number;
    transaction_type?: string;
    from_date?: string;
    to_date?: string;
  };
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
    // Build where clause dynamically
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

    const { data, error } =
      await executeGraphQLAsAdmin<GetCreditTransactionsQuery>(
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
}
