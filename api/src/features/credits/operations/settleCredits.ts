/**
 * Settle Credits Operation
 *
 * Settles a credit reservation after an AI operation completes successfully.
 * Records the actual credits consumed, creates a transaction record, and
 * deducts from the organization's credit balance.
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration (T4.3)
 */

import { sql } from 'drizzle-orm';
import { getDb } from '@/db';
import type { CreditTransactionType } from '@/shared/libs/aiAccess';
import { calculateDeductionSplit, buildProviderMetadata } from '../functions';
import {
  createInvalidReservationStatusError,
  createSettlementReservationNotFoundError,
} from '../functions';
import type {
  SettleCreditParams,
  CreditSettlement,
  SettlementReservationRow,
  SettlementBalanceRow,
  TransactionRow,
} from '../types';
import type { CreditReservationStatus } from '@/shared/libs/aiAccess';

/**
 * Settle a credit reservation after an AI operation completes.
 *
 * This function implements the settlement phase of the two-phase commit pattern
 * for credit management. It records the actual credits consumed and deducts
 * them from the organization's balance.
 *
 * Credit Deduction Order:
 * 1. Monthly credits are consumed first
 * 2. Bonus credits are used for any remaining amount
 *
 * Atomicity:
 * - Uses database transactions to ensure all updates are atomic
 * - If any step fails, the entire operation is rolled back
 *
 * @param params - Settlement parameters including reservation ID and actual credits
 * @returns The settlement result with transaction ID and deduction breakdown
 * @throws ReservationNotFoundError if reservation does not exist
 * @throws InvalidReservationStatusError if reservation is not in 'pending' status
 *
 * @example
 * ```typescript
 * const result = await aiOperation(reservation.id);
 *
 * const settlement = await settleCredits({
 *   reservationId: reservation.id,
 *   actualCredits: result.creditsUsed,
 *   providerId: 'openai',
 *   modelId: 'gpt-4o-mini',
 *   inputTokens: result.usage.inputTokens,
 *   outputTokens: result.usage.outputTokens,
 *   providerCostUsd: result.cost,
 *   description: 'Question generation for form xyz',
 * });
 *
 * console.log(`Settled: ${settlement.monthlyDeducted} monthly + ${settlement.bonusDeducted} bonus`);
 * ```
 */
