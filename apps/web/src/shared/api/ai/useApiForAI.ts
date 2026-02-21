/**
 * AI API Composable
 * Provides type-safe methods for AI operations using the REST client
 */

import { useApi } from '../rest';
import type {
  SuggestQuestionsRequest,
  SuggestQuestionsResponse,
  AssembleTestimonialRequest,
  AssembleTestimonialResponse,
} from './models';

/** Response from the AI availability check endpoint */
export interface AIAvailabilityResponse {
  available: boolean;
  reason?: 'plan_not_included' | 'form_not_found';
}

/** Structured API error with code and status */
export class AIApiError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = 'AIApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

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
   * Assemble customer Q&A responses into a coherent testimonial
   * POST /ai/assemble-testimonial
   *
   * @see PRD-005: AI Testimonial Generation
   */
  async function assembleTestimonial(
    request: AssembleTestimonialRequest
  ): Promise<AssembleTestimonialResponse> {
    const res = await api.fetch('/ai/assemble-testimonial', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({
        message: 'Unknown error',
        code: 'UNKNOWN_ERROR',
      }));
      throw new AIApiError(
        errorBody.message || 'Failed to assemble testimonial',
        errorBody.code || 'UNKNOWN_ERROR',
        res.status,
      );
    }

    return res.json() as Promise<AssembleTestimonialResponse>;
  }

  /**
   * Check if AI testimonial assembly is available for a form.
   * GET /forms/:formId/ai-availability
   *
   * Public endpoint — no auth required.
   */
  async function checkFormAIAvailability(
    formId: string
  ): Promise<AIAvailabilityResponse> {
    const res = await api.fetch(`/forms/${formId}/ai-availability`);

    if (!res.ok) {
      return { available: false, reason: 'form_not_found' };
    }

    return res.json() as Promise<AIAvailabilityResponse>;
  }

  return {
    suggestQuestions,
    assembleTestimonial,
    checkFormAIAvailability,
  };
}
