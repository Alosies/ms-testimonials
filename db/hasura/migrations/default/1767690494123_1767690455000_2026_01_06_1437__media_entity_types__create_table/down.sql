-- ============================================================================
-- MEDIA ENTITY TYPES TABLE - ROLLBACK
-- ============================================================================
-- Warning: This will delete all entity type definitions.
--          The media table has a FK to this table (entity_type -> code),
--          so media table must be dropped FIRST if it exists.
-- ============================================================================

-- Remove the updated_at trigger
SELECT remove_updated_at_trigger('media_entity_types', 'public');

-- Drop the table (CASCADE handles any remaining FKs)
DROP TABLE IF EXISTS public.media_entity_types CASCADE;
