-- =====================================================
-- Rollback: Rename org_admin back to admin
-- =====================================================

UPDATE public.roles
SET
    unique_name = 'admin',
    name = 'Admin',
    description = 'Full access to forms, testimonials, widgets, and members. No billing access.'
WHERE unique_name = 'org_admin';
