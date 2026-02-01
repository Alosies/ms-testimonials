-- =====================================================
-- Seed: Plan Capability Model Mappings
-- =====================================================
-- Purpose: Populate plan_quality_level_models junction table to link
--          plan-capability-quality combinations to specific LLM models.
-- ADR Reference: ADR-023 AI Capabilities Plan Integration
--
-- This seed populates the normalized junction table that replaces the
-- TEXT[] allowed_models column in plan_ai_capability_quality_levels.
--
-- Model Mapping Per Quality Tier:
-- - fast: openai/gpt-4o-mini, google/gemini-2.0-flash, anthropic/claude-3-5-haiku-latest
-- - enhanced: openai/gpt-4o, google/gemini-2.5-flash, anthropic/claude-sonnet-4-20250514
-- - premium: openai/gpt-4o, google/gemini-2.5-pro, anthropic/claude-sonnet-4-20250514
--
-- Business Rules:
-- - Free plan: question_generation only, fast quality only
-- - Pro plan: all capabilities, fast + enhanced quality
-- - Team plan: all capabilities, all quality levels (fast + enhanced + premium)
-- - OpenAI models are set as default (is_default = true, priority = 0)
-- - Google models are first fallback (priority = 1)
-- - Anthropic models are second fallback (priority = 2)
-- =====================================================

-- =========================================================================
-- Section 1: Verify/Ensure plan_ai_capabilities data exists
-- =========================================================================
-- The plan_ai_capabilities table should already have data from migration.
-- This section ensures idempotency by checking before inserting.

-- Free Plan: question_generation only (rate limited 10rpm/50rpd)
INSERT INTO public.plan_ai_capabilities (plan_id, ai_capability_id, is_enabled, rate_limit_rpm, rate_limit_rpd)
SELECT p.id, ac.id, true, 10, 50
FROM public.plans p
CROSS JOIN public.ai_capabilities ac
WHERE p.unique_name = 'free'
  AND ac.unique_name = 'question_generation'
  AND NOT EXISTS (
    SELECT 1 FROM public.plan_ai_capabilities pac
    WHERE pac.plan_id = p.id AND pac.ai_capability_id = ac.id
  );

-- Pro Plan: all 3 capabilities (rate limited 30rpm/500rpd)
INSERT INTO public.plan_ai_capabilities (plan_id, ai_capability_id, is_enabled, rate_limit_rpm, rate_limit_rpd)
SELECT p.id, ac.id, true, 30, 500
FROM public.plans p
CROSS JOIN public.ai_capabilities ac
WHERE p.unique_name = 'pro'
  AND NOT EXISTS (
    SELECT 1 FROM public.plan_ai_capabilities pac
    WHERE pac.plan_id = p.id AND pac.ai_capability_id = ac.id
  );

-- Team Plan: all 3 capabilities (unlimited - NULL rate limits)
INSERT INTO public.plan_ai_capabilities (plan_id, ai_capability_id, is_enabled, rate_limit_rpm, rate_limit_rpd)
SELECT p.id, ac.id, true, NULL, NULL
FROM public.plans p
CROSS JOIN public.ai_capabilities ac
WHERE p.unique_name = 'team'
  AND NOT EXISTS (
    SELECT 1 FROM public.plan_ai_capabilities pac
    WHERE pac.plan_id = p.id AND pac.ai_capability_id = ac.id
  );

-- =========================================================================
-- Section 2: Verify/Ensure plan_ai_capability_quality_levels data exists
-- =========================================================================
-- The quality level assignments should already exist from migration.
-- This section ensures idempotency by checking before inserting.

-- Free Plan: fast quality only for question_generation
INSERT INTO public.plan_ai_capability_quality_levels (plan_ai_capability_id, quality_level_id)
SELECT pac.id, ql.id
FROM public.plan_ai_capabilities pac
JOIN public.plans p ON pac.plan_id = p.id
JOIN public.ai_capabilities ac ON pac.ai_capability_id = ac.id
CROSS JOIN public.quality_levels ql
WHERE p.unique_name = 'free'
  AND ac.unique_name = 'question_generation'
  AND ql.unique_name = 'fast'
  AND NOT EXISTS (
    SELECT 1 FROM public.plan_ai_capability_quality_levels pacql
    WHERE pacql.plan_ai_capability_id = pac.id AND pacql.quality_level_id = ql.id
  );

