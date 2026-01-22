-- ============================================================================
-- FORM ANALYTICS EVENTS TABLE - ROLLBACK
-- ============================================================================
-- Warning: This will delete ALL analytics events.
--          This data is not recoverable.
-- ============================================================================

-- Drop the table (indexes are dropped automatically with the table)
DROP TABLE IF EXISTS public.form_analytics_events CASCADE;
