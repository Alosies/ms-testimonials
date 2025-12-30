-- =====================================================
-- Testimonials Table Rollback
-- =====================================================

SELECT remove_updated_at_trigger('testimonials', 'public');

DROP INDEX IF EXISTS public.idx_testimonials_org;
DROP INDEX IF EXISTS public.idx_testimonials_submission;
DROP INDEX IF EXISTS public.idx_testimonials_status;
DROP INDEX IF EXISTS public.idx_testimonials_approved;

DROP TABLE IF EXISTS public.testimonials CASCADE;
