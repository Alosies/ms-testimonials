import type { Context } from 'hono';
import { deleteTestForm } from '@/services/e2e-data';

/**
 * DELETE /e2e/forms/:id
 * Soft delete a test form
 */
export async function deleteForm(c: Context) {
  try {
    const formId = c.req.param('id');

    if (!formId) {
      return c.json({ error: 'Form ID is required' }, 400);
    }

    console.log(`[E2E] Deleting form ${formId}`);

    const deleted = await deleteTestForm(formId);

    if (!deleted) {
      return c.json({ error: 'Form not found' }, 404);
    }

    return c.json({ success: true, formId });
  } catch (error) {
    console.error('[E2E] Delete form error:', error);
    return c.json({ error: 'Failed to delete form' }, 500);
  }
}
