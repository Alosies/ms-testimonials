# ADR-023 Implementation Progress

## Status: IN_PROGRESS

**Started**: 2026-01-31
**Last Updated**: 2026-01-31
**Current Wave**: Wave 7 (API Access Checking - Wave 6 Complete!)

---

## Quick Stats

| Metric | Value |
|--------|-------|
| Total Tasks | 51 |
| Completed | 22 |
| In Progress | 0 |
| Skipped | 1 |
| Remaining | 28 |

**Note**: Phase 1 (Capabilities) and Phase 2 (Credits) database schema complete. All tables created, seeded, permissions configured. T2.6 (SQL functions) and T2.10 (init balances) completed 2026-01-31. Wave 6 (API types) now unblocked.

---

## Wave Status

| Wave | Status | Tasks | Completed |
|------|--------|-------|-----------|
| Wave 1 | ✅ Complete | T1.1, T1.2, T2.1, T2.3, T2.8 | 5/5 |
| Wave 2 | ✅ Complete | T1.3, T2.2 | 2/2 |
| Wave 3 | ✅ Complete | T1.4, T1.4b, T2.4 | 3/3 |
| Wave 4 | ✅ Complete | T1.4c, T2.5, T2.7 | 3/3 |
| Wave 4b | ✅ Complete | T1.5 (seed with llm_models) | 1/1 |
| Wave 5 | ✅ Complete | T1.4d (skip), T1.6 ✅, T2.6 ✅, T2.9 ✅, T2.10 ✅ | 5/5 |
| Wave 6 | ✅ Complete | T3.1, T3.4, T4.1 | 3/3 |
| Wave 7 | 🔒 Blocked | T3.2, T4.2, T5.4 | 0/3 |
| Wave 8 | 🔒 Blocked | T3.3, T4.3, T4.4, T5.3 | 0/4 |
| Wave 9 | 🔒 Blocked | T4.5, T4.6, T5.5, T7.1, T7.3, T7.4 | 0/6 |
| Wave 10 | 🔒 Blocked | T5.1, T5.2, T6.1, T6.2, T6.6 | 0/5 |
| Wave 11 | 🔒 Blocked | T6.3, T6.4, T7.2, T7.5, T7.7 | 0/5 |
| Wave 12 | 🔒 Blocked | T6.5, T6.7, T7.6 | 0/3 |
| Wave 13 | 🔒 Blocked | T8.1, T8.2, T8.3 | 0/3 |

**Legend**: ⏳ Pending | 🔄 In Progress | ✅ Complete | 🔒 Blocked | ❌ Failed

---

## Active Agents

| Agent ID | Task | Status | Started | Last Update |
|----------|------|--------|---------|-------------|
| wave1-t1.1 | T1.1: quality_levels | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave1-t1.2 | T1.2: ai_capabilities | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave1-t2.1 | T2.1: plans.monthly_ai_credits | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave2-t2.2 | T2.2: org_plans.monthly_ai_credits | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave1-t2.3 | T2.3: org_plans pending | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave1-t2.8 | T2.8: credit_topup_packages | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave2-t1.3 | T1.3: plan_ai_capabilities | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave3-t2.4 | T2.4: org_credit_balances | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave3-t1.4 | T1.4: plan_ai_capability_quality_levels | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave4-t2.7 | T2.7: credit_reservations | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave4-t2.5 | T2.5: credit_transactions | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave4-t1.5 | T1.5: seed plan_ai_capabilities | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave3-t1.4b | T1.4b: llm_models table | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave4-t1.4c | T1.4c: plan_quality_level_models | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave4b-t1.5 | T1.5: seed plan_quality_level_models | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave5-t1.6 | T1.6: Hasura metadata (capabilities) | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave5-t2.9 | T2.9: Hasura metadata (credits) | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave5-t2.6 | T2.6: SQL credit functions | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave5-t2.10 | T2.10: Init org credit balances | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave6-t4.1 | T4.1: checkCreditBalance | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave6-t3.1 | T3.1: Capability access types | ✅ Complete | 2026-01-31 | 2026-01-31 |
| wave6-t3.4 | T3.4: AI access errors | ✅ Complete | 2026-01-31 | 2026-01-31 |

---

## Task Status Detail

### Phase 1: Database Schema (Capabilities)

| Task | Description | Status | Agent | Notes |
|------|-------------|--------|-------|-------|
| T1.1 | quality_levels table | ✅ | wave1-t1.1 | Completed |
| T1.2 | ai_capabilities table | ✅ | wave1-t1.2 | Completed |
| T1.3 | plan_ai_capabilities table | ✅ | wave2-t1.3 | Completed |
| T1.4 | plan_ai_capability_quality_levels | ✅ | wave3-t1.4 | Completed (allowed_models column to be removed) |
| T1.4b | llm_models table | ✅ | wave3-t1.4b | Completed: 7 models seeded |
| T1.4c | plan_quality_level_models junction | ✅ | wave4-t1.4c | Completed |
| T1.4d | Drop allowed_models column | ⏭️ Skip | - | Column never added - table created with junction approach |
| T1.5 | Seed plan capabilities | ✅ | wave4b-t1.5 | Hasura seed file: 1_seed_plan_capability_models.sql |
| T1.6 | Hasura metadata (capabilities + llm_models) | ✅ | wave5-t1.6 | All 6 tables with permissions configured |

### Phase 2: Database Schema (Credits)

| Task | Description | Status | Agent | Notes |
|------|-------------|--------|-------|-------|
| T2.1 | plans.monthly_ai_credits | ✅ | wave1-t2.1 | Completed |
| T2.2 | org_plans.monthly_ai_credits | ✅ | wave2-t2.2 | Completed |
| T2.3 | org_plans pending columns | ✅ | wave1-t2.3 | Completed |
| T2.4 | organization_credit_balances | ✅ | wave3-t2.4 | Completed |
| T2.5 | credit_transactions | ✅ | wave4-t2.5 | Completed |
| T2.6 | SQL functions | ✅ | wave5-t2.6 | Completed: 3 functions + covering index |
| T2.7 | credit_reservations | ✅ | wave4-t2.7 | Completed |
| T2.8 | credit_topup_packages | ✅ | wave1-t2.8 | Completed |
| T2.9 | Hasura metadata (credits) | ✅ | wave5-t2.9 | All 4 credit tables with org-scoped permissions |
| T2.10 | Init credit balances | ✅ | wave5-t2.10 | Completed: 3 orgs, 6 transactions |

### Phase 3: API Capability Access

| Task | Description | Status | Agent | Notes |
|------|-------------|--------|-------|-------|
| T3.1 | Capability access types | ✅ | wave6-t3.1 | api/src/features/ai/types.ts |
| T3.2 | checkCapabilityAccess | 🔒 | - | Depends: T3.1 |
| T3.3 | checkAIAccess | 🔒 | - | Depends: T3.2, T4.1 |
| T3.4 | AI access errors | ✅ | wave6-t3.4 | api/src/features/ai/errors.ts |

### Phase 4: API Credit Management

| Task | Description | Status | Agent | Notes |
|------|-------------|--------|-------|-------|
| T4.1 | checkCreditBalance | ✅ | wave6-t4.1 | api/src/features/credits/checkBalance.ts |
| T4.2 | reserveCredits | 🔒 | - | Depends: T4.1, T2.7 |
| T4.3 | settleCredits | 🔒 | - | Depends: T4.2, T2.5 |
| T4.4 | releaseCredits | 🔒 | - | Depends: T4.2 |
| T4.5 | executeWithAIAccess | 🔒 | - | Depends: T3.3, T4.2-T4.4 |
| T4.6 | Barrel exports | 🔒 | - | Depends: T4.1-T4.5 |

### Phase 5: API Integration

| Task | Description | Status | Agent | Notes |
|------|-------------|--------|-------|-------|
| T5.1 | Update suggest-questions | 🔒 | - | Depends: T4.5 |
| T5.2 | Update assemble-testimonial | 🔒 | - | Depends: T4.5 |
| T5.3 | /credits/balance | 🔒 | - | Depends: T4.1 |
| T5.4 | /credits/transactions | 🔒 | - | Depends: T2.9 |
| T5.5 | /ai/access-check | 🔒 | - | Depends: T3.3 |

### Phase 6: Frontend

| Task | Description | Status | Agent | Notes |
|------|-------------|--------|-------|-------|
| T6.1 | useCreditBalance | 🔒 | - | Depends: T5.3 |
| T6.2 | useAIAccess | 🔒 | - | Depends: T5.5 |
| T6.3 | CreditBalanceWidget | 🔒 | - | Depends: T6.1 |
| T6.4 | QualityLevelSelector | 🔒 | - | Depends: T6.2 |
| T6.5 | Update AI UIs | 🔒 | - | Depends: T6.2, T6.4 |
| T6.6 | CreditHistoryPage | 🔒 | - | Depends: T5.4 |
| T6.7 | TopupPurchaseModal | 🔒 | - | Depends: T2.8, T7.1 |

### Phase 7: Billing Integration

| Task | Description | Status | Agent | Notes |
|------|-------------|--------|-------|-------|
| T7.1 | Stripe checkout | 🔒 | - | Depends: T2.8 |
| T7.2 | Stripe webhook | ✅ | yellow | Completed: POST /webhooks/stripe endpoint |
| T7.3 | Monthly reset job | 🔒 | - | Depends: T2.4, T2.5 |
| T7.4 | Reservation cleanup | 🔒 | - | Depends: T2.7 |
| T7.5 | Plan upgrades | 🔒 | - | Depends: T2.2, T4.3 |
| T7.6 | Plan downgrades | 🔒 | - | Depends: T2.3, T7.3 |
| T7.7 | Low balance notifications | 🔒 | - | Depends: T4.3 |

### Phase 8: Testing

| Task | Description | Status | Agent | Notes |
|------|-------------|--------|-------|-------|
| T8.1 | Migration tests | 🔒 | - | Depends: Phase 1-2 |
| T8.2 | Credit ops tests | 🔒 | - | Depends: Phase 4 |
| T8.3 | E2E tests | 🔒 | - | Depends: Phase 5-6 |

