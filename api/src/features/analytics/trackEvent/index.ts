import type { Context } from 'hono';
import { successResponse, errorResponse } from '@/shared/utils/http';
import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import { TrackEventRequestSchema } from '@/shared/schemas/analytics';
import {
  InsertFormAnalyticsEventDocument,
  type InsertFormAnalyticsEventMutation,
} from '@/entities/formAnalyticsEvent';
import { getClientIp, lookupGeoLocation } from '@/shared/utils/geolocation';

/**
 * POST /analytics/events
 *
 * Track form analytics events (public endpoint - no auth required).
 *
 * This endpoint is called from the public form to track:
 * - form_started: When user lands on the form
 * - step_completed: When user moves past a step
 * - step_skipped: When user skips an optional step
 * - form_submitted: When form is completed successfully
 * - form_abandoned: When user leaves without submitting (via Beacon API)
 * - form_resumed: When user returns to saved progress
 *
 * Note: The Hasura permission check validates that:
 * - The form exists and belongs to the specified organization
 * - The form is active and published
 */
export async function trackEvent(c: Context) {
  try {
    const body = await c.req.json();

    // Validate request body using Zod schema
    const parseResult = TrackEventRequestSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return errorResponse(
        c,
        `Validation failed: ${errorMessages}`,
        400,
        'VALIDATION_ERROR'
      );
    }

    const {
      formId,
      organizationId,
      sessionId,
      eventType,
      stepIndex,
      stepId,
      stepType,
      eventData,
    } = parseResult.data;

    // Get user agent from request headers
    const userAgent = c.req.header('user-agent') ?? null;

    // Prepare event data with potential geolocation enrichment
    let enrichedEventData = eventData ?? {};

    // For form_started and form_resumed events, add geolocation data
    // These events include device info, so we enrich with server-side location
    if (eventType === 'form_started' || eventType === 'form_resumed') {
      const clientIp = getClientIp(c.req.raw.headers);

      if (clientIp) {
        // Lookup geolocation (non-blocking, with timeout)
        const geoLocation = await lookupGeoLocation(clientIp);

        if (geoLocation) {
          enrichedEventData = {
            ...enrichedEventData,
            geo: {
              ip: geoLocation.ip,
              country: geoLocation.country,
              countryCode: geoLocation.countryCode,
              region: geoLocation.regionName,
              city: geoLocation.city,
              timezone: geoLocation.timezone,
              isp: geoLocation.isp,
              org: geoLocation.org,
            },
          };
        }
      }
    }

    // Insert analytics event using admin client
    // The Hasura permissions will validate form.is_active and form.status
    const { data, error } = await executeGraphQLAsAdmin<InsertFormAnalyticsEventMutation>(
      InsertFormAnalyticsEventDocument,
      {
        organization_id: organizationId,
        form_id: formId,
        session_id: sessionId,
        event_type: eventType,
        step_index: stepIndex ?? null,
        step_id: stepId ?? null,
        step_type: stepType ?? null,
        event_data: enrichedEventData,
        user_agent: userAgent,
      }
    );

    if (error) {
      console.error('Error inserting analytics event:', error);
      // Return success anyway - analytics should not block user experience
      // We fail silently to avoid impacting form completion
      return successResponse(c, { success: true });
    }

    return successResponse(c, {
      success: true,
      eventId: data?.insert_form_analytics_events_one?.id,
    });
  } catch (error) {
    console.error('Analytics track event failed:', error);
    // Return success anyway - analytics should not block user experience
    return successResponse(c, { success: true });
  }
}

export default trackEvent;
