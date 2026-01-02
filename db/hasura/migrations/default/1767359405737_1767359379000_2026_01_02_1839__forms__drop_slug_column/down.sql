-- =====================================================
-- Forms: Restore Slug Column (Rollback)
-- =====================================================
-- Restores the slug column with its original constraints and index

-- Add the column back
ALTER TABLE public.forms
ADD COLUMN slug TEXT;

-- Populate slug from name for existing rows (lowercase, hyphenated)
UPDATE public.forms
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));

-- Make it NOT NULL after populating
ALTER TABLE public.forms
ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint per organization
ALTER TABLE public.forms
ADD CONSTRAINT forms_slug_per_org_unique UNIQUE (organization_id, slug);

-- Add format check constraint (lowercase alphanumeric with hyphens)
ALTER TABLE public.forms
ADD CONSTRAINT forms_slug_format CHECK (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$');

-- Recreate the index
CREATE INDEX idx_forms_slug ON public.forms(organization_id, slug);

-- Restore column comment
COMMENT ON COLUMN public.forms.slug IS 'URL-friendly identifier for public form link (/f/{slug}). Lowercase alphanumeric with hyphens';