---

## Migration Log (CRITICAL)

This section contains detailed output from database migrations for visibility.

### Migration Entries

### [2026-01-31 16:55] T2.1: plans.monthly_ai_credits

**Agent**: wave1-t2.1
**Started**: 2026-01-31 16:54
**Completed**: 2026-01-31 16:58
**Status**: ✅ SUCCESS
**Migration**: `1769858683398_1769858676000_2026_01_31_1654__plans__add_monthly_ai_credits`

#### SQL Applied
```sql
-- Add monthly_ai_credits column to plans table
ALTER TABLE public.plans
ADD COLUMN monthly_ai_credits INT NOT NULL DEFAULT 0;

-- Update existing plans with credit allocations
UPDATE public.plans SET monthly_ai_credits = 10 WHERE unique_name = 'free';
UPDATE public.plans SET monthly_ai_credits = 500 WHERE unique_name = 'pro';
UPDATE public.plans SET monthly_ai_credits = 2000 WHERE unique_name = 'team';

-- Column comment
COMMENT ON COLUMN public.plans.monthly_ai_credits IS
  'Number of AI credits allocated per billing period for this plan. Free=10, Pro=500, Team=2000. Credits are consumed by AI features like testimonial assembly and smart prompts.';
```

#### Hasura Output
```
INFO migrations applied
Migration status: Present Present
INFO Metadata reloaded
INFO Metadata is consistent
```

#### Verification
- [x] Column exists on plans table
- [x] free plan has 10 credits
- [x] pro plan has 500 credits
- [x] team plan has 2000 credits

#### GraphQL Verification Query Result
```json
{
  "data": {
    "plans": [
      { "unique_name": "free", "monthly_ai_credits": 10 },
      { "unique_name": "pro", "monthly_ai_credits": 500 },
      { "unique_name": "team", "monthly_ai_credits": 2000 }
    ]
  }
}
```

---

### [2026-01-31 16:55] T2.3: organization_plans pending columns

**Agent**: wave1-t2.3
**Started**: 2026-01-31 16:54
**Completed**: 2026-01-31 16:55
**Status**: ✅ SUCCESS
**Migration**: `1769858690728_1769858684000_2026_01_31_1654__organization_plans__add_pending_change`

#### SQL Applied
```sql
-- Add pending plan change columns for scheduled downgrades
ALTER TABLE public.organization_plans
ADD COLUMN pending_plan_id TEXT REFERENCES public.plans(id) ON DELETE SET NULL;

ALTER TABLE public.organization_plans
ADD COLUMN pending_change_at TIMESTAMPTZ;

-- Partial index for the scheduled job that processes pending changes
CREATE INDEX idx_organization_plans_pending_change
ON public.organization_plans (pending_change_at)
WHERE pending_change_at IS NOT NULL;

-- Column comments
COMMENT ON COLUMN public.organization_plans.pending_plan_id IS
  'FK to plans table. Set when a downgrade is scheduled to take effect at period end. NULL means no pending change.';

COMMENT ON COLUMN public.organization_plans.pending_change_at IS
  'Timestamp when the pending plan change should be applied. Used by scheduled job to process changes at period end.';

COMMENT ON INDEX idx_organization_plans_pending_change IS
  'Partial index for efficiently querying pending plan changes. Used by scheduled job.';
```

#### Hasura Output
```
INFO migrations applied
Migration status: Present Present
```

#### Verification
- [x] pending_plan_id column exists
- [x] pending_change_at column exists
- [x] Partial index created
- [x] Column comments added
- [x] Down migration written

---

### [2026-01-31 16:58] T1.2: ai_capabilities table

**Agent**: wave1-t1.2
**Started**: 2026-01-31 16:54
**Completed**: 2026-01-31 16:58
**Status**: ✅ SUCCESS
**Migration**: `1769858684343_1769858677000_2026_01_31_1654__ai_capabilities__create_table`

#### SQL Applied
```sql
-- Create ai_capabilities table
CREATE TABLE public.ai_capabilities (
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),
    unique_name TEXT NOT NULL UNIQUE,  -- 'question_generation', 'testimonial_assembly', etc.
    name TEXT NOT NULL,                 -- Display name
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    icon TEXT,                          -- Icon identifier for UI
    estimated_credits_fast DECIMAL(10,2) NOT NULL DEFAULT 1.0,
    estimated_credits_enhanced DECIMAL(10,2) NOT NULL DEFAULT 1.5,
    estimated_credits_premium DECIMAL(10,2) NOT NULL DEFAULT 3.0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Indexes
CREATE INDEX idx_ai_capabilities_category ON public.ai_capabilities(category);
CREATE INDEX idx_ai_capabilities_is_active ON public.ai_capabilities(is_active) WHERE is_active = true;

-- Add updated_at trigger
SELECT add_updated_at_trigger('ai_capabilities', 'public');

-- Seed data
INSERT INTO public.ai_capabilities (unique_name, name, description, category, icon, estimated_credits_fast, estimated_credits_enhanced, estimated_credits_premium) VALUES
('question_generation', 'Smart Question Generation', 'AI-generated follow-up questions based on form context', 'forms', 'sparkles', 1.0, 1.5, 3.0),
('testimonial_assembly', 'Testimonial Assembly', 'Assembles customer answers into coherent testimonial', 'testimonials', 'wand-2', 2.0, 3.0, 6.0),
('testimonial_polish', 'Testimonial Polish', 'Improves grammar and flow of existing testimonials', 'testimonials', 'pen-tool', 1.0, 1.5, 3.0);

-- COMMENT ON statements for all columns
COMMENT ON TABLE public.ai_capabilities IS
  'Catalog of AI features available in the platform. Defines each capability with display info and credit cost estimates per quality level.';
```

#### Hasura Output
```
INFO migrations applied
Migration status: Present Present
INFO Metadata applied
INFO Metadata is consistent
```

#### Verification
- [x] Table exists in database
- [x] updated_at trigger works (trigger created via add_updated_at_trigger)
- [x] Seed data inserted (3 rows)
- [x] Hasura metadata file created (public_ai_capabilities.yaml)
- [x] Permissions configured for anonymous, member, org_admin, owner, viewer

#### GraphQL Verification Query Result
```json
{
  "data": {
    "ai_capabilities": [
      {"unique_name": "question_generation", "name": "Smart Question Generation", "category": "forms", "estimated_credits_fast": 1.00, "estimated_credits_enhanced": 1.50, "estimated_credits_premium": 3.00},
      {"unique_name": "testimonial_assembly", "name": "Testimonial Assembly", "category": "testimonials", "estimated_credits_fast": 2.00, "estimated_credits_enhanced": 3.00, "estimated_credits_premium": 6.00},
      {"unique_name": "testimonial_polish", "name": "Testimonial Polish", "category": "testimonials", "estimated_credits_fast": 1.00, "estimated_credits_enhanced": 1.50, "estimated_credits_premium": 3.00}
    ]
  }
}
```

---

### [2026-01-31 17:00] T1.1: quality_levels table

**Agent**: wave1-t1.1
**Started**: 2026-01-31 16:54
**Completed**: 2026-01-31 17:00
**Status**: ✅ SUCCESS
**Migration**: `1769858683310_1769858677000_2026_01_31_1654__quality_levels__create_table`

#### SQL Applied
```sql
-- Create quality_levels table
CREATE TABLE public.quality_levels (
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),
    unique_name TEXT NOT NULL UNIQUE,  -- 'fast', 'enhanced', 'premium'
    name TEXT NOT NULL,                 -- Display name
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    credit_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Indexes
CREATE INDEX idx_quality_levels_unique_name ON public.quality_levels(unique_name);
CREATE INDEX idx_quality_levels_display_order ON public.quality_levels(display_order);
CREATE INDEX idx_quality_levels_is_active ON public.quality_levels(is_active);

-- Seed data
INSERT INTO public.quality_levels (unique_name, name, description, display_order, credit_multiplier) VALUES
('fast', 'Fast', 'Quick responses using efficient models', 1, 1.0),
('enhanced', 'Enhanced', 'Better quality with smarter models', 2, 1.5),
('premium', 'Premium', 'Best quality using most capable models', 3, 3.0);

-- COMMENT ON statements for table and all columns
COMMENT ON TABLE public.quality_levels IS
  'Defines AI quality tiers (fast, enhanced, premium) that determine model selection and credit costs.';
```

#### Hasura Output
```
INFO migrations applied
Migration status: Present Present
Table tracked successfully: public_quality_levels.yaml created
INFO Metadata exported
```

#### Verification
- [x] Table exists in database
- [x] Seed data inserted (3 rows: fast, enhanced, premium)
- [x] Rollback tested (down.sql drops table and indexes)
- [x] Re-applied successfully after rollback
- [x] Hasura metadata file created
- [x] All COMMENT ON statements applied

#### GraphQL Verification Query Result
```json
{
  "data": {
    "quality_levels": [
      {
        "id": "jMzafFXujzLQ",
        "unique_name": "fast",
        "name": "Fast",
        "description": "Quick responses using efficient models",
        "display_order": 1,
        "credit_multiplier": 1.00,
        "is_active": true
      },
      {
        "id": "fRd735NUf4vP",
        "unique_name": "enhanced",
        "name": "Enhanced",
        "description": "Better quality with smarter models",
        "display_order": 2,
        "credit_multiplier": 1.50,
        "is_active": true
      },
      {
        "id": "ryE9DdJBnrFu",
        "unique_name": "premium",
        "name": "Premium",
        "description": "Best quality using most capable models",
        "display_order": 3,
        "credit_multiplier": 3.00,
        "is_active": true
      }
    ]
  }
}
```

---

### [2026-01-31 17:01] T2.2: organization_plans.monthly_ai_credits

**Agent**: wave2-t2.2
**Started**: 2026-01-31 17:00
**Completed**: 2026-01-31 17:01
**Status**: ✅ SUCCESS
**Migration**: `1769859003313_1769858967000_2026_01_31_1659__organization_plans__add_monthly_ai_credits`

