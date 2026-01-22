-- ============================================================================
-- FORM ANALYTICS EVENTS TABLE
-- ============================================================================
-- Purpose: Lightweight analytics for tracking form interactions.
--          Stores only event metadata - NO PII until form submission.
--
-- Key Design Decisions:
--   1. No user content stored - only event type, step index, session ID
--   2. Session ID is client-generated UUID for cross-event correlation
--   3. Beacon API friendly - small payloads for reliable abandonment tracking
--   4. Organization-scoped for multi-tenant analytics
--
-- Event Types:
--   - form_started: User begins the form (lands on first step)
--   - step_completed: User successfully moves past a step
--   - step_skipped: User skips an optional step (future use)
--   - form_submitted: Form completed successfully
--   - form_abandoned: User leaves without submitting (via beforeunload/Beacon)
--   - form_resumed: User returns to previously started form (via localStorage)
-- ============================================================================

CREATE TABLE public.form_analytics_events (
  -- Unique identifier (opaque NanoID)
  id TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),

  -- Multi-tenant boundary: organization that owns the form
  organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Which form this event relates to
  form_id TEXT NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,

  -- Client-generated UUID for correlating events within a session
  -- Stored in localStorage, regenerated on form completion
  session_id TEXT NOT NULL,

  -- Type of event being tracked
  event_type TEXT NOT NULL CHECK (event_type IN (
    'form_started',
    'step_completed',
    'step_skipped',
    'form_submitted',
    'form_abandoned',
    'form_resumed'
  )),

  -- Step context (nullable - not all events are step-specific)
  step_index INTEGER,
  step_id TEXT,
  step_type TEXT,

  -- Extensible event data for future analytics needs
  -- Example: { "abandonedOnRequired": true, "timeOnStep": 45000 }
  event_data JSONB NOT NULL DEFAULT '{}',

  -- User agent for device/browser analytics
  -- Useful for understanding abandonment by device type
  user_agent TEXT,

  -- Timestamp of the event (no updated_at - events are immutable)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR ANALYTICS QUERIES
-- ============================================================================
-- Designed for common analytics query patterns:
-- 1. Organization-level dashboards (filter by org)
-- 2. Form-specific funnels (filter by form, order by time)
-- 3. Session reconstruction (filter by session)
-- 4. Event type aggregations (counts by event type per org/form)

-- Organization filter (dashboard queries)
CREATE INDEX idx_form_analytics_org ON public.form_analytics_events(organization_id);

-- Form + time (funnel analysis, recent events)
CREATE INDEX idx_form_analytics_form ON public.form_analytics_events(form_id, created_at DESC);

-- Session lookup (reconstruct user journey)
CREATE INDEX idx_form_analytics_session ON public.form_analytics_events(session_id);

-- Event type aggregations (conversion/abandonment rates)
CREATE INDEX idx_form_analytics_event_type ON public.form_analytics_events(organization_id, event_type);

-- ============================================================================
-- TABLE AND COLUMN COMMENTS
-- ============================================================================

COMMENT ON TABLE public.form_analytics_events IS
  'Lightweight analytics table for tracking form interactions.

   Stores only event metadata - NO user-entered content or PII.
   This allows analytics to work before form submission and enables
   abandonment tracking without privacy concerns.

   Events are immutable (no updates) for audit trail integrity.
   Session ID correlates events within a single form-filling session.';

COMMENT ON COLUMN public.form_analytics_events.id IS
  'Opaque unique identifier (NanoID 12-char).';

COMMENT ON COLUMN public.form_analytics_events.organization_id IS
  'Organization that owns the form. Used for multi-tenant isolation
   in analytics queries and dashboards.';

COMMENT ON COLUMN public.form_analytics_events.form_id IS
  'The form this event relates to. CASCADE delete ensures cleanup
   when forms are removed.';

COMMENT ON COLUMN public.form_analytics_events.session_id IS
  'Client-generated UUID (v4) stored in localStorage.
   Correlates all events from a single form-filling session.
   Regenerated when form is completed or explicitly cleared.';

COMMENT ON COLUMN public.form_analytics_events.event_type IS
  'Type of analytics event:
   - form_started: User landed on the form
   - step_completed: User moved past a step
   - step_skipped: User skipped optional step
   - form_submitted: Form completed successfully
   - form_abandoned: User left without submitting
   - form_resumed: User returned to saved progress';

COMMENT ON COLUMN public.form_analytics_events.step_index IS
  'Zero-based index of the step within visible steps.
   NULL for form-level events (started, submitted, abandoned).';

COMMENT ON COLUMN public.form_analytics_events.step_id IS
  'Database ID of the step (for joining with form_steps).
   NULL for form-level events.';

COMMENT ON COLUMN public.form_analytics_events.step_type IS
  'Type of step (welcome, question, rating, etc.).
   Denormalized for efficient analytics queries.';

COMMENT ON COLUMN public.form_analytics_events.event_data IS
  'JSONB for extensible event metadata.
   Examples: timeOnStep, abandonedOnRequired, deviceType.
   Avoid storing PII here.';

COMMENT ON COLUMN public.form_analytics_events.user_agent IS
  'Browser user agent string for device/browser analytics.
   Useful for identifying abandonment patterns by device.';

COMMENT ON COLUMN public.form_analytics_events.created_at IS
  'Timestamp when the event occurred. Used for time-series analytics.';