-- Pro Plan: fast + enhanced for all capabilities
INSERT INTO public.plan_ai_capability_quality_levels (plan_ai_capability_id, quality_level_id)
SELECT pac.id, ql.id
FROM public.plan_ai_capabilities pac
JOIN public.plans p ON pac.plan_id = p.id
CROSS JOIN public.quality_levels ql
WHERE p.unique_name = 'pro'
  AND ql.unique_name IN ('fast', 'enhanced')
  AND NOT EXISTS (
    SELECT 1 FROM public.plan_ai_capability_quality_levels pacql
    WHERE pacql.plan_ai_capability_id = pac.id AND pacql.quality_level_id = ql.id
  );

-- Team Plan: all quality levels for all capabilities
INSERT INTO public.plan_ai_capability_quality_levels (plan_ai_capability_id, quality_level_id)
SELECT pac.id, ql.id
FROM public.plan_ai_capabilities pac
JOIN public.plans p ON pac.plan_id = p.id
CROSS JOIN public.quality_levels ql
WHERE p.unique_name = 'team'
  AND NOT EXISTS (
    SELECT 1 FROM public.plan_ai_capability_quality_levels pacql
    WHERE pacql.plan_ai_capability_id = pac.id AND pacql.quality_level_id = ql.id
  );

-- =========================================================================
-- Section 3: Populate plan_quality_level_models junction table
-- =========================================================================
-- This is the main purpose of this seed: link quality levels to LLM models.
-- Each quality level gets 3 models (one per provider) with priority ordering.

-- -------------------------------------------------------------------------
-- FAST Quality Tier Models
-- Models: gpt-4o-mini (default), gemini-2.0-flash, claude-3-5-haiku-latest
-- -------------------------------------------------------------------------

-- OpenAI gpt-4o-mini for all FAST quality level entries (DEFAULT, priority 0)
INSERT INTO public.plan_quality_level_models (plan_ai_capability_quality_level_id, llm_model_id, is_default, priority)
SELECT pacql.id, lm.id, true, 0
FROM public.plan_ai_capability_quality_levels pacql
JOIN public.quality_levels ql ON pacql.quality_level_id = ql.id
CROSS JOIN public.llm_models lm
WHERE ql.unique_name = 'fast'
  AND lm.unique_name = 'openai/gpt-4o-mini'
  AND NOT EXISTS (
    SELECT 1 FROM public.plan_quality_level_models pqlm
    WHERE pqlm.plan_ai_capability_quality_level_id = pacql.id AND pqlm.llm_model_id = lm.id
  );

-- Google gemini-2.0-flash for all FAST quality level entries (fallback, priority 1)
INSERT INTO public.plan_quality_level_models (plan_ai_capability_quality_level_id, llm_model_id, is_default, priority)
SELECT pacql.id, lm.id, false, 1
FROM public.plan_ai_capability_quality_levels pacql
JOIN public.quality_levels ql ON pacql.quality_level_id = ql.id
CROSS JOIN public.llm_models lm
WHERE ql.unique_name = 'fast'
  AND lm.unique_name = 'google/gemini-2.0-flash'
  AND NOT EXISTS (
    SELECT 1 FROM public.plan_quality_level_models pqlm
    WHERE pqlm.plan_ai_capability_quality_level_id = pacql.id AND pqlm.llm_model_id = lm.id
  );

