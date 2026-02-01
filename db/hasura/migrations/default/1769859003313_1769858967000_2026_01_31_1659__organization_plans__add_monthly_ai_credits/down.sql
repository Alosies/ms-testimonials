-- =====================================================
-- Organization Plans: Remove monthly_ai_credits Column (Rollback)
-- =====================================================

ALTER TABLE public.organization_plans DROP COLUMN monthly_ai_credits;
