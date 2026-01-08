-- =====================================================
-- Organizations: Drop deprecated logo_url column
-- =====================================================
-- Purpose: Remove the deprecated logo_url column now that organizations
--          use the logo_id FK relationship to the media table.
--          The logo relationship provides full media metadata (storage_path,
--          dimensions, mime_type, status).

-- Drop the deprecated column
ALTER TABLE public.organizations
    DROP COLUMN IF EXISTS logo_url;
