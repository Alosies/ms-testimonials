/**
 * Release Credits Operation
 *
 * Releases reserved credits when an AI operation fails or is cancelled.
 * Implements idempotency - safe to call multiple times with the same reservation ID.
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration (T4.4)
 */

import { sql } from 'drizzle-orm';
import { getDb } from '@/db';
import type { CreditReservationStatus } from '@/shared/libs/aiAccess';
import {
  createReservationSettledError,
  createReleaseReservationNotFoundError,
} from '../functions';
import type {
  ReleaseCreditParams,
  CreditRelease,
  ReleaseReservationRow,
} from '../types';

/**
 * Release reserved credits when an AI operation fails or is cancelled.
 *
 * This function implements the release phase of the two-phase commit pattern
 * for credit management. It returns reserved credits to the spendable pool
 * when an operation cannot complete.
 *
 * Idempotency:
 * - If the reservation is already 'released', returns success with wasAlreadyReleased: true
 * - If the reservation is 'expired', returns success with wasAlreadyReleased: true
 * - If the reservation is 'settled', throws ReservationSettledError (cannot release)
 *
 * Atomicity:
 * - Uses database transactions to ensure balance update and status change are atomic
 *
 * @param params - Release parameters
 * @returns The release result indicating credits released and current status
 * @throws ReservationSettledError if reservation was already settled
 * @throws ReservationNotFoundError if reservation does not exist
 *
 * @example
 * ```typescript
 * try {
 *   await performAIOperation(reservation.id);
 *   await settleCredits({ reservationId: reservation.id, ... });
 * } catch (error) {
 *   // Operation failed, release the reserved credits
 *   const release = await releaseCredits({
 *     reservationId: reservation.id,
 *     reason: 'AI operation failed: ' + error.message,
 *   });
 *   console.log(`Released ${release.releasedCredits} credits`);
 * }
 * ```
 */
export async function releaseCredits(
  params: ReleaseCreditParams
): Promise<CreditRelease> {
  const { reservationId, reason } = params;

  const db = getDb();

  // Step 1: Look up the reservation
  const reservationResult = await db.execute<ReleaseReservationRow>(sql`
    SELECT
      id,
      organization_id,
      reserved_credits::text,
      status
    FROM credit_reservations
    WHERE id = ${reservationId}
  `);

  if (!reservationResult || reservationResult.length === 0) {
    throw createReleaseReservationNotFoundError(reservationId);
  }

  const reservation = reservationResult[0];
  const reservedCredits = parseFloat(reservation.reserved_credits);
  const currentStatus = reservation.status as CreditReservationStatus;

  // Step 2: Check current status for idempotency
  if (currentStatus === 'released') {
    // Already released - idempotent success
    return {
      reservationId,
      releasedCredits: reservedCredits,
      status: 'released',
      wasAlreadyReleased: true,
    };
  }

  if (currentStatus === 'expired') {
    // Expired reservations are already handled - idempotent success
    return {
      reservationId,
      releasedCredits: reservedCredits,
      status: 'expired',
      wasAlreadyReleased: true,
    };
  }

  if (currentStatus === 'settled') {
    // Cannot release a settled reservation - throw error
    throw createReservationSettledError(reservationId);
  }

  // Step 3: Release credits atomically in a transaction
  // Status must be 'pending' at this point
  await db.transaction(async (tx) => {
    // Decrease reserved_credits in organization_credit_balances
    await tx.execute(sql`
      UPDATE organization_credit_balances
      SET reserved_credits = reserved_credits - ${reservedCredits}
      WHERE organization_id = ${reservation.organization_id}
    `);

    // Update reservation status to 'released'
    await tx.execute(sql`
      UPDATE credit_reservations
      SET
        status = 'released',
        release_reason = ${reason},
        released_at = NOW()
      WHERE id = ${reservationId}
        AND status = 'pending'
    `);
  });

  return {
    reservationId,
    releasedCredits: reservedCredits,
    status: 'released',
    wasAlreadyReleased: false,
  };
}
