/**
 * Billing Routes
 *
 * Handles plan upgrades and downgrades for organizations.
 * Uses Drizzle ORM for transactional database operations.
 *
 * Part of ADR-023 AI Capabilities Plan Integration (T7.5, T7.6)
 */

import { OpenAPIHono, createRoute } from '@hono/zod-openapi';

import { authMiddleware, type AuthContext } from '@/shared/middleware/auth';
import { getClient, getDb } from '@/db';
import { sql } from 'drizzle-orm';
import {
  UpgradePlanRequestSchema,
  UpgradePlanResponseSchema,
  DowngradePlanRequestSchema,
  DowngradePlanResponseSchema,
  BillingErrorResponseSchema,
} from '@/shared/schemas/billing';
import { ErrorResponseSchema, ForbiddenResponseSchema } from '@/shared/schemas/common';
import type { CreditTransactionType } from '@/shared/libs/aiAccess';
import { isUpgrade, isDowngrade } from '@/shared/libs/billing';

// =============================================================================
// Types
// =============================================================================

/**
 * Row type for organization plan query result
 */
interface OrganizationPlanRow {
  id: string;
  organization_id: string;
  plan_id: string;
  monthly_ai_credits: number;
  status: string;
  current_period_ends_at: string | null;
}

/**
 * Row type for plan query result
 */
interface PlanRow {
  id: string;
  unique_name: string;
  name: string;
  monthly_ai_credits: number;
  is_active: boolean;
}

/**
 * Row type for credit balance query result
 */
interface CreditBalanceRow {
  monthly_credits: string;
  bonus_credits: string;
  [key: string]: unknown;
}

/**
 * Row type for transaction insert result
 */
interface TransactionRow {
  id: string;
  [key: string]: unknown;
}

// =============================================================================
// Router Setup
// =============================================================================

const billing = new OpenAPIHono();

// Apply auth middleware to all routes
billing.use('/*', authMiddleware);

// =============================================================================
// POST /billing/upgrade - Immediate plan upgrade
// =============================================================================

