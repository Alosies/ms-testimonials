/**
 * Credit Release Types
 *
 * Type definitions for credit release operations.
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration
 */

import type { CreditReservationStatus } from '@/shared/libs/aiAccess';

/**
 * Parameters for releasing a credit reservation.
 */
export interface ReleaseCreditParams {
  /** Unique ID of the reservation to release */
  reservationId: string;

  /** Reason why the operation failed or was cancelled */
  reason: string;
}

/**
 * Result of releasing a credit reservation.
 */
export interface CreditRelease {
  /** Unique ID of the reservation */
  reservationId: string;

  /** Credits that were released (returned to spendable pool) */
  releasedCredits: number;

  /** Current status of the reservation after this operation */
  status: CreditReservationStatus;

  /** True if this was a no-op due to idempotency (already released/expired) */
  wasAlreadyReleased: boolean;
}

/** Row type for reservation lookup query */
export type ReleaseReservationRow = {
  id: string;
  organization_id: string;
  reserved_credits: string;
  status: string;
  [key: string]: unknown;
};

/**
 * Error thrown when trying to release a settled reservation.
 */
export interface ReservationSettledError {
  readonly _tag: 'ReservationSettledError';
  readonly code: 'RESERVATION_SETTLED';
  readonly message: string;
  readonly reservationId: string;
}

/**
 * Error thrown when reservation is not found (for release).
 */
export interface ReleaseReservationNotFoundError {
  readonly _tag: 'ReservationNotFoundError';
  readonly code: 'RESERVATION_NOT_FOUND';
  readonly message: string;
  readonly reservationId: string;
}
