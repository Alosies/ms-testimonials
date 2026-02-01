/**
 * Scheduled Jobs Routes
 *
 * HTTP endpoints for Hasura Scheduled Triggers to invoke background jobs.
 * These endpoints are authenticated using a webhook secret header.
 *
 * **Security:**
 * - All endpoints require X-Hasura-Webhook-Secret header matching HASURA_WEBHOOK_SECRET
 * - Only POST methods are allowed (Hasura triggers use POST)
 * - Returns 401 if authentication fails (stops Hasura retries for auth errors)
 *
 * **Hasura Scheduled Trigger Response Format:**
 * - Success: HTTP 200 with JSON body (Hasura marks trigger as complete)
 * - Retry: HTTP 5xx triggers Hasura's retry mechanism
 * - Stop: HTTP 4xx stops retries (e.g., 401 for auth failure)
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration (T7)
 *
 * @module routes/jobs
 */

import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import type { Context, MiddlewareHandler } from 'hono';

import { env } from '@/shared/config/env';
import {
  cleanupExpiredReservations,
  resetMonthlyCredits,
  type CleanupResult,
  type ResetMonthlyCreditsResult,
} from '@/jobs';

// =============================================================================
// Schemas
// =============================================================================

/**
 * Standard response schema for all job endpoints.
 * Follows Hasura scheduled trigger conventions.
 */
const JobResponseSchema = z.object({
  success: z.boolean().openapi({
    description: 'Whether the job completed without fatal errors',
  }),
  jobName: z.string().openapi({
    description: 'Name of the executed job',
  }),
  startedAt: z.string().datetime().openapi({
    description: 'ISO timestamp when job execution started',
  }),
  completedAt: z.string().datetime().openapi({
    description: 'ISO timestamp when job execution completed',
  }),
  durationMs: z.number().openapi({
    description: 'Job execution duration in milliseconds',
  }),
  result: z.record(z.unknown()).openapi({
    description: 'Job-specific result data',
  }),
}).openapi('JobResponse');

const JobErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string(),
  timestamp: z.string().datetime(),
}).openapi('JobErrorResponse');

// =============================================================================
// Logging Utilities
// =============================================================================

/**
 * Structured log entry for job execution.
 */
interface JobLogEntry {
  level: 'info' | 'warn' | 'error';
  job: string;
  phase: 'start' | 'complete' | 'error';
  durationMs?: number;
  result?: Record<string, unknown>;
  error?: string;
  requestId?: string;
  timestamp: string;
}

/**
 * Log job execution with structured data.
 * Output is JSON for easy parsing in log aggregators (CloudWatch, Datadog, etc.)
 */
function logJob(entry: JobLogEntry): void {
  const logLine = JSON.stringify({
    ...entry,
    service: 'testimonials-api',
    component: 'scheduled-jobs',
  });

  switch (entry.level) {
    case 'error':
      console.error(logLine);
      break;
    case 'warn':
      console.warn(logLine);
      break;
    default:
      console.log(logLine);
  }
}

/**
 * Generate a request ID for tracing job execution.
 */
