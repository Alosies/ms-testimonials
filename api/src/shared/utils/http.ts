import type { Context } from 'hono';

/**
 * Standard success response
 */
export function successResponse<T>(c: Context, data: T, statusCode: number = 200) {
  return c.json(data, statusCode as any);
}

/**
 * Standard error response
 */
export function errorResponse(
  c: Context,
  message: string,
  statusCode: number = 400,
  errorCode?: string
) {
  const response: { error: string; code?: string } = { error: message };
  if (errorCode) {
    response.code = errorCode;
  }
  return c.json(response, statusCode as any);
}
