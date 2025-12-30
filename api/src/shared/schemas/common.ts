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