-- Anthropic claude-3-5-haiku-latest for all FAST quality level entries (fallback, priority 2)
INSERT INTO public.plan_quality_level_models (plan_ai_capability_quality_level_id, llm_model_id, is_default, priority)
SELECT pacql.id, lm.id, false, 2
FROM public.plan_ai_capability_quality_levels pacql
JOIN public.quality_levels ql ON pacql.quality_level_id = ql.id
CROSS JOIN public.llm_models lm
WHERE ql.unique_name = 'fast'
  AND lm.unique_name = 'anthropic/claude-3-5-haiku-latest'
  AND NOT EXISTS (
    SELECT 1 FROM public.plan_quality_level_models pqlm
    WHERE pqlm.plan_ai_capability_quality_level_id = pacql.id AND pqlm.llm_model_id = lm.id
  );

-- -------------------------------------------------------------------------
-- ENHANCED Quality Tier Models
-- Models: gpt-4o (default), gemini-2.5-flash, claude-sonnet-4-20250514
-- -------------------------------------------------------------------------

-- OpenAI gpt-4o for all ENHANCED quality level entries (DEFAULT, priority 0)
INSERT INTO public.plan_quality_level_models (plan_ai_capability_quality_level_id, llm_model_id, is_default, priority)
SELECT pacql.id, lm.id, true, 0
FROM public.plan_ai_capability_quality_levels pacql
JOIN public.quality_levels ql ON pacql.quality_level_id = ql.id
CROSS JOIN public.llm_models lm
WHERE ql.unique_name = 'enhanced'
  AND lm.unique_name = 'openai/gpt-4o'
  AND NOT EXISTS (
    SELECT 1 FROM public.plan_quality_level_models pqlm
    WHERE pqlm.plan_ai_capability_quality_level_id = pacql.id AND pqlm.llm_model_id = lm.id
  );

-- Google gemini-2.5-flash for all ENHANCED quality level entries (fallback, priority 1)
INSERT INTO public.plan_quality_level_models (plan_ai_capability_quality_level_id, llm_model_id, is_default, priority)
SELECT pacql.id, lm.id, false, 1
FROM public.plan_ai_capability_quality_levels pacql
JOIN public.quality_levels ql ON pacql.quality_level_id = ql.id
CROSS JOIN public.llm_models lm
WHERE ql.unique_name = 'enhanced'
  AND lm.unique_name = 'google/gemini-2.5-flash'
  AND NOT EXISTS (
    SELECT 1 FROM public.plan_quality_level_models pqlm
    WHERE pqlm.plan_ai_capability_quality_level_id = pacql.id AND pqlm.llm_model_id = lm.id
  );

-- Anthropic claude-sonnet-4-20250514 for all ENHANCED quality level entries (fallback, priority 2)
INSERT INTO public.plan_quality_level_models (plan_ai_capability_quality_level_id, llm_model_id, is_default, priority)
SELECT pacql.id, lm.id, false, 2
FROM public.plan_ai_capability_quality_levels pacql
JOIN public.quality_levels ql ON pacql.quality_level_id = ql.id
CROSS JOIN public.llm_models lm
WHERE ql.unique_name = 'enhanced'
  AND lm.unique_name = 'anthropic/claude-sonnet-4-20250514'
  AND NOT EXISTS (
    SELECT 1 FROM public.plan_quality_level_models pqlm
    WHERE pqlm.plan_ai_capability_quality_level_id = pacql.id AND pqlm.llm_model_id = lm.id
  );

-- -------------------------------------------------------------------------
-- PREMIUM Quality Tier Models
-- Models: gpt-4o (default), gemini-2.5-pro, claude-sonnet-4-20250514
-- Note: Premium tier uses gemini-2.5-pro instead of gemini-2.5-flash
-- -------------------------------------------------------------------------

-- OpenAI gpt-4o for all PREMIUM quality level entries (DEFAULT, priority 0)
INSERT INTO public.plan_quality_level_models (plan_ai_capability_quality_level_id, llm_model_id, is_default, priority)
SELECT pacql.id, lm.id, true, 0
FROM public.plan_ai_capability_quality_levels pacql
JOIN public.quality_levels ql ON pacql.quality_level_id = ql.id
CROSS JOIN public.llm_models lm
WHERE ql.unique_name = 'premium'
  AND lm.unique_name = 'openai/gpt-4o'
  AND NOT EXISTS (
    SELECT 1 FROM public.plan_quality_level_models pqlm
    WHERE pqlm.plan_ai_capability_quality_level_id = pacql.id AND pqlm.llm_model_id = lm.id
  );

