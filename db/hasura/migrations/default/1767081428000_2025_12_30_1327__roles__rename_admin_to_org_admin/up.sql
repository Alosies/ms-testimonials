-- =====================================================
-- Rename admin role to org_admin
-- =====================================================
-- Purpose: Avoid conflict with Hasura's reserved 'admin' role
-- The database role 'admin' is renamed to 'org_admin' for use in Hasura permissions

UPDATE public.roles
SET
    unique_name = 'org_admin',
    name = 'Organization Admin',
    description = 'Full access to forms, testimonials, widgets, and members. No billing access.'
WHERE unique_name = 'admin';
