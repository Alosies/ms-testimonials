-- =====================================================
-- Organizations: Add logo_id Foreign Key
-- =====================================================
-- Purpose: Link organizations to their current logo in the media table.
--          This replaces the legacy logo_url string field with a proper
--          relationship, enabling access to full media metadata (dimensions,
--          status, mime_type, etc.)
-- Dependencies: media table

-- Add logo_id column (nullable - orgs may not have a logo)
ALTER TABLE public.organizations
    ADD COLUMN logo_id TEXT;

-- Add foreign key constraint to media table
-- ON DELETE SET NULL: If media record is deleted, logo_id becomes NULL
ALTER TABLE public.organizations
    ADD CONSTRAINT fk_organizations_logo_id
    FOREIGN KEY (logo_id) REFERENCES public.media(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Index for efficient FK lookups and joins
CREATE INDEX idx_organizations_logo_id ON public.organizations(logo_id);

-- Documentation
COMMENT ON COLUMN public.organizations.logo_id IS
'Reference to the current organization logo in the media table.
 When a new logo is uploaded and reaches "ready" status, this field
 is updated to point to the new media record. The logo relationship
 provides access to storage_path, dimensions, mime_type, and status.
 NULL means no logo is set.';
