-- =====================================================
-- Rollback: Remove monthly_ai_credits column from plans table
-- =====================================================

ALTER TABLE public.plans DROP COLUMN monthly_ai_credits;
