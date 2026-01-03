-- =====================================================
-- Form Submissions: Add Contact Reference
-- =====================================================
-- Purpose: Links form submissions to normalized contact records.
--          Enables contact-centric views of testimonial activity and
--          deduplication of submitter information across multiple submissions.
-- Dependencies: contacts table must exist

-- Add contact_id column to form_submissions
-- This creates a link from each submission to the normalized contact record.
-- NULL is allowed for historical submissions created before contacts table existed.
ALTER TABLE public.form_submissions
    ADD COLUMN contact_id TEXT;

-- Foreign key: Link to contacts table (set null if contact deleted, preserve submission)
ALTER TABLE public.form_submissions
    ADD CONSTRAINT fk_form_submissions_contact_id
    FOREIGN KEY (contact_id) REFERENCES public.contacts(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Index for efficient joins and queries by contact
CREATE INDEX idx_form_submissions_contact_id ON public.form_submissions(contact_id);

-- Column documentation
COMMENT ON COLUMN public.form_submissions.contact_id IS 'Foreign key to contacts table. Links this submission to a normalized contact record for deduplication and contact management. NULL for legacy submissions or anonymous submissions.';
