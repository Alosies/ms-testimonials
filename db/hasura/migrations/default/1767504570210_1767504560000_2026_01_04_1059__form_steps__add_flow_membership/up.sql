-- =====================================================
-- Add flow_membership column to form_steps
-- =====================================================
-- Purpose: Enable conditional branching by assigning steps to flows
-- Values: 'shared' (all paths), 'testimonial' (positive), 'improvement' (negative)

-- Add flow_membership column with default 'shared'
ALTER TABLE public.form_steps
ADD COLUMN flow_membership TEXT NOT NULL DEFAULT 'shared';

-- Add check constraint for valid values
ALTER TABLE public.form_steps
ADD CONSTRAINT chk_form_steps_flow_membership
CHECK (flow_membership IN ('shared', 'testimonial', 'improvement'));

-- Add index for filtering by flow
CREATE INDEX idx_form_steps_flow_membership
ON public.form_steps(form_id, flow_membership);

-- Documentation
COMMENT ON COLUMN public.form_steps.flow_membership IS
  'Which flow this step belongs to: shared (all paths), testimonial (positive rating), or improvement (negative rating)';
