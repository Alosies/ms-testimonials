-- =====================================================
-- Widgets: Expand type CHECK Constraint
-- =====================================================
-- Purpose: Add 4 new widget types to the CHECK constraint.
--          New types: marquee, rating_badge, avatars_bar, toast_popup
-- Dependencies: widgets table (ADR-024)
-- ADR: ADR-027 (Widget Types Expansion)

-- =========================================================================
-- Drop existing 3-type constraint
-- =========================================================================

ALTER TABLE public.widgets
  DROP CONSTRAINT IF EXISTS widgets_type_check;

-- =========================================================================
-- Recreate with all 7 types
-- =========================================================================

ALTER TABLE public.widgets
  ADD CONSTRAINT widgets_type_check
  CHECK (type IN (
    'wall_of_love',
    'carousel',
    'single_quote',
    'marquee',
    'rating_badge',
    'avatars_bar',
    'toast_popup'
  ));

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

COMMENT ON COLUMN public.widgets.type IS
  'Layout type: wall_of_love (masonry grid), carousel (horizontal slider), single_quote (featured testimonial), marquee (auto-scroll strip), rating_badge (compact aggregate rating), avatars_bar (hero social proof with overlapping avatars), toast_popup (floating notification overlay)';

COMMENT ON CONSTRAINT widgets_type_check ON public.widgets IS
  'Restricts widget type to one of 7 supported layout types. Added marquee, rating_badge, avatars_bar, toast_popup in ADR-027.';
