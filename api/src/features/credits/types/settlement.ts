/**
 * Credit Settlement Types
 *
 * Type definitions for credit settlement operations.
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration
 */

import type { CreditReservationStatus } from '@/shared/libs/aiAccess';

/**
 * Parameters for settling a credit reservation.
 */
export interface SettleCreditParams {
  /** Unique ID of the reservation to settle */
  reservationId: string;

  /** Actual credits consumed (may differ from estimated) */
  actualCredits: number;

  /** LLM provider used (e.g., 'openai', 'anthropic') */
  providerId?: string;

  /** Specific model used (e.g., 'gpt-4o-mini') */
  modelId?: string;

  /** Number of input tokens processed */
  inputTokens?: number;

  /** Number of output tokens generated */
  outputTokens?: number;

  /** Actual provider cost in USD */
  providerCostUsd?: number;

  /** Optional description for the transaction */
  description?: string;
}

/**
 * Result of settling a credit reservation.
 */
export interface CreditSettlement {
  /** Unique ID of the created transaction */
  transactionId: string;

  /** Actual credits consumed */
  actualCredits: number;

  /** Credits deducted from monthly allocation */
  monthlyDeducted: number;

  /** Credits deducted from bonus pool */
  bonusDeducted: number;

  /** Unique ID of the reservation that was settled */
  reservationId: string;
}

/**
 * Result of calculating deduction split between monthly and bonus credits.
 */
export interface DeductionSplit {
  /** Credits to deduct from monthly allocation */
  monthlyDeducted: number;
  /** Credits to deduct from bonus pool */
  bonusDeducted: number;
}

/** Row type for reservation lookup query */
export type SettlementReservationRow = {
  id: string;
  organization_id: string;
  ai_capability_id: string;
  quality_level_id: string;
  reserved_credits: string;
  status: string;
  idempotency_key: string;
  // Audit context (ADR-023 Decision 8)
  user_id: string | null;
  user_email: string | null;
  form_id: string | null;
  form_name: string | null;
  [key: string]: unknown;
};

/** Row type for balance lookup query */
export type SettlementBalanceRow = {
  monthly_credits: string;
  bonus_credits: string;
  [key: string]: unknown;
};

/** Row type for transaction insert result */
export type TransactionRow = {
  id: string;
  [key: string]: unknown;
};

/**
 * Error thrown when trying to settle a reservation that is not pending.
 */
export interface InvalidReservationStatusError {
  readonly _tag: 'InvalidReservationStatusError';
  readonly code: 'INVALID_RESERVATION_STATUS';
  readonly message: string;
  readonly reservationId: string;
  readonly currentStatus: CreditReservationStatus;
  readonly expectedStatus: CreditReservationStatus;
}

/**
 * Error thrown when reservation is not found (for settlement).
 */
export interface SettlementReservationNotFoundError {
  readonly _tag: 'ReservationNotFoundError';
  readonly code: 'RESERVATION_NOT_FOUND';
  readonly message: string;
  readonly reservationId: string;
}
