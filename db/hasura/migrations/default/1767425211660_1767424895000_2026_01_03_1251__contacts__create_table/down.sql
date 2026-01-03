-- =====================================================
-- Contacts Table Rollback
-- =====================================================
-- Removes the contacts table and all associated objects

-- Remove the updated_at trigger first
SELECT remove_updated_at_trigger('contacts', 'public');

-- Drop indexes
DROP INDEX IF EXISTS public.idx_contacts_last_seen_at;
DROP INDEX IF EXISTS public.idx_contacts_email;
DROP INDEX IF EXISTS public.idx_contacts_organization_id;

-- Drop table (CASCADE handles foreign key constraints)
DROP TABLE IF EXISTS public.contacts CASCADE;
