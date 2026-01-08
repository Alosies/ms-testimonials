-- =====================================================
-- Drop flow_membership CHECK Constraint
-- =====================================================
-- Purpose: Remove the 3-value constraint on flow_membership to enable
--          N-way branching support (NPS 3-way, custom flows, etc.)
--
-- Context:
--   - flow_membership was originally constrained to: 'shared', 'testimonial', 'improvement'
--   - With the flows table (ADR-009), flow_id is now the source of truth
--   - flow_membership is deprecated and will be derived from flow.flow_type
--   - Removing this constraint allows the column to hold any value during transition
--   - Eventually, flow_membership column will be dropped entirely
--
-- N-Way Branching Examples:
--   - NPS: 'promoters', 'passives', 'detractors'
--   - Custom: 'premium_users', 'free_users'
--   - Boolean: 'feature_used', 'feature_not_used'
--
-- Dependencies: form_steps table

-- =========================================================================
-- Drop Constraint
-- =========================================================================

-- Drop the CHECK constraint that limits to 3 values
ALTER TABLE public.form_steps
DROP CONSTRAINT IF EXISTS chk_form_steps_flow_membership;

-- =========================================================================
-- Documentation
-- =========================================================================

-- Update column comment to reflect deprecated status
COMMENT ON COLUMN public.form_steps.flow_membership IS
  'DEPRECATED: Legacy flow membership column. Use flow_id instead. This column will be removed in a future migration. Values are no longer constrained - any string is allowed during transition.';
