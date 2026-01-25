/**
 * AI API Composable
 * Provides type-safe methods for AI operations using the RPC client
 */

import { useApi } from '../rpc';
import type {
  SuggestQuestionsRequest,
  SuggestQuestionsResponse,
  AssembleTestimonialRequest,
  AssembleTestimonialResponse,
} from './models';

/**
 * AI API composable
 * Provides methods for AI-related operations with type safety
 */
export function useApiForAI() {
  const api = useApi();

  /**
   * Generate AI-suggested questions for a product
   * POST /ai/suggest-questions
   */
  async function suggestQuestions(
    request: SuggestQuestionsRequest
  ): Promise<SuggestQuestionsResponse> {
    const res = await api.fetch('/ai/suggest-questions', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || 'Failed to suggest questions');
    }

    return res.json() as Promise<SuggestQuestionsResponse>;
  }

  /**
   * Assemble customer answers into a coherent testimonial
   * POST /ai/assemble
   */
  async function assembleTestimonial(
    request: AssembleTestimonialRequest
  ): Promise<AssembleTestimonialResponse> {
    const res = await api.fetch('/ai/assemble', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || 'Failed to assemble testimonial');
    }

    return res.json() as Promise<AssembleTestimonialResponse>;
  }

  return {
    suggestQuestions,
    assembleTestimonial,
  };
}
