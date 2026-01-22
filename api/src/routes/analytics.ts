import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { trackEvent } from '@/features/analytics/trackEvent';
import {
  TrackEventRequestSchema,
  TrackEventResponseSchema,
} from '@/shared/schemas/analytics';
import {
  ErrorResponseSchema,
} from '@/shared/schemas/common';

const analytics = new OpenAPIHono();

// ============================================================
// POST /analytics/events - Track form analytics event
// ============================================================

const trackEventRoute = createRoute({
  method: 'post',
  path: '/events',
  tags: ['Analytics'],
  summary: 'Track form analytics event',
  description: `
Track lightweight analytics events for form interactions.

**Public endpoint** - No authentication required.

**Event Types:**
- \`form_started\` - User lands on the form
- \`step_completed\` - User moves past a step
- \`step_skipped\` - User skips an optional step
- \`form_submitted\` - Form completed successfully
- \`form_abandoned\` - User leaves without submitting (via Beacon API)
- \`form_resumed\` - User returns to saved progress

**Session ID:**
Client-generated UUID stored in localStorage. Used to correlate all events
from a single form-filling session.

**Privacy:**
This endpoint only stores event metadata - no user-entered content or PII.
Designed for analytics dashboards (abandonment rates, funnel analysis).

**Beacon API Support:**
For \`form_abandoned\` events, use \`navigator.sendBeacon()\` to ensure
reliable delivery during page unload.
  `,
  request: {
    body: {
      content: {
        'application/json': {
          schema: TrackEventRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Event tracked successfully',
      content: {
        'application/json': {
          schema: TrackEventResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request (validation failed)',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// No auth middleware - public endpoint
// Type assertion needed: OpenAPI handler type inference is complex with @hono/zod-openapi.
// Runtime type safety is ensured by Zod schema validation inside the handler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
analytics.openapi(trackEventRoute, trackEvent as any);

export default analytics;
