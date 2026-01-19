import { Hono } from 'hono';
import { env } from '@/shared/config/env';
import { e2eAuthMiddleware, isE2EConfigured } from '@/features/e2e-support/middleware/e2e';
import { createForm, createBranchedForm, createChoiceQuestionForm, deleteForm, getOrganization, cleanup, createFormResponses } from '@/features/e2e-support';

/**
 * E2E Testing Support Routes
 *
 * Provides endpoints for Playwright E2E tests to create/delete test data.
 * These routes are only active when E2E_API_SECRET is properly configured.
 *
 * All endpoints require X-E2E-Token header matching E2E_API_SECRET.
 */
export function createE2ERoutes(): Hono {
  const app = new Hono();

  // Check if E2E support is configured
  if (!isE2EConfigured()) {
    if (env.NODE_ENV !== 'production') {
      console.warn('[E2E] E2E support not configured. Routes disabled.');
      console.warn('[E2E] Required: E2E_API_SECRET (32+ chars), E2E_USER_ID, E2E_ORGANIZATION_ID');
    }
    return app;
  }

  console.log('[E2E] E2E support routes enabled');

  // Apply authentication middleware to all routes
  app.use('*', e2eAuthMiddleware);

  // GET /e2e/organizations/:slug - Get organization by slug
  app.get('/organizations/:slug', getOrganization);

  // POST /e2e/forms - Create test form
  app.post('/forms', createForm);

  // POST /e2e/forms/branched - Create test form with branching
  app.post('/forms/branched', createBranchedForm);

  // POST /e2e/forms/choice-question - Create test form with choice question and options
  app.post('/forms/choice-question', createChoiceQuestionForm);

  // DELETE /e2e/forms/:id - Delete test form
  app.delete('/forms/:id', deleteForm);

  // POST /e2e/cleanup - Clean up old test data
  app.post('/cleanup', cleanup);

  // POST /e2e/form-responses - Create mock responses for a question
  app.post('/form-responses', createFormResponses);

  return app;
}

export default createE2ERoutes();
