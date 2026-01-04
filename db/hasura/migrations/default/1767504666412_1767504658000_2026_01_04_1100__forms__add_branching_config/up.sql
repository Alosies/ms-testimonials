-- =====================================================
-- Add branching_config column to forms
-- =====================================================
-- Purpose: Store conditional branching configuration
-- Schema: { enabled: boolean, threshold: number, ratingStepId: string | null }

-- Add branching_config column with JSONB
ALTER TABLE public.forms
ADD COLUMN branching_config JSONB NOT NULL DEFAULT '{"enabled": false, "threshold": 4, "ratingStepId": null}';

-- Documentation
COMMENT ON COLUMN public.forms.branching_config IS
  'Branching configuration: { enabled: boolean, threshold: number (rating cutoff), ratingStepId: string | null (step that triggers branching) }';
