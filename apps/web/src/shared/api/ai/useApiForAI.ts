/**
 * AI API Composable
 * Provides type-safe methods for AI operations
 */

import { computed } from 'vue';
import { useTokenManager } from '@/shared/authorization/composables/useTokenManager';
import { createApiClient } from '../lib/apiClient';
import { getApiBaseUrl } from '../config/apiConfig';
import { API_ENDPOINTS } from '../config/apiConfig';
import type {
  SuggestQuestionsRequest,
  SuggestQuestionsResponse,
  AssembleTestimonialRequest,
  AssembleTestimonialResponse,
} from './models';

/**
 * AI API composable
 * Provides methods for AI-related operations
 */
export function useApiForAI() {
  const { getValidEnhancedToken } = useTokenManager();
  const baseUrl = computed(() => getApiBaseUrl());
  const client = createApiClient(baseUrl.value, getValidEnhancedToken);

  /**
   * Generate AI-suggested questions for a product
   * POST /ai/suggest-questions
   */
  async function suggestQuestions(
    request: SuggestQuestionsRequest
  ): Promise<SuggestQuestionsResponse> {
    return client.post<SuggestQuestionsRequest, SuggestQuestionsResponse>(
      API_ENDPOINTS.AI_SUGGEST_QUESTIONS,
      request,
      { authenticated: true }
    );
  }

  /**
   * Assemble customer answers into a coherent testimonial
   * POST /ai/assemble
   */
  async function assembleTestimonial(
    request: AssembleTestimonialRequest
  ): Promise<AssembleTestimonialResponse> {
    return client.post<AssembleTestimonialRequest, AssembleTestimonialResponse>(
      API_ENDPOINTS.AI_ASSEMBLE,
      request,
      { authenticated: true }
    );
  }

  return {
    suggestQuestions,
    assembleTestimonial,
  };
}
