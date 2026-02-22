/**
 * Submissions API Composable
 *
 * Provides type-safe method for submitting form responses.
 * Follows the useApiForAI pattern.
 *
 * ADR-025: Phase 5c
 */

import { useApi } from '../rest';
import type { SubmitFormRequest, SubmitFormResponse } from './models';

export function useApiForSubmissions() {
  const api = useApi();

  /**
   * Submit a completed form with contact info, question responses, and testimonial.
   * POST /testimonials
   */
  async function submitForm(request: SubmitFormRequest): Promise<SubmitFormResponse> {
    const res = await api.fetch('/testimonials', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || 'Failed to submit form');
    }

    return res.json() as Promise<SubmitFormResponse>;
  }

  return { submitForm };
}
