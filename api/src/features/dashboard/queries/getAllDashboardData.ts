/**
 * Unified Dashboard Query
 *
 * Combines form validation, step types, and all dashboard metrics into a SINGLE query.
 * This replaces multiple separate queries that were causing ~5s response times.
 *
 * CRITICAL: All queries include organizationId for tenant isolation.
 */

import { sql } from 'drizzle-orm';
import type { DrizzleClient } from '@/db';
import type {
  SessionStats,
  FunnelData,
  FunnelStep,
  AudienceData,
  CountryEntry,
  RatingData,
} from '@/shared/schemas/dashboard';
import {
  safePercentage,
  createMetricWithBenchmark,
  MAX_VALID_DURATION_MS,
  MIN_VALID_DURATION_MS,
} from '../utils/formatMetrics';

interface UnifiedDashboardResult {
  formExists: boolean;
  stepTypes: string[];
  stats: SessionStats;
  funnel: FunnelData;
  audience: AudienceData;
  ratings: RatingData;
}

/**
 * Get all dashboard data in a single optimized query
 *
 * Includes form validation, step types, and all analytics in one round-trip.
 *
 * @param db - Drizzle database client
 * @param formId - ID of the form
 * @param organizationId - Organization ID for tenant isolation (REQUIRED)
 * @param since - Start date for the query period
 * @returns All dashboard data including form existence check
 */
