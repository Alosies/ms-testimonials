/**
 * Audience Data Query
 *
 * Calculates device and location breakdown from analytics events.
 * CRITICAL: All queries include organizationId for tenant isolation.
 */

import { sql } from 'drizzle-orm';
import type { DrizzleClient } from '@/db';
import type { AudienceData, CountryEntry } from '@/shared/schemas/dashboard';
import { safePercentage } from '../utils/formatMetrics';

/**
 * Get audience data including device and location breakdown
 *
 * @param db - Drizzle database client
 * @param formId - ID of the form
 * @param organizationId - Organization ID for tenant isolation (REQUIRED)
 * @param since - Start date for the query period
 * @returns Audience data with device and country breakdown
 */
export async function getAudienceData(
  db: DrizzleClient,
  formId: string,
  organizationId: string,
  since: Date
): Promise<AudienceData> {
  // Query 1: Device breakdown
  // We look at form_started events which capture device info
  const deviceResult = await db.execute<{
    is_mobile: boolean;
    sessions: string;
  }>(sql`
    SELECT
      COALESCE(
        (event_data->'device'->>'isMobile')::boolean,
        false
      ) as is_mobile,
      COUNT(DISTINCT session_id)::int as sessions
    FROM form_analytics_events
    WHERE form_id = ${formId}
      AND organization_id = ${organizationId}
      AND event_type = 'form_started'
      AND created_at >= ${since.toISOString()}
    GROUP BY is_mobile
  `);

  let desktop = 0;
  let mobile = 0;

  for (const row of deviceResult) {
    const sessions = parseInt(row.sessions as string) || 0;
    if (row.is_mobile) {
      mobile = sessions;
    } else {
      desktop = sessions;
    }
  }

  const totalDeviceSessions = desktop + mobile;
  const desktopPercent = safePercentage(desktop, totalDeviceSessions) ?? 0;
  const mobilePercent = safePercentage(mobile, totalDeviceSessions) ?? 0;

  // Query 2: Location breakdown (top 5 countries)
  const locationResult = await db.execute<{
    country: string;
    country_code: string | null;
    sessions: string;
  }>(sql`
    SELECT
      COALESCE(event_data->'geo'->>'country', 'Unknown') as country,
      event_data->'geo'->>'countryCode' as country_code,
      COUNT(DISTINCT session_id)::int as sessions
    FROM form_analytics_events
    WHERE form_id = ${formId}
      AND organization_id = ${organizationId}
      AND event_type = 'form_started'
      AND created_at >= ${since.toISOString()}
    GROUP BY country, country_code
    ORDER BY sessions DESC
    LIMIT 6
  `);

  // Calculate total sessions for percentage
  let totalLocationSessions = 0;
  for (const row of locationResult) {
    totalLocationSessions += parseInt(row.sessions as string) || 0;
  }

  // Take top 5 countries, group rest as "Other"
  const topCountries: CountryEntry[] = [];
  let otherSessions = 0;

  for (let i = 0; i < locationResult.length; i++) {
    const row = locationResult[i];
    const sessions = parseInt(row.sessions as string) || 0;

    if (i < 5) {
      topCountries.push({
        country: row.country as string,
        countryCode: row.country_code as string | null,
        sessions,
        percent: safePercentage(sessions, totalLocationSessions) ?? 0,
      });
    } else {
      otherSessions += sessions;
    }
  }

  // If there are more countries beyond top 5, we need to query the total "other"
  // For simplicity, we include the 6th+ in "other"
  const otherCountriesPercent =
    totalLocationSessions > 0
      ? safePercentage(
          totalLocationSessions -
            topCountries.reduce((sum, c) => sum + c.sessions, 0),
          totalLocationSessions
        ) ?? 0
      : 0;

  return {
    device: {
      desktop,
      mobile,
      desktopPercent,
      mobilePercent,
    },
    topCountries,
    otherCountriesPercent: Math.max(0, otherCountriesPercent),
  };
}