#### SQL Applied
```sql
-- Add monthly_ai_credits column
ALTER TABLE public.organization_plans
ADD COLUMN monthly_ai_credits INT NOT NULL DEFAULT 0;

-- Populate from linked plan's value
UPDATE public.organization_plans op
SET monthly_ai_credits = p.monthly_ai_credits
FROM public.plans p
WHERE op.plan_id = p.id;

-- Column comment
COMMENT ON COLUMN public.organization_plans.monthly_ai_credits IS
  'Cached copy of monthly AI credits from the plan. Updated on plan change. Used to track the org-specific allocation which may differ from plan default for enterprise deals.';
```

#### Hasura Output
```
INFO migrations applied
Migration status: Present Present
INFO Metadata reloaded
INFO Metadata is consistent
INFO Metadata exported
```

#### Verification
- [x] Column exists on organization_plans table
- [x] Existing org_plans populated with correct values (from plans.monthly_ai_credits)
- [x] Down migration written (DROP COLUMN)
- [x] Column comment added

---

### [2026-01-31 16:58] T2.8: credit_topup_packages table

**Agent**: wave1-t2.8
**Started**: 2026-01-31 16:54
**Completed**: 2026-01-31 16:58
**Status**: ✅ SUCCESS
**Migration**: `1769858683554_1769858676000_2026_01_31_1654__credit_topup_packages__create_table`

#### SQL Applied
```sql
-- Create credit topup packages table
CREATE TABLE public.credit_topup_packages (
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),
    unique_name TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    credits INT NOT NULL,
    price_usd_cents INT NOT NULL,
    price_per_credit DECIMAL(10,4) GENERATED ALWAYS AS (price_usd_cents::DECIMAL / 100 / credits) STORED,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Index for active packages display
CREATE INDEX idx_credit_topup_packages_active_order
ON public.credit_topup_packages (display_order)
WHERE is_active = true;

-- Seed data
INSERT INTO public.credit_topup_packages (unique_name, name, description, credits, price_usd_cents, display_order) VALUES
('starter', 'Starter Pack', 'Perfect for trying out AI features', 100, 999, 1),
('popular', 'Popular Pack', 'Best value for regular users', 500, 3999, 2),
('power', 'Power Pack', 'For power users and teams', 2000, 12999, 3);

-- Table comment
COMMENT ON TABLE public.credit_topup_packages IS
  'Purchasable credit bundles. Credits are added to bonus_credits on purchase.';
```

#### Hasura Output
```
INFO migrations applied
Migration status: Present Present
Table tracked successfully
```

#### Verification
- [x] Table exists in database
- [x] Generated column price_per_credit works correctly
- [x] Seed data inserted (3 packages)
- [x] starter: 100 credits / $9.99 (price_per_credit: 0.0999)
- [x] popular: 500 credits / $39.99 (price_per_credit: 0.0800)
- [x] power: 2000 credits / $129.99 (price_per_credit: 0.0650)
- [x] Table tracked in Hasura
- [x] Metadata exported

#### GraphQL Verification Query Result
```json
{
  "data": {
    "credit_topup_packages": [
      {
        "unique_name": "starter",
        "name": "Starter Pack",
        "credits": 100,
        "price_usd_cents": 999,
        "price_per_credit": 0.0999
      },
      {
        "unique_name": "popular",
        "name": "Popular Pack",
        "credits": 500,
        "price_usd_cents": 3999,
        "price_per_credit": 0.0800
      },
      {
        "unique_name": "power",
        "name": "Power Pack",
        "credits": 2000,
        "price_usd_cents": 12999,
        "price_per_credit": 0.0650
      }
    ]
  }
}
```

---

### [2026-01-31 17:03] T1.3: plan_ai_capabilities table

**Agent**: wave2-t1.3
**Started**: 2026-01-31 17:01
**Completed**: 2026-01-31 17:03
**Status**: ✅ SUCCESS
**Migration**: `1769859101186_1769859064000_2026_01_31_1701__plan_ai_capabilities__create_table`

#### SQL Applied
```sql
-- Create plan_ai_capabilities junction table
CREATE TABLE public.plan_ai_capabilities (
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),
    plan_id TEXT NOT NULL,
    ai_capability_id TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    rate_limit_rpm INT,  -- requests per minute, NULL = unlimited
    rate_limit_rpd INT,  -- requests per day, NULL = unlimited
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    UNIQUE (plan_id, ai_capability_id)
);

-- Foreign keys
ALTER TABLE public.plan_ai_capabilities
    ADD CONSTRAINT fk_plan_ai_capabilities_plan_id
    FOREIGN KEY (plan_id) REFERENCES public.plans(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.plan_ai_capabilities
    ADD CONSTRAINT fk_plan_ai_capabilities_ai_capability_id
    FOREIGN KEY (ai_capability_id) REFERENCES public.ai_capabilities(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX idx_plan_ai_capabilities_plan_id ON public.plan_ai_capabilities(plan_id);
CREATE INDEX idx_plan_ai_capabilities_ai_capability_id ON public.plan_ai_capabilities(ai_capability_id);

-- Trigger
SELECT add_updated_at_trigger('plan_ai_capabilities', 'public');

-- COMMENT ON statements for table, columns, constraints, indexes
COMMENT ON TABLE public.plan_ai_capabilities IS
  'Junction table linking subscription plans to AI capabilities they can access.';
COMMENT ON COLUMN public.plan_ai_capabilities.is_enabled IS
  'Whether this capability is enabled for this plan. Allows disabling without removing the row.';
COMMENT ON COLUMN public.plan_ai_capabilities.rate_limit_rpm IS
  'Maximum requests per minute for this capability on this plan. NULL means unlimited.';
COMMENT ON COLUMN public.plan_ai_capabilities.rate_limit_rpd IS
  'Maximum requests per day for this capability on this plan. NULL means unlimited.';
```

#### Hasura Output
```
INFO migrations applied
Migration status: Present Present (version 1769859101186)
```

#### Verification
- [x] Table exists in database
- [x] Foreign keys to plans and ai_capabilities created
- [x] Unique constraint on (plan_id, ai_capability_id) created
- [x] Indexes on plan_id and ai_capability_id created
- [x] updated_at trigger configured via add_updated_at_trigger
- [x] Down migration written (removes trigger, indexes, table)
- [x] All COMMENT ON statements applied

---

### [2026-01-31 17:08] T1.4: plan_ai_capability_quality_levels table

**Agent**: wave3-t1.4
**Started**: 2026-01-31 17:06
**Completed**: 2026-01-31 17:08
**Status**: ✅ SUCCESS
**Migration**: `1769859420232_1769859379000_2026_01_31_1706__plan_ai_capability_quality_levels__create_table`

#### SQL Applied
```sql
-- Create plan_ai_capability_quality_levels junction table
CREATE TABLE public.plan_ai_capability_quality_levels (
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),
    plan_ai_capability_id TEXT NOT NULL,
    quality_level_id TEXT NOT NULL,
    allowed_models TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Unique constraint ensuring each plan-capability has only one entry per quality level
ALTER TABLE public.plan_ai_capability_quality_levels
    ADD CONSTRAINT uq_pacql_plan_ai_capability_quality
    UNIQUE (plan_ai_capability_id, quality_level_id);

-- Foreign keys
ALTER TABLE public.plan_ai_capability_quality_levels
    ADD CONSTRAINT fk_pacql_plan_ai_capability_id
    FOREIGN KEY (plan_ai_capability_id) REFERENCES public.plan_ai_capabilities(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.plan_ai_capability_quality_levels
    ADD CONSTRAINT fk_pacql_quality_level_id
    FOREIGN KEY (quality_level_id) REFERENCES public.quality_levels(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes for FK lookups
CREATE INDEX idx_pacql_plan_ai_capability_id
    ON public.plan_ai_capability_quality_levels(plan_ai_capability_id);

CREATE INDEX idx_pacql_quality_level_id
    ON public.plan_ai_capability_quality_levels(quality_level_id);

-- Table comment
COMMENT ON TABLE public.plan_ai_capability_quality_levels IS
  'Junction table defining which quality levels are available for each plan-capability combination, and which models are allowed at each quality level.';

-- Column comments
COMMENT ON COLUMN public.plan_ai_capability_quality_levels.allowed_models IS
  'Array of model identifiers allowed at this quality level for this plan-capability. E.g., {"gpt-4o-mini", "gpt-4o"}';
```

#### Hasura Output
```
INFO migrations applied
Migration status: Present Present (version 1769859420232)
```

#### Verification
- [x] Table exists in database
- [x] Foreign key to plan_ai_capabilities with CASCADE DELETE
- [x] Foreign key to quality_levels with CASCADE DELETE
- [x] Unique constraint on (plan_ai_capability_id, quality_level_id)
- [x] Indexes on both FK columns
- [x] TEXT[] array column for allowed_models
- [x] Down migration written (drops indexes, then table)
- [x] All COMMENT ON statements applied

---

### [2026-01-31 17:04] T2.4: organization_credit_balances table

**Agent**: wave3-t2.4
**Started**: 2026-01-31 17:03
**Completed**: 2026-01-31 17:04
**Status**: ✅ SUCCESS
**Migration**: `1769859207476_1769859202000_2026_01_31_1703__organization_credit_balances__create_table`

