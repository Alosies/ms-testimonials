/**
 * Actor Info Functions
 *
 * Pure functions for extracting and checking actor context from credit transactions.
 * ADR-023 Decision 8: Audit Log Snapshot Pattern
 */

import type { ActorInfo, CreditTransaction } from '../models';

/**
 * Get actor display info for a transaction.
 *
 * Shows both form and user context when available:
 * - formName: Which form the operation relates to
 * - userEmail: Who triggered the operation
 */
export function getActorInfo(tx: CreditTransaction): ActorInfo {
  return {
    form: tx.formName,
    user: tx.userEmail,
  };
}

/**
 * Check if we have any actor info to display
 */
export function hasActorInfo(tx: CreditTransaction): boolean {
  return tx.formName !== null || tx.userEmail !== null;
}
