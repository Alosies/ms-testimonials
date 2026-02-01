-- =====================================================
-- Quality Levels Table Rollback
-- =====================================================
-- Purpose: Reverses the quality_levels table creation
-- ADR Reference: ADR-023 AI Capabilities Plan Integration

-- Drop indexes first
DROP INDEX IF EXISTS public.idx_quality_levels_unique_name;
DROP INDEX IF EXISTS public.idx_quality_levels_display_order;
DROP INDEX IF EXISTS public.idx_quality_levels_is_active;

-- Drop the table (CASCADE handles any dependent constraints)
DROP TABLE IF EXISTS public.quality_levels CASCADE;
