/**
 * Dashboard Routes
 *
 * Provides analytics dashboard data for forms.
 * Uses Drizzle ORM for complex SQL aggregations.
 */

import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { authMiddleware, type AuthContext } from '@/shared/middleware/auth';
import { getDb } from '@/db';
import {
  PeriodSchema,
  DashboardResponseSchema,
  DashboardErrorResponseSchema,
} from '@/shared/schemas/dashboard';
import { ErrorResponseSchema } from '@/shared/schemas/common';
import {
  getAllDashboardData,
  calculateBenchmark,
  periodToDays,
  getPeriodStartDate,
  isStatisticallySignificant,
  getDataCaveat,
} from '@/features/dashboard';

const dashboard = new OpenAPIHono();

// Apply auth middleware to all routes
dashboard.use('/*', authMiddleware);

// ============================================================
// GET /dashboard/forms/:formId - Get form dashboard data
// ============================================================

const getFormDashboardRoute = createRoute({
  method: 'get',
  path: '/forms/{formId}',
  tags: ['Dashboard'],
  summary: 'Get form dashboard analytics',
  description: `
Retrieve comprehensive analytics data for a form including:
- Key metrics (sessions, completion rate, abandonment rate, avg time)
- Conversion funnel with step-by-step dropoff
- Audience breakdown (device, location)
- Rating distribution (if form has rating step)
- Benchmark comparisons based on form structure

**Authentication required** - Must have access to the organization that owns the form.

**Period options:**
- \`7d\` - Last 7 days
- \`30d\` - Last 30 days (default)
- \`90d\` - Last 90 days
  `,
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      formId: z.string().min(1).openapi({
        description: 'ID of the form',
        example: 'form_abc123',
      }),
    }),
    query: z.object({
      period: PeriodSchema.default('30d').openapi({
        description: 'Time period for analytics data',
      }),
    }),
  },
  responses: {
    200: {
      description: 'Dashboard data retrieved successfully',
      content: {
        'application/json': {
          schema: DashboardResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: 'Access denied - organization context required',
      content: {
        'application/json': {
          schema: DashboardErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Form not found or not accessible',
      content: {
        'application/json': {
          schema: DashboardErrorResponseSchema,
        },
      },
    },
  },
});

// Type assertion needed: Hono OpenAPI has complex generic inference that doesn't
// properly narrow the context type for handlers with validated params/query.
// See: https://github.com/honojs/middleware/issues/200
// eslint-disable-next-line @typescript-eslint/no-explicit-any
dashboard.openapi(getFormDashboardRoute, async (c: any) => {
  const { formId } = c.req.valid('param');
  const { period } = c.req.valid('query');
  const auth = c.get('auth') as AuthContext;

  // Verify organization context
  if (!auth.organizationId) {
    return c.json(
      {
        success: false as const,
        error: 'Organization context required',
      },
      403
    );
  }

  const db = getDb();
  const organizationId = auth.organizationId;
  const periodDays = periodToDays(period);
  const since = getPeriodStartDate(periodDays);

  try {
    // Single unified query: form check + step types + all dashboard data
    const { stats, funnel, audience, ratings, stepTypes, formExists } = await getAllDashboardData(
      db,
      formId,
      organizationId,
      since
    );

    if (!formExists) {
      return c.json(
        {
          success: false as const,
          error: 'Form not found',
        },
        404
      );
    }

    const hasRatingStep = stepTypes.includes('rating');
    const benchmark = calculateBenchmark(stepTypes.length > 0 ? stepTypes : ['welcome', 'question', 'thank_you']);

    // Build response
    const response = {
      success: true as const,
      data: {
        formId,
        period,
        periodDays,
        availability: {
          hasData: stats.totalSessions > 0,
          sessionCount: stats.totalSessions,
          isStatisticallySignificant: isStatisticallySignificant(stats.totalSessions),
          caveat: getDataCaveat(stats.totalSessions),
        },
        stats,
        funnel,
        audience,
        ratings,
        benchmark,
        generatedAt: new Date().toISOString(),
      },
    };

    return c.json(response, 200);
  } catch (error) {
    console.error('Dashboard query error:', error);
    return c.json(
      {
        success: false as const,
        error: 'Failed to load dashboard data',
      },
      500
    );
  }
});

export { dashboard };
export type DashboardRoutes = typeof dashboard;
