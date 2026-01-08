-- =====================================================
-- Organizations: Restore logo_url column (Rollback)
-- =====================================================
-- Note: This restores the column but NOT the data. If you need the data,
-- you must restore from backup or derive from media.storage_path.

-- Restore the column
ALTER TABLE public.organizations
    ADD COLUMN logo_url TEXT;

-- Documentation
COMMENT ON COLUMN public.organizations.logo_url IS
'DEPRECATED: Organization logo image URL. Use logo_id and the logo relationship instead.';
