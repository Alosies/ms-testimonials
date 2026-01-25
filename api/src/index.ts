import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';

import { env } from '@/shared/config/env';
import { corsConfig } from '@/shared/config/cors';

import { auth, ai, media, analytics } from '@/routes';
import testimonialRoutes from '@/routes/testimonials';
import formRoutes from '@/routes/forms';
import widgetRoutes from '@/routes/widgets';
import { createE2ERoutes } from '@/routes/e2e';

const app = new OpenAPIHono();

// Register security schemes
app.openAPIRegistry.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'JWT token for authentication. Obtain by calling /auth/enhance-token with a Supabase token.',
});

// Middleware
app.use('*', logger());
app.use('*', cors(corsConfig));

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Testimonials API',
    version: '0.1.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: env.NODE_ENV,
  });
});

// API Routes
app.route('/auth', auth);
app.route('/ai', ai);
app.route('/media', media);
app.route('/analytics', analytics);
// Non-OpenAPI routes (still using default exports)
app.route('/testimonials', testimonialRoutes);
app.route('/forms', formRoutes);
app.route('/widgets', widgetRoutes);

// E2E testing support routes (only active when E2E_API_SECRET is configured)
app.route('/e2e', createE2ERoutes());

// OpenAPI Documentation
app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    version: '0.1.0',
    title: 'Testimonials API',
    description: 'REST API for Testimonials - AI-powered testimonial collection and display tool',
    contact: {
      name: 'Testimonials Support',
      email: 'support@testimonials.app',
    },
  },
  servers: [
    {
      url: env.API_URL,
      description: env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and token management endpoints',
    },
    {
      name: 'Forms',
      description: 'Testimonial collection form management',
    },
    {
      name: 'Testimonials',
      description: 'Testimonial submission and management',
    },
    {
      name: 'Widgets',
      description: 'Embeddable widget configuration',
    },
    {
      name: 'AI',
      description: 'AI-powered testimonial assembly',
    },
    {
      name: 'Media',
      description: 'Media upload and management',
    },
    {
      name: 'Analytics',
      description: 'Form analytics and event tracking',
    },
    {
      name: 'Webhooks',
      description: 'Internal webhook endpoints',
    },
    {
      name: 'System',
      description: 'Health checks and system status',
    },
  ],
});

// Scalar API Documentation UI
app.get(
  '/docs',
  apiReference({
    theme: 'purple',
    spec: {
      url: '/openapi.json',
    },
  })
);

// Global error handler
app.onError((err, c) => {
  // Handle HTTPException (e.g., 401 from test API middleware)
  if (err instanceof HTTPException) {
    const status = err.status;
    return c.json(
      {
        error: status === 401 ? 'Unauthorized' : `HTTP Error ${status}`,
        message: err.message,
        timestamp: new Date().toISOString(),
      },
      status
    );
  }

  console.error('Global error handler:', err);

  return c.json(
    {
      error: 'Internal Server Error',
      message: env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
      timestamp: new Date().toISOString(),
    },
    500
  );
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: 'Not Found',
      message: 'The requested endpoint does not exist',
      path: c.req.path,
      method: c.req.method,
      timestamp: new Date().toISOString(),
    },
    404
  );
});

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  try {
    const { closeDb } = await import('./db');
    await closeDb();
    console.log('Database connections closed.');
  } catch {
    // DB module not initialized or no connections to close
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  try {
    const { closeDb } = await import('./db');
    await closeDb();
    console.log('Database connections closed.');
  } catch {
    // DB module not initialized or no connections to close
  }
  process.exit(0);
});

// Start server
const port = env.PORT;

console.log(`Testimonials API Server starting...`);
console.log(`Environment: ${env.NODE_ENV}`);
console.log(`Port: ${port}`);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
    console.log(`API Documentation: http://localhost:${info.port}/docs`);
    console.log(`OpenAPI Spec: http://localhost:${info.port}/openapi.json`);
    console.log(`Health Check: http://localhost:${info.port}/health`);
  }
);

export default app;
