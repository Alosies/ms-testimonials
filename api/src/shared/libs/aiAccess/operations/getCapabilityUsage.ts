/**
 * Get AI Capability Usage
 *
 * Queries credit_transactions to count AI operations for rate limiting.
 * This function counts operations per day and per hour to enforce
 * rate limits defined in plan_ai_capabilities.
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration
 */

import { sql } from 'drizzle-orm';
import { getDb } from '@/db';

// =============================================================================
// Types
// =============================================================================

interface CapabilityUsageParams {
  organizationId: string;
  aiCapabilityId: string;
}

export interface CapabilityUsage {
  /** Number of AI operations since midnight UTC */
  usedToday: number;
  /** Number of AI operations in the last 60 minutes */
  usedThisHour: number;
}

// =============================================================================
// Main Function
// =============================================================================

/**
 * Get usage counts for an AI capability.
 *
 * Queries the credit_transactions table to count how many AI operations
 * have been performed for the given capability in the current day and hour.
 * Uses the existing indexes for efficient querying.
 *
 * @param params - Organization ID and capability ID to check
 * @returns Usage counts for today and this hour
 *
 * @example
 * ```typescript
 * const usage = await getCapabilityUsage({
 *   organizationId: 'org_123',
 *   aiCapabilityId: 'cap_456',
 * });
 *
 * if (usage.usedThisHour >= hourlyLimit) {
 *   // Deny request - rate limit exceeded
 * }
 * ```
 */
export async function getCapabilityUsage(
  params: CapabilityUsageParams
): Promise<CapabilityUsage> {
  const { organizationId, aiCapabilityId } = params;
  const db = getDb();

  // Calculate time boundaries
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Single query with conditional counting for both time windows
  // Uses FILTER clause for efficient counting in a single pass
  const result = await db.execute<{
    used_today: string;
    used_this_hour: string;
  }>(sql`
    SELECT
      COUNT(*)::text as used_today,
      COUNT(*) FILTER (WHERE created_at >= ${oneHourAgo.toISOString()})::text as used_this_hour
    FROM credit_transactions
    WHERE organization_id = ${organizationId}
      AND ai_capability_id = ${aiCapabilityId}
      AND transaction_type = 'ai_consumption'
      AND created_at >= ${todayStart.toISOString()}
  `);

  // Parse results safely
  const row = result?.[0];
  return {
    usedToday: row ? parseInt(row.used_today, 10) || 0 : 0,
    usedThisHour: row ? parseInt(row.used_this_hour, 10) || 0 : 0,
  };
}
