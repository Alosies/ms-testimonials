import type { Context } from 'hono';
import { env } from '@/shared/config/env';
import { createTestFormWithSteps } from '@/services/e2e-data';

/**
 * POST /e2e/forms
 * Create a test form for E2E testing
 *
 * Uses pre-configured E2E_USER_ID and E2E_ORGANIZATION_ID from environment.
 */
export async function createForm(c: Context) {
  try {
    const body = await c.req.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return c.json({ error: 'name is required' }, 400);
    }

    console.log(`[E2E] Creating form "${name}"`);

    const result = await createTestFormWithSteps(
      env.E2E_ORGANIZATION_ID,
      name,
      env.E2E_USER_ID
    );

    const studioUrl = `${env.FRONTEND_URL}/forms/${result.formId}/studio`;

    console.log(`[E2E] Created form ${result.formId}`);

    return c.json({ ...result, studioUrl }, 201);
  } catch (error) {
    console.error('[E2E] Create form error:', error);
    return c.json({ error: 'Failed to create form' }, 500);
  }
}
