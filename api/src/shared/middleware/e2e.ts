import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { env } from '@/shared/config/env';

/**
 * E2E API Authentication Middleware
 *
 * Validates X-E2E-Token header against E2E_API_SECRET.
 * Used to protect /e2e/* endpoints for Playwright tests.
 */
export const e2eAuthMiddleware = createMiddleware(async (c, next) => {
  const token = c.req.header('X-E2E-Token');

  if (!token || token !== env.E2E_API_SECRET) {
    const path = c.req.path;
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    console.warn(`[E2E] Unauthorized access - Path: ${path}, IP: ${ip}`);
    throw new HTTPException(401, { message: 'Unauthorized: Invalid or missing E2E token' });
  }

  await next();
});

/**
 * Check if E2E support is properly configured
 */
export function isE2EConfigured(): boolean {
  return Boolean(
    env.E2E_API_SECRET &&
    env.E2E_API_SECRET.length >= 32 &&
    env.E2E_USER_ID &&
    env.E2E_ORGANIZATION_ID
  );
}