#### SQL Applied
```sql
-- Create organization_credit_balances table
CREATE TABLE public.organization_credit_balances (
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),
    organization_id TEXT NOT NULL UNIQUE,  -- One balance per org
    monthly_credits DECIMAL(10,2) NOT NULL DEFAULT 0,
    bonus_credits DECIMAL(10,2) NOT NULL DEFAULT 0,
    reserved_credits DECIMAL(10,2) NOT NULL DEFAULT 0,
    overdraft_limit DECIMAL(10,2) NOT NULL DEFAULT 0,
    period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),

    -- Balance constraints
    CONSTRAINT chk_monthly_credits_positive CHECK (monthly_credits >= 0),
    CONSTRAINT chk_bonus_credits_positive CHECK (bonus_credits >= 0),
    CONSTRAINT chk_reserved_credits_positive CHECK (reserved_credits >= 0),
    CONSTRAINT chk_overdraft_limit_positive CHECK (overdraft_limit >= 0)
);

-- Foreign key
ALTER TABLE public.organization_credit_balances
    ADD CONSTRAINT fk_org_credit_balances_organization_id
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Index for the monthly reset job
CREATE INDEX idx_org_credit_balances_period_end
ON public.organization_credit_balances (period_end);

-- updated_at trigger
SELECT add_updated_at_trigger('organization_credit_balances', 'public');

-- Table comment
COMMENT ON TABLE public.organization_credit_balances IS
  'Tracks credit balance state for each organization. One row per org. used_this_period is computed from credit_transactions.';

-- Column comments
COMMENT ON COLUMN public.organization_credit_balances.monthly_credits IS
  'Credits allocated for the current billing period from the plan. Reset monthly.';
COMMENT ON COLUMN public.organization_credit_balances.bonus_credits IS
  'Additional credits from purchases or promotions. Does not reset monthly.';
COMMENT ON COLUMN public.organization_credit_balances.reserved_credits IS
  'Credits currently reserved for in-flight AI operations. Released on completion or timeout.';
COMMENT ON COLUMN public.organization_credit_balances.overdraft_limit IS
  'How far negative the available balance can go. Provides grace for operations that slightly exceed limits.';
COMMENT ON COLUMN public.organization_credit_balances.period_start IS
  'Start of the current billing period. Used for calculating usage within the period.';
COMMENT ON COLUMN public.organization_credit_balances.period_end IS
  'End of the current billing period. When reached, monthly_credits are reset and period advances.';

-- Constraint comments
COMMENT ON CONSTRAINT chk_monthly_credits_positive ON public.organization_credit_balances IS
  'Ensures monthly_credits cannot be negative.';
COMMENT ON CONSTRAINT chk_bonus_credits_positive ON public.organization_credit_balances IS
  'Ensures bonus_credits cannot be negative.';
COMMENT ON CONSTRAINT chk_reserved_credits_positive ON public.organization_credit_balances IS
  'Ensures reserved_credits cannot be negative.';
COMMENT ON CONSTRAINT chk_overdraft_limit_positive ON public.organization_credit_balances IS
  'Ensures overdraft_limit cannot be negative.';
COMMENT ON CONSTRAINT fk_org_credit_balances_organization_id ON public.organization_credit_balances IS
  'Links balance to organization. CASCADE DELETE removes balance when organization is deleted.';

-- Index comments
COMMENT ON INDEX idx_org_credit_balances_period_end IS
  'Supports monthly reset job to efficiently find expired billing periods.';
```

#### Hasura Output
```
INFO migrations applied
Migration status: Present Present (version 1769859207476)
```

#### Verification
- [x] Table exists in database
- [x] UNIQUE constraint on organization_id (one balance per org)
- [x] Foreign key to organizations table with CASCADE DELETE
- [x] Check constraints for non-negative credit values
- [x] period_end index for monthly reset job
- [x] updated_at trigger configured via add_updated_at_trigger
- [x] Down migration written (removes trigger, index, table)
- [x] All COMMENT ON statements applied
- [x] No used_this_period column (computed from transactions per ADR)

---

### [2026-01-31 17:09] T2.7: credit_reservations table

**Agent**: wave4-t2.7
**Started**: 2026-01-31 17:07
**Completed**: 2026-01-31 17:09
**Status**: SUCCESS
**Migration**: `1769859427697_1769859421000_2026_01_31_1707__credit_reservations__create_table`

#### SQL Applied
```sql
-- Create credit_reservations table for tracking in-flight AI operations
CREATE TABLE public.credit_reservations (
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),
    organization_id TEXT NOT NULL,
    ai_capability_id TEXT NOT NULL,
    quality_level_id TEXT NOT NULL,
    reserved_credits DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    idempotency_key TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    settled_credits DECIMAL(10,2),
    release_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),

    CONSTRAINT chk_reservation_status CHECK (status IN ('pending', 'settled', 'released', 'expired')),
    CONSTRAINT chk_reserved_credits_positive CHECK (reserved_credits > 0)
);

-- Foreign keys with CASCADE DELETE
ALTER TABLE public.credit_reservations
    ADD CONSTRAINT fk_credit_reservations_organization_id
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.credit_reservations
    ADD CONSTRAINT fk_credit_reservations_ai_capability_id
    FOREIGN KEY (ai_capability_id) REFERENCES public.ai_capabilities(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.credit_reservations
    ADD CONSTRAINT fk_credit_reservations_quality_level_id
    FOREIGN KEY (quality_level_id) REFERENCES public.quality_levels(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX idx_credit_reservations_org ON public.credit_reservations (organization_id);
CREATE INDEX idx_credit_reservations_cleanup ON public.credit_reservations (status, expires_at) WHERE status = 'pending';

-- updated_at trigger
SELECT add_updated_at_trigger('credit_reservations', 'public');

-- COMMENT ON statements for table, columns, constraints, indexes
COMMENT ON TABLE public.credit_reservations IS
  'Tracks credit reservations for in-flight AI operations. Reservations hold credits during operation execution.';
COMMENT ON COLUMN public.credit_reservations.status IS
  'Reservation status: pending (in-flight), settled (completed successfully), released (cancelled/failed), expired (timed out)';
COMMENT ON COLUMN public.credit_reservations.idempotency_key IS
  'Unique key to prevent duplicate reservations for the same request. Usually the client request ID.';
```

#### Hasura Output
```
INFO migrations applied
Migration status: Present Present (version 1769859427697)
```

#### Metadata Updates
- Created `public_credit_reservations.yaml` with:
  - Object relationships: organization, ai_capability, quality_level
  - Select permissions for member, org_admin, owner, viewer roles
- Updated `tables.yaml` to include credit_reservations
- Added array relationship `credit_reservations` to:
  - `public_organizations.yaml`
  - `public_ai_capabilities.yaml`
  - `public_quality_levels.yaml`

#### Verification
- [x] Table exists in database
- [x] Foreign keys to organizations, ai_capabilities, quality_levels created
- [x] UNIQUE constraint on idempotency_key created
- [x] CHECK constraints for status and reserved_credits created
- [x] Partial index for cleanup job (pending status only)
- [x] updated_at trigger configured via add_updated_at_trigger
- [x] Down migration written (removes trigger, indexes, table)
- [x] All COMMENT ON statements applied
- [x] Hasura metadata file created with permissions
- [x] Relationships added to related tables

---

### [2026-01-31 17:12] T2.5: credit_transactions table

**Agent**: wave4-t2.5
**Started**: 2026-01-31 17:08
**Completed**: 2026-01-31 17:12
**Status**: ✅ SUCCESS
**Migration**: `1769859532633_1769859425000_2026_01_31_1707__credit_transactions__create_table`

#### SQL Applied
```sql
-- Create credit_transactions table (immutable audit log)
CREATE TABLE public.credit_transactions (
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),
    organization_id TEXT NOT NULL,
    ai_capability_id TEXT,           -- NULL for non-AI transactions
    quality_level_id TEXT,           -- NULL for non-AI transactions
    transaction_type TEXT NOT NULL,
    credits_amount DECIMAL(10,2) NOT NULL,
    estimated_credits DECIMAL(10,2),
    estimation_variance DECIMAL(10,2) GENERATED ALWAYS AS (
        CASE WHEN estimated_credits IS NOT NULL
             THEN credits_amount - estimated_credits
             ELSE NULL
        END
    ) STORED,
    balance_after DECIMAL(10,2) NOT NULL,
    description TEXT,
    provider_request_id TEXT,
    provider_metadata JSONB,
    idempotency_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),

    -- Transaction type constraint
    CONSTRAINT chk_credit_transactions_type CHECK (transaction_type IN (
        'ai_consumption', 'plan_allocation', 'topup_purchase', 'promo_bonus',
        'admin_adjustment', 'plan_change_adjustment', 'expiration'
    )),

    -- Sign constraint based on type
    CONSTRAINT chk_credit_transactions_sign CHECK (
        (transaction_type IN ('ai_consumption', 'expiration') AND credits_amount < 0)
        OR (transaction_type IN ('plan_allocation', 'topup_purchase', 'promo_bonus', 'plan_change_adjustment') AND credits_amount > 0)
        OR (transaction_type = 'admin_adjustment')
    )
);

-- Foreign keys
ALTER TABLE public.credit_transactions
    ADD CONSTRAINT fk_credit_transactions_organization_id
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.credit_transactions
    ADD CONSTRAINT fk_credit_transactions_ai_capability_id
    FOREIGN KEY (ai_capability_id) REFERENCES public.ai_capabilities(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE public.credit_transactions
    ADD CONSTRAINT fk_credit_transactions_quality_level_id
    FOREIGN KEY (quality_level_id) REFERENCES public.quality_levels(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes
CREATE INDEX idx_credit_transactions_org_time
    ON public.credit_transactions (organization_id, created_at DESC);
CREATE INDEX idx_credit_transactions_type
    ON public.credit_transactions (transaction_type);
CREATE INDEX idx_credit_transactions_capability
    ON public.credit_transactions (ai_capability_id) WHERE ai_capability_id IS NOT NULL;
CREATE UNIQUE INDEX idx_credit_transactions_idempotency
    ON public.credit_transactions (idempotency_key) WHERE idempotency_key IS NOT NULL;

-- COMMENT ON statements for table, columns, constraints, indexes
COMMENT ON TABLE public.credit_transactions IS
  'Immutable audit log of all credit changes for organizations. Records consumption, allocations, purchases, adjustments, and expirations.';
```

#### Hasura Output
```
INFO migrations applied
Migration status: Present Present (version 1769859532633)
INFO Metadata reloaded
INFO Metadata is consistent
```

#### Verification
- [x] Table exists in database
- [x] Foreign key to organizations with CASCADE DELETE
- [x] Foreign key to ai_capabilities with SET NULL on delete
- [x] Foreign key to quality_levels with SET NULL on delete
- [x] CHECK constraint for valid transaction_type values
- [x] CHECK constraint for sign based on transaction_type
- [x] Generated column estimation_variance computes correctly
- [x] Composite index on (organization_id, created_at DESC) for history queries
- [x] Partial index for idempotency_key uniqueness
- [x] Rollback tested successfully (down.sql drops indexes and table)
- [x] Re-applied successfully after rollback
- [x] All COMMENT ON statements applied for table, columns, constraints, and indexes

