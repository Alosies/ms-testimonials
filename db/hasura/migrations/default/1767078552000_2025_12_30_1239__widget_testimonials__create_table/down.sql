-- =====================================================
-- Widget Testimonials Junction Table Rollback
-- =====================================================

DROP INDEX IF EXISTS public.idx_widget_testimonials_org;
DROP INDEX IF EXISTS public.idx_widget_testimonials_widget;
DROP INDEX IF EXISTS public.idx_widget_testimonials_testimonial;
DROP INDEX IF EXISTS public.idx_widget_testimonials_order;

DROP TABLE IF EXISTS public.widget_testimonials CASCADE;
