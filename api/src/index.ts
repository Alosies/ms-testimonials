import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import { env } from '@/config/env';
import { corsConfig } from '@/config/cors';

import authRoutes from '@/routes/auth';
import testimonialRoutes from '@/routes/testimonials';
import formRoutes from '@/routes/forms';
import widgetRoutes from '@/routes/widgets';
import aiRoutes from '@/routes/ai';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors(corsConfig));

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Testimonials API',
    version: '0.1.0',
    status: 'healthy',
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// Routes
app.route('/auth', authRoutes);
app.route('/testimonials', testimonialRoutes);
app.route('/forms', formRoutes);
app.route('/widgets', widgetRoutes);
app.route('/ai', aiRoutes);

// Start server
const port = env.PORT;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