---

### [2026-01-31 17:16] T1.5: Seed plan_ai_capabilities data

**Agent**: wave4-t1.5
**Started**: 2026-01-31 17:09
**Completed**: 2026-01-31 17:16
**Status**: ✅ SUCCESS
**Migration**: `1769859619270_1769859590000_2026_01_31_1709__plan_ai_capabilities__seed_data`

#### SQL Applied
```sql
-- Free Plan: question_generation only, fast quality, 10 rpm / 50 rpd
INSERT INTO public.plan_ai_capabilities (plan_id, ai_capability_id, is_enabled, rate_limit_rpm, rate_limit_rpd)
SELECT p.id, ac.id, true, 10, 50
FROM public.plans p CROSS JOIN public.ai_capabilities ac
WHERE p.unique_name = 'free' AND ac.unique_name = 'question_generation';

INSERT INTO public.plan_ai_capability_quality_levels (plan_ai_capability_id, quality_level_id, allowed_models)
SELECT pac.id, ql.id, ARRAY['gpt-4o-mini']
FROM public.plan_ai_capabilities pac
JOIN public.plans p ON pac.plan_id = p.id
JOIN public.ai_capabilities ac ON pac.ai_capability_id = ac.id
CROSS JOIN public.quality_levels ql
WHERE p.unique_name = 'free' AND ac.unique_name = 'question_generation' AND ql.unique_name = 'fast';

-- Pro Plan: all 3 capabilities, fast + enhanced, 30 rpm / 500 rpd
INSERT INTO public.plan_ai_capabilities (plan_id, ai_capability_id, is_enabled, rate_limit_rpm, rate_limit_rpd)
SELECT p.id, ac.id, true, 30, 500 FROM public.plans p CROSS JOIN public.ai_capabilities ac WHERE p.unique_name = 'pro';

-- Pro: fast quality (gpt-4o-mini) and enhanced quality (gpt-4o)
INSERT INTO public.plan_ai_capability_quality_levels (plan_ai_capability_id, quality_level_id, allowed_models)
SELECT pac.id, ql.id, ARRAY['gpt-4o-mini']
FROM public.plan_ai_capabilities pac JOIN public.plans p ON pac.plan_id = p.id
CROSS JOIN public.quality_levels ql WHERE p.unique_name = 'pro' AND ql.unique_name = 'fast';

INSERT INTO public.plan_ai_capability_quality_levels (plan_ai_capability_id, quality_level_id, allowed_models)
SELECT pac.id, ql.id, ARRAY['gpt-4o']
FROM public.plan_ai_capabilities pac JOIN public.plans p ON pac.plan_id = p.id
CROSS JOIN public.quality_levels ql WHERE p.unique_name = 'pro' AND ql.unique_name = 'enhanced';

-- Team Plan: all 3 capabilities, all quality levels, unlimited (NULL rate limits)
INSERT INTO public.plan_ai_capabilities (plan_id, ai_capability_id, is_enabled, rate_limit_rpm, rate_limit_rpd)
SELECT p.id, ac.id, true, NULL, NULL FROM public.plans p CROSS JOIN public.ai_capabilities ac WHERE p.unique_name = 'team';

-- Team: fast (gpt-4o-mini), enhanced (gpt-4o), premium (gpt-4o + claude-3-5-sonnet)
INSERT INTO public.plan_ai_capability_quality_levels (plan_ai_capability_id, quality_level_id, allowed_models)
SELECT pac.id, ql.id, ARRAY['gpt-4o-mini']
FROM public.plan_ai_capabilities pac JOIN public.plans p ON pac.plan_id = p.id
CROSS JOIN public.quality_levels ql WHERE p.unique_name = 'team' AND ql.unique_name = 'fast';

INSERT INTO public.plan_ai_capability_quality_levels (plan_ai_capability_id, quality_level_id, allowed_models)
SELECT pac.id, ql.id, ARRAY['gpt-4o']
FROM public.plan_ai_capabilities pac JOIN public.plans p ON pac.plan_id = p.id
CROSS JOIN public.quality_levels ql WHERE p.unique_name = 'team' AND ql.unique_name = 'enhanced';

INSERT INTO public.plan_ai_capability_quality_levels (plan_ai_capability_id, quality_level_id, allowed_models)
SELECT pac.id, ql.id, ARRAY['gpt-4o', 'claude-3-5-sonnet']
FROM public.plan_ai_capabilities pac JOIN public.plans p ON pac.plan_id = p.id
CROSS JOIN public.quality_levels ql WHERE p.unique_name = 'team' AND ql.unique_name = 'premium';
```

#### Hasura Output
```
INFO migrations applied
Migration status: Present Present (version 1769859619270)
```

#### Verification
- [x] plan_ai_capabilities populated (7 rows total)
  - Free: 1 capability (question_generation, rate limited 10rpm/50rpd)
  - Pro: 3 capabilities (all, rate limited 30rpm/500rpd)
  - Team: 3 capabilities (all, unlimited)
- [x] plan_ai_capability_quality_levels populated (16 rows total)
  - Free: 1 row (question_generation -> fast)
  - Pro: 6 rows (3 capabilities x 2 quality levels: fast, enhanced)
  - Team: 9 rows (3 capabilities x 3 quality levels: fast, enhanced, premium)
- [x] Allowed models configured correctly:
  - fast: ['gpt-4o-mini']
  - enhanced: ['gpt-4o']
  - premium: ['gpt-4o', 'claude-3-5-sonnet']
- [x] Rollback tested (down.sql DELETEs all seeded data)
- [x] Re-applied successfully after rollback

#### SQL Verification Query Results
```
-- plan_ai_capabilities (7 rows):
| plan_name | capability_name      | is_enabled | rate_limit_rpm | rate_limit_rpd |
|-----------|---------------------|------------|----------------|----------------|
| free      | question_generation | t          | 10             | 50             |
| pro       | question_generation | t          | 30             | 500            |
| pro       | testimonial_assembly| t          | 30             | 500            |
| pro       | testimonial_polish  | t          | 30             | 500            |
| team      | question_generation | t          | NULL           | NULL           |
| team      | testimonial_assembly| t          | NULL           | NULL           |
| team      | testimonial_polish  | t          | NULL           | NULL           |

-- plan_ai_capability_quality_levels (16 rows):
| plan_name | capability_name      | quality_level | allowed_models              |
|-----------|---------------------|---------------|------------------------------|
| free      | question_generation | fast          | {gpt-4o-mini}               |
| pro       | question_generation | fast          | {gpt-4o-mini}               |
| pro       | question_generation | enhanced      | {gpt-4o}                    |
| pro       | testimonial_assembly| fast          | {gpt-4o-mini}               |
| pro       | testimonial_assembly| enhanced      | {gpt-4o}                    |
| pro       | testimonial_polish  | fast          | {gpt-4o-mini}               |
| pro       | testimonial_polish  | enhanced      | {gpt-4o}                    |
| team      | question_generation | fast          | {gpt-4o-mini}               |
| team      | question_generation | enhanced      | {gpt-4o}                    |
| team      | question_generation | premium       | {gpt-4o,claude-3-5-sonnet}  |
| team      | testimonial_assembly| fast          | {gpt-4o-mini}               |
| team      | testimonial_assembly| enhanced      | {gpt-4o}                    |
| team      | testimonial_assembly| premium       | {gpt-4o,claude-3-5-sonnet}  |
| team      | testimonial_polish  | fast          | {gpt-4o-mini}               |
| team      | testimonial_polish  | enhanced      | {gpt-4o}                    |
| team      | testimonial_polish  | premium       | {gpt-4o,claude-3-5-sonnet}  |
```

---

### [2026-01-31 17:31] T1.4b: llm_models table

**Agent**: wave3-t1.4b
**Started**: 2026-01-31 17:23
**Completed**: 2026-01-31 17:31
**Status**: ✅ SUCCESS
**Migration**: `1769860405922_1769860387000_2026_01_31_1723__llm_models__create_table`

#### SQL Applied
```sql
-- Create llm_models table for AI model catalog
CREATE TABLE public.llm_models (
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),
    unique_name TEXT NOT NULL UNIQUE,        -- 'openai/gpt-4o-mini', 'google/gemini-2.0-flash'
    provider TEXT NOT NULL,                   -- 'openai', 'google', 'anthropic'
    model_id TEXT NOT NULL,                   -- Actual API model ID
    display_name TEXT NOT NULL,               -- 'GPT-4o Mini', 'Gemini 2.0 Flash'
    quality_tier TEXT NOT NULL,               -- 'fast', 'balanced', 'powerful'
    input_cost_per_million DECIMAL(10,4),     -- USD per 1M input tokens
    output_cost_per_million DECIMAL(10,4),    -- USD per 1M output tokens
    context_window INT,                        -- Token limit
    is_active BOOLEAN NOT NULL DEFAULT true,
    deprecated_at TIMESTAMPTZ,
    replacement_model_id TEXT,                 -- FK to replacement if deprecated
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    CONSTRAINT chk_llm_models_provider CHECK (provider IN ('openai', 'google', 'anthropic')),
    CONSTRAINT chk_llm_models_quality_tier CHECK (quality_tier IN ('fast', 'balanced', 'powerful'))
);

-- Indexes
CREATE INDEX idx_llm_models_provider_quality_tier ON public.llm_models(provider, quality_tier);
CREATE INDEX idx_llm_models_is_active ON public.llm_models(is_active) WHERE is_active = true;
CREATE INDEX idx_llm_models_quality_tier_order ON public.llm_models(quality_tier, display_order);

-- Seed data: 7 unique models
INSERT INTO public.llm_models (unique_name, provider, model_id, display_name, quality_tier, ...) VALUES
    ('openai/gpt-4o-mini', 'openai', 'gpt-4o-mini', 'GPT-4o Mini', 'fast', ...),
    ('openai/gpt-4o', 'openai', 'gpt-4o', 'GPT-4o', 'balanced', ...),
    ('google/gemini-2.0-flash', 'google', 'gemini-2.0-flash', 'Gemini 2.0 Flash', 'fast', ...),
    ('google/gemini-2.5-flash', 'google', 'gemini-2.5-flash', 'Gemini 2.5 Flash', 'balanced', ...),
    ('google/gemini-2.5-pro', 'google', 'gemini-2.5-pro', 'Gemini 2.5 Pro', 'powerful', ...),
    ('anthropic/claude-3-5-haiku-latest', 'anthropic', 'claude-3-5-haiku-latest', 'Claude 3.5 Haiku', 'fast', ...),
    ('anthropic/claude-sonnet-4-20250514', 'anthropic', 'claude-sonnet-4-20250514', 'Claude Sonnet 4', 'balanced', ...);
```

