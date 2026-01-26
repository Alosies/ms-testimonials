-- =====================================================
-- Form Steps: Remove testimonial_write step type (Rollback)
-- =====================================================
-- WARNING: This will fail if any form_steps have step_type = 'testimonial_write'
-- Delete those rows first before rolling back.

-- Revert the step_type CHECK constraint to exclude 'testimonial_write'
ALTER TABLE public.form_steps DROP CONSTRAINT form_steps_step_type_check;

ALTER TABLE public.form_steps ADD CONSTRAINT form_steps_step_type_check
CHECK (step_type IN (
    'welcome', 'question', 'rating', 'consent',
    'contact_info', 'reward', 'thank_you'
));

-- Revert column comment
COMMENT ON COLUMN public.form_steps.step_type IS 'Enumerated type determining step behavior: welcome (intro screen), question (text input), rating (star/scale), consent (public/private choice), contact_info (submitter details), reward (incentive), thank_you (completion).';

-- Revert table comment
COMMENT ON TABLE public.form_steps IS 'Stores step configuration per form for the timeline editor. Each step represents a screen in the testimonial collection flow (welcome, questions, consent, contact info, reward, thank you).';
