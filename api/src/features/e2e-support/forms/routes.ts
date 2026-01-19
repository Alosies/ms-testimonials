import type { Context } from 'hono';
import { env } from '@/shared/config/env';
import { createTestFormWithSteps, createTestFormWithBranching, createTestFormWithChoiceQuestion, deleteTestForm } from './crud';

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

/**
 * POST /e2e/forms/branched
 * Create a test form with branching (shared + testimonial + improvement flows)
 *
 * Uses pre-configured E2E_USER_ID and E2E_ORGANIZATION_ID from environment.
 */
export async function createBranchedForm(c: Context) {
  try {
    const body = await c.req.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return c.json({ error: 'name is required' }, 400);
    }

    console.log(`[E2E] Creating branched form "${name}"`);

    const result = await createTestFormWithBranching(
      env.E2E_ORGANIZATION_ID,
      name,
      env.E2E_USER_ID
    );

    const studioUrl = `${env.FRONTEND_URL}/forms/${result.formId}/studio`;

    console.log(`[E2E] Created branched form ${result.formId} with ${result.allSteps.length} steps`);

    return c.json({ ...result, studioUrl }, 201);
  } catch (error) {
    console.error('[E2E] Create branched form error:', error);
    return c.json({ error: 'Failed to create branched form' }, 500);
  }
}

/**
 * POST /e2e/forms/choice-question
 * Create a test form with a choice_single question and options
 *
 * Uses pre-configured E2E_USER_ID and E2E_ORGANIZATION_ID from environment.
 */
export async function createChoiceQuestionForm(c: Context) {
  try {
    const body = await c.req.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return c.json({ error: 'name is required' }, 400);
    }

    console.log(`[E2E] Creating choice question form "${name}"`);

    const result = await createTestFormWithChoiceQuestion(
      env.E2E_ORGANIZATION_ID,
      name,
      env.E2E_USER_ID
    );

    const studioUrl = `${env.FRONTEND_URL}/forms/${result.formId}/studio`;

    console.log(`[E2E] Created choice question form ${result.formId} with ${result.allSteps.length} steps`);

    return c.json({ ...result, studioUrl }, 201);
  } catch (error) {
    console.error('[E2E] Create choice question form error:', error);
    return c.json({ error: 'Failed to create choice question form' }, 500);
  }
}

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
