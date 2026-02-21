import { Hono } from 'hono';
import { getFormById } from '@/features/ai/assembleTestimonial/handlers/getFormById';
import { checkCapabilityAccess } from '@/shared/libs/aiAccess';

const forms = new Hono();

/**
 * GET /forms
 * Get all forms for a user
 */
forms.get('/', async (c) => {
  // TODO: Implement get forms
  return c.json({ forms: [] });
});

/**
 * GET /forms/:formId/ai-availability
 * Check if AI testimonial assembly is available for a form (public endpoint).
 * Returns only a boolean — no plan details leaked.
 */
forms.get('/:formId/ai-availability', async (c) => {
  const formId = c.req.param('formId');

  const formResult = await getFormById(formId);
  if (!formResult.success) {
    return c.json({ available: false, reason: 'form_not_found' as const });
  }

  const access = await checkCapabilityAccess(
    formResult.form.organization_id,
    'testimonial_assembly',
  );

  if (!access.hasAccess) {
    return c.json({ available: false, reason: 'plan_not_included' as const });
  }

  return c.json({ available: true });
});

/**
 * GET /forms/:slug
 * Get a form by slug (public endpoint)
 */
forms.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  // TODO: Implement get form by slug
  return c.json({ slug, form: null });
});

/**
 * POST /forms
 * Create a new form
 */
forms.post('/', async (c) => {
  // TODO: Implement form creation
  return c.json({ message: 'Form created' });
});

/**
 * PUT /forms/:id
 * Update a form
 */
forms.put('/:id', async (c) => {
  const id = c.req.param('id');
  // TODO: Implement form update
  return c.json({ message: `Form ${id} updated` });
});

export default forms;
