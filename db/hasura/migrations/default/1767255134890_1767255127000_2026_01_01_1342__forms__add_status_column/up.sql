-- =====================================================
-- Forms: Add Status Column
-- =====================================================
-- Purpose: Add lifecycle status to forms (draft, published, archived)
-- Used for: Eager draft creation, publish workflow

-- Add status column with check constraint
ALTER TABLE public.forms
ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'
CONSTRAINT chk_forms_status CHECK (status IN ('draft', 'published', 'archived'));

-- Create index for efficient filtering by status within organization
CREATE INDEX idx_forms_organization_status ON public.forms(organization_id, status);

-- Documentation
COMMENT ON COLUMN public.forms.status IS 'Form lifecycle status: draft (editing), published (public), archived (hidden)';
