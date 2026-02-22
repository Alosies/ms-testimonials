/**
 * Form Submission Types
 *
 * SQL row types for Drizzle transaction operations.
 *
 * ADR Reference: ADR-025 Testimonials Display (Phase 5a)
 */

/** Row returned from contact upsert */
export interface ContactRow {
  id: string;
  [key: string]: unknown;
}

/** Row returned from form_submissions insert */
export interface SubmissionRow {
  id: string;
  [key: string]: unknown;
}

/** Row returned from testimonials insert */
export interface TestimonialRow {
  id: string;
  [key: string]: unknown;
}

/** Result from the submitForm transaction */
export interface SubmitFormResult {
  submissionId: string;
  testimonialId: string | null;
  contactId: string;
}
