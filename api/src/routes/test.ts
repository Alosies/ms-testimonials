import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { env } from '@/shared/config/env';
import {
  createTestFormWithSteps,
  deleteTestForm,
  getOrganizationBySlug,
  getOrganizationById,
  cleanupTestData,
} from '@/services/test-data';

/**
 * Middleware to validate X-Test-Token header against TEST_API_SECRET
 * Logs unauthorized access attempts with path and IP
 */
const testTokenMiddleware = createMiddleware(async (c, next) => {
  const testToken = c.req.header('X-Test-Token');
  const path = c.req.path;
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';

  if (!testToken || testToken !== env.TEST_API_SECRET) {
    console.warn(`[TEST API] Unauthorized access attempt - Path: ${path}, IP: ${ip}`);
    throw new HTTPException(401, { message: 'Unauthorized: Invalid or missing test token' });
  }

  await next();
});

/**
 * Create test routes for E2E testing
 * Returns empty Hono app when TEST_API_SECRET is not configured
 * Validates TEST_API_SECRET is at least 32 characters
 */
export function createTestRoutes(): Hono {
  const app = new Hono();

  // Validate TEST_API_SECRET is at least 32 characters
  if (!env.TEST_API_SECRET || env.TEST_API_SECRET.length < 32) {
    if (env.NODE_ENV !== 'production') {
      console.warn('[TEST API] TEST_API_SECRET not configured or too short. Test routes disabled.');
    }
    return app;
  }

  // Apply token validation middleware to all routes
  app.use('*', testTokenMiddleware);

  // ============================================================================
  // POST /forms - Create test form with steps
  // ============================================================================
  app.post('/forms', async (c) => {
    try {
      const body = await c.req.json();
      const { organizationId, name } = body;

      if (!organizationId || typeof organizationId !== 'string') {
        console.log('[TEST API] POST /forms - Missing or invalid organizationId');
        return c.json({ error: 'organizationId is required' }, 400);
      }

      if (!name || typeof name !== 'string') {
        console.log('[TEST API] POST /forms - Missing or invalid name');
        return c.json({ error: 'name is required' }, 400);
      }

      // Get organization to find the creator
      const organization = await getOrganizationById(organizationId);
      if (!organization) {
        console.log(`[TEST API] POST /forms - Organization ${organizationId} not found`);
        return c.json({ error: 'Organization not found' }, 404);
      }

      if (!organization.created_by) {
        console.log(`[TEST API] POST /forms - Organization ${organizationId} has no creator`);
        return c.json({ error: 'Organization has no creator' }, 400);
      }

      console.log(`[TEST API] POST /forms - Creating form "${name}" for org ${organizationId}`);

      const result = await createTestFormWithSteps(organizationId, name, organization.created_by);
      const studioUrl = `${env.FRONTEND_URL}/forms/${result.formId}/studio`;

      console.log(`[TEST API] POST /forms - Created form ${result.formId}`);

      return c.json(
        {
          ...result,
          studioUrl,
        },
        201
      );
    } catch (error) {
      console.error('[TEST API] POST /forms - Error:', error);
      return c.json({ error: 'Failed to create test form' }, 500);
    }
  });

  // ============================================================================
  // DELETE /forms/:id - Soft delete test form
  // ============================================================================
  app.delete('/forms/:id', async (c) => {
    try {
      const formId = c.req.param('id');

      if (!formId) {
        console.log('[TEST API] DELETE /forms/:id - Missing form ID');
        return c.json({ error: 'Form ID is required' }, 400);
      }

      console.log(`[TEST API] DELETE /forms/${formId} - Soft deleting form`);

      const deleted = await deleteTestForm(formId);

      if (!deleted) {
        console.log(`[TEST API] DELETE /forms/${formId} - Form not found`);
        return c.json({ error: 'Form not found' }, 404);
      }

      console.log(`[TEST API] DELETE /forms/${formId} - Form soft deleted`);

      return c.json({ success: true, formId }, 200);
    } catch (error) {
      console.error('[TEST API] DELETE /forms/:id - Error:', error);
      return c.json({ error: 'Failed to delete test form' }, 500);
    }
  });

  // ============================================================================
  // GET /organizations/:slug - Get organization by slug
  // ============================================================================
  app.get('/organizations/:slug', async (c) => {
    try {
      const slug = c.req.param('slug');

      if (!slug) {
        console.log('[TEST API] GET /organizations/:slug - Missing slug');
        return c.json({ error: 'Organization slug is required' }, 400);
      }

      console.log(`[TEST API] GET /organizations/${slug} - Fetching organization`);

      const organization = await getOrganizationBySlug(slug);

      if (!organization) {
        console.log(`[TEST API] GET /organizations/${slug} - Organization not found`);
        return c.json({ error: 'Organization not found' }, 404);
      }

      console.log(`[TEST API] GET /organizations/${slug} - Found organization ${organization.id}`);

      return c.json(organization, 200);
    } catch (error) {
      console.error('[TEST API] GET /organizations/:slug - Error:', error);
      return c.json({ error: 'Failed to get organization' }, 500);
    }
  });

  // ============================================================================
  // POST /cleanup - Clean up old test data
  // ============================================================================
  app.post('/cleanup', async (c) => {
    try {
      const body = await c.req.json();
      const { organizationId, olderThanHours } = body;

      if (!organizationId || typeof organizationId !== 'string') {
        console.log('[TEST API] POST /cleanup - Missing or invalid organizationId');
        return c.json({ error: 'organizationId is required' }, 400);
      }

      const hours = typeof olderThanHours === 'number' ? olderThanHours : 24;

      console.log(
        `[TEST API] POST /cleanup - Cleaning up forms older than ${hours}h for org ${organizationId}`
      );

      const deletedCount = await cleanupTestData(organizationId, hours);

      console.log(`[TEST API] POST /cleanup - Soft deleted ${deletedCount} forms`);

      return c.json({ success: true, deletedCount }, 200);
    } catch (error) {
      console.error('[TEST API] POST /cleanup - Error:', error);
      return c.json({ error: 'Failed to cleanup test data' }, 500);
    }
  });

  return app;
}

export default createTestRoutes();
