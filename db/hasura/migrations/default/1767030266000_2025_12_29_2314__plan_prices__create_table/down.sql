-- =====================================================
-- Plan Prices Table Rollback
-- =====================================================

SELECT remove_updated_at_trigger('plan_prices', 'public');

DROP INDEX IF EXISTS public.idx_plan_prices_currency;
DROP INDEX IF EXISTS public.idx_plan_prices_plan;

DROP TABLE IF EXISTS public.plan_prices CASCADE;