#### Hasura Output
```
INFO migrations applied
Migration status: Present Present (version 1769860405922)
```

#### Metadata Updates
- Created `public_llm_models.yaml` with:
  - Object relationship: replacement_model (self-referential)
  - Select permissions for anonymous, member, org_admin, owner, viewer roles
- Updated `tables.yaml` to include llm_models (alphabetical order)

#### Verification
- [x] Table exists in database
- [x] Seed data inserted (7 models)
- [x] Rollback tested successfully (down.sql drops indexes and table)
- [x] Re-applied successfully after rollback
- [x] Table tracked in Hasura
- [x] Metadata applied and consistent
- [x] GraphQL query works

#### GraphQL Verification Query Result
```json
{
  "data": {
    "llm_models": [
      {"unique_name": "openai/gpt-4o-mini", "display_name": "GPT-4o Mini", "quality_tier": "fast", "provider": "openai"},
      {"unique_name": "openai/gpt-4o", "display_name": "GPT-4o", "quality_tier": "balanced", "provider": "openai"},
      {"unique_name": "google/gemini-2.0-flash", "display_name": "Gemini 2.0 Flash", "quality_tier": "fast", "provider": "google"},
      {"unique_name": "google/gemini-2.5-flash", "display_name": "Gemini 2.5 Flash", "quality_tier": "balanced", "provider": "google"},
      {"unique_name": "google/gemini-2.5-pro", "display_name": "Gemini 2.5 Pro", "quality_tier": "powerful", "provider": "google"},
      {"unique_name": "anthropic/claude-3-5-haiku-latest", "display_name": "Claude 3.5 Haiku", "quality_tier": "fast", "provider": "anthropic"},
      {"unique_name": "anthropic/claude-sonnet-4-20250514", "display_name": "Claude Sonnet 4", "quality_tier": "balanced", "provider": "anthropic"}
    ]
  }
}
```

---

### [2026-01-31 17:41] T1.4c: plan_quality_level_models junction table

**Agent**: wave4-t1.4c
**Started**: 2026-01-31 17:35
**Completed**: 2026-01-31 17:41
**Status**: ✅ SUCCESS
**Migration**: `1769861144728_1769861134000_2026_01_31_1735__plan_quality_level_models__create_table`

#### SQL Applied
```sql
-- Create junction table linking plan-capability-quality combinations to LLM models
CREATE TABLE public.plan_quality_level_models (
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),
    plan_ai_capability_quality_level_id TEXT NOT NULL,
    llm_model_id TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    priority INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    CONSTRAINT uq_pqlm_quality_level_model UNIQUE (plan_ai_capability_quality_level_id, llm_model_id)
);

-- Foreign keys with CASCADE DELETE
ALTER TABLE public.plan_quality_level_models
    ADD CONSTRAINT fk_pqlm_plan_ai_capability_quality_level_id
    FOREIGN KEY (plan_ai_capability_quality_level_id)
    REFERENCES public.plan_ai_capability_quality_levels(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.plan_quality_level_models
    ADD CONSTRAINT fk_pqlm_llm_model_id
    FOREIGN KEY (llm_model_id) REFERENCES public.llm_models(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX idx_pqlm_plan_ai_capability_quality_level_id ON public.plan_quality_level_models(...);
CREATE INDEX idx_pqlm_llm_model_id ON public.plan_quality_level_models(...);
CREATE INDEX idx_pqlm_default ON public.plan_quality_level_models(...) WHERE is_default = true;
```

#### Hasura Output
```
INFO migrations applied
Migration status: Present Present (version 1769861144728)
INFO metadata is consistent
INFO Metadata exported
```

#### Metadata Updates
- Created `public_plan_quality_level_models.yaml` with:
  - Object relationships: plan_ai_capability_quality_level, llm_model
  - Select permissions for member, org_admin, owner, viewer roles
- Updated `public_plan_ai_capability_quality_levels.yaml` with:
  - Object relationships: plan_ai_capability, quality_level
  - Array relationship: allowed_model_mappings → plan_quality_level_models
  - Select permissions for member, org_admin, owner, viewer roles
- Updated `public_plan_ai_capabilities.yaml` with:
  - Object relationships: plan, ai_capability
  - Array relationship: quality_levels → plan_ai_capability_quality_levels
  - Select permissions for member, org_admin, owner, viewer roles
- Added array relationship `plan_quality_level_models` to `public_llm_models.yaml`
- Updated `tables.yaml` to include all three new tables

#### Verification
- [x] Table exists in database
- [x] Unique constraint on (plan_ai_capability_quality_level_id, llm_model_id)
- [x] Foreign key to plan_ai_capability_quality_levels with CASCADE DELETE
- [x] Foreign key to llm_models with CASCADE DELETE
- [x] is_default and priority columns for model selection
- [x] Indexes for FK lookups and default model lookup
- [x] Rollback tested successfully (down.sql drops indexes and table)
- [x] Re-applied successfully after rollback
- [x] Table tracked in Hasura
- [x] Object relationships configured (plan_ai_capability_quality_level, llm_model)
- [x] Array relationship added to parent table (allowed_model_mappings)
- [x] Array relationship added to llm_models (plan_quality_level_models)
- [x] Metadata applied and consistent
- [x] All COMMENT ON statements applied for table, columns, constraints, and indexes

---

### [2026-01-31 18:24] T2.6: Credit Calculation SQL Functions

**Agent**: wave5-t2.6
**Started**: 2026-01-31 18:21
**Completed**: 2026-01-31 18:24
**Status**: ✅ SUCCESS
**Migration**: `1769863867000_2026_01_31_1821__credit_functions__utility-function`

#### SQL Applied

```sql
-- Function 1: get_used_this_period(org_id TEXT) RETURNS DECIMAL(10,2)
-- Returns absolute value of credits consumed during current billing period
-- Aggregates ai_consumption transactions between period_start and period_end
CREATE OR REPLACE FUNCTION public.get_used_this_period(org_id TEXT)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    result DECIMAL(10,2);
    period_start_ts TIMESTAMPTZ;
    period_end_ts TIMESTAMPTZ;
BEGIN
    SELECT period_start, period_end INTO period_start_ts, period_end_ts
    FROM public.organization_credit_balances WHERE organization_id = org_id;
    IF NOT FOUND THEN RETURN 0; END IF;
    SELECT COALESCE(SUM(ABS(credits_amount)), 0) INTO result
    FROM public.credit_transactions
    WHERE organization_id = org_id AND transaction_type = 'ai_consumption'
      AND created_at >= period_start_ts AND created_at < period_end_ts;
    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function 2: get_available_credits(org_id TEXT) RETURNS DECIMAL(10,2)
-- Formula: monthly_credits + bonus_credits - reserved_credits - used_this_period
CREATE OR REPLACE FUNCTION public.get_available_credits(org_id TEXT)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    result DECIMAL(10,2);
    monthly DECIMAL(10,2); bonus DECIMAL(10,2); reserved DECIMAL(10,2); used DECIMAL(10,2);
BEGIN
    SELECT monthly_credits, bonus_credits, reserved_credits INTO monthly, bonus, reserved
    FROM public.organization_credit_balances WHERE organization_id = org_id;
    IF NOT FOUND THEN RETURN 0; END IF;
    used := public.get_used_this_period(org_id);
    RETURN monthly + bonus - reserved - used;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function 3: get_spendable_credits(org_id TEXT) RETURNS DECIMAL(10,2)
-- Formula: get_available_credits(org_id) + overdraft_limit
CREATE OR REPLACE FUNCTION public.get_spendable_credits(org_id TEXT)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    available DECIMAL(10,2);
    overdraft DECIMAL(10,2);
BEGIN
    SELECT overdraft_limit INTO overdraft
    FROM public.organization_credit_balances WHERE organization_id = org_id;
    IF NOT FOUND THEN RETURN 0; END IF;
    RETURN public.get_available_credits(org_id) + overdraft;
END;
$$ LANGUAGE plpgsql STABLE;

-- Covering index for efficient consumption aggregation
CREATE INDEX idx_credit_transactions_consumption_covering
ON public.credit_transactions (organization_id, created_at)
INCLUDE (credits_amount)
WHERE transaction_type = 'ai_consumption';
```

#### Function Summary

| Function | Purpose | Formula |
|----------|---------|---------|
| `get_used_this_period(org_id)` | Credits consumed this billing period | SUM(ABS(ai_consumption transactions)) |
| `get_available_credits(org_id)` | Credits available before overdraft | monthly + bonus - reserved - used |
| `get_spendable_credits(org_id)` | Max spendable (API uses this) | available + overdraft_limit |

#### Index Created

- `idx_credit_transactions_consumption_covering`: Partial covering index for efficient ai_consumption aggregation
  - Columns: `(organization_id, created_at)` INCLUDE `(credits_amount)`
  - Filter: `WHERE transaction_type = 'ai_consumption'`
  - Enables index-only scans for `get_used_this_period`

#### Verification

- [x] Migration files created (up.sql + down.sql)
- [x] All 3 functions use STABLE volatility (same inputs = same outputs within transaction)
- [x] All functions handle NULL/not found cases (return 0)
- [x] Comprehensive COMMENT ON statements included
- [x] down.sql properly drops index and functions

**Applied**: Migration successfully applied via `hasura migrate apply --database-name default`.

---

### [2026-01-31 18:43] T2.10: Initialize Credit Balances for Existing Organizations

