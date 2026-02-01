/**
 * Cleanup Expired Credit Reservations
 *
 * Scheduled job that expires stale credit reservations.
 * Finds reservations where status='pending' AND expires_at < NOW(),
 * then releases the reserved credits back to the organization's balance.
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration (T7.4)
 *
 * @module jobs/cleanupReservations
 */

import { sql } from 'drizzle-orm';
import { getDb } from '@/db';

// =============================================================================
// Types
// =============================================================================

/**
 * Result of the cleanup operation.
 */
export interface CleanupResult {
  /** Number of reservations that were expired */
  expiredCount: number;

  /** Number of reservations that failed to process */
  errorCount: number;

  /** Any errors encountered during processing */
  errors: CleanupError[];
}

/**
 * Error details for a failed cleanup.
 */
export interface CleanupError {
  /** Reservation ID that failed */
  reservationId: string;

  /** Organization ID for the reservation */
  organizationId: string;

  /** Error message */
  message: string;
}

/** Row type for expired reservation query */
type ExpiredReservationRow = {
  id: string;
  organization_id: string;
  reserved_credits: string;
};

// =============================================================================
// Constants
// =============================================================================

/**
 * Maximum number of reservations to process in a single batch.
 * Keeps transactions short to avoid long locks.
 */
const BATCH_SIZE = 100;

// =============================================================================
// Main Function
// =============================================================================

/**
 * Clean up expired credit reservations.
 *
 * This function is designed to be called by a scheduler (e.g., cron job).
 * It finds all pending reservations that have passed their expiration time
 * and releases the reserved credits back to the organization's balance.
 *
 * Idempotency:
 * - The WHERE status='pending' clause ensures already-processed records are skipped
 * - Safe to run multiple times concurrently (though not recommended)
 *
 * Batch Processing:
 * - Processes reservations in batches of BATCH_SIZE to avoid long transactions
 * - Continues processing until no more expired reservations are found
 *
 * Error Handling:
 * - Individual reservation failures don't stop the overall job
 * - All errors are collected and returned in the result
 *
 * @returns CleanupResult with counts and any errors encountered
 *
 * @example
 * ```typescript
 * // Called by scheduler every 5 minutes
 * const result = await cleanupExpiredReservations();
 * console.log(`Cleaned up ${result.expiredCount} reservations`);
 * if (result.errorCount > 0) {
 *   console.error(`${result.errorCount} errors:`, result.errors);
 * }
 * ```
 */
export async function cleanupExpiredReservations(): Promise<CleanupResult> {
  const db = getDb();
  let totalExpired = 0;
  let totalErrors = 0;
  const errors: CleanupError[] = [];

  // Process in batches until no more expired reservations
  let hasMore = true;

  while (hasMore) {
    // Find expired reservations (status='pending' AND expires_at < NOW())
    const expiredReservations = await db.execute<ExpiredReservationRow>(sql`
      SELECT
        id,
        organization_id,
        reserved_credits::text
      FROM credit_reservations
      WHERE status = 'pending'
        AND expires_at < NOW()
      ORDER BY expires_at ASC
      LIMIT ${BATCH_SIZE}
    `);

    // No more expired reservations to process
    if (!expiredReservations || expiredReservations.length === 0) {
      hasMore = false;
      break;
    }

    console.log(
      `[cleanupReservations] Found ${expiredReservations.length} expired reservations to process`
    );

    // Process each expired reservation
    for (const reservation of expiredReservations) {
      try {
        await expireReservation(
          db,
          reservation.id,
          reservation.organization_id,
          parseFloat(reservation.reserved_credits)
        );
        totalExpired++;
      } catch (error) {
        totalErrors++;
        errors.push({
          reservationId: reservation.id,
          organizationId: reservation.organization_id,
          message: error instanceof Error ? error.message : String(error),
        });
        console.error(
          `[cleanupReservations] Failed to expire reservation ${reservation.id}:`,
          error
        );
      }
    }

    // If we processed fewer than BATCH_SIZE, we're done
    if (expiredReservations.length < BATCH_SIZE) {
      hasMore = false;
    }
  }

  // Log summary
  if (totalExpired > 0 || totalErrors > 0) {
    console.log(
      `[cleanupReservations] Completed: ${totalExpired} expired, ${totalErrors} errors`
    );
  }

  return {
    expiredCount: totalExpired,
    errorCount: totalErrors,
    errors,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Expire a single reservation atomically.
 *
 * Updates both the reservation status and the organization's credit balance
 * in a single transaction to ensure consistency.
 *
 * @param db - Drizzle database instance
 * @param reservationId - ID of the reservation to expire
 * @param organizationId - Organization ID for the balance update
 * @param reservedCredits - Credits to release from reserved back to available
 */
async function expireReservation(
  db: ReturnType<typeof getDb>,
  reservationId: string,
  organizationId: string,
  reservedCredits: number
): Promise<void> {
  await db.transaction(async (tx) => {
    // Step 1: Update reservation status to 'expired'
    // Use WHERE status='pending' to ensure idempotency
    const updateResult = await tx.execute(sql`
      UPDATE credit_reservations
      SET
        status = 'expired',
        released_at = NOW()
      WHERE id = ${reservationId}
        AND status = 'pending'
      RETURNING id
    `);

    // If no rows updated, reservation was already processed (idempotent)
    if (!updateResult || updateResult.length === 0) {
      console.log(
        `[cleanupReservations] Reservation ${reservationId} already processed, skipping`
      );
      return;
    }

    // Step 2: Decrease reserved_credits in organization_credit_balances
    await tx.execute(sql`
      UPDATE organization_credit_balances
      SET reserved_credits = reserved_credits - ${reservedCredits}
      WHERE organization_id = ${organizationId}
    `);
  });
}
