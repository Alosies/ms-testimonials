import { Hono } from 'hono';

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
