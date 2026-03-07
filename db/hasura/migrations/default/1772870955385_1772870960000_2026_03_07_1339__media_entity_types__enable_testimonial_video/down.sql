-- =====================================================
-- Media Entity Types: Disable testimonial_video (Rollback)
-- =====================================================

UPDATE public.media_entity_types
SET is_active = false,
    updated_at = NOW()
WHERE code = 'testimonial_video';
