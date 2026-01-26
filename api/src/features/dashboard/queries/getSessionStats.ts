/**
 * Session Statistics Query
 *
 * Calculates key metrics from form analytics events using Drizzle.
 * CRITICAL: All queries include organizationId for tenant isolation.
 */

import { sql } from 'drizzle-orm';
import type { DrizzleClient } from '@/db';
import type { SessionStats } from '@/shared/schemas/dashboard';
import {
  safePercentage,
  createMetricWithBenchmark,
  MAX_VALID_DURATION_MS,
  MIN_VALID_DURATION_MS,
} from '../utils/formatMetrics';

interface SessionStatsRaw {
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  avgCompletionTimeMs: number | null;
}

/**
 * Get session statistics for a form
 *
 * @param db - Drizzle database client
 * @param formId - ID of the form
 * @param organizationId - Organization ID for tenant isolation (REQUIRED)
 * @param since - Start date for the query period
 * @param expectedCompletionRate - Benchmark completion rate
 * @returns Session statistics with benchmark comparisons
 */
export async function getSessionStats(
  db: DrizzleClient,
  formId: string,
  organizationId: string,
  since: Date,
  expectedCompletionRate: number
): Promise<SessionStats> {
  // Query 1: Get session-level stats with CTE
  const sessionStatsResult = await db.execute<{
    total_sessions: string;
    completed_sessions: string;
    abandoned_sessions: string;
  }>(sql`
    WITH session_stats AS (
      SELECT
        session_id,
        MIN(created_at) as started_at,
        MAX(created_at) as ended_at,
        bool_or(event_type = 'form_submitted') as completed,
        bool_or(event_type = 'form_abandoned') as abandoned
      FROM form_analytics_events
      WHERE form_id = ${formId}
        AND organization_id = ${organizationId}
        AND created_at >= ${since.toISOString()}
      GROUP BY session_id
    )
    SELECT
      COUNT(*)::int as total_sessions,
      COUNT(*) FILTER (WHERE completed)::int as completed_sessions,
      COUNT(*) FILTER (WHERE abandoned)::int as abandoned_sessions
    FROM session_stats
  `);

  const rawStats = sessionStatsResult[0] ?? {
    total_sessions: '0',
    completed_sessions: '0',
    abandoned_sessions: '0',
  };

  const totalSessions = parseInt(rawStats.total_sessions as string) || 0;
  const completedSessions = parseInt(rawStats.completed_sessions as string) || 0;
  const abandonedSessions = parseInt(rawStats.abandoned_sessions as string) || 0;

  // Query 2: Get average completion time for completed sessions
  const avgTimeResult = await db.execute<{
    avg_time_ms: string | null;
  }>(sql`
    WITH completed_sessions AS (
      SELECT
        session_id,
        MIN(created_at) as started_at,
        MAX(created_at) as ended_at
      FROM form_analytics_events
      WHERE form_id = ${formId}
        AND organization_id = ${organizationId}
        AND created_at >= ${since.toISOString()}
      GROUP BY session_id
      HAVING bool_or(event_type = 'form_submitted')
    )
    SELECT
      AVG(
        EXTRACT(EPOCH FROM (ended_at - started_at)) * 1000
      ) FILTER (
        WHERE EXTRACT(EPOCH FROM (ended_at - started_at)) * 1000 > ${MIN_VALID_DURATION_MS}
          AND EXTRACT(EPOCH FROM (ended_at - started_at)) * 1000 < ${MAX_VALID_DURATION_MS}
      )::numeric as avg_time_ms
    FROM completed_sessions
  `);

  const avgCompletionTimeMs = avgTimeResult[0]?.avg_time_ms
    ? Math.round(parseFloat(avgTimeResult[0].avg_time_ms as string))
    : null;

  // Calculate metrics
  const completionRateValue = safePercentage(completedSessions, totalSessions);
  const abandonmentRateValue = safePercentage(abandonedSessions, totalSessions);

  // Calculate expected abandonment rate (inverse of completion)
  const expectedAbandonmentRate = 100 - expectedCompletionRate;

  // Expected completion time benchmark: ~2-3 minutes for standard forms
  // We estimate based on complexity: 30 seconds per complexity point
  const expectedCompletionTimeMs = 90000; // 1.5 minutes baseline

  return {
    totalSessions,
    completedSessions,
    abandonedSessions,
    completionRate: createMetricWithBenchmark(
      completionRateValue,
      expectedCompletionRate,
      true // higher is better
    ),
    abandonmentRate: createMetricWithBenchmark(
      abandonmentRateValue,
      expectedAbandonmentRate,
      false // lower is better
    ),
    avgCompletionTimeMs,
    avgCompletionTimeBenchmark: avgCompletionTimeMs
      ? createMetricWithBenchmark(
          avgCompletionTimeMs,
          expectedCompletionTimeMs,
          false // lower is better (faster completion)
        )
      : null,
  };
}