export async function getAllDashboardData(
  db: DrizzleClient,
  formId: string,
  organizationId: string,
  since: Date
): Promise<UnifiedDashboardResult> {
  // Single unified query that validates form AND calculates all metrics
  const result = await db.execute<{
    // Form validation
    form_exists: boolean;
    step_types: string;
    // Session stats
    total_sessions: string;
    completed_sessions: string;
    abandoned_sessions: string;
    avg_completion_time_ms: string | null;
    // Device breakdown
    desktop_sessions: string;
    mobile_sessions: string;
    // Funnel data as JSON
    funnel_data: string;
    // Location data as JSON
    location_data: string;
  }>(sql`
    WITH
    -- Form validation and step types
    form_check AS (
      SELECT
        f.id,
        COALESCE(
          (SELECT json_agg(fs.step_type ORDER BY fs.step_order)
           FROM form_steps fs
           INNER JOIN flows fl ON fs.flow_id = fl.id
           WHERE fl.form_id = f.id
             AND fl.organization_id = ${organizationId}
             AND fl.is_primary = true
             AND fs.is_active = true),
          '[]'::json
        ) as step_types
      FROM forms f
      WHERE f.id = ${formId}
        AND f.organization_id = ${organizationId}
        AND f.is_active = true
      LIMIT 1
    ),

    -- Base CTE: Get all events for this form in the period (single table scan)
    events AS (
      SELECT
        session_id,
        event_type,
        step_index,
        step_type,
        step_id,
        created_at,
        event_data
      FROM form_analytics_events
      WHERE form_id = ${formId}
        AND organization_id = ${organizationId}
        AND created_at >= ${since.toISOString()}
        AND EXISTS (SELECT 1 FROM form_check)
    ),

    -- Session-level aggregation
    sessions AS (
      SELECT
        session_id,
        MIN(created_at) as started_at,
        MAX(created_at) as ended_at,
        bool_or(event_type = 'form_submitted') as completed,
        bool_or(event_type = 'form_abandoned') as abandoned,
        MAX(CASE WHEN event_type = 'form_started'
            THEN event_data->'device'->>'isMobile'
            ELSE NULL END) = 'true' as is_mobile,
        MAX(CASE WHEN event_type = 'form_started'
            THEN COALESCE(event_data->'geo'->>'country', 'Unknown')
            ELSE NULL END) as country,
        MAX(CASE WHEN event_type = 'form_started'
            THEN event_data->'geo'->>'countryCode'
            ELSE NULL END) as country_code
      FROM events
      GROUP BY session_id
    ),

    -- Session stats
    session_stats AS (
      SELECT
        COUNT(*)::int as total_sessions,
        COUNT(*) FILTER (WHERE completed)::int as completed_sessions,
        COUNT(*) FILTER (WHERE abandoned)::int as abandoned_sessions,
        AVG(
          EXTRACT(EPOCH FROM (ended_at - started_at)) * 1000
        ) FILTER (
          WHERE completed
            AND EXTRACT(EPOCH FROM (ended_at - started_at)) * 1000 > ${MIN_VALID_DURATION_MS}
            AND EXTRACT(EPOCH FROM (ended_at - started_at)) * 1000 < ${MAX_VALID_DURATION_MS}
        )::numeric as avg_completion_time_ms,
        COUNT(*) FILTER (WHERE COALESCE(is_mobile, false) = false)::int as desktop_sessions,
        COUNT(*) FILTER (WHERE is_mobile = true)::int as mobile_sessions
      FROM sessions
    ),

    -- Funnel step counts
    funnel_steps AS (
      SELECT 0 as step_index, 'welcome' as step_type, NULL::text as step_id, session_id
      FROM events WHERE event_type = 'form_started'
      UNION ALL
      SELECT COALESCE(step_index, 0), COALESCE(step_type, 'unknown'), step_id, session_id
      FROM events WHERE event_type = 'step_completed'
      UNION ALL
      SELECT
        COALESCE((SELECT MAX(step_index) + 1 FROM events WHERE event_type = 'step_completed'), 1),
        'submitted',
        NULL,
        session_id
      FROM events WHERE event_type = 'form_submitted'
    ),

    funnel_agg AS (
      SELECT step_index, step_type, step_id, COUNT(DISTINCT session_id)::int as sessions
      FROM funnel_steps
      GROUP BY step_index, step_type, step_id
      ORDER BY step_index
    ),

    -- Location breakdown (top 6)
    location_agg AS (
      SELECT COALESCE(country, 'Unknown') as country, country_code, COUNT(*)::int as sessions
      FROM sessions
      WHERE country IS NOT NULL
      GROUP BY country, country_code
      ORDER BY sessions DESC
      LIMIT 6
    )

    SELECT
      -- Form validation
      EXISTS (SELECT 1 FROM form_check) as form_exists,
      COALESCE((SELECT step_types::text FROM form_check), '[]') as step_types,
      -- Session stats
      COALESCE(ss.total_sessions, 0)::text as total_sessions,
      COALESCE(ss.completed_sessions, 0)::text as completed_sessions,
      COALESCE(ss.abandoned_sessions, 0)::text as abandoned_sessions,
      ss.avg_completion_time_ms::text,
      COALESCE(ss.desktop_sessions, 0)::text as desktop_sessions,
      COALESCE(ss.mobile_sessions, 0)::text as mobile_sessions,
      -- Funnel as JSON array
      COALESCE(
        (SELECT json_agg(json_build_object(
          'step_index', step_index,
          'step_type', step_type,
          'step_id', step_id,
          'sessions', sessions
        ) ORDER BY step_index)::text FROM funnel_agg),
        '[]'
      ) as funnel_data,
      -- Locations as JSON array
      COALESCE(
        (SELECT json_agg(json_build_object(
          'country', country,
          'country_code', country_code,
          'sessions', sessions
        ) ORDER BY sessions DESC)::text FROM location_agg),
        '[]'
      ) as location_data
    FROM session_stats ss
  `);

  const row = result[0];

  // Handle case where query returns no rows (form doesn't exist)
  if (!row || !row.form_exists) {
    return createEmptyResult(false, []);
  }

  // Parse step types
  const stepTypes = JSON.parse(row.step_types) as string[];
  const hasRatingStep = stepTypes.includes('rating');

  // Parse session stats
  const totalSessions = parseInt(row.total_sessions) || 0;
  const completedSessions = parseInt(row.completed_sessions) || 0;
  const abandonedSessions = parseInt(row.abandoned_sessions) || 0;
  const avgCompletionTimeMs = row.avg_completion_time_ms
    ? Math.round(parseFloat(row.avg_completion_time_ms))
    : null;

  // Parse device stats
  const desktop = parseInt(row.desktop_sessions) || 0;
  const mobile = parseInt(row.mobile_sessions) || 0;
  const totalDeviceSessions = desktop + mobile;

  // Parse funnel data
  const funnelRaw = JSON.parse(row.funnel_data) as Array<{
    step_index: number;
    step_type: string;
    step_id: string | null;
    sessions: number;
  }>;

  // Parse location data
  const locationRaw = JSON.parse(row.location_data) as Array<{
    country: string;
    country_code: string | null;
    sessions: number;
  }>;

  // Build funnel steps
  const funnelSteps: FunnelStep[] = [];
  let highestDropoff: { stepIndex: number; stepType: string; dropoffPercent: number } | null = null;
  const funnelTotalSessions = funnelRaw[0]?.sessions || 0;

  for (let i = 0; i < funnelRaw.length; i++) {
    const step = funnelRaw[i];
    const percentage = safePercentage(step.sessions, funnelTotalSessions) ?? 0;

    let dropoffPercent: number | null = null;
    if (i > 0) {
      const prevSessions = funnelRaw[i - 1].sessions || 0;
      if (prevSessions > 0) {
        dropoffPercent = safePercentage(prevSessions - step.sessions, prevSessions);
      }
    }

    funnelSteps.push({
      stepIndex: step.step_index,
      stepType: step.step_type,
      stepId: step.step_id,
      sessions: step.sessions,
      percentage,
      dropoffPercent,
    });

    if (dropoffPercent !== null && dropoffPercent > 0) {
      if (!highestDropoff || dropoffPercent > highestDropoff.dropoffPercent) {
        highestDropoff = {
          stepIndex: step.step_index,
          stepType: step.step_type,
          dropoffPercent,
        };
      }
    }
  }

  // Build location breakdown
  let totalLocationSessions = 0;
  for (const loc of locationRaw) {
    totalLocationSessions += loc.sessions;
  }

  const topCountries: CountryEntry[] = locationRaw.slice(0, 5).map((loc) => ({
    country: loc.country,
    countryCode: loc.country_code,
    sessions: loc.sessions,
    percent: safePercentage(loc.sessions, totalLocationSessions) ?? 0,
  }));

  const topCountriesTotal = topCountries.reduce((sum, c) => sum + c.sessions, 0);
  const otherCountriesPercent =
    totalLocationSessions > 0
      ? safePercentage(totalLocationSessions - topCountriesTotal, totalLocationSessions) ?? 0
      : 0;

  // Calculate metrics with benchmarks (use default values, will be recalculated by caller)
  const completionRateValue = safePercentage(completedSessions, totalSessions);
  const abandonmentRateValue = safePercentage(abandonedSessions, totalSessions);

  return {
    formExists: true,
    stepTypes,
    stats: {
      totalSessions,
      completedSessions,
      abandonedSessions,
      completionRate: createMetricWithBenchmark(completionRateValue, 50, true),
      abandonmentRate: createMetricWithBenchmark(abandonmentRateValue, 50, false),
      avgCompletionTimeMs,
      avgCompletionTimeBenchmark: avgCompletionTimeMs
        ? createMetricWithBenchmark(avgCompletionTimeMs, 90000, false)
        : null,
    },
    funnel: {
      steps: funnelSteps,
      highestDropoffStep: highestDropoff,
    },
    audience: {
      device: {
        desktop,
        mobile,
        desktopPercent: safePercentage(desktop, totalDeviceSessions) ?? 0,
        mobilePercent: safePercentage(mobile, totalDeviceSessions) ?? 0,
      },
      topCountries,
      otherCountriesPercent: Math.max(0, otherCountriesPercent),
    },
    ratings: {
      avgRating: null,
      totalRatings: 0,
      distribution: [],
      hasRatingStep,
    },
  };
}

function createEmptyResult(formExists: boolean, stepTypes: string[]): UnifiedDashboardResult {
  const hasRatingStep = stepTypes.includes('rating');

  return {
    formExists,
    stepTypes,
    stats: {
      totalSessions: 0,
      completedSessions: 0,
      abandonedSessions: 0,
      completionRate: createMetricWithBenchmark(null, 50, true),
      abandonmentRate: createMetricWithBenchmark(null, 50, false),
      avgCompletionTimeMs: null,
      avgCompletionTimeBenchmark: null,
    },
    funnel: {
      steps: [],
      highestDropoffStep: null,
    },
    audience: {
      device: {
        desktop: 0,
        mobile: 0,
        desktopPercent: 0,
        mobilePercent: 0,
      },
      topCountries: [],
      otherCountriesPercent: 0,
    },
    ratings: {
      avgRating: null,
      totalRatings: 0,
      distribution: [],
      hasRatingStep,
    },
  };
}
