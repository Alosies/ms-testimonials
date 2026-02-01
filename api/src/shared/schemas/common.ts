/**
 * Common Zod schemas shared across API endpoints
 * Using HTTP status codes for success/failure indication
 */

import { z } from '@hono/zod-openapi';

/**
 * Standard error response
 */
export const ErrorResponseSchema = z.object({
  error: z.string().openapi({ example: 'Invalid request parameters' }),
  code: z.string().optional().openapi({ example: 'VALIDATION_ERROR' }),
}).openapi('ErrorResponse');

/**
 * Validation error response (400)
 */
export const ValidationErrorResponseSchema = z.object({
  error: z.string().openapi({ example: 'Validation failed' }),
  code: z.string().optional().openapi({ example: 'VALIDATION_ERROR' }),
}).openapi('ValidationErrorResponse');

/**
 * Unauthorized error response (401)
 */
export const UnauthorizedResponseSchema = z.object({
  error: z.string().openapi({ example: 'Unauthorized - Invalid or missing authentication token' }),
  code: z.string().optional().openapi({ example: 'UNAUTHORIZED' }),
}).openapi('UnauthorizedResponse');

/**
 * Not found error response (404)
 */
export const NotFoundResponseSchema = z.object({
  error: z.string().openapi({ example: 'Resource not found' }),
  code: z.string().optional().openapi({ example: 'NOT_FOUND' }),
}).openapi('NotFoundResponse');

/**
 * Internal server error response (500)
 */
export const InternalErrorResponseSchema = z.object({
  error: z.string().openapi({ example: 'Internal server error' }),
  code: z.string().optional().openapi({ example: 'INTERNAL_ERROR' }),
}).openapi('InternalErrorResponse');

/**
 * Too many requests error response (429)
 */
export const TooManyRequestsResponseSchema = z.object({
  error: z.string().openapi({ example: 'Rate limit exceeded. Please try again later.' }),
  code: z.string().optional().openapi({ example: 'RATE_LIMIT' }),
}).openapi('TooManyRequestsResponse');

/**
 * Payment required error response (402)
 * Used when credits are insufficient for an operation
 */
export const PaymentRequiredResponseSchema = z.object({
  error: z.string().openapi({ example: 'Insufficient credits. Purchase more credits to continue.' }),
  code: z.string().optional().openapi({ example: 'INSUFFICIENT_CREDITS' }),
  credits_available: z.number().optional().openapi({ example: 0.5 }),
  credits_required: z.number().optional().openapi({ example: 1.0 }),
}).openapi('PaymentRequiredResponse');

/**
 * Forbidden error response (403)
 * Used when access is denied due to plan restrictions
 */
export const ForbiddenResponseSchema = z.object({
  error: z.string().openapi({ example: 'Access denied. Upgrade your plan to use this feature.' }),
  code: z.string().optional().openapi({ example: 'CAPABILITY_DENIED' }),
}).openapi('ForbiddenResponse');

/**
 * NanoID parameter (12 characters)
 */
export const NanoIDParamSchema = z.string().min(12).max(12).openapi({
  param: {
    name: 'id',
    in: 'path',
  },
  example: 'GspfE8jECdU4',
});

/**
 * Authorization header schema
 */
export const AuthHeaderSchema = z.object({
  authorization: z.string().openapi({
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Bearer token',
  }),
});

/**
 * Empty success response
 */
export const EmptyResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
}).openapi('EmptyResponse');
