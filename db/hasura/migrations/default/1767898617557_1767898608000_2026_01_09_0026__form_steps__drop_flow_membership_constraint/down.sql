-- =====================================================
-- Restore flow_membership CHECK Constraint
-- =====================================================
-- Rollback: Re-add the 3-value constraint on flow_membership
--
-- WARNING: This will fail if any rows have values other than
--          'shared', 'testimonial', or 'improvement'.
--          Clean up invalid data before running this rollback:
--
--          UPDATE public.form_steps
--          SET flow_membership = 'shared'
--          WHERE flow_membership NOT IN ('shared', 'testimonial', 'improvement');

-- =========================================================================
-- Restore Constraint
-- =========================================================================

-- Re-add the CHECK constraint
ALTER TABLE public.form_steps
ADD CONSTRAINT chk_form_steps_flow_membership
CHECK (flow_membership IN ('shared', 'testimonial', 'improvement'));

-- =========================================================================
-- Documentation
-- =========================================================================

-- Restore original column comment
COMMENT ON COLUMN public.form_steps.flow_membership IS
  'Which flow this step belongs to: shared (all paths), testimonial (positive rating), or improvement (negative rating)';
