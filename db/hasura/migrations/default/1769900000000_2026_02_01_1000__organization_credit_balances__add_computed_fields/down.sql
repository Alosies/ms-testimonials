-- Drop computed field wrapper functions
DROP FUNCTION IF EXISTS public.ocb_available_credits(public.organization_credit_balances);
DROP FUNCTION IF EXISTS public.ocb_spendable_credits(public.organization_credit_balances);
DROP FUNCTION IF EXISTS public.ocb_used_this_period(public.organization_credit_balances);