const upgradePlanRoute = createRoute({
  method: 'post',
  path: '/upgrade',
  tags: ['Billing'],
  summary: 'Upgrade organization plan',
  description: `
Immediately upgrade the organization's plan to a higher tier.

**Authentication required** - Must have access to the organization.

**Upgrade vs Downgrade:**
- **Upgrades** (this endpoint): Take effect immediately with prorated credit adjustment
- **Downgrades**: Scheduled for period end (see POST /billing/downgrade)

**Credit Adjustment:**
On upgrade, the difference in monthly credits between plans is immediately added
to the organization's credit balance. A \`plan_change_adjustment\` transaction is
recorded for audit purposes.

**Example:**
Upgrading from Free (10 credits) to Pro (500 credits) adds 490 credits immediately.

**Validation:**
- New plan must be higher tier than current plan
- Current plan must be active
- New plan must exist and be active
  `,
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpgradePlanRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Plan upgraded successfully',
      content: {
        'application/json': {
          schema: UpgradePlanResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid upgrade - new plan is not higher tier',
      content: {
        'application/json': {
          schema: BillingErrorResponseSchema,
        },
      },
    },
    403: {
      description: 'Access denied - organization context required',
      content: {
        'application/json': {
          schema: ForbiddenResponseSchema,
        },
      },
    },
    404: {
      description: 'Plan or organization not found',
      content: {
        'application/json': {
          schema: BillingErrorResponseSchema,
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
billing.openapi(upgradePlanRoute, async (c: any) => {
  const { newPlanId } = c.req.valid('json');
  const auth = c.get('auth') as AuthContext;

  // Verify organization context
  if (!auth.organizationId) {
    return c.json(
      {
        success: false as const,
        error: 'Organization context required',
        code: 'ORGANIZATION_REQUIRED',
      },
      403
    );
  }

  const organizationId = auth.organizationId;

  try {
    const sqlClient = getClient();
    const db = getDb();

    // 1. Get current organization plan
    const orgPlanQuery = `
      SELECT
        op.id,
        op.organization_id,
        op.plan_id,
        op.monthly_ai_credits,
        op.status,
        op.current_period_ends_at
      FROM organization_plans op
      WHERE op.organization_id = $1
        AND op.status IN ('active', 'trial')
      LIMIT 1
    `;
    const orgPlanResult = await sqlClient.unsafe(orgPlanQuery, [organizationId]) as OrganizationPlanRow[];

    if (!orgPlanResult || orgPlanResult.length === 0) {
      return c.json(
        {
          success: false as const,
          error: 'No active plan found for organization',
          code: 'NO_ACTIVE_PLAN',
        },
        404
      );
    }

    const currentOrgPlan = orgPlanResult[0];
    const currentPlanId = currentOrgPlan.plan_id;
    const currentMonthlyCredits = currentOrgPlan.monthly_ai_credits;

    // 2. Get current plan details
    const currentPlanQuery = `
      SELECT id, unique_name, name, monthly_ai_credits, is_active
      FROM plans
      WHERE id = $1
    `;
    const currentPlanResult = await sqlClient.unsafe(currentPlanQuery, [currentPlanId]) as PlanRow[];

    if (!currentPlanResult || currentPlanResult.length === 0) {
      return c.json(
        {
          success: false as const,
          error: 'Current plan not found',
          code: 'PLAN_NOT_FOUND',
        },
        404
      );
    }

    const currentPlan = currentPlanResult[0];

    // 3. Get new plan details
    const newPlanQuery = `
      SELECT id, unique_name, name, monthly_ai_credits, is_active
      FROM plans
      WHERE id = $1
    `;
    const newPlanResult = await sqlClient.unsafe(newPlanQuery, [newPlanId]) as PlanRow[];

    if (!newPlanResult || newPlanResult.length === 0) {
      return c.json(
        {
          success: false as const,
          error: 'New plan not found',
          code: 'PLAN_NOT_FOUND',
        },
        404
      );
    }

    const newPlan = newPlanResult[0];

    // 4. Verify new plan is active
    if (!newPlan.is_active) {
      return c.json(
        {
          success: false as const,
          error: 'New plan is not available',
          code: 'PLAN_INACTIVE',
        },
        400
      );
    }

    // 5. Verify this is an upgrade (new plan is higher tier)
    if (!isUpgrade(currentPlan.unique_name, newPlan.unique_name)) {
      return c.json(
        {
          success: false as const,
          error: 'Cannot upgrade: new plan is not higher tier than current plan. Use /billing/downgrade for downgrades.',
          code: 'INVALID_UPGRADE',
        },
        400
      );
    }

    // 6. Calculate credit difference
    const newMonthlyCredits = newPlan.monthly_ai_credits;
    const creditsToAdd = newMonthlyCredits - currentMonthlyCredits;

    // 7. Perform upgrade in a transaction
    await db.transaction(async (tx) => {
      // 7a. Update organization_plans: set plan_id and monthly_ai_credits
      await tx.execute(sql`
        UPDATE organization_plans
        SET
          plan_id = ${newPlanId},
          monthly_ai_credits = ${newMonthlyCredits},
          updated_at = NOW()
        WHERE organization_id = ${organizationId}
          AND status IN ('active', 'trial')
      `);

      // 7b. Update organization_credit_balances: add the credit difference to monthly_credits
      await tx.execute(sql`
        UPDATE organization_credit_balances
        SET
          monthly_credits = monthly_credits + ${creditsToAdd},
          updated_at = NOW()
        WHERE organization_id = ${organizationId}
      `);

      // 7c. Get balance after update for transaction record
      const balanceResult = await tx.execute<CreditBalanceRow>(sql`
        SELECT
          monthly_credits::text,
          bonus_credits::text
        FROM organization_credit_balances
        WHERE organization_id = ${organizationId}
      `);

      const balanceAfter = balanceResult && balanceResult.length > 0
        ? parseFloat(balanceResult[0].monthly_credits) + parseFloat(balanceResult[0].bonus_credits)
        : creditsToAdd;

      // 7d. Create credit_transaction for the adjustment
      const transactionType: CreditTransactionType = 'plan_change_adjustment';
      const description = `Plan upgrade from ${currentPlan.name} to ${newPlan.name}`;

      await tx.execute<TransactionRow>(sql`
        INSERT INTO credit_transactions (
          organization_id,
          transaction_type,
          credits_amount,
          balance_after,
          description
        )
        VALUES (
          ${organizationId},
          ${transactionType},
          ${creditsToAdd},
          ${balanceAfter},
          ${description}
        )
      `);
    });

    return c.json(
      {
        success: true as const,
        newPlanId,
        newMonthlyCredits,
        creditsAdded: creditsToAdd,
      },
      200
    );
  } catch (error) {
    console.error('Plan upgrade error:', error);
    return c.json(
      {
        error: 'Failed to upgrade plan',
        code: 'INTERNAL_ERROR',
      },
      500
    );
  }
});

// =============================================================================
// POST /billing/downgrade - Scheduled plan downgrade
// =============================================================================

const downgradePlanRoute = createRoute({
  method: 'post',
  path: '/downgrade',
  tags: ['Billing'],
  summary: 'Schedule organization plan downgrade',
  description: `
Schedule a downgrade of the organization's plan to a lower tier.

**Authentication required** - Must have access to the organization.

**Upgrade vs Downgrade:**
- **Upgrades** (see POST /billing/upgrade): Take effect immediately with prorated credit adjustment
- **Downgrades** (this endpoint): Scheduled for period end to maintain access until billing cycle completes

**How Downgrades Work:**
1. The current plan remains active until the end of the billing period
2. A \`pending_plan_id\` is set on the organization's plan record
3. The \`pending_change_at\` timestamp is set to the period end date
4. At period end, the scheduled job (resetMonthlyCredits) applies the change

**Credit Behavior:**
- Current monthly credits remain unchanged until period end
- At period end, monthly credits reset to the new plan's allocation
- Bonus credits are preserved and carry over regardless of plan changes

**Example:**
Downgrading from Pro (500 credits) to Free (10 credits) on Jan 15 with period ending Feb 1:
- Jan 15 - Feb 1: Organization keeps 500 credits/month
- Feb 1: Monthly credits reset to 10, new period begins

**Validation:**
- New plan must be lower tier than current plan
- Current plan must be active
- New plan must exist and be active
  `,
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: DowngradePlanRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Plan downgrade scheduled successfully',
      content: {
        'application/json': {
          schema: DowngradePlanResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid downgrade - new plan is not lower tier',
      content: {
        'application/json': {
          schema: BillingErrorResponseSchema,
        },
      },
    },
    403: {
      description: 'Access denied - organization context required',
      content: {
        'application/json': {
          schema: ForbiddenResponseSchema,
        },
      },
    },
    404: {
      description: 'Plan or organization not found',
      content: {
        'application/json': {
          schema: BillingErrorResponseSchema,
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

/**
 * Row type for credit balance query with period_end
 */
interface CreditBalanceWithPeriodRow {
  monthly_credits: string;
  bonus_credits: string;
  period_end: string;
  [key: string]: unknown;
}

// Type assertion needed: OpenAPI handler type inference is complex with @hono/zod-openapi.
// Runtime type safety is ensured by Zod schema validation inside the handler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
billing.openapi(downgradePlanRoute, async (c: any) => {
  const { newPlanId } = c.req.valid('json');
  const auth = c.get('auth') as AuthContext;

  // Verify organization context
  if (!auth.organizationId) {
    return c.json(
      {
        success: false as const,
        error: 'Organization context required',
        code: 'ORGANIZATION_REQUIRED',
      },
      403
    );
  }

  const organizationId = auth.organizationId;

  try {
    const sqlClient = getClient();

    // 1. Get current organization plan
    const orgPlanQuery = `
      SELECT
        op.id,
        op.organization_id,
        op.plan_id,
        op.monthly_ai_credits,
        op.status,
        op.current_period_ends_at
      FROM organization_plans op
      WHERE op.organization_id = $1
        AND op.status IN ('active', 'trial')
      LIMIT 1
    `;
    const orgPlanResult = await sqlClient.unsafe(orgPlanQuery, [organizationId]) as OrganizationPlanRow[];

    if (!orgPlanResult || orgPlanResult.length === 0) {
      return c.json(
        {
          success: false as const,
          error: 'No active plan found for organization',
          code: 'NO_ACTIVE_PLAN',
        },
        404
      );
    }

    const currentOrgPlan = orgPlanResult[0];
    const currentPlanId = currentOrgPlan.plan_id;
    const currentMonthlyCredits = currentOrgPlan.monthly_ai_credits;

    // 2. Get current plan details
    const currentPlanQuery = `
      SELECT id, unique_name, name, monthly_ai_credits, is_active
      FROM plans
      WHERE id = $1
    `;
    const currentPlanResult = await sqlClient.unsafe(currentPlanQuery, [currentPlanId]) as PlanRow[];

    if (!currentPlanResult || currentPlanResult.length === 0) {
      return c.json(
        {
          success: false as const,
          error: 'Current plan not found',
          code: 'PLAN_NOT_FOUND',
        },
        404
      );
    }

    const currentPlan = currentPlanResult[0];

    // 3. Get new plan details
    const newPlanQuery = `
      SELECT id, unique_name, name, monthly_ai_credits, is_active
      FROM plans
      WHERE id = $1
    `;
    const newPlanResult = await sqlClient.unsafe(newPlanQuery, [newPlanId]) as PlanRow[];

    if (!newPlanResult || newPlanResult.length === 0) {
      return c.json(
        {
          success: false as const,
          error: 'New plan not found',
          code: 'PLAN_NOT_FOUND',
        },
        404
      );
    }

    const newPlan = newPlanResult[0];

    // 4. Verify new plan is active
    if (!newPlan.is_active) {
      return c.json(
        {
          success: false as const,
          error: 'New plan is not available',
          code: 'PLAN_INACTIVE',
        },
        400
      );
    }

    // 5. Verify this is a downgrade (new plan is lower tier)
    if (!isDowngrade(currentPlan.unique_name, newPlan.unique_name)) {
      return c.json(
        {
          success: false as const,
          error: 'Cannot downgrade: new plan is not lower tier than current plan. Use /billing/upgrade for upgrades.',
          code: 'INVALID_DOWNGRADE',
        },
        400
      );
    }

    // 6. Get period_end from organization_credit_balances
    const balanceQuery = `
      SELECT
        monthly_credits::text,
        bonus_credits::text,
        period_end::text
      FROM organization_credit_balances
      WHERE organization_id = $1
    `;
    const balanceResult = await sqlClient.unsafe(balanceQuery, [organizationId]) as CreditBalanceWithPeriodRow[];

    if (!balanceResult || balanceResult.length === 0) {
      return c.json(
        {
          success: false as const,
          error: 'Credit balance not found for organization',
          code: 'BALANCE_NOT_FOUND',
        },
        404
      );
    }

    const periodEnd = balanceResult[0].period_end;

    // 7. Schedule the downgrade by setting pending_plan_id and pending_change_at
    const updateQuery = `
      UPDATE organization_plans
      SET
        pending_plan_id = $1,
        pending_change_at = $2,
        updated_at = NOW()
      WHERE organization_id = $3
        AND status IN ('active', 'trial')
    `;
    await sqlClient.unsafe(updateQuery, [newPlanId, periodEnd, organizationId]);

    // 8. Return response with scheduled change info
    const newMonthlyCredits = newPlan.monthly_ai_credits;

    return c.json(
      {
        success: true as const,
        scheduledPlanId: newPlanId,
        effectiveAt: new Date(periodEnd).toISOString(),
        currentCredits: currentMonthlyCredits,
        newCredits: newMonthlyCredits,
      },
      200
    );
  } catch (error) {
    console.error('Plan downgrade error:', error);
    return c.json(
      {
        error: 'Failed to schedule plan downgrade',
        code: 'INTERNAL_ERROR',
      },
      500
    );
  }
});

export { billing };
export type BillingRoutes = typeof billing;
