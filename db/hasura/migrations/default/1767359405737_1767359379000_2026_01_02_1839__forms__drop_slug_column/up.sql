-- =====================================================
-- Forms: Drop Slug Column
-- =====================================================
-- Purpose: Remove user-controlled slug in favor of name_id URL pattern
-- Reference: ADR-005 - Public Form URL Strategy
--
-- The slug column is being removed because:
-- 1. Public form URLs will use /f/{name}_{id} pattern (like Notion)
-- 2. ID guarantees global uniqueness without conflicts
-- 3. No user decision needed - system auto-generates from name + id
-- 4. Simpler schema with fewer constraints to manage

-- Drop the index first
DROP INDEX IF EXISTS public.idx_forms_slug;

-- Drop constraints (unique constraint drops automatically with column,
-- but explicitly dropping for clarity)
ALTER TABLE public.forms
DROP CONSTRAINT IF EXISTS forms_slug_per_org_unique;

ALTER TABLE public.forms
DROP CONSTRAINT IF EXISTS forms_slug_format;

-- Drop the column
ALTER TABLE public.forms
DROP COLUMN IF EXISTS slug;