export async function settleCredits(
  params: SettleCreditParams
): Promise<CreditSettlement> {
  const { reservationId, actualCredits, description } = params;

  const db = getDb();

  // Step 1: Look up the reservation and verify status is 'pending'
  // Include audit context fields to copy to transaction (ADR-023 Decision 8)
  const reservationResult = await db.execute<SettlementReservationRow>(sql`
    SELECT
      id,
      organization_id,
      ai_capability_id,
      quality_level_id,
      reserved_credits::text,
      status,
      idempotency_key,
      user_id,
      user_email,
      form_id,
      form_name,
      customer_google_id
    FROM credit_reservations
    WHERE id = ${reservationId}
  `);

  if (!reservationResult || reservationResult.length === 0) {
    throw createSettlementReservationNotFoundError(reservationId);
  }

  const reservation = reservationResult[0];
  const currentStatus = reservation.status as CreditReservationStatus;

  // Verify reservation is pending
  if (currentStatus !== 'pending') {
    throw createInvalidReservationStatusError(reservationId, currentStatus);
  }

  const reservedCredits = parseFloat(reservation.reserved_credits);
  const organizationId = reservation.organization_id;
  const aiCapabilityId = reservation.ai_capability_id;
  const qualityLevelId = reservation.quality_level_id;
  const idempotencyKey = reservation.idempotency_key;

  // Audit context (ADR-023 Decision 8) - copy from reservation to transaction
  const userId = reservation.user_id;
  const userEmail = reservation.user_email;
  const formId = reservation.form_id;
  const formName = reservation.form_name;
  const customerGoogleId = reservation.customer_google_id;

  // Step 2: Get current credit balance to calculate deduction split
  const balanceResult = await db.execute<SettlementBalanceRow>(sql`
    SELECT
      monthly_credits::text,
      bonus_credits::text
    FROM organization_credit_balances
    WHERE organization_id = ${organizationId}
  `);

  // If no balance record exists, use zero values
  const monthlyCredits = balanceResult && balanceResult.length > 0
    ? parseFloat(balanceResult[0].monthly_credits) || 0
    : 0;
  const bonusCredits = balanceResult && balanceResult.length > 0
    ? parseFloat(balanceResult[0].bonus_credits) || 0
    : 0;

  // Step 3: Calculate how to split the deduction (pure function)
  const { monthlyDeducted, bonusDeducted } = calculateDeductionSplit(
    monthlyCredits,
    bonusCredits,
    actualCredits
  );

  // Build provider metadata for transaction record (pure function)
  const providerMetadata = buildProviderMetadata(params);

  // Step 4: Perform all updates atomically in a transaction
  const transactionResult = await db.transaction(async (tx) => {
    // 4a. Decrease reserved_credits by the original reservation amount
    //     AND decrease monthly_credits and bonus_credits by the actual deductions
    await tx.execute(sql`
      UPDATE organization_credit_balances
      SET
        reserved_credits = reserved_credits - ${reservedCredits},
        monthly_credits = monthly_credits - ${monthlyDeducted},
        bonus_credits = bonus_credits - ${bonusDeducted}
      WHERE organization_id = ${organizationId}
    `);

    // 4b. Calculate balance_after for the transaction record
    //     Formula: (monthly + bonus - reserved - actualCredits) after all deductions
    const balanceAfterResult = await tx.execute<{ balance_after: string; [key: string]: unknown }>(sql`
      SELECT (monthly_credits + bonus_credits - reserved_credits)::text as balance_after
      FROM organization_credit_balances
      WHERE organization_id = ${organizationId}
    `);

    const balanceAfter = balanceAfterResult && balanceAfterResult.length > 0
      ? parseFloat(balanceAfterResult[0].balance_after) || 0
      : 0;

    // 4c. Insert credit_transaction record
    const transactionType: CreditTransactionType = 'ai_consumption';
    const creditsAmount = -actualCredits; // Negative for consumption

    // Build the insert query with optional provider_metadata
    let insertResult: TransactionRow[];

    if (providerMetadata) {
      insertResult = await tx.execute<TransactionRow>(sql`
        INSERT INTO credit_transactions (
          organization_id,
          ai_capability_id,
          quality_level_id,
          transaction_type,
          credits_amount,
          estimated_credits,
          balance_after,
          description,
          idempotency_key,
          provider_metadata,
          user_id,
          user_email,
          form_id,
          form_name,
          customer_google_id
        )
        VALUES (
          ${organizationId},
          ${aiCapabilityId},
          ${qualityLevelId},
          ${transactionType},
          ${creditsAmount},
          ${-reservedCredits},
          ${balanceAfter},
          ${description || 'AI operation consumption'},
          ${idempotencyKey},
          ${JSON.stringify(providerMetadata)}::jsonb,
          ${userId},
          ${userEmail},
          ${formId},
          ${formName},
          ${customerGoogleId}
        )
        RETURNING id
      `);
    } else {
      insertResult = await tx.execute<TransactionRow>(sql`
        INSERT INTO credit_transactions (
          organization_id,
          ai_capability_id,
          quality_level_id,
          transaction_type,
          credits_amount,
          estimated_credits,
          balance_after,
          description,
          idempotency_key,
          user_id,
          user_email,
          form_id,
          form_name,
          customer_google_id
        )
        VALUES (
          ${organizationId},
          ${aiCapabilityId},
          ${qualityLevelId},
          ${transactionType},
          ${creditsAmount},
          ${-reservedCredits},
          ${balanceAfter},
          ${description || 'AI operation consumption'},
          ${idempotencyKey},
          ${userId},
          ${userEmail},
          ${formId},
          ${formName},
          ${customerGoogleId}
        )
        RETURNING id
      `);
    }

    if (!insertResult || insertResult.length === 0) {
      throw new Error('Failed to create credit transaction');
    }

    const transactionId = insertResult[0].id;

    // 4d. Update credit_reservations to mark as settled
    await tx.execute(sql`
      UPDATE credit_reservations
      SET
        status = 'settled',
        settled_credits = ${actualCredits}
      WHERE id = ${reservationId}
        AND status = 'pending'
    `);

    return transactionId;
  });

  return {
    transactionId: transactionResult,
    actualCredits,
    monthlyDeducted,
    bonusDeducted,
    reservationId,
  };
}
