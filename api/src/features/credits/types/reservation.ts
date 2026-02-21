/**
 * Credit Reservation Types
 *
 * Type definitions for credit reservation operations.
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration
 */

import type { CreditReservationStatus } from '@/shared/libs/aiAccess';

/**
 * Parameters for reserving credits.
 */
export interface ReserveCreditParams {
  /** Organization ID to reserve credits for */
  organizationId: string;

  /** Estimated credits to reserve for the operation */
  estimatedCredits: number;

  /** AI capability being used (FK to ai_capabilities) */
  aiCapabilityId: string;

  /** Quality level for the operation (FK to quality_levels) */
  qualityLevelId: string;

  /** Client-provided key to prevent duplicate reservations */
  idempotencyKey: string;

  /** Seconds until reservation expires (default: 300 = 5 minutes) */
  expiresInSeconds?: number;

  // Audit context (ADR-023 Decision 8)

  /** User who initiated the operation (null for anonymous/system) */
  userId?: string | null;

  /** Email of user at reservation time (snapshot) */
  userEmail?: string | null;

  /** Form this operation relates to (null for non-form operations) */
  formId?: string | null;

  /** Name of form at reservation time (snapshot) */
  formName?: string | null;

  /** Google ID of the customer (public endpoints) */
  customerGoogleId?: string | null;
}

/**
 * Result of a credit reservation.
 */
export interface CreditReservation {
  /** Unique ID of the reservation */
  id: string;

  /** Credits reserved for this operation */
  estimatedCredits: number;

  /** When this reservation expires if not settled */
  expiresAt: Date;

  /** Current status of the reservation */
  status: CreditReservationStatus;
}

/** Row type for existing reservation query */
export type ExistingReservationRow = {
  id: string;
  reserved_credits: string;
  expires_at: string;
  status: string;
  organization_id: string;
  ai_capability_id: string;
  quality_level_id: string;
  [key: string]: unknown;
};

/** Row type for new reservation insert */
export type NewReservationRow = {
  id: string;
  reserved_credits: string;
  expires_at: string;
  status: string;
  [key: string]: unknown;
};