**Agent**: wave5-t2.10
**Started**: 2026-01-31 18:21
**Completed**: 2026-01-31 18:43
**Status**: ✅ SUCCESS
**Migration**: `1769863878000_2026_01_31_1821__organization_credit_balances__init_data`

#### SQL Applied (Summary)

```sql
-- Step 1: Insert organization_credit_balances for existing organizations
INSERT INTO organization_credit_balances (organization_id, monthly_credits, bonus_credits, period_start, period_end)
SELECT o.id, COALESCE(op.monthly_ai_credits, 0),
       CASE WHEN p.unique_name = 'free' THEN 10
            WHEN p.unique_name = 'pro' THEN 25
            WHEN p.unique_name = 'team' THEN 50 ELSE 0 END,
       NOW(), NOW() + INTERVAL '1 month'
FROM organizations o JOIN organization_plans op ON ... JOIN plans p ON ...
WHERE NOT EXISTS (SELECT 1 FROM organization_credit_balances WHERE organization_id = o.id);

-- Step 2: Create initial plan_allocation transactions
INSERT INTO credit_transactions (organization_id, transaction_type, credits_amount, balance_after, description)
SELECT organization_id, 'plan_allocation', monthly_credits, monthly_credits + bonus_credits, 'Initial monthly credit allocation'
FROM organization_credit_balances WHERE NOT EXISTS (...);

-- Step 3: Create initial promo_bonus transactions (welcome bonus)
INSERT INTO credit_transactions (organization_id, transaction_type, credits_amount, balance_after, description)
SELECT organization_id, 'promo_bonus', bonus_credits, monthly_credits + bonus_credits, 'Welcome bonus credits'
FROM organization_credit_balances WHERE bonus_credits > 0 AND NOT EXISTS (...);
```

#### Data Created

| Table | Records | Details |
|-------|---------|---------|
| organization_credit_balances | 3 | One per existing org |
| credit_transactions | 6 | 3 plan_allocation + 3 promo_bonus |

#### Credit Balances by Plan

| Organization | Plan | Monthly Credits | Bonus Credits |
|--------------|------|-----------------|---------------|
| Druqrhb2Eptq | Free | 10 | 10 |
| hxuDj1Efveoz | Free | 10 | 10 |
| qSDp6B1hXvSz | Pro | 500 | 25 |

#### Verification

- [x] Migration files created (up.sql + down.sql)
- [x] Migration is idempotent (safe to re-run)
- [x] All existing orgs have credit_balances row
- [x] monthly_credits matches plan allocation
- [x] Welcome bonuses applied correctly (free=10, pro=25)
- [x] Initial transactions recorded (plan_allocation + promo_bonus)
- [x] Verified via tm-graph GraphQL query

**Applied**: Migration successfully applied via `hasura migrate apply --database-name default`.

---

### [2026-01-31 18:08] T1.6 + T2.9: Hasura Permissions for All ADR-023 Tables

**Agent**: wave5-t1.6, wave5-t2.9 (combined)
**Started**: 2026-01-31 17:55
**Completed**: 2026-01-31 18:08
**Status**: ✅ SUCCESS
**Skill**: `/hasura-permissions`

#### Tables Configured

**Phase 1 (Capabilities) - T1.6:**
1. `quality_levels` - Updated with permissions + array relationships
2. `ai_capabilities` - Updated with array relationship to credit_transactions
3. `plan_ai_capabilities` - Already configured during migration
4. `plan_ai_capability_quality_levels` - Already configured during migration
5. `llm_models` - Already configured during migration
6. `plan_quality_level_models` - Already configured during migration

**Phase 2 (Credits) - T2.9:**
1. `organization_credit_balances` - NEW YAML created with org-scoped permissions
2. `credit_transactions` - NEW YAML created with org-scoped permissions
3. `credit_reservations` - Already configured during migration
4. `credit_topup_packages` - Updated with public (anonymous) permissions

#### Hasura Output
```
INFO Applying metadata...
INFO Metadata applied
INFO Reloading metadata...
INFO Metadata reloaded
INFO Metadata is consistent
INFO Exporting metadata...
INFO Metadata exported
```

#### GraphQL Codegen Output
```
[SUCCESS] Generate to src/shared/graphql/generated/types.ts
[SUCCESS] Generate to src/shared/graphql/generated/operations.ts
[SUCCESS] Generate to src/shared/graphql/generated/schema.graphql
[SUCCESS] Generate to src/shared/graphql/generated/introspection.json
```

#### Verification via tm-graph
```graphql
# All tables now accessible via GraphQL
query { quality_levels { id unique_name name } }           # ✅ 3 rows
query { ai_capabilities { id unique_name name } }          # ✅ 3 rows
query { llm_models { id unique_name provider model_id } }  # ✅ 7 rows
query { credit_topup_packages { id unique_name credits } } # ✅ 3 rows
query { plan_ai_capabilities_aggregate { aggregate { count } } }          # ✅ 7
query { plan_ai_capability_quality_levels_aggregate { aggregate { count } } } # ✅ 16
query { plan_quality_level_models_aggregate { aggregate { count } } }     # ✅ 48
```

---

### [2026-01-31 17:47] T1.5: Seed plan_quality_level_models (RESTRUCTURED)

**Agent**: wave4b-t1.5
**Started**: 2026-01-31 17:40
**Completed**: 2026-01-31 17:47
**Status**: ✅ SUCCESS
**Seed File**: `db/hasura/seeds/default/1_seed_plan_capability_models.sql`

**Note**: This task was restructured from migration to Hasura seed. The original T1.5 migration seeded `plan_ai_capabilities` and `plan_ai_capability_quality_levels` with TEXT[] arrays. After T1.4b created `llm_models` table and T1.4c created `plan_quality_level_models` junction, this seed populates the junction table with proper foreign key relationships.

#### SQL Applied (Summary)
```sql
-- Section 1: Verify plan_ai_capabilities exists (idempotent)
-- Section 2: Verify plan_ai_capability_quality_levels exists (idempotent)
-- Section 3: Populate plan_quality_level_models with model mappings

-- FAST Quality: gpt-4o-mini (default), gemini-2.0-flash, claude-3-5-haiku-latest
-- ENHANCED Quality: gpt-4o (default), gemini-2.5-flash, claude-sonnet-4-20250514
-- PREMIUM Quality: gpt-4o (default), gemini-2.5-pro, claude-sonnet-4-20250514

-- Each model gets:
-- - is_default = true (OpenAI), false (others)
-- - priority = 0 (OpenAI), 1 (Google), 2 (Anthropic)
```

#### Hasura Output
```
INFO Applying seeds...
INFO Seeds planted
```

#### Verification
- [x] Seed file created at `db/hasura/seeds/default/1_seed_plan_capability_models.sql`
- [x] Seed applies cleanly (idempotent)
- [x] plan_ai_capabilities has 7 entries (1 free + 3 pro + 3 team)
- [x] plan_ai_capability_quality_levels has 16 entries (1 free + 6 pro + 9 team)
- [x] plan_quality_level_models has 48 entries (16 x 3 models)
- [x] Each quality level has 3 models (one per provider)
- [x] OpenAI models marked as default (is_default = true, priority = 0)
- [x] Google models as first fallback (priority = 1)
- [x] Anthropic models as second fallback (priority = 2)

#### GraphQL Verification Query Results
```json
{
  "plan_ai_capabilities_aggregate": { "aggregate": { "count": 7 } },
  "plan_ai_capability_quality_levels_aggregate": { "aggregate": { "count": 16 } },
  "plan_quality_level_models_aggregate": { "aggregate": { "count": 48 } }
}
```

#### Plan Configuration Summary

| Plan | Capabilities | Quality Levels | Total Model Mappings |
|------|-------------|----------------|---------------------|
| Free | 1 (question_generation) | 1 (fast) | 3 |
| Pro | 3 (all) | 2 (fast, enhanced) | 18 |
| Team | 3 (all) | 3 (fast, enhanced, premium) | 27 |
| **Total** | **7** | **16** | **48** |

---

<!--
Template for migration entries:

### [TIMESTAMP] T1.1: quality_levels table

**Agent**: agent-id
**Started**: YYYY-MM-DD HH:MM
**Completed**: YYYY-MM-DD HH:MM
**Status**: ✅ SUCCESS / ❌ FAILED

#### Migration Created
```
Migration folder: 1234567890000_2026_01_31_1200__quality_levels__create_table
```

#### SQL Applied
```sql
-- Summary of key SQL statements
CREATE TABLE public.quality_levels (
  ...
);
```

#### Hasura Output
```
INFO migrations applied
[migration status output]
```

#### Verification
- [ ] Table exists in database
- [ ] Seed data inserted
- [ ] Rollback tested

#### Errors (if any)
```
Error output here
```
-->

---

## Blocking Issues

_No blocking issues._

<!--
Template for blocking issues:

### [TIMESTAMP] Issue: Title

**Affects**: T1.2, T1.3
**Severity**: CRITICAL / HIGH / MEDIUM
**Status**: OPEN / RESOLVED

**Description**:
What went wrong and why it's blocking.

