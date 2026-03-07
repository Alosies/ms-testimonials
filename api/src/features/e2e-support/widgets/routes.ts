/**
 * E2E Widget Route Handlers
 */
import type { Context } from 'hono';
import { createTestWidget, deleteTestWidget } from './crud';

/**
 * POST /e2e/widgets
 * Create a test widget with approved testimonials for E2E testing.
 */
export async function createWidget(c: Context) {
  try {
    const body = await c.req.json();
    const { name, type, testimonialCount, settings } = body;

    if (!name || !type) {
      return c.json({ error: 'name and type are required' }, 400);
    }

    console.log(`[E2E] Creating widget "${name}" (type: ${type})`);

    const result = await createTestWidget({ name, type, testimonialCount, settings });

    console.log(`[E2E] Created widget ${result.widgetId} with ${result.testimonialCount} testimonials`);

    return c.json(result, 201);
  } catch (error) {
    console.error('[E2E] Create widget error:', error);
    return c.json({ error: 'Failed to create widget' }, 500);
  }
}

/**
 * DELETE /e2e/widgets/:id
 * Hard-delete a test widget AND its created testimonials.
 */
export async function deleteWidget(c: Context) {
  try {
    const widgetId = c.req.param('id');

    if (!widgetId) {
      return c.json({ error: 'Widget ID is required' }, 400);
    }

    console.log(`[E2E] Deleting widget ${widgetId}`);

    const deleted = await deleteTestWidget(widgetId);

    if (!deleted) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    return c.json({ success: true, widgetId });
  } catch (error) {
    console.error('[E2E] Delete widget error:', error);
    return c.json({ error: 'Failed to delete widget' }, 500);
  }
}
