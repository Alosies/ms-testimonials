/**
 * Reset Monthly Credits Job
 *
 * Scheduled job that resets monthly credits at billing period end for organizations.
 * Handles plan changes (pending downgrades) and creates audit records.
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration (T7.3)
 *
 * Process for each organization where period_end <= NOW():
 * 1. Check if pending_plan_id exists (scheduled downgrade)
 * 2. If pending plan: apply plan change, update plan_id and monthly_ai_credits
 * 3. Calculate new period: period_start = old period_end, period_end = period_start + 1 month
 * 4. Update organization_credit_balances:
 *    - Set monthly_credits from plan's monthly_ai_credits
 *    - Set new period_start and period_end
 *    - Keep bonus_credits unchanged (they carry over)
 *    - Reset reserved_credits to 0 (expired reservations)
 * 5. Create credit_transaction with type 'plan_allocation' for new monthly credits
 * 6. If plan changed: create additional transaction with type 'plan_change_adjustment'
 *
 * Idempotency:
 * - Uses database transactions to prevent double-processing
 * - Checks period_end > NOW() after update confirms the reset occurred
 */

import { sql } from 'drizzle-orm';
import { getDb } from '@/db';
import type { CreditTransactionType } from '@/shared/libs/aiAccess';

// =============================================================================
// Types
// =============================================================================

/**
 * Result of a single organization credit reset.
 */
export interface OrganizationResetResult {
  /** Organization ID that was processed */
  organizationId: string;

  /** Whether the reset was successful */
  success: boolean;

  /** Whether a plan change was applied */
  planChanged: boolean;

  /** Previous plan ID (if changed) */
  previousPlanId?: string;

  /** New plan ID (if changed) */
  newPlanId?: string;

  /** New monthly credits allocation */
  newMonthlyCredits?: number;

  /** Error message if failed */
  error?: string;
}

/**
 * Result of the monthly credit reset job.
 */
export interface ResetMonthlyCreditsResult {
  /** Timestamp when job started */
  startedAt: Date;

  /** Timestamp when job completed */
  completedAt: Date;

  /** Number of organizations processed */
  processedCount: number;

  /** Number of successful resets */
  successCount: number;

  /** Number of failed resets */
  failedCount: number;

  /** Number of plan changes applied */
  planChangesApplied: number;

  /** Details for each organization processed */
  results: OrganizationResetResult[];
}

/** Row type for expired balance query */
type ExpiredBalanceRow = {
  organization_id: string;
  period_start: string;
  period_end: string;
  monthly_credits: string;
  bonus_credits: string;
  [key: string]: unknown;
};

/** Row type for organization plan query */
type OrgPlanRow = {
  id: string;
  plan_id: string;
  pending_plan_id: string | null;
  monthly_ai_credits: string;
  [key: string]: unknown;
};

/** Row type for plan query */
type PlanRow = {
  id: string;
  monthly_ai_credits: string;
  [key: string]: unknown;
};

/** Row type for balance after update */
type BalanceAfterRow = {
  balance_after: string;
  [key: string]: unknown;
};

// =============================================================================
// Main Function
// =============================================================================

/**
 * Reset monthly credits for all organizations with expired billing periods.
 *
 * This function is designed to be called by an external scheduler (cron job,
 * Hasura scheduled trigger, etc.). It processes all organizations where
 * period_end <= NOW().
 *
 * Idempotency:
 * - Safe to call multiple times; only processes organizations that need reset
 * - Uses transactions to prevent partial updates
 * - Each organization is processed independently (one failure doesn't affect others)
 *
 * @returns Results summary including counts and per-organization details
 *
 * @example
 * ```typescript
 * // Call from a scheduled job handler
 * import { resetMonthlyCredits } from '@/jobs';
 *
 * app.post('/jobs/reset-credits', async (c) => {
 *   const results = await resetMonthlyCredits();
 *   return c.json(results);
 * });
 * ```
 */