function generateRequestId(): string {
  return `job-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

// =============================================================================
// Authentication Middleware
// =============================================================================

/**
 * Middleware to authenticate Hasura scheduled trigger requests.
 *
 * Hasura sends the webhook secret in the X-Hasura-Webhook-Secret header.
 * This middleware validates the secret before allowing the request to proceed.
 *
 * Returns 401 if:
 * - HASURA_WEBHOOK_SECRET is not configured
 * - Header is missing or doesn't match
 *
 * Note: 401 response stops Hasura from retrying (unlike 5xx which triggers retries)
 */
const webhookAuthMiddleware: MiddlewareHandler = async (c, next) => {
  // Skip auth for health endpoint (used by load balancers/monitoring)
  if (c.req.path.endsWith('/health')) {
    await next();
    return;
  }

  const webhookSecret = env.HASURA_WEBHOOK_SECRET;

  // Check if webhook secret is configured
  if (!webhookSecret) {
    logJob({
      level: 'error',
      job: 'auth',
      phase: 'error',
      error: 'HASURA_WEBHOOK_SECRET not configured',
      timestamp: new Date().toISOString(),
    });

    return c.json(
      {
        success: false,
        error: 'Webhook authentication not configured',
        code: 'WEBHOOK_NOT_CONFIGURED',
        timestamp: new Date().toISOString(),
      },
      401
    );
  }

  // Validate the webhook secret from header
  const providedSecret = c.req.header('X-Hasura-Webhook-Secret');

  if (!providedSecret || providedSecret !== webhookSecret) {
    logJob({
      level: 'warn',
      job: 'auth',
      phase: 'error',
      error: 'Invalid or missing webhook secret',
      timestamp: new Date().toISOString(),
    });

    return c.json(
      {
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
      },
      401
    );
  }

  await next();
};

// =============================================================================
// Route Handlers
// =============================================================================

const jobs = new OpenAPIHono();

// Apply webhook authentication to all job routes
jobs.use('/*', webhookAuthMiddleware);

// -----------------------------------------------------------------------------
// POST /jobs/cleanup-reservations
// -----------------------------------------------------------------------------

const cleanupReservationsRoute = createRoute({
  method: 'post',
  path: '/cleanup-reservations',
  tags: ['Scheduled Jobs'],
  summary: 'Clean up expired credit reservations',
  description: `
Scheduled job endpoint for Hasura cron triggers.

**Purpose:** Expire stale credit reservations and return credits to organizations.

**Schedule:** Every 5 minutes (recommended)

**Process:**
1. Find reservations where status='pending' AND expires_at < NOW()
2. Update each reservation status to 'expired'
3. Decrease reserved_credits in organization_credit_balances

**Authentication:** X-Hasura-Webhook-Secret header required

**Idempotency:** Safe to call multiple times; already-processed reservations are skipped.
  `,
  responses: {
    200: {
      description: 'Job executed successfully',
      content: {
        'application/json': {
          schema: JobResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - invalid or missing webhook secret',
      content: {
        'application/json': {
          schema: JobErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Job execution failed',
      content: {
        'application/json': {
          schema: JobErrorResponseSchema,
        },
      },
    },
  },
});

// Type assertion: OpenAPIHono handler inference is complex.
// Runtime safety ensured by Zod and middleware.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
jobs.openapi(cleanupReservationsRoute, async (c: any) => {
  const requestId = generateRequestId();
  const startedAt = new Date();

  logJob({
    level: 'info',
    job: 'cleanup-reservations',
    phase: 'start',
    requestId,
    timestamp: startedAt.toISOString(),
  });

  try {
    const result: CleanupResult = await cleanupExpiredReservations();
    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();

    logJob({
      level: result.errorCount > 0 ? 'warn' : 'info',
      job: 'cleanup-reservations',
      phase: 'complete',
      durationMs,
      requestId,
      result: {
        expiredCount: result.expiredCount,
        errorCount: result.errorCount,
      },
      timestamp: completedAt.toISOString(),
    });

    return c.json(
      {
        success: true,
        jobName: 'cleanup-reservations',
        startedAt: startedAt.toISOString(),
        completedAt: completedAt.toISOString(),
        durationMs,
        result: {
          expiredCount: result.expiredCount,
          errorCount: result.errorCount,
          errors: result.errors,
        },
      },
      200
    );
  } catch (error) {
    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logJob({
      level: 'error',
      job: 'cleanup-reservations',
      phase: 'error',
      durationMs,
      requestId,
      error: errorMessage,
      timestamp: completedAt.toISOString(),
    });

    // Return 500 to trigger Hasura retry mechanism
    return c.json(
      {
        success: false,
        error: errorMessage,
        code: 'JOB_EXECUTION_FAILED',
        timestamp: completedAt.toISOString(),
      },
      500
    );
  }
});

// -----------------------------------------------------------------------------
// POST /jobs/reset-credits
// -----------------------------------------------------------------------------

const resetCreditsRoute = createRoute({
  method: 'post',
  path: '/reset-credits',
  tags: ['Scheduled Jobs'],
  summary: 'Reset monthly credits at billing period end',
  description: `
Scheduled job endpoint for Hasura cron triggers.

**Purpose:** Reset monthly credit allocations for organizations at billing period end.

**Schedule:** Daily at midnight UTC (recommended: 0 0 * * *)

**Process:**
1. Find organizations where period_end <= NOW()
2. For each organization:
   - Apply pending plan changes if any
   - Calculate new billing period (period_end + 1 month)
   - Set monthly_credits from plan's monthly_ai_credits
   - Keep bonus_credits (they carry over)
   - Reset reserved_credits to 0
   - Create credit_transaction for 'plan_allocation'
   - If plan changed: create 'plan_change_adjustment' transaction

**Authentication:** X-Hasura-Webhook-Secret header required

**Idempotency:** Safe to call multiple times; only processes orgs with expired periods.
  `,
  responses: {
    200: {
      description: 'Job executed successfully',
      content: {
        'application/json': {
          schema: JobResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - invalid or missing webhook secret',
      content: {
        'application/json': {
          schema: JobErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Job execution failed',
      content: {
        'application/json': {
          schema: JobErrorResponseSchema,
        },
      },
    },
  },
});

// Type assertion: OpenAPIHono handler inference is complex.
// Runtime safety ensured by Zod and middleware.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
jobs.openapi(resetCreditsRoute, async (c: any) => {
  const requestId = generateRequestId();
  const startedAt = new Date();

  logJob({
    level: 'info',
    job: 'reset-credits',
    phase: 'start',
    requestId,
    timestamp: startedAt.toISOString(),
  });

  try {
    const result: ResetMonthlyCreditsResult = await resetMonthlyCredits();
    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();

    logJob({
      level: result.failedCount > 0 ? 'warn' : 'info',
      job: 'reset-credits',
      phase: 'complete',
      durationMs,
      requestId,
      result: {
        processedCount: result.processedCount,
        successCount: result.successCount,
        failedCount: result.failedCount,
        planChangesApplied: result.planChangesApplied,
      },
      timestamp: completedAt.toISOString(),
    });

    return c.json(
      {
        success: true,
        jobName: 'reset-credits',
        startedAt: startedAt.toISOString(),
        completedAt: completedAt.toISOString(),
        durationMs,
        result: {
          processedCount: result.processedCount,
          successCount: result.successCount,
          failedCount: result.failedCount,
          planChangesApplied: result.planChangesApplied,
          // Include individual org results for debugging
          organizations: result.results.map((r) => ({
            organizationId: r.organizationId,
            success: r.success,
            planChanged: r.planChanged,
            error: r.error,
          })),
        },
      },
      200
    );
  } catch (error) {
    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logJob({
      level: 'error',
      job: 'reset-credits',
      phase: 'error',
      durationMs,
      requestId,
      error: errorMessage,
      timestamp: completedAt.toISOString(),
    });

    // Return 500 to trigger Hasura retry mechanism
    return c.json(
      {
        success: false,
        error: errorMessage,
        code: 'JOB_EXECUTION_FAILED',
        timestamp: completedAt.toISOString(),
      },
      500
    );
  }
});

// -----------------------------------------------------------------------------
// GET /jobs/health - Health check for scheduled jobs system
// -----------------------------------------------------------------------------

const jobsHealthRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['Scheduled Jobs'],
  summary: 'Health check for scheduled jobs system',
  description: `
Simple health check endpoint for the jobs system.
Does NOT require authentication (for load balancer health checks).

Returns the status of the job scheduler configuration.
  `,
  responses: {
    200: {
      description: 'Jobs system is healthy',
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal('healthy'),
            webhookSecretConfigured: z.boolean(),
            availableJobs: z.array(z.string()),
            timestamp: z.string().datetime(),
          }),
        },
      },
    },
  },
});

// Health check doesn't need auth - override the middleware for this route
jobs.openapi(jobsHealthRoute, async (c: Context) => {
  return c.json(
    {
      status: 'healthy' as const,
      webhookSecretConfigured: !!env.HASURA_WEBHOOK_SECRET,
      availableJobs: ['cleanup-reservations', 'reset-credits'],
      timestamp: new Date().toISOString(),
    },
    200
  );
});

export { jobs };
export type JobsRoutes = typeof jobs;
