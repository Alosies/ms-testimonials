-- =====================================================
-- Form Submissions: Add consent_type Column
-- =====================================================
-- Purpose: Captures the customer's consent choice from the consent step
--          in the public form flow. Determines whether the testimonial
--          can be displayed publicly or is restricted to private use.
-- Dependencies: form_submissions table

-- =========================================================================
-- Add Column
-- =========================================================================

-- Consent type chosen by the customer during the consent step.
-- NULL when submission predates this column or form has no consent step.
-- 'public' = customer agrees to public display on widgets.
-- 'private' = customer restricts usage to internal/private purposes.
ALTER TABLE public.form_submissions
    ADD COLUMN consent_type TEXT;

-- =========================================================================
-- Constraints
-- =========================================================================

-- Restrict to known consent values.
ALTER TABLE public.form_submissions
    ADD CONSTRAINT chk_form_submissions_consent_type
    CHECK (consent_type IN ('public', 'private'));

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

COMMENT ON COLUMN public.form_submissions.consent_type IS
  'Consent choice from the form consent step. ''public'' allows testimonial display on widgets; ''private'' restricts to internal use. NULL when form has no consent step or for legacy submissions.';

COMMENT ON CONSTRAINT chk_form_submissions_consent_type ON public.form_submissions IS
  'Ensures consent_type is either ''public'' or ''private''. NULL is allowed for forms without a consent step.';
