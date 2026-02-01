/**
 * Check Credit Balance Operation
 *
 * Checks if an organization has sufficient credits for an AI operation.
 * Uses GraphQL for reading balance data with Hasura computed fields.
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration (T4.1)
 */

import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import {
  GetCreditBalanceForCheckDocument,
  type GetCreditBalanceForCheckQuery,
} from '@/graphql/generated/operations';
import type { CreditBalanceCheck } from '../types';

/**
 * Fetch balance data via GraphQL using Hasura computed fields.
 */
async function fetchBalance(organizationId: string): Promise<{
  monthlyCredits: number;
  bonusCredits: number;
  reservedCredits: number;
  overdraftLimit: number;
  available: number;
  spendable: number;
  usedThisPeriod: number;
  periodEndsAt: Date;
} | null> {
  const { data, error } = await executeGraphQLAsAdmin<GetCreditBalanceForCheckQuery>(
    GetCreditBalanceForCheckDocument,
    { organizationId }
  );

  if (error) {
    console.error('Credit balance check GraphQL error:', error);
    return null;
  }

  const balances = data?.organization_credit_balances;
  if (!balances || balances.length === 0) {
    return null;
  }

  const row = balances[0];

  return {
    monthlyCredits: row.monthly_credits,
    bonusCredits: row.bonus_credits,
    reservedCredits: row.reserved_credits,
    overdraftLimit: row.overdraft_limit,
    available: row.available_credits ?? 0,
    spendable: row.spendable_credits ?? 0,
    usedThisPeriod: row.used_this_period ?? 0,
    periodEndsAt: new Date(row.period_end),
  };
}

/**
 * Check if an organization has sufficient credits for an AI operation.
 *
 * Queries the organization_credit_balances table via GraphQL using Hasura
 * computed fields for available and spendable credits. The operation can
 * proceed if spendable credits are greater than or equal to the estimated cost.
 *
 * @param organizationId - The organization ID to check
 * @param estimatedCost - The estimated credit cost for the operation
 * @returns Credit balance information including whether the operation can proceed
 *
 * @example
 * ```typescript
 * const balance = await checkCreditBalance(orgId, 2.5);
 * if (balance.canProceed) {
 *   // Proceed with AI operation
 * } else {
 *   // Show insufficient credits message
 * }
 * ```
 */
export async function checkCreditBalance(
  organizationId: string,
  estimatedCost: number
): Promise<CreditBalanceCheck> {
  // Edge case: zero cost always proceeds
  if (estimatedCost === 0) {
    return createZeroCostResult(organizationId);
  }

  const balanceData = await fetchBalance(organizationId);

  // Edge case: Organization not found - return canProceed: false with zeros
  if (!balanceData) {
    return createNotFoundResult(estimatedCost);
  }

  const {
    monthlyCredits,
    bonusCredits,
    reservedCredits,
    available,
    spendable,
    usedThisPeriod,
    periodEndsAt,
  } = balanceData;

  // Calculate monthly remaining: monthly_credits - used_this_period (but not below 0)
  const monthlyRemaining = Math.max(0, monthlyCredits - usedThisPeriod);

  // Determine if operation can proceed
  const canProceed = spendable >= estimatedCost;

  // Calculate balance after operation
  const afterOperation = spendable - estimatedCost;

  return {
    canProceed,
    available,
    spendable,
    monthlyRemaining,
    bonusCredits,
    reservedCredits,
    periodEndsAt,
    estimatedCost,
    afterOperation,
  };
}

/**
 * Creates a result for zero-cost operations.
 * Zero-cost operations always proceed.
 */
async function createZeroCostResult(
  organizationId: string
): Promise<CreditBalanceCheck> {
  const balanceData = await fetchBalance(organizationId);

  if (!balanceData) {
    // Even for zero cost, return the not found result structure
    // but with canProceed: true since cost is 0
    return {
      canProceed: true,
      available: 0,
      spendable: 0,
      monthlyRemaining: 0,
      bonusCredits: 0,
      reservedCredits: 0,
      periodEndsAt: new Date(),
      estimatedCost: 0,
      afterOperation: 0,
    };
  }

  const {
    monthlyCredits,
    bonusCredits,
    reservedCredits,
    available,
    spendable,
    usedThisPeriod,
    periodEndsAt,
  } = balanceData;

  const monthlyRemaining = Math.max(0, monthlyCredits - usedThisPeriod);

  return {
    canProceed: true, // Zero cost always proceeds
    available,
    spendable,
    monthlyRemaining,
    bonusCredits,
    reservedCredits,
    periodEndsAt,
    estimatedCost: 0,
    afterOperation: spendable, // No change since cost is 0
  };
}

/**
 * Creates a result for when the organization is not found.
 * Operations cannot proceed if the organization doesn't exist.
 */
function createNotFoundResult(estimatedCost: number): CreditBalanceCheck {
  return {
    canProceed: false,
    available: 0,
    spendable: 0,
    monthlyRemaining: 0,
    bonusCredits: 0,
    reservedCredits: 0,
    periodEndsAt: new Date(),
    estimatedCost,
    afterOperation: -estimatedCost,
  };
}
