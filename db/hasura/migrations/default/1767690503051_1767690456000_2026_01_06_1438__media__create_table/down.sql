-- ============================================================================
-- MEDIA TABLE - ROLLBACK
-- ============================================================================
-- Warning: This will delete all media tracking records.
--          The actual files in S3 are NOT deleted by this migration.
--          Run cleanup scripts separately if needed.
-- ============================================================================

-- Remove the updated_at trigger
SELECT remove_updated_at_trigger('media', 'public');

-- Drop indexes (explicit for clarity, CASCADE would handle them)
DROP INDEX IF EXISTS public.idx_media_organization_id;
DROP INDEX IF EXISTS public.idx_media_entity;
DROP INDEX IF EXISTS public.idx_media_status;
DROP INDEX IF EXISTS public.idx_media_storage_path;
DROP INDEX IF EXISTS public.idx_media_created_at;
DROP INDEX IF EXISTS public.idx_media_uploaded_by;

-- Drop the table
DROP TABLE IF EXISTS public.media CASCADE;
