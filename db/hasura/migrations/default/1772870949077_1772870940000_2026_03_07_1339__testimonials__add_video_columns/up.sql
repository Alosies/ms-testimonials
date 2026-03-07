-- =====================================================
-- Testimonials: Add Video Columns (ADR-026, ADR-029)
-- =====================================================
-- Purpose: Add `type` and `video_media_id` columns to support video testimonials.
--          `type` distinguishes text from video testimonials.
--          `video_media_id` links to the media table for video file tracking.
-- Dependencies: media table (must exist)

-- =========================================================================
-- Add type column
-- =========================================================================

-- Testimonial format: 'text' (AI-assembled or manual) or 'video' (uploaded file).
-- Defaults to 'text' so all existing testimonials remain unchanged.
ALTER TABLE public.testimonials
  ADD COLUMN type TEXT NOT NULL DEFAULT 'text';

ALTER TABLE public.testimonials
  ADD CONSTRAINT chk_testimonials_type
  CHECK (type IN ('text', 'video'));

-- =========================================================================
-- Add video_media_id column
-- =========================================================================

-- FK to media table for video testimonials. NULL for text testimonials.
ALTER TABLE public.testimonials
  ADD COLUMN video_media_id TEXT;

ALTER TABLE public.testimonials
  ADD CONSTRAINT fk_testimonials_video_media_id
  FOREIGN KEY (video_media_id) REFERENCES public.media(id)
  ON DELETE SET NULL;

-- =========================================================================
-- Indexes
-- =========================================================================

-- Index for filtering testimonials by type (text vs video)
CREATE INDEX idx_testimonials_type ON public.testimonials(type);

-- Index for looking up testimonial by video media reference
CREATE INDEX idx_testimonials_video_media_id
  ON public.testimonials(video_media_id)
  WHERE video_media_id IS NOT NULL;

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

COMMENT ON COLUMN public.testimonials.type IS
  'Testimonial format: text (AI-assembled or manual) or video (uploaded file). Defaults to text.';

COMMENT ON COLUMN public.testimonials.video_media_id IS
  'FK to media table for video testimonials. NULL for text testimonials. Set when video is uploaded and linked.';

COMMENT ON CONSTRAINT chk_testimonials_type ON public.testimonials IS
  'Ensures testimonial type is either text or video.';

COMMENT ON CONSTRAINT fk_testimonials_video_media_id ON public.testimonials IS
  'Links video testimonial to its media record. SET NULL on media deletion to preserve testimonial.';

COMMENT ON INDEX idx_testimonials_type IS
  'Supports filtering testimonials by type (text vs video) in dashboard views.';

COMMENT ON INDEX idx_testimonials_video_media_id IS
  'Supports looking up testimonial by video media reference. Partial index excludes text testimonials.';