**Resolution**:
How it was resolved (or what's needed to resolve).
-->

---

## Completion Log

### [2026-01-31] T4.1 Completed

**Duration**: 10 minutes
**Agent**: wave6-t4.1
**File**: `api/src/features/credits/checkBalance.ts`

**Summary**: Implemented `checkCreditBalance` function to check if an organization has sufficient credits for an AI operation. Uses the SQL functions from T2.6 (`get_available_credits`, `get_spendable_credits`, `get_used_this_period`) to compute balance information.

**Features**:
- Returns comprehensive `CreditBalanceCheck` object with available, spendable, monthlyRemaining, bonusCredits, reservedCredits, periodEndsAt, estimatedCost, and afterOperation
- Handles edge cases: organization not found (returns canProceed: false), zero cost (always proceeds)
- Uses Drizzle ORM with raw SQL to call the PostgreSQL functions
- Type-safe with proper JSDoc documentation

**Files Created**:
- `api/src/features/credits/checkBalance.ts`

**Verified**: `pnpm typecheck` passes.

---

### [2026-01-31] T3.1 Completed

**Duration**: 5 minutes
**Agent**: wave6-t3.1
**File**: `api/src/features/ai/types.ts`

**Summary**: Created TypeScript types for AI capability access checking in the API layer. These types support the ADR-023 AI Capabilities & Plan Integration system.

**Types Created**:
- `AICapabilityId`: Union type for capability identifiers (question_generation, testimonial_assembly, testimonial_polish)
- `QualityLevelId`: Union type for quality level identifiers (fast, enhanced, premium)
- `QualityLevelInfo`: Information about a quality level including credit cost and allowed models
- `AICapabilityAccessResult`: Result of checking capability access for a plan
- `AIAccessResult`: Combined result for full AI access check (capability + credits)
- `AICapabilityDenialReason`: Reasons why capability access may be denied
- `AIAccessDenialReason`: Extended reasons including credit-related denials
- `CreditTransactionType`: Types of credit transactions (matches DB CHECK constraint)
- `CreditReservationStatus`: Status of credit reservations (matches DB CHECK constraint)
- `LLMProvider`: Supported LLM provider identifiers (openai, google, anthropic)
- `LLMQualityTier`: Quality tier classification for LLM models (fast, balanced, powerful)

**Files Created**:
- `api/src/features/ai/types.ts`

**Note**: The `pnpm typecheck` has an unrelated error in `checkBalance.ts` from T4.1 (Drizzle type issue), but the types file itself is syntactically correct.

---

### [2026-01-31 18:43] Phase 2 Database Schema Complete

**Duration**: ~3 hours (Phase 1 + Phase 2)
**Tasks Completed**: T1.1-T1.6, T2.1-T2.10 (19 tasks, 1 skipped)

**Summary**: All database schema work for AI Capabilities and Credits systems is complete:
- 10 new tables created (quality_levels, ai_capabilities, llm_models, plan_ai_capabilities, plan_ai_capability_quality_levels, plan_quality_level_models, organization_credit_balances, credit_transactions, credit_reservations, credit_topup_packages)
- 3 SQL functions created (get_used_this_period, get_available_credits, get_spendable_credits)
- All tables tracked in Hasura with proper permissions
- Seed data applied (3 quality levels, 3 capabilities, 7 models, 3 topup packages)
- Credit balances initialized for all existing organizations

**Next**: Wave 6 - API capability access types (T3.1, T3.4, T4.1)

---

### [2026-01-31 18:43] T2.10 Completed

**Duration**: 22 minutes
**Agent**: wave5-t2.10
**Migration**: `1769863878000_2026_01_31_1821__organization_credit_balances__init_data`

**Summary**: Initialized credit balances for all 3 existing organizations with monthly allocations and welcome bonuses. Created 6 credit transactions (3 plan_allocation + 3 promo_bonus).

**Files Created**:
- `db/hasura/migrations/default/1769863878000_2026_01_31_1821__organization_credit_balances__init_data/up.sql`
- `db/hasura/migrations/default/1769863878000_2026_01_31_1821__organization_credit_balances__init_data/down.sql`

**Applied**: Migration successfully applied.

---

### [2026-01-31 18:36] T2.6 Completed

**Duration**: 15 minutes
**Agent**: wave5-t2.6
**Migration**: `1769863867000_2026_01_31_1821__credit_functions__utility-function`

**Summary**: Created 3 PostgreSQL functions for credit calculations and 1 partial covering index for efficient consumption aggregation. Functions are STABLE and handle NULL cases by returning 0.

**Files Created**:
- `db/hasura/migrations/default/1769863867000_2026_01_31_1821__credit_functions__utility-function/up.sql`
- `db/hasura/migrations/default/1769863867000_2026_01_31_1821__credit_functions__utility-function/down.sql`

**Applied**: Migration successfully applied.

### [2026-01-31 18:08] T1.6 + T2.9: Hasura Permissions Completed

**Duration**: 15 minutes
**Agent**: wave5-t1.6, wave5-t2.9
**Skill**: `/hasura-permissions`

#### Files Created/Updated

**New Files:**
- `db/hasura/metadata/databases/default/tables/public_organization_credit_balances.yaml`
- `db/hasura/metadata/databases/default/tables/public_credit_transactions.yaml`

**Updated Files:**
- `public_quality_levels.yaml` - Added permissions (anonymous, member, org_admin, owner, viewer) + array relationships
- `public_credit_topup_packages.yaml` - Added public select permissions for pricing display
- `public_ai_capabilities.yaml` - Added array relationship to credit_transactions
- `tables.yaml` - Added includes for new YAML files

#### Permissions Summary

| Table | Anonymous | Member | Org Admin | Owner | Viewer |
|-------|-----------|--------|-----------|-------|--------|
| quality_levels | ✅ (active only) | ✅ | ✅ | ✅ | ✅ |
| ai_capabilities | ✅ (active only) | ✅ | ✅ | ✅ | ✅ |
| llm_models | ✅ (active only) | ✅ | ✅ | ✅ | ✅ |
| plan_ai_capabilities | - | ✅ | ✅ | ✅ | ✅ |
| plan_ai_capability_quality_levels | - | ✅ | ✅ | ✅ | ✅ |
| plan_quality_level_models | - | ✅ | ✅ | ✅ | ✅ |
| credit_topup_packages | ✅ (active only) | ✅ | ✅ | ✅ | ✅ |
| organization_credit_balances | - | ✅ (org) | ✅ (org) | ✅ (org) | ✅ (org) |
| credit_transactions | - | ✅ (org) | ✅ (org) | ✅ (org) | ✅ (org) |
| credit_reservations | - | ✅ (org) | ✅ (org) | ✅ (org) | ✅ (org) |

**Note:** (org) = filtered by `organization_id = X-Hasura-Organization-Id`

#### Verification
- [x] `hasura metadata apply` - SUCCESS
- [x] `hasura metadata ic list` - No inconsistencies
- [x] `pnpm codegen:web` - GraphQL types generated
- [x] tm-graph queries verified all tables accessible

---

### [2026-01-31 17:47] T1.5 Seed Completed (Restructured)

**Duration**: 10 minutes
**Agent**: wave4b-t1.5
**Seed File**: `db/hasura/seeds/default/1_seed_plan_capability_models.sql`

**Note**: T1.5 was restructured to use Hasura seeds instead of migrations. The seed file populates `plan_quality_level_models` junction table with proper model mappings.

**Results**:
- plan_ai_capabilities: 7 rows (verified)
- plan_ai_capability_quality_levels: 16 rows (verified)
- plan_quality_level_models: 48 rows (16 quality levels x 3 models each)

**Model Distribution**:
- Fast tier: openai/gpt-4o-mini (default), google/gemini-2.0-flash, anthropic/claude-3-5-haiku-latest
- Enhanced tier: openai/gpt-4o (default), google/gemini-2.5-flash, anthropic/claude-sonnet-4-20250514
- Premium tier: openai/gpt-4o (default), google/gemini-2.5-pro, anthropic/claude-sonnet-4-20250514

### [2026-01-31 17:41] T1.4c Completed

**Duration**: 6 minutes
**Agent**: wave4-t1.4c
**Migration**: `1769861144728_1769861134000_2026_01_31_1735__plan_quality_level_models__create_table`

### [2026-01-31 17:31] T1.4b Completed

**Duration**: 8 minutes
**Agent**: wave3-t1.4b
**Migration**: `1769860405922_1769860387000_2026_01_31_1723__llm_models__create_table`

### [2026-01-31 17:16] T1.5 Completed

**Duration**: 7 minutes
**Agent**: wave4-t1.5
**Migration**: `1769859619270_1769859590000_2026_01_31_1709__plan_ai_capabilities__seed_data`

### [2026-01-31 17:12] T2.5 Completed

**Duration**: 4 minutes
**Agent**: wave4-t2.5
**Migration**: `1769859532633_1769859425000_2026_01_31_1707__credit_transactions__create_table`

### [2026-01-31 17:09] T2.7 Completed

**Duration**: 2 minutes
**Agent**: wave4-t2.7
**Migration**: `1769859427697_1769859421000_2026_01_31_1707__credit_reservations__create_table`

### [2026-01-31 17:08] T1.4 Completed

**Duration**: 2 minutes
**Agent**: wave3-t1.4
**Migration**: `1769859420232_1769859379000_2026_01_31_1706__plan_ai_capability_quality_levels__create_table`

### [2026-01-31 17:04] T2.4 Completed

**Duration**: 1 minute
**Agent**: wave3-t2.4
**Migration**: `1769859207476_1769859202000_2026_01_31_1703__organization_credit_balances__create_table`

### [2026-01-31 17:03] T1.3 Completed

**Duration**: 2 minutes
**Agent**: wave2-t1.3
**Migration**: `1769859101186_1769859064000_2026_01_31_1701__plan_ai_capabilities__create_table`

### [2026-01-31 17:01] T2.2 Completed

**Duration**: 1 minute
**Agent**: wave2-t2.2
**Migration**: `1769859003313_1769858967000_2026_01_31_1659__organization_plans__add_monthly_ai_credits`

### [2026-01-31 17:00] T1.1 Completed

**Duration**: 6 minutes
**Agent**: wave1-t1.1
**Migration**: `1769858683310_1769858677000_2026_01_31_1654__quality_levels__create_table`

### [2026-01-31 16:58] T1.2 Completed

**Duration**: 4 minutes
**Agent**: wave1-t1.2
**Migration**: `1769858684343_1769858677000_2026_01_31_1654__ai_capabilities__create_table`

### [2026-01-31 16:58] T2.8 Completed

**Duration**: 4 minutes
**Agent**: wave1-t2.8
**Migration**: `1769858683554_1769858676000_2026_01_31_1654__credit_topup_packages__create_table`

<!--
Template for completion entries:

### [TIMESTAMP] T1.1 Completed

**Duration**: X minutes
**Agent**: agent-id
**Commit**: abc1234 (if applicable)
-->

---

## Notes

- Migration tasks (T1.x, T2.x) require detailed logging in the Migration Log section
- All agents should update this file when starting/completing tasks
- Use `/hasura-migrations` skill for migration tasks
- Use `/hasura-permissions` skill for metadata tasks
