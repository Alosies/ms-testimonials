/**
 * Shared API - Public Exports
 * Domain-organized, tree-shakable API gateway
 *
 * @example
 * ```typescript
 * // Import specific domain API
 * import { useApiForAI } from '@/shared/api/ai';
 *
 * const aiApi = useApiForAI();
 * const result = await aiApi.suggestQuestions({ product_name, product_description });
 *
 * // Import error utilities
 * import { getErrorMessage, formatUserFriendlyError } from '@/shared/api';
 * ```
 */

// Common types (shared across domains)
export type { ApiError, SuccessResponse, HttpStatus } from './models/common';
export { HTTP_STATUS } from './models/common';

// Error utilities (used by all domains)
export {
  getErrorMessage,
  formatUserFriendlyError,
  isNetworkError,
  isAuthError,
  isApiClientError,
} from './lib';

export type { ApiClientError } from './lib';

// AI domain exports (convenience re-exports)
export { useApiForAI } from './ai';
export type {
  AIQuestion,
  AIContext,
  SuggestQuestionsRequest,
  SuggestQuestionsResponse,
  QuestionAnswerPair,
  AssembleTestimonialRequest,
  AssembleTestimonialResponse,
} from './ai';

// Domain exports are also available via:
// - import { useApiForAI } from '@/shared/api/ai';
// This ensures tree-shaking and code-splitting work optimally
