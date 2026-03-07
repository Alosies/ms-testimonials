-- =====================================================
-- Media Entity Types: Enable testimonial_video (ADR-029)
-- =====================================================
-- Purpose: Activate the testimonial_video entity type to allow video uploads.
--          The entity type was seeded as inactive in the original migration.
--          Now that video transcoding (Bunny Stream) is being implemented,
--          we can enable it.

UPDATE public.media_entity_types
SET is_active = true,
    updated_at = NOW()
WHERE code = 'testimonial_video';
