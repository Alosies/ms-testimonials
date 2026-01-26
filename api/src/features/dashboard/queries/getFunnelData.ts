/**
 * Funnel Data Query
 *
 * Calculates conversion funnel with step-by-step progression.
 * CRITICAL: All queries include organizationId for tenant isolation.
 */

import { sql } from 'drizzle-orm';
import type { DrizzleClient } from '@/db';
import type { FunnelData, FunnelStep } from '@/shared/schemas/dashboard';
import { safePercentage } from '../utils/formatMetrics';

interface FunnelStepRaw {
  step_index: number;
  step_type: string;
  step_id: string | null;
  sessions: number;
}

/**
 * Get funnel data showing progression through form steps
 *
 * @param db - Drizzle database client
 * @param formId - ID of the form
 * @param organizationId - Organization ID for tenant isolation (REQUIRED)
 * @param since - Start date for the query period
 * @returns Funnel data with steps and highest dropoff
 */
export async function getFunnelData(
  db: DrizzleClient,
  formId: string,
  organizationId: string,
  since: Date
): Promise<FunnelData> {
  // Query to get session counts at each step
  // We count sessions that reached each step (form_started for step 0, step_completed for others)
  const result = await db.execute<{
    step_index: string;
    step_type: string;
    step_id: string | null;
    sessions: string;
  }>(sql`
    WITH step_sessions AS (
      -- Step 0: form_started events
      SELECT
        0 as step_index,
        'welcome' as step_type,
        NULL as step_id,
        session_id
      FROM form_analytics_events
      WHERE form_id = ${formId}
        AND organization_id = ${organizationId}
        AND event_type = 'form_started'
        AND created_at >= ${since.toISOString()}

      UNION ALL

      -- Other steps: step_completed events
      SELECT
        COALESCE(step_index, 0) as step_index,
        COALESCE(step_type, 'unknown') as step_type,
        step_id,
        session_id
      FROM form_analytics_events
      WHERE form_id = ${formId}
        AND organization_id = ${organizationId}
        AND event_type = 'step_completed'
        AND created_at >= ${since.toISOString()}

      UNION ALL

      -- Final step: form_submitted (use max step_index + 1)
      SELECT
        COALESCE(
          (SELECT MAX(step_index) + 1 FROM form_analytics_events
           WHERE form_id = ${formId}
             AND organization_id = ${organizationId}
             AND event_type = 'step_completed'
             AND created_at >= ${since.toISOString()}),
          1
        ) as step_index,
        'submitted' as step_type,
        NULL as step_id,
        session_id
      FROM form_analytics_events
      WHERE form_id = ${formId}
        AND organization_id = ${organizationId}
        AND event_type = 'form_submitted'
        AND created_at >= ${since.toISOString()}
    )
    SELECT
      step_index::int,
      step_type,
      step_id,
      COUNT(DISTINCT session_id)::int as sessions
    FROM step_sessions
    GROUP BY step_index, step_type, step_id
    ORDER BY step_index ASC
  `);

  if (result.length === 0) {
    return {
      steps: [],
      highestDropoffStep: null,
    };
  }

  // Get total sessions (step 0)
  const totalSessions = parseInt(result[0]?.sessions as string) || 0;

  if (totalSessions === 0) {
    return {
      steps: [],
      highestDropoffStep: null,
    };
  }

  // Transform raw results into FunnelStep objects
  const steps: FunnelStep[] = [];
  let highestDropoff: { stepIndex: number; stepType: string; dropoffPercent: number } | null = null;

  for (let i = 0; i < result.length; i++) {
    const row = result[i];
    const stepIndex = parseInt(row.step_index as string);
    const stepType = row.step_type as string;
    const stepId = row.step_id as string | null;
    const sessions = parseInt(row.sessions as string) || 0;

    const percentage = safePercentage(sessions, totalSessions) ?? 0;

    // Calculate dropoff from previous step
    let dropoffPercent: number | null = null;
    if (i > 0) {
      const prevSessions = parseInt(result[i - 1].sessions as string) || 0;
      if (prevSessions > 0) {
        dropoffPercent = safePercentage(prevSessions - sessions, prevSessions);
      }
    }

    steps.push({
      stepIndex,
      stepType,
      stepId,
      sessions,
      percentage,
      dropoffPercent,
    });

    // Track highest dropoff (excluding step 0)
    if (dropoffPercent !== null && dropoffPercent > 0) {
      if (!highestDropoff || dropoffPercent > highestDropoff.dropoffPercent) {
        highestDropoff = {
          stepIndex,
          stepType,
          dropoffPercent,
        };
      }
    }
  }

  return {
    steps,
    highestDropoffStep: highestDropoff,
  };
}
