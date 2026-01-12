/**
 * Form Entity - FormData Type
 *
 * Core form data structure collected during form creation.
 * Moved from features/createForm/models per FSD architecture (ADR-014 Phase 1).
 */

/**
 * Form Data (collected in wizard Step 1)
 * Contains the basic information about a testimonial collection form
 */
export interface FormData {
  name: string;
  product_name: string;
  product_description: string;
  focus_areas?: string; // Optional guidance for AI question generation
}
