-- =====================================================
-- Credit Topup Packages Rollback
-- =====================================================

DROP INDEX IF EXISTS public.idx_credit_topup_packages_active_order;

DROP TABLE IF EXISTS public.credit_topup_packages CASCADE;
