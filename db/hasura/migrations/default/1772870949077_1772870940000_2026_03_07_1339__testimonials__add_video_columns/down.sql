-- =====================================================
-- Testimonials: Remove Video Columns (Rollback)
-- =====================================================

-- Drop indexes
DROP INDEX IF EXISTS public.idx_testimonials_video_media_id;
DROP INDEX IF EXISTS public.idx_testimonials_type;

-- Drop foreign key and column
ALTER TABLE public.testimonials
  DROP CONSTRAINT IF EXISTS fk_testimonials_video_media_id;
ALTER TABLE public.testimonials
  DROP COLUMN IF EXISTS video_media_id;

-- Drop check constraint and column
ALTER TABLE public.testimonials
  DROP CONSTRAINT IF EXISTS chk_testimonials_type;
ALTER TABLE public.testimonials
  DROP COLUMN IF EXISTS type;
