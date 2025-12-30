-- =====================================================
-- Organizations: Add setup_status Column
-- =====================================================
-- Purpose: Track whether auto-created organizations need user configuration
-- Related: ADR-002 Organization Setup Status Tracking

-- Create enum type for setup status
CREATE TYPE public.organization_setup_status AS ENUM (
  'pending_setup',  -- Auto-created, needs user configuration
  'completed'       -- User has configured the organization
);

-- Add column to organizations table
ALTER TABLE public.organizations
ADD COLUMN setup_status public.organization_setup_status
NOT NULL DEFAULT 'completed';

-- Documentation
COMMENT ON COLUMN public.organizations.setup_status IS
'Organization configuration state: pending_setup for auto-created orgs, completed after user setup';
