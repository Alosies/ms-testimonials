/**
 * Credit Balance Types
 *
 * Type definitions for credit balance checking operations.
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration
 */

/**
 * Result of a credit balance check for an organization.
 */
export interface CreditBalanceCheck {
  /** Whether the operation can proceed based on available credits */
  canProceed: boolean;
  /** Credits available (monthly + bonus - reserved - used) */
  available: number;
  /** Credits spendable (available + overdraft) */
  spendable: number;
  /** Monthly credits not yet used */
  monthlyRemaining: number;
  /** Bonus credits available */
  bonusCredits: number;
  /** Credits currently reserved for in-flight operations */
  reservedCredits: number;
  /** When current billing period ends */
  periodEndsAt: Date;
  /** Estimated cost for the operation */
  estimatedCost: number;
  /** Balance after operation completes (spendable - estimatedCost) */
  afterOperation: number;
}

/** Row type from credit balance query with index signature for Drizzle compatibility */
export type CreditBalanceRow = {
  monthly_credits: string;
  bonus_credits: string;
  reserved_credits: string;
  overdraft_limit: string;
  period_end: string;
  available: string;
  spendable: string;
  used_this_period: string;
  [key: string]: unknown;
};
