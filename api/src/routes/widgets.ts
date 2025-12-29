import { Hono } from 'hono';

const widgets = new Hono();

/**
 * GET /widgets
 * Get all widgets for a user
 */
widgets.get('/', async (c) => {
  // TODO: Implement get widgets
  return c.json({ widgets: [] });
});

/**
 * GET /widgets/:id
 * Get widget data (public endpoint for embed)
 */
widgets.get('/:id', async (c) => {
  const id = c.req.param('id');
  // TODO: Implement get widget data
  return c.json({ id, widget: null, testimonials: [] });
});

/**
 * POST /widgets
 * Create a new widget
 */
widgets.post('/', async (c) => {
  // TODO: Implement widget creation
  return c.json({ message: 'Widget created' });
});

/**
 * PUT /widgets/:id
 * Update a widget
 */
widgets.put('/:id', async (c) => {
  const id = c.req.param('id');
  // TODO: Implement widget update
  return c.json({ message: `Widget ${id} updated` });
});

export default widgets;
