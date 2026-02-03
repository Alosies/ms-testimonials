/**
 * GET /credits/limits - Get rate limit usage per AI capability
 *
 * Part of ADR-023 AI Capabilities Plan Integration
 */

import { createRoute } from '@hono/zod-openapi';
import type { Context } from 'hono';
import { getClient } from '@/db';
import {
  GetLimitsResponseSchema,
  CreditsErrorResponseSchema,
} from '@/shared/schemas/credits';
import { ErrorResponseSchema } from '@/shared/schemas/common';
import type { AuthContext } from '@/shared/middleware/auth';

/**
 * Row type for rate limit capability query
 */
interface RateLimitCapabilityRow {
  capability_id: string;
  capability_name: string;
  capability_unique_name: string;
  hourly_limit: number | null;
  daily_limit: number | null;
  plan_name: string;
}

/**
 * Row type for usage count query
 */
interface UsageCountRow {
  ai_capability_id: string;
  used_today: string;
  used_this_hour: string;
}

export const getLimitsRoute = createRoute({
  method: 'get',
  path: '/limits',
  tags: ['Credits'],
  summary: 'Get rate limit usage per AI capability',
  description: `
Retrieve current rate limit usage for each AI capability enabled on the organization's plan.

**Authentication required** - Must have access to the organization.

**Response includes for each capability:**
- Hourly and daily limits (null = unlimited)
- Current usage counts
- Reset times for limits
  `,
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: 'Rate limits retrieved successfully',
      content: {
        'application/json': {
          schema: GetLimitsResponseSchema,
        },
      },
    },
    403: {
      description: 'Access denied - organization context required',
      content: {
        'application/json': {
          schema: CreditsErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export async function getLimitsHandler(c: Context): Promise<Response> {
  const auth = c.get('auth') as AuthContext;

  if (!auth.organizationId) {
    return c.json(
      {
        success: false as const,
        error: 'Organization context required',
      },
      403
    );
  }

  const organizationId = auth.organizationId;

  try {
    const sql = getClient();

    // Step 1: Get all enabled capabilities with their rate limits for this org's plan
    const capabilitiesQuery = `
      SELECT
        ac.id as capability_id,
        ac.name as capability_name,
        ac.unique_name as capability_unique_name,
        pac.rate_limit_rph as hourly_limit,
        pac.rate_limit_rpd as daily_limit,
        p.name as plan_name
      FROM plan_ai_capabilities pac
      INNER JOIN ai_capabilities ac ON ac.id = pac.ai_capability_id
      INNER JOIN organization_plans op ON op.plan_id = pac.plan_id
      INNER JOIN plans p ON p.id = pac.plan_id
      WHERE op.organization_id = $1
        AND op.status IN ('active', 'trial')
        AND pac.is_enabled = true
        AND ac.is_active = true
      ORDER BY ac.name ASC
    `;

    const capabilities = (await sql.unsafe(capabilitiesQuery, [
      organizationId,
    ])) as RateLimitCapabilityRow[];

    if (capabilities.length === 0) {
      return c.json(
        {
          capabilities: [],
          planName: 'Unknown',
        },
        200
      );
    }

    const planName = capabilities[0].plan_name;
    const capabilityIds = capabilities.map((cap) => cap.capability_id);

    // Step 2: Get usage counts for all capabilities in a single query
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Build the IN clause with positional parameters
    const placeholders = capabilityIds.map((_, i) => `$${i + 4}`).join(', ');

    const usageQuery = `
      SELECT
        ai_capability_id,
        COUNT(*)::text as used_today,
        COUNT(*) FILTER (WHERE created_at >= $2)::text as used_this_hour
      FROM credit_transactions
      WHERE organization_id = $1
        AND ai_capability_id IN (${placeholders})
        AND transaction_type = 'ai_consumption'
        AND created_at >= $3
      GROUP BY ai_capability_id
    `;

    const usageResult = (await sql.unsafe(usageQuery, [
      organizationId,
      oneHourAgo.toISOString(),
      todayStart.toISOString(),
      ...capabilityIds,
    ])) as UsageCountRow[];

    // Build usage map for quick lookup
    const usageMap = new Map<
      string,
      { usedToday: number; usedThisHour: number }
    >();
    for (const row of usageResult) {
      usageMap.set(row.ai_capability_id, {
        usedToday: parseInt(row.used_today, 10) || 0,
        usedThisHour: parseInt(row.used_this_hour, 10) || 0,
      });
    }

    // Step 3: Calculate reset times
    const tomorrowMidnight = new Date(now);
    tomorrowMidnight.setUTCDate(tomorrowMidnight.getUTCDate() + 1);
    tomorrowMidnight.setUTCHours(0, 0, 0, 0);

    // Hourly reset: next hour boundary (conservative estimate)
    const nextHourBoundary = new Date(now);
    nextHourBoundary.setUTCMinutes(0, 0, 0);
    nextHourBoundary.setUTCHours(nextHourBoundary.getUTCHours() + 1);

    // Step 4: Build response
    const responseCapabilities = capabilities.map((cap) => {
      const usage = usageMap.get(cap.capability_id) || {
        usedToday: 0,
        usedThisHour: 0,
      };

      return {
        capabilityId: cap.capability_id,
        capabilityName: cap.capability_name,
        capabilityUniqueName: cap.capability_unique_name,
        hourlyLimit: cap.hourly_limit,
        dailyLimit: cap.daily_limit,
        usedThisHour: usage.usedThisHour,
        usedToday: usage.usedToday,
        hourlyResetsAt:
          cap.hourly_limit !== null ? nextHourBoundary.toISOString() : null,
        dailyResetsAt: tomorrowMidnight.toISOString(),
      };
    });

    return c.json(
      {
        capabilities: responseCapabilities,
        planName,
      },
      200
    );
  } catch (error) {
    console.error('Rate limits query error:', error);
    return c.json(
      {
        error: 'Failed to retrieve rate limits',
      },
      500
    );
  }
}
