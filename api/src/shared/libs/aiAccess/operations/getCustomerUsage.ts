/**
 * Get Customer Usage
 *
 * Queries per-customer AI generation count for rate limiting.
 * Uses the idx_credit_transactions_customer_form partial index.
 *
 * @see ADR-023 Decision 8a: Per-customer generation limits
 */

import { sql } from 'drizzle-orm';
import { getDb } from '@/db';

interface CustomerUsageParams {
  /** Form ID to scope the count */
  formId: string;
  /** Google ID (sub claim) of the customer */
  customerGoogleId: string;
  /** Time window in hours (e.g., 24) */
  windowHours: number;
}

interface CustomerUsage {
  /** Number of AI generations used within the time window */
  generationsUsed: number;
}

/**
 * Count AI generations by a specific customer on a specific form
 * within a rolling time window.
 */
export async function getCustomerUsage(
  params: CustomerUsageParams
): Promise<CustomerUsage> {
  const { formId, customerGoogleId, windowHours } = params;
  const db = getDb();

  const result = await db.execute<{ count: string; [key: string]: unknown }>(sql`
    SELECT COUNT(*)::text as count
    FROM credit_transactions
    WHERE form_id = ${formId}
      AND customer_google_id = ${customerGoogleId}
      AND transaction_type = 'ai_consumption'
      AND created_at >= NOW() - INTERVAL '1 hour' * ${windowHours}
  `);

  const count = result && result.length > 0
    ? parseInt(result[0].count, 10) || 0
    : 0;

  return { generationsUsed: count };
}
