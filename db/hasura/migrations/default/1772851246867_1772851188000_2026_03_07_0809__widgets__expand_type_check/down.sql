-- =====================================================
-- Widgets: Revert type CHECK to Original 3 Types
-- =====================================================
-- WARNING: This will fail if any rows use the new types.
-- Delete or update those rows first before rolling back.

ALTER TABLE public.widgets
  DROP CONSTRAINT IF EXISTS widgets_type_check;

ALTER TABLE public.widgets
  ADD CONSTRAINT widgets_type_check
  CHECK (type IN (
    'wall_of_love',
    'carousel',
    'single_quote'
  ));

COMMENT ON COLUMN public.widgets.type IS
  'Layout type: wall_of_love (masonry grid), carousel (horizontal slider), single_quote (featured testimonial)';

COMMENT ON CONSTRAINT widgets_type_check ON public.widgets IS
  'Restricts widget type to one of 3 supported layout types.';
