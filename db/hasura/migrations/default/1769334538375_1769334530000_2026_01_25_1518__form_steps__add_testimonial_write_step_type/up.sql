-- =====================================================
-- Form Steps: Add testimonial_write step type
-- =====================================================
-- Purpose: Add support for testimonial writing step (PRD-005).
--          This step type enables customers to write their testimonial
--          either manually or with AI assistance.
-- Dependencies: form_steps table

-- Drop and recreate the step_type CHECK constraint to include 'testimonial_write'
ALTER TABLE public.form_steps DROP CONSTRAINT form_steps_step_type_check;

ALTER TABLE public.form_steps ADD CONSTRAINT form_steps_step_type_check
CHECK (step_type IN (
    'welcome', 'question', 'rating', 'consent',
    'contact_info', 'reward', 'thank_you', 'testimonial_write'
));

-- Update column comment to reflect new step type
COMMENT ON COLUMN public.form_steps.step_type IS 'Enumerated type determining step behavior: welcome (intro screen), question (text input), rating (star/scale), consent (public/private choice), contact_info (submitter details), reward (incentive), thank_you (completion), testimonial_write (manual or AI-assisted testimonial composition).';

-- Update table comment
COMMENT ON TABLE public.form_steps IS 'Stores step configuration per form for the timeline editor. Each step represents a screen in the testimonial collection flow (welcome, questions, consent, contact info, reward, testimonial writing, thank you).';
