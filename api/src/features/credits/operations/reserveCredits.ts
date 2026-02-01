/**
 * Reserve Credits Operation
 *
 * Reserves credits before an AI operation to ensure sufficient balance.
 * Uses database transactions for atomicity and idempotency keys to prevent
 * duplicate reservations from retries.
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration (T4.2)
 */

import { sql } from 'drizzle-orm';
import { getDb } from '@/db';
import {
  createInsufficientCreditsError,
  createDuplicateRequestError,
  type CreditReservationStatus,
} from '@/shared/libs/aiAccess';
import { checkCreditBalance } from './checkBalance';
import type {
  ReserveCreditParams,
  CreditReservation,
  ExistingReservationRow,
  NewReservationRow,
} from '../types';

/**
 * Reserve credits for an AI operation.
 *
 * This function implements the reservation phase of the two-phase commit pattern
 * for credit management. It ensures that credits are available and reserved
 * before an AI operation begins.
 *
 * Idempotency:
 * - If the same idempotency_key is provided with matching parameters, returns
 *   the existing reservation (safe for retries)
 * - If the idempotency_key exists with different parameters, throws DuplicateRequestError
 *
 * Atomicity:
 * - Uses database transactions to ensure reservation and balance update are atomic
 * - UPDATE with WHERE clause ensures sufficient credits before incrementing reserved
 *
 * @param params - Reservation parameters
 * @returns The reservation object with ID and expiration, or an error object
 * @throws Returns InsufficientCreditsError if not enough credits available
 * @throws Returns DuplicateRequestError if idempotency_key exists with different params
 *
 * @example
 * ```typescript
 * const reservation = await reserveCredits({
 *   organizationId: 'org_123',
 *   estimatedCredits: 2.5,
 *   aiCapabilityId: 'cap_abc',
 *   qualityLevelId: 'ql_fast',
 *   idempotencyKey: 'req_xyz_2026-01-31',
 * });
 * // Use reservation.id when settling or releasing
 * ```
 */
export async function reserveCredits(
  params: ReserveCreditParams
): Promise<CreditReservation> {
  const {
    organizationId,
    estimatedCredits,
    aiCapabilityId,
    qualityLevelId,
    idempotencyKey,
    expiresInSeconds = 300, // 5 minutes default
    // Audit context (ADR-023 Decision 8)
    userId = null,
    userEmail = null,
    formId = null,
    formName = null,
  } = params;

  const db = getDb();

  // Step 1: Check for existing reservation with this idempotency key
  const existingResult = await db.execute<ExistingReservationRow>(sql`
    SELECT
      id,
      reserved_credits::text,
      expires_at::text,
      status,
      organization_id,
      ai_capability_id,
      quality_level_id
    FROM credit_reservations
    WHERE idempotency_key = ${idempotencyKey}
  `);

  if (existingResult && existingResult.length > 0) {
    const existing = existingResult[0];

    // Check if parameters match (idempotent retry)
    const paramsMatch =
      existing.organization_id === organizationId &&
      existing.ai_capability_id === aiCapabilityId &&
      existing.quality_level_id === qualityLevelId &&
      parseFloat(existing.reserved_credits) === estimatedCredits;

    if (paramsMatch) {
      // Idempotent: return existing reservation
      return {
        id: existing.id,
        estimatedCredits: parseFloat(existing.reserved_credits),
        expiresAt: new Date(existing.expires_at),
        status: existing.status as CreditReservationStatus,
      };
    }

    // Different parameters with same key = duplicate request error
    throw createDuplicateRequestError(idempotencyKey, existing.id);
  }

  // Step 2: Check if sufficient credits are available
  const balanceCheck = await checkCreditBalance(organizationId, estimatedCredits);

  if (!balanceCheck.canProceed) {
    throw createInsufficientCreditsError(
      estimatedCredits,
      balanceCheck.spendable
    );
  }

  // Step 3: Reserve credits atomically in a transaction
  // Calculate expiration time
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  // Use a transaction to ensure atomicity
  const result = await db.transaction(async (tx) => {
    // Update organization_credit_balances to increment reserved_credits
    // The WHERE clause ensures we only update if there's still enough spendable credits
    const updateResult = await tx.execute(sql`
      UPDATE organization_credit_balances
      SET reserved_credits = reserved_credits + ${estimatedCredits}
      WHERE organization_id = ${organizationId}
        AND get_spendable_credits(${organizationId}) >= ${estimatedCredits}
      RETURNING id
    `);

    // If no rows updated, another operation consumed credits between check and reserve
    if (!updateResult || updateResult.length === 0) {
      throw createInsufficientCreditsError(
        estimatedCredits,
        balanceCheck.spendable
      );
    }

    // Insert the reservation record with audit context (ADR-023 Decision 8)
    const insertResult = await tx.execute<NewReservationRow>(sql`
      INSERT INTO credit_reservations (
        organization_id,
        ai_capability_id,
        quality_level_id,
        reserved_credits,
        status,
        idempotency_key,
        expires_at,
        user_id,
        user_email,
        form_id,
        form_name
      )
      VALUES (
        ${organizationId},
        ${aiCapabilityId},
        ${qualityLevelId},
        ${estimatedCredits},
        'pending',
        ${idempotencyKey},
        ${expiresAt.toISOString()},
        ${userId},
        ${userEmail},
        ${formId},
        ${formName}
      )
      RETURNING id, reserved_credits::text, expires_at::text, status
    `);

    if (!insertResult || insertResult.length === 0) {
      throw new Error('Failed to create credit reservation');
    }

    return insertResult[0];
  });

  return {
    id: result.id,
    estimatedCredits: parseFloat(result.reserved_credits),
    expiresAt: new Date(result.expires_at),
    status: result.status as CreditReservationStatus,
  };
}
