/**
 * Error Factory Functions
 *
 * Pure functions for creating typed error objects and type guards.
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration
 */

import type { CreditReservationStatus } from '@/shared/libs/aiAccess';
import type {
  InvalidReservationStatusError,
  SettlementReservationNotFoundError,
  ReservationSettledError,
  ReleaseReservationNotFoundError,
} from '../types';

// =============================================================================
// Settlement Errors
// =============================================================================

/**
 * Creates an InvalidReservationStatusError.
 */
export function createInvalidReservationStatusError(
  reservationId: string,
  currentStatus: CreditReservationStatus
): InvalidReservationStatusError {
  return {
    _tag: 'InvalidReservationStatusError',
    code: 'INVALID_RESERVATION_STATUS',
    message: `Cannot settle reservation '${reservationId}': status is '${currentStatus}', expected 'pending'`,
    reservationId,
    currentStatus,
    expectedStatus: 'pending',
  };
}

/**
 * Creates a ReservationNotFoundError for settlement operations.
 */
export function createSettlementReservationNotFoundError(
  reservationId: string
): SettlementReservationNotFoundError {
  return {
    _tag: 'ReservationNotFoundError',
    code: 'RESERVATION_NOT_FOUND',
    message: `Reservation '${reservationId}' not found`,
    reservationId,
  };
}

/** Type guard for InvalidReservationStatusError */
export function isInvalidReservationStatusError(
  error: unknown
): error is InvalidReservationStatusError {
  return (
    typeof error === 'object' &&
    error !== null &&
    '_tag' in error &&
    (error as InvalidReservationStatusError)._tag === 'InvalidReservationStatusError'
  );
}

/** Type guard for SettlementReservationNotFoundError */
export function isSettlementReservationNotFoundError(
  error: unknown
): error is SettlementReservationNotFoundError {
  return (
    typeof error === 'object' &&
    error !== null &&
    '_tag' in error &&
    (error as SettlementReservationNotFoundError)._tag === 'ReservationNotFoundError'
  );
}

// =============================================================================
// Release Errors
// =============================================================================

/**
 * Creates a ReservationSettledError.
 */
export function createReservationSettledError(
  reservationId: string
): ReservationSettledError {
  return {
    _tag: 'ReservationSettledError',
    code: 'RESERVATION_SETTLED',
    message: `Cannot release reservation '${reservationId}': already settled`,
    reservationId,
  };
}

/**
 * Creates a ReservationNotFoundError for release operations.
 */
export function createReleaseReservationNotFoundError(
  reservationId: string
): ReleaseReservationNotFoundError {
  return {
    _tag: 'ReservationNotFoundError',
    code: 'RESERVATION_NOT_FOUND',
    message: `Reservation '${reservationId}' not found`,
    reservationId,
  };
}

/** Type guard for ReservationSettledError */
export function isReservationSettledError(
  error: unknown
): error is ReservationSettledError {
  return (
    typeof error === 'object' &&
    error !== null &&
    '_tag' in error &&
    (error as ReservationSettledError)._tag === 'ReservationSettledError'
  );
}

/** Type guard for ReleaseReservationNotFoundError */
export function isReleaseReservationNotFoundError(
  error: unknown
): error is ReleaseReservationNotFoundError {
  return (
    typeof error === 'object' &&
    error !== null &&
    '_tag' in error &&
    (error as ReleaseReservationNotFoundError)._tag === 'ReservationNotFoundError'
  );
}