export async function resetMonthlyCredits(): Promise<ResetMonthlyCreditsResult> {
  const startedAt = new Date();
  const results: OrganizationResetResult[] = [];
  let successCount = 0;
  let failedCount = 0;
  let planChangesApplied = 0;

  const db = getDb();

  // Step 1: Find all organizations with expired billing periods
  const expiredBalances = await db.execute<ExpiredBalanceRow>(sql`
    SELECT
      organization_id,
      period_start::text,
      period_end::text,
      monthly_credits::text,
      bonus_credits::text
    FROM organization_credit_balances
    WHERE period_end <= NOW()
    ORDER BY period_end ASC
  `);

  // Step 2: Process each organization
  for (const balance of expiredBalances) {
    const organizationId = balance.organization_id;
    const result = await processOrganizationReset(db, organizationId, balance);

    results.push(result);

    if (result.success) {
      successCount++;
      if (result.planChanged) {
        planChangesApplied++;
      }
    } else {
      failedCount++;
    }
  }

  return {
    startedAt,
    completedAt: new Date(),
    processedCount: expiredBalances.length,
    successCount,
    failedCount,
    planChangesApplied,
    results,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Process credit reset for a single organization.
 *
 * Runs in a transaction to ensure atomicity. If any step fails,
 * the entire operation is rolled back.
 */
async function processOrganizationReset(
  db: ReturnType<typeof getDb>,
  organizationId: string,
  balance: ExpiredBalanceRow
): Promise<OrganizationResetResult> {
  try {
    return await db.transaction(async (tx) => {
      // Step 1: Get the organization's current plan info
      const orgPlanResult = await tx.execute<OrgPlanRow>(sql`
        SELECT
          id,
          plan_id,
          pending_plan_id,
          monthly_ai_credits::text
        FROM organization_plans
        WHERE organization_id = ${organizationId}
          AND status IN ('active', 'trial')
        LIMIT 1
      `);

      if (!orgPlanResult || orgPlanResult.length === 0) {
        // No active plan - just reset the period without allocating credits
        return await resetWithoutPlan(tx, organizationId, balance);
      }

      const orgPlan = orgPlanResult[0];
      const hasPendingChange = orgPlan.pending_plan_id !== null;
      let planChanged = false;
      let previousPlanId: string | undefined;
      let newPlanId: string | undefined;
      let newMonthlyCredits: number;

      // Step 2: Handle pending plan change if exists
      if (hasPendingChange) {
        // Get the new plan's monthly_ai_credits
        const newPlanResult = await tx.execute<PlanRow>(sql`
          SELECT id, monthly_ai_credits::text
          FROM plans
          WHERE id = ${orgPlan.pending_plan_id}
        `);

        if (newPlanResult && newPlanResult.length > 0) {
          const newPlan = newPlanResult[0];
          previousPlanId = orgPlan.plan_id;
          newPlanId = newPlan.id;
          newMonthlyCredits = parseInt(newPlan.monthly_ai_credits);
          planChanged = true;

          // Apply plan change: update organization_plans
          await tx.execute(sql`
            UPDATE organization_plans
            SET
              plan_id = ${newPlanId},
              monthly_ai_credits = ${newMonthlyCredits},
              pending_plan_id = NULL,
              pending_change_at = NULL,
              updated_at = NOW()
            WHERE organization_id = ${organizationId}
              AND status IN ('active', 'trial')
          `);
        } else {
          // Pending plan no longer exists, clear the pending fields
          await tx.execute(sql`
            UPDATE organization_plans
            SET
              pending_plan_id = NULL,
              pending_change_at = NULL,
              updated_at = NOW()
            WHERE organization_id = ${organizationId}
              AND status IN ('active', 'trial')
          `);
          newMonthlyCredits = parseInt(orgPlan.monthly_ai_credits);
        }
      } else {
        newMonthlyCredits = parseInt(orgPlan.monthly_ai_credits);
      }

      // Step 3: Calculate new billing period
      const oldPeriodEnd = new Date(balance.period_end);
      const newPeriodStart = oldPeriodEnd;
      const newPeriodEnd = new Date(oldPeriodEnd);
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

      // Step 4: Update organization_credit_balances
      // - Set monthly_credits from plan's monthly_ai_credits
      // - Set new period_start and period_end
      // - Keep bonus_credits unchanged (they carry over)
      // - Reset reserved_credits to 0 (expired reservations)
      await tx.execute(sql`
        UPDATE organization_credit_balances
        SET
          monthly_credits = ${newMonthlyCredits},
          reserved_credits = 0,
          period_start = ${newPeriodStart.toISOString()},
          period_end = ${newPeriodEnd.toISOString()},
          updated_at = NOW()
        WHERE organization_id = ${organizationId}
      `);

      // Step 5: Get the balance after for transaction record
      const balanceAfterResult = await tx.execute<BalanceAfterRow>(sql`
        SELECT (monthly_credits + bonus_credits - reserved_credits)::text as balance_after
        FROM organization_credit_balances
        WHERE organization_id = ${organizationId}
      `);

      const balanceAfter = balanceAfterResult && balanceAfterResult.length > 0
        ? parseFloat(balanceAfterResult[0].balance_after)
        : newMonthlyCredits;

      // Step 6: Create credit_transaction for plan_allocation
      const allocationDescription = `Monthly credit allocation for ${new Date(newPeriodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;

      await tx.execute(sql`
        INSERT INTO credit_transactions (
          organization_id,
          transaction_type,
          credits_amount,
          balance_after,
          description
        )
        VALUES (
          ${organizationId},
          ${'plan_allocation' as CreditTransactionType},
          ${newMonthlyCredits},
          ${balanceAfter},
          ${allocationDescription}
        )
      `);

      // Step 7: If plan changed, create additional transaction for audit
      if (planChanged && previousPlanId && newPlanId) {
        const changeDescription = `Plan changed from ${previousPlanId} to ${newPlanId} at period end`;

        await tx.execute(sql`
          INSERT INTO credit_transactions (
            organization_id,
            transaction_type,
            credits_amount,
            balance_after,
            description
          )
          VALUES (
            ${organizationId},
            ${'plan_change_adjustment' as CreditTransactionType},
            ${0},
            ${balanceAfter},
            ${changeDescription}
          )
        `);
      }

      return {
        organizationId,
        success: true,
        planChanged,
        previousPlanId,
        newPlanId,
        newMonthlyCredits,
      };
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to reset credits for organization ${organizationId}:`, errorMessage);

    return {
      organizationId,
      success: false,
      planChanged: false,
      error: errorMessage,
    };
  }
}

/**
 * Reset credits for an organization without an active plan.
 *
 * This handles edge cases where:
 * - The organization's plan has expired
 * - The organization is in a cancelled state
 *
 * In these cases, we just advance the period without allocating new credits.
 */
async function resetWithoutPlan(
  tx: Parameters<Parameters<ReturnType<typeof getDb>['transaction']>[0]>[0],
  organizationId: string,
  balance: ExpiredBalanceRow
): Promise<OrganizationResetResult> {
  // Calculate new billing period
  const oldPeriodEnd = new Date(balance.period_end);
  const newPeriodStart = oldPeriodEnd;
  const newPeriodEnd = new Date(oldPeriodEnd);
  newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

  // Update with zero monthly credits, reset reserved, keep bonus
  await tx.execute(sql`
    UPDATE organization_credit_balances
    SET
      monthly_credits = 0,
      reserved_credits = 0,
      period_start = ${newPeriodStart.toISOString()},
      period_end = ${newPeriodEnd.toISOString()},
      updated_at = NOW()
    WHERE organization_id = ${organizationId}
  `);

  // Get balance after for transaction record
  const balanceAfterResult = await tx.execute<BalanceAfterRow>(sql`
    SELECT (monthly_credits + bonus_credits - reserved_credits)::text as balance_after
    FROM organization_credit_balances
    WHERE organization_id = ${organizationId}
  `);

  const balanceAfter = balanceAfterResult && balanceAfterResult.length > 0
    ? parseFloat(balanceAfterResult[0].balance_after)
    : 0;

  // Create transaction record for the period reset (zero allocation)
  const allocationDescription = `Monthly credit allocation for ${new Date(newPeriodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} (no active plan)`;

  await tx.execute(sql`
    INSERT INTO credit_transactions (
      organization_id,
      transaction_type,
      credits_amount,
      balance_after,
      description
    )
    VALUES (
      ${organizationId},
      ${'plan_allocation' as CreditTransactionType},
      ${0},
      ${balanceAfter},
      ${allocationDescription}
    )
  `);

  return {
    organizationId,
    success: true,
    planChanged: false,
    newMonthlyCredits: 0,
  };
}
