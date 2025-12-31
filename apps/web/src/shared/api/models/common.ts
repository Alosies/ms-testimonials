/**
 * Common API types and interfaces
 * Shared across all API endpoints
 */

/**
 * Standard API error response
 */
export interface ApiError {
  error: string;
  message?: string;
  timestamp?: string;
  status?: number;
}

/**
 * Generic success response wrapper
 */
export interface SuccessResponse<T> {
  data: T;
}

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