-- Google gemini-2.5-pro for all PREMIUM quality level entries (fallback, priority 1)
INSERT INTO public.plan_quality_level_models (plan_ai_capability_quality_level_id, llm_model_id, is_default, priority)
SELECT pacql.id, lm.id, false, 1
FROM public.plan_ai_capability_quality_levels pacql
JOIN public.quality_levels ql ON pacql.quality_level_id = ql.id
CROSS JOIN public.llm_models lm
WHERE ql.unique_name = 'premium'
  AND lm.unique_name = 'google/gemini-2.5-pro'
  AND NOT EXISTS (
    SELECT 1 FROM public.plan_quality_level_models pqlm
    WHERE pqlm.plan_ai_capability_quality_level_id = pacql.id AND pqlm.llm_model_id = lm.id
  );

-- Anthropic claude-sonnet-4-20250514 for all PREMIUM quality level entries (fallback, priority 2)
INSERT INTO public.plan_quality_level_models (plan_ai_capability_quality_level_id, llm_model_id, is_default, priority)
SELECT pacql.id, lm.id, false, 2
FROM public.plan_ai_capability_quality_levels pacql
JOIN public.quality_levels ql ON pacql.quality_level_id = ql.id
CROSS JOIN public.llm_models lm
WHERE ql.unique_name = 'premium'
  AND lm.unique_name = 'anthropic/claude-sonnet-4-20250514'
  AND NOT EXISTS (
    SELECT 1 FROM public.plan_quality_level_models pqlm
    WHERE pqlm.plan_ai_capability_quality_level_id = pacql.id AND pqlm.llm_model_id = lm.id
  );

-- =========================================================================
-- Verification Queries (for manual inspection after seed)
-- =========================================================================
-- Run these queries to verify the seed was applied correctly:
--
-- 1. Check plan_ai_capabilities count (should be 7):
--    SELECT COUNT(*) FROM plan_ai_capabilities;
--
-- 2. Check plan_ai_capability_quality_levels count (should be 16):
--    SELECT COUNT(*) FROM plan_ai_capability_quality_levels;
--
-- 3. Check plan_quality_level_models count (should be 48 = 16 quality levels * 3 models each):
--    SELECT COUNT(*) FROM plan_quality_level_models;
--
-- 4. Verify model distribution per quality level:
--    SELECT ql.unique_name as quality, COUNT(DISTINCT pqlm.llm_model_id) as model_count
--    FROM plan_quality_level_models pqlm
--    JOIN plan_ai_capability_quality_levels pacql ON pqlm.plan_ai_capability_quality_level_id = pacql.id
--    JOIN quality_levels ql ON pacql.quality_level_id = ql.id
--    GROUP BY ql.unique_name;
--
-- 5. Full breakdown by plan/capability/quality/model:
--    SELECT p.unique_name as plan, ac.unique_name as capability, ql.unique_name as quality,
--           lm.unique_name as model, pqlm.is_default, pqlm.priority
--    FROM plan_quality_level_models pqlm
--    JOIN plan_ai_capability_quality_levels pacql ON pqlm.plan_ai_capability_quality_level_id = pacql.id
--    JOIN plan_ai_capabilities pac ON pacql.plan_ai_capability_id = pac.id
--    JOIN plans p ON pac.plan_id = p.id
--    JOIN ai_capabilities ac ON pac.ai_capability_id = ac.id
--    JOIN quality_levels ql ON pacql.quality_level_id = ql.id
--    JOIN llm_models lm ON pqlm.llm_model_id = lm.id
--    ORDER BY p.unique_name, ac.unique_name, ql.display_order, pqlm.priority;
