# ADR-023 Implementation Plan

## Overview

Implementation plan for AI Credits & Plan Integration system.

**ADR**: [adr.md](./adr.md)
**Progress**: [progress.md](./progress.md)
**Status**: Near Complete (Unit tests remaining)
**Last Updated**: 2026-02-17

---

## Course Correction Notes

### Checkpoint 1 (2026-01-31)

**Architectural Change**: TEXT[] arrays for `allowed_models` replaced with proper normalization:
- Created `llm_models` table (7 models seeded from `api/src/shared/libs/ai/providers.ts`)
- Created `plan_quality_level_models` junction table (48 model mappings)
- Seeds moved to Hasura seed files (`db/hasura/seeds/default/`) instead of migrations

**Tasks Added**: T1.4b, T1.4c, T1.4d (total now 51 tasks)

**Partial Completions Identified**:
- T1.6: Most tables already tracked during migrations; needs relationship/permission YAML only
- T2.9: `credit_reservations` and `credit_topup_packages` tracked; `organization_credit_balances` and `credit_transactions` NOT tracked

**Completed (14 tasks)**: T1.1, T1.2, T1.3, T1.4, T1.4b, T1.4c, T1.5, T2.1, T2.2, T2.3, T2.4, T2.5, T2.7, T2.8

---

## Task Legend

| Symbol | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Completed |
| `[!]` | Blocked |
| `[-]` | Skipped/Cancelled |

**Dependency notation**: `depends: [T1.2, T1.3]` means task cannot start until T1.2 AND T1.3 are complete.

---

## Skill Reference

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `/hasura-migrations` | Create DB migrations | New tables, columns, indexes, functions |
| `/hasura-permissions` | Configure Hasura metadata | Relationships, permissions YAML |
| `/hasura-table-docs` | Document tables | After new table migrations |
| `/api-creator` | Create REST endpoints | New Hono routes with OpenAPI |
| `/graphql-code` | GraphQL operations | .gql files, codegen, composables |
| `/e2e-test-ids` | Test ID management | Add data-testid to components |
| `/e2e-tests-creator` | Create E2E tests | New Playwright tests |
| `/e2e-tests-runner` | Run E2E tests | Verify test pass/fail |
| `/code-review` | Review code | Before committing |
| `/create-commits` | Create commits | After task completion |

---

## Phase 1: Database Schema (Capabilities)

Foundation tables for AI capabilities and plan access control.

### T1.1: Create quality_levels table
- **Status**: [x] ✅ COMPLETED
- **Depends**: None
- **Skills**: `/hasura-migrations`, `/hasura-table-docs`
- **Log**: Write detailed output to `progress.md` under Migration Log
- **Files**:
  - `db/hasura/migrations/default/1769855760000_2026_01_31_1446__quality_levels__create_table/up.sql`
  - `db/hasura/migrations/default/1769855760000_2026_01_31_1446__quality_levels__create_table/down.sql`
- **Acceptance Criteria**:
  - [x] Table created with: id (nanoid), unique_name, name, description, display_order, credit_multiplier, is_active, created_at
  - [x] Seed data: fast, enhanced, premium
  - [x] Migration applies cleanly
  - [x] Rollback works

### T1.2: Create ai_capabilities table
- **Status**: [x] ✅ COMPLETED
- **Depends**: None
- **Skills**: `/hasura-migrations`, `/hasura-table-docs`
- **Log**: Write detailed output to `progress.md` under Migration Log
- **Files**:
  - `db/hasura/migrations/default/1769855820000_2026_01_31_1447__ai_capabilities__create_table/up.sql`
  - `db/hasura/migrations/default/1769855820000_2026_01_31_1447__ai_capabilities__create_table/down.sql`
- **Acceptance Criteria**:
  - [x] Table created with: id, unique_name, name, description, category, icon, estimated_credits_fast/enhanced/premium, is_active, created_at, updated_at
  - [x] Seed data: question_generation, testimonial_assembly, testimonial_polish
  - [x] updated_at trigger configured
  - [x] Migration applies cleanly

### T1.3: Create plan_ai_capabilities table
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T1.2]
- **Skills**: `/hasura-migrations`, `/hasura-table-docs`
- **Log**: Write detailed output to `progress.md` under Migration Log
- **Files**:
  - `db/hasura/migrations/default/1769856180000_2026_01_31_1453__plan_ai_capabilities__create_table/up.sql`
  - `db/hasura/migrations/default/1769856180000_2026_01_31_1453__plan_ai_capabilities__create_table/down.sql`
- **Acceptance Criteria**:
  - [x] Table created with: id, plan_id (FK), ai_capability_id (FK), is_enabled, rate_limit_rpm, rate_limit_rpd, created_at, updated_at
  - [x] UNIQUE constraint on (plan_id, ai_capability_id)
  - [x] Indexes on plan_id and ai_capability_id
  - [x] updated_at trigger configured

### T1.4: Create plan_ai_capability_quality_levels junction table
- **Status**: [x] ✅ COMPLETED (MODIFIED - allowed_models column removed, now uses junction table)
- **Depends**: [T1.1, T1.3]
- **Skills**: `/hasura-migrations`, `/hasura-table-docs`
- **Log**: Write detailed output to `progress.md` under Migration Log
- **Files**:
  - `db/hasura/migrations/default/1769856540000_2026_01_31_1459__plan_ai_capability_quality_levels__create_table/up.sql`
  - `db/hasura/migrations/default/1769856540000_2026_01_31_1459__plan_ai_capability_quality_levels__create_table/down.sql`
- **Acceptance Criteria**:
  - [x] Table created with: id, plan_ai_capability_id (FK), quality_level_id (FK), created_at
  - [x] UNIQUE constraint on (plan_ai_capability_id, quality_level_id)
  - [x] Indexes for lookup and reverse lookup
  - [-] ~~allowed_models (TEXT[])~~ REMOVED - replaced by T1.4b, T1.4c

### T1.4b: Create llm_models table
- **Status**: [x] ✅ COMPLETED
- **Depends**: None (can parallel with T1.4)
- **Skills**: `/hasura-migrations`, `/hasura-table-docs`
- **Log**: Write detailed output to `progress.md` under Migration Log
- **Rationale**: Proper normalization instead of TEXT[] arrays. Stores model metadata (provider, pricing, context window).
- **Files**:
  - `db/hasura/migrations/default/1769860080000_2026_01_31_1558__llm_models__create_table/up.sql`
  - `db/hasura/migrations/default/1769860080000_2026_01_31_1558__llm_models__create_table/down.sql`
- **Acceptance Criteria**:
  - [x] Table created with: id, unique_name, provider, model_id, display_name, quality_tier, input_cost_per_million, output_cost_per_million, context_window, is_active, deprecated_at, replacement_model_id, display_order, created_at
  - [x] UNIQUE constraint on unique_name
  - [x] CHECK constraint on provider IN ('openai', 'google', 'anthropic')
  - [x] CHECK constraint on quality_tier IN ('fast', 'balanced', 'powerful')
  - [x] Seed data from api/src/shared/libs/ai/providers.ts (7 models seeded)
    - Fast: gpt-4o-mini, gemini-2.0-flash, claude-3-5-haiku-latest
    - Balanced: gpt-4o, gemini-2.5-flash, claude-sonnet-4-20250514
    - Powerful: gpt-4o, gemini-2.5-pro, claude-sonnet-4-20250514
  - [x] Index on (provider, quality_tier) for queries
  - [x] Index on is_active for filtering

### T1.4c: Create plan_quality_level_models junction table
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T1.4, T1.4b]
- **Skills**: `/hasura-migrations`, `/hasura-table-docs`
- **Log**: Write detailed output to `progress.md` under Migration Log
- **Rationale**: Links plan-capability-quality combinations to allowed models. Replaces allowed_models TEXT[].
- **Files**:
  - `db/hasura/migrations/default/1769860440000_2026_01_31_1604__plan_quality_level_models__create_table/up.sql`
  - `db/hasura/migrations/default/1769860440000_2026_01_31_1604__plan_quality_level_models__create_table/down.sql`
- **Acceptance Criteria**:
  - [x] Table created with: id, plan_ai_capability_quality_level_id (FK), llm_model_id (FK), is_default, priority, created_at
  - [x] UNIQUE constraint on (plan_ai_capability_quality_level_id, llm_model_id)
  - [x] FK to plan_ai_capability_quality_levels ON DELETE CASCADE
  - [x] FK to llm_models ON DELETE CASCADE
  - [x] Indexes for both FK columns

### T1.4d: Drop allowed_models column from plan_ai_capability_quality_levels
- **Status**: [-] SKIPPED (column was never added - table created without allowed_models)
- **Depends**: [T1.4c, T1.5] (after junction data migrated)
- **Skills**: `/hasura-migrations`
- **Log**: N/A - Column never existed, table created directly with junction approach
- **Notes**: The original T1.4 was modified during implementation to NOT include allowed_models column. Junction table (T1.4c) was created instead. This task is no longer needed.

### T1.5: Seed plan capability mappings
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T1.4c]
- **Skills**: Hasura seeds (NOT migrations)
- **Log**: Write detailed output to `progress.md` under Migration Log
- **Files**:
  - `db/hasura/seeds/default/1_seed_plan_capability_models.sql`
- **Acceptance Criteria**:
  - [x] Free plan: question_generation only, fast quality
  - [x] Pro plan: all capabilities, fast+enhanced, rate limits 30/500
  - [x] Team plan: all capabilities, all quality levels, unlimited
  - [x] Junction table populated with correct model associations per quality tier (48 mappings)
  - [x] Uses Hasura seed files (not migrations) for easy re-seeding
  - [x] Matches ADR specification exactly
- **Verified Data**:
  - plan_ai_capabilities: 7 entries
  - plan_ai_capability_quality_levels: 16 entries
  - plan_quality_level_models: 48 entries (16 quality levels × 3 models each)

### T1.6: Add Hasura metadata for capability tables
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T1.5]
- **Skills**: `/hasura-permissions`
- **Files**:
  - `db/hasura/metadata/databases/default/tables/public_quality_levels.yaml`
  - `db/hasura/metadata/databases/default/tables/public_ai_capabilities.yaml`
  - `db/hasura/metadata/databases/default/tables/public_plan_ai_capabilities.yaml`
  - `db/hasura/metadata/databases/default/tables/public_plan_ai_capability_quality_levels.yaml`
  - `db/hasura/metadata/databases/default/tables/public_llm_models.yaml`
  - `db/hasura/metadata/databases/default/tables/public_plan_quality_level_models.yaml`
- **Acceptance Criteria**:
  - [x] All 6 tables tracked in Hasura
  - [x] Relationships configured (object and array relationships)
  - [x] Select permissions for anonymous (public reference data) and authenticated roles
  - [x] No insert/update/delete from GraphQL (admin only)
- **Verified**: All tables accessible via GraphQL, codegen completed successfully

---

## Phase 2: Database Schema (Credits)

Credit balance and transaction tracking tables.

### T2.1: Add monthly_ai_credits to plans table
- **Status**: [x] ✅ COMPLETED
- **Depends**: None (can parallel with Phase 1)
- **Skills**: `/hasura-migrations`, `/hasura-permissions`
- **Log**: Write detailed output to `progress.md` under Migration Log
- **Files**:
  - `db/hasura/migrations/default/1769855880000_2026_01_31_1448__plans__add_monthly_ai_credits/up.sql`
  - `db/hasura/migrations/default/1769855880000_2026_01_31_1448__plans__add_monthly_ai_credits/down.sql`
- **Acceptance Criteria**:
  - [x] Column added: monthly_ai_credits INT NOT NULL DEFAULT 0
  - [x] Existing plans updated: free=10, pro=500, team=2000
  - [x] Hasura metadata updated to expose field

### T2.2: Add monthly_ai_credits to organization_plans table
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T2.1]
- **Skills**: `/hasura-migrations`, `/hasura-permissions`
- **Log**: Write detailed output to `progress.md` under Migration Log
- **Files**:
  - `db/hasura/migrations/default/1769856000000_2026_01_31_1450__organization_plans__add_monthly_ai_credits/up.sql`
  - `db/hasura/migrations/default/1769856000000_2026_01_31_1450__organization_plans__add_monthly_ai_credits/down.sql`
- **Acceptance Criteria**:
  - [x] Column added: monthly_ai_credits INT NOT NULL DEFAULT 0
  - [x] Existing org_plans populated from their plan's value
  - [x] Hasura metadata updated

### T2.3: Add pending plan change columns to organization_plans
- **Status**: [x] ✅ COMPLETED
- **Depends**: None (can parallel)
- **Skills**: `/hasura-migrations`, `/hasura-permissions`
- **Log**: Write detailed output to `progress.md` under Migration Log
- **Files**:
  - `db/hasura/migrations/default/1769855940000_2026_01_31_1449__organization_plans__add_pending_plan_columns/up.sql`
  - `db/hasura/migrations/default/1769855940000_2026_01_31_1449__organization_plans__add_pending_plan_columns/down.sql`
- **Acceptance Criteria**:
  - [x] Columns added: pending_plan_id (FK), pending_change_at (TIMESTAMPTZ)
  - [x] Index on pending_change_at WHERE NOT NULL

### T2.4: Create organization_credit_balances table
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T2.2]
- **Skills**: `/hasura-migrations`, `/hasura-table-docs`
- **Log**: Write detailed output to `progress.md` under Migration Log
- **Files**:
  - `db/hasura/migrations/default/1769856060000_2026_01_31_1451__organization_credit_balances__create_table/up.sql`
  - `db/hasura/migrations/default/1769856060000_2026_01_31_1451__organization_credit_balances__create_table/down.sql`
- **Acceptance Criteria**:
  - [x] Table created per ADR spec (monthly_credits, bonus_credits, reserved_credits, overdraft_limit, period_start/end)
  - [x] NO used_this_period column (computed)
  - [x] Positive balance constraints
  - [x] updated_at trigger
  - [x] Index on period_end for reset job
  - [x] Tracked in Hasura with org-scoped permissions (T2.9)

### T2.5: Create credit_transactions table
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T2.4, T1.2]
- **Skills**: `/hasura-migrations`, `/hasura-table-docs`
- **Log**: Write detailed output to `progress.md` under Migration Log
- **Files**:
  - `db/hasura/migrations/default/1769856120000_2026_01_31_1452__credit_transactions__create_table/up.sql`
  - `db/hasura/migrations/default/1769856120000_2026_01_31_1452__credit_transactions__create_table/down.sql`
- **Acceptance Criteria**:
  - [x] Table created per ADR spec
  - [x] transaction_type CHECK constraint
  - [x] credits_amount sign CHECK constraint
  - [x] Indexes: org_time, type, capability, idempotency
  - [x] estimation_variance generated column
  - [x] Tracked in Hasura with org-scoped permissions (T2.9)

### T2.6: Create get_used_this_period SQL function
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T2.5]
- **Skills**: `/hasura-migrations`
- **Log**: Write detailed output to `progress.md` under Migration Log
- **Files**:
  - `db/hasura/migrations/default/1769863867000_2026_01_31_1821__credit_functions__utility-function/up.sql`
  - `db/hasura/migrations/default/1769863867000_2026_01_31_1821__credit_functions__utility-function/down.sql`
- **Acceptance Criteria**:
  - [x] Function: get_used_this_period(org_id) returns DECIMAL
  - [x] Function: get_available_credits(org_id) returns DECIMAL
  - [x] Function: get_spendable_credits(org_id) returns DECIMAL
  - [x] Partial covering index for consumption aggregation
- **Notes**: All functions are STABLE, handle NULL cases (return 0 if org not found)

### T2.7: Create credit_reservations table
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T2.4, T1.2]
- **Skills**: `/hasura-migrations`, `/hasura-table-docs`
- **Log**: Write detailed output to `progress.md` under Migration Log
- **Files**:
  - `db/hasura/migrations/default/1769856420000_2026_01_31_1458__credit_reservations__create_table/up.sql`
  - `db/hasura/migrations/default/1769856420000_2026_01_31_1458__credit_reservations__create_table/down.sql`
- **Acceptance Criteria**:
  - [x] Table created per ADR spec
  - [x] Status CHECK constraint (pending, settled, released, expired)
  - [x] Indexes for cleanup job and org lookup
- **Notes**: Table tracked in Hasura during migration

### T2.8: Create credit_topup_packages table
- **Status**: [x] ✅ COMPLETED
- **Depends**: None (can parallel)
- **Skills**: `/hasura-migrations`, `/hasura-table-docs`
- **Log**: Write detailed output to `progress.md` under Migration Log
- **Files**:
  - `db/hasura/migrations/default/1769856360000_2026_01_31_1457__credit_topup_packages__create_table/up.sql`
  - `db/hasura/migrations/default/1769856360000_2026_01_31_1457__credit_topup_packages__create_table/down.sql`
- **Acceptance Criteria**:
  - [x] Table created with: id, unique_name, name, description, credits, price_usd_cents, price_per_credit (generated), is_active, display_order
  - [x] Seed: starter (100/$9.99), popular (500/$39.99), power (2000/$129.99)
- **Notes**: Table tracked in Hasura during migration

### T2.9: Add Hasura metadata for credit tables
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T2.5, T2.7, T2.8]
- **Skills**: `/hasura-permissions`
- **Files**:
  - `db/hasura/metadata/databases/default/tables/public_organization_credit_balances.yaml` (CREATED)
  - `db/hasura/metadata/databases/default/tables/public_credit_transactions.yaml` (CREATED)
  - `db/hasura/metadata/databases/default/tables/public_credit_reservations.yaml` (UPDATED)
  - `db/hasura/metadata/databases/default/tables/public_credit_topup_packages.yaml` (UPDATED)
- **Acceptance Criteria**:
  - [x] All credit tables tracked in Hasura
    - [x] credit_reservations - org-scoped permissions
    - [x] credit_topup_packages - public select (for pricing display)
    - [x] organization_credit_balances - org-scoped permissions
    - [x] credit_transactions - org-scoped permissions
  - [x] Relationships configured (organization, ai_capability, quality_level)
  - [x] organization_credit_balances: select for org members (org_id filter)
  - [x] credit_transactions: select for org members (org_id filter)
  - [x] credit_topup_packages: anonymous select (public pricing)
- **Verified**: All tables accessible via GraphQL, codegen completed successfully

### T2.10: Initialize credit balances for existing organizations
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T2.4, T2.5]
- **Skills**: `/hasura-migrations`
- **Log**: Write detailed output to `progress.md` under Migration Log
- **Files**:
  - `db/hasura/migrations/default/1769863878000_2026_01_31_1821__organization_credit_balances__init_data/up.sql`
  - `db/hasura/migrations/default/1769863878000_2026_01_31_1821__organization_credit_balances__init_data/down.sql`
- **Acceptance Criteria**:
  - [x] All existing orgs get credit_balances row (3 orgs initialized)
  - [x] monthly_credits set from their plan (free=10, pro=500)
  - [x] Welcome bonus added per ADR (free=10, pro=25, team=50)
  - [x] Initial transactions recorded (plan_allocation + promo_bonus)
- **Verified**: 3 organization_credit_balances rows, 6 credit_transactions (3 allocations + 3 bonuses)

---

## Phase 3: API - Capability Access Layer

TypeScript functions for checking AI feature access.

### T3.1: Create capability access types
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T1.6] (needs schema)
- **Skills**: Manual TypeScript coding
- **Files**:
  - `api/src/features/ai/types.ts`
- **Acceptance Criteria**:
  - [x] AICapabilityAccessResult interface
  - [x] AIAccessResult interface
  - [x] QualityLevelInfo type
  - [x] Error reason union types
- **Notes**: Includes AICapabilityId, QualityLevelId, CreditTransactionType, CreditReservationStatus, LLMProvider, LLMQualityTier types

### T3.2: Implement checkCapabilityAccess function
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T3.1]
- **Skills**: Manual TypeScript coding (Drizzle ORM)
- **Files**:
  - `api/src/features/ai/checkCapabilityAccess.ts`
- **Acceptance Criteria**:
  - [x] Queries plan_ai_capabilities via Drizzle
  - [x] Checks: capability exists, is_active, plan has access, quality allowed
  - [x] Returns allowed models for the quality level
  - [x] Returns clear denial reasons
- **Notes**: Returns AICapabilityAccessResult with hasAccess, availableQualityLevels (with models), dailyLimit, monthlyLimit

### T3.3: Implement checkAIAccess combined function
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T3.2, T4.1]
- **Skills**: Manual TypeScript coding
- **Files**:
  - `api/src/features/ai/checkAIAccess.ts`
- **Acceptance Criteria**:
  - [x] Combines capability check + credit balance check
  - [x] Returns unified result with all access info
  - [x] Includes upgrade/topup hints for UI
- **Notes**: Returns AIAccessResult with canProceed, capability, credits, selectedQualityLevel, and context-aware denial hints

### T3.4: Create AI access error types
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T3.1]
- **Skills**: Manual TypeScript coding
- **Files**:
  - `api/src/features/ai/errors.ts`
- **Acceptance Criteria**:
  - [x] AIAccessDeniedError class (renamed to AICapabilityDeniedError)
  - [x] InsufficientCreditsError class
  - [x] DuplicateRequestError class
  - [x] All errors have structured data for API responses
- **Notes**: Added base AIAccessError class, RateLimitExceededError. All errors have code, message, details pattern.

---

## Phase 4: API - Credit Management

Credit balance checking, reservation, and consumption.

### T4.1: Implement checkCreditBalance function
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T2.6, T2.9]
- **Skills**: Manual TypeScript coding (Drizzle ORM)
- **Files**:
  - `api/src/features/credits/checkBalance.ts`
- **Acceptance Criteria**:
  - [x] Calls get_spendable_credits SQL function
  - [x] Returns: available, monthlyRemaining, bonusCredits, periodEndsAt
  - [x] Calculates estimatedCost from capability + quality
  - [x] Returns canProceed boolean
- **Notes**: Uses Drizzle raw SQL to call PostgreSQL functions. Returns CreditBalanceCheck interface.

### T4.2: Implement reserveCredits function
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T4.1, T2.7]
- **Skills**: Manual TypeScript coding (Drizzle ORM, transactions)
- **Files**:
  - `api/src/features/credits/reserveCredits.ts`
- **Acceptance Criteria**:
  - [x] Atomic UPDATE with balance check
  - [x] Creates credit_reservations row
  - [x] Handles duplicate idempotency keys
  - [x] Returns reservationId
- **Notes**: Uses db.transaction() for atomicity. Returns existing reservation for idempotent retries. Uses factory functions for errors.

### T4.3: Implement settleCredits function
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T4.2, T2.5]
- **Skills**: Manual TypeScript coding (Drizzle ORM, transactions)
- **Files**:
  - `api/src/features/credits/settleCredits.ts`
- **Acceptance Criteria**:
  - [x] Calculates monthly vs bonus consumption split
  - [x] Updates reserved_credits and bonus_credits
  - [x] Creates credit_transaction with provider_metadata
  - [x] Updates credit_reservations status
  - [x] Handles idempotent retries
- **Notes**: Deducts from monthly_credits first, then bonus_credits. Uses factory functions for errors.

### T4.4: Implement releaseCredits function
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T4.2]
- **Skills**: Manual TypeScript coding (Drizzle ORM)
- **Files**:
  - `api/src/features/credits/releaseCredits.ts`
- **Acceptance Criteria**:
  - [x] Releases reserved_credits on failure
  - [x] Updates credit_reservations with release_reason
  - [x] Idempotent (safe to call multiple times)
- **Notes**: Returns wasAlreadyReleased flag for idempotency. Handles released/expired/settled statuses.

### T4.5: Create executeWithAIAccess wrapper
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T3.3, T4.2, T4.3, T4.4]
- **Skills**: Manual TypeScript coding
- **Files**:
  - `api/src/features/ai/executeWithAIAccess.ts`
- **Acceptance Criteria**:
  - [x] Full reserve → execute → settle/release flow
  - [x] Integrates with credit checking
  - [x] Returns result + creditsUsed + balanceRemaining
  - [x] Proper error handling with release on failure
- **Notes**: Generic function with type parameter. Returns structured results, never throws.

### T4.6: Create credit operations barrel export
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T4.1, T4.2, T4.3, T4.4, T4.5]
- **Skills**: Manual TypeScript coding
- **Files**:
  - `api/src/features/credits/index.ts`
  - `api/src/features/ai/index.ts`
- **Acceptance Criteria**:
  - [x] Clean public API exports
  - [x] Types exported
- **Notes**: Both barrel files created with organized exports for functions, types, and error utilities

---

## Phase 5: API - Integration with AI Endpoints

Wrap existing AI endpoints with credit system.

### T5.1: Update /ai/suggest-questions endpoint
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T4.5]
- **Skills**: `/api-creator` (modify existing)
- **Files**:
  - `api/src/features/ai/suggestQuestions/index.ts`
  - `api/src/shared/schemas/ai.ts` (added qualityLevel, idempotencyKey, credits_used, balance_remaining)
- **Acceptance Criteria**:
  - [x] Wrapped with executeWithAIAccess
  - [x] Returns credits_used in response
  - [x] Returns balance_remaining in response
  - [x] Handles access denied errors gracefully (402, 403)
- **Notes**: Also sets X-Credits-Used and X-Balance-Remaining headers

### T5.2: Update /ai/assemble-testimonial endpoint
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T4.5]
- **Skills**: `/api-creator` (modify existing)
- **Files**:
  - `api/src/features/ai/assembleTestimonial/index.ts`
  - `api/src/shared/schemas/ai.ts` (added qualityLevel, idempotencyKey)
- **Acceptance Criteria**:
  - [x] Wrapped with executeWithAIAccess
  - [x] Returns credits_used in response
  - [x] Returns balance_remaining in response
- **Notes**: Updated getFormById to include organization_id for credit operations

### T5.3: Create /credits/balance endpoint
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T4.1]
- **Skills**: `/api-creator`
- **Files**:
  - `api/src/routes/credits.ts` (added to existing)
  - `api/src/shared/schemas/credits.ts` (added GetBalanceResponseSchema)
- **Acceptance Criteria**:
  - [x] GET endpoint returns current balance
  - [x] Includes: available, spendable, monthlyCredits, bonusCredits, periodEndsAt, etc.
  - [x] Authenticated, org-scoped
- **Notes**: Uses SQL functions (get_available_credits, get_spendable_credits, get_used_this_period) for computed values

### T5.4: Create /credits/transactions endpoint
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T2.9]
- **Skills**: `/api-creator`
- **Files**:
  - `api/src/routes/credits.ts`
  - `api/src/shared/schemas/credits.ts`
- **Acceptance Criteria**:
  - [x] GET endpoint with pagination
  - [x] Filters: transaction_type, date range
  - [x] Includes capability name (joined)
  - [x] Authenticated, org-scoped
- **Notes**: OpenAPIHono route with Zod schemas. LEFT JOINs ai_capabilities and quality_levels for names. Mounted at /credits.

### T5.5: Create /ai/access-check endpoint
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T3.3]
- **Skills**: `/api-creator`
- **Files**:
  - `api/src/routes/ai.ts` (added to existing)
  - `api/src/shared/schemas/ai.ts` (added schemas)
- **Acceptance Criteria**:
  - [x] POST endpoint to pre-check access
  - [x] Input: capabilityUniqueName, qualityLevelUniqueName
  - [x] Returns: canProceed, capability, credits, selectedQualityLevel, availableQualityLevels
  - [x] Used by frontend before showing AI options
- **Notes**: OpenAPIHono route with full schema validation. Includes upgrade/topup hints.

---

## Phase 6: Frontend - Composables & Components

Vue composables and UI components for credit display.

### T6.1: Create useCreditBalance composable
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T5.3]
- **Skills**: Manual Vue/TypeScript coding
- **Files**:
  - `apps/web/src/features/credits/composables/useCreditBalance.ts`
  - `apps/web/src/features/credits/index.ts`
- **Acceptance Criteria**:
  - [x] Fetches from /credits/balance
  - [x] Reactive state: balance, loading, error
  - [x] Auto-refresh option with interval
  - [x] Loading/error states
- **Notes**: Includes computed helpers: percentUsed, isLow, daysUntilReset

### T6.2: Create useAIAccess composable
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T5.5]
- **Skills**: Manual Vue/TypeScript coding
- **Files**:
  - `apps/web/src/features/ai/composables/useAIAccess.ts`
  - `apps/web/src/features/ai/index.ts`
- **Acceptance Criteria**:
  - [x] Pre-checks capability + credit access
  - [x] Returns: canProceed, capabilityAllowed, hasEnoughCredits
  - [x] Returns: allowedQualityLevels with models
  - [x] upgradeRequired / topupRequired computed hints
- **Notes**: Includes reset() function to clear state

### T6.3: Create CreditBalanceWidget component
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T6.1]
- **Skills**: Manual Vue coding, `/e2e-test-ids`
- **Files**:
  - `apps/web/src/features/credits/ui/CreditBalanceWidget.vue`
- **Acceptance Criteria**:
  - [x] Shows available credits prominently
  - [x] Shows monthly vs bonus breakdown
  - [x] Shows period reset date
  - [x] "Get More Credits" button when low
  - [x] data-testid attributes added
- **Notes**: Includes usage progress bar, low balance warning, compact mode prop

### T6.4: Create QualityLevelSelector component
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T6.2]
- **Skills**: Manual Vue coding, `/e2e-test-ids`
- **Files**:
  - `apps/web/src/features/ai/ui/QualityLevelSelector.vue`
  - `apps/web/src/features/ai/ui/index.ts`
- **Acceptance Criteria**:
  - [x] Radio buttons for quality level selection
  - [x] Shows estimated credits per level
  - [x] Disables unavailable levels (greyed + upgrade hint)
  - [x] v-model support via defineModel
  - [x] data-testid attributes added
- **Notes**: Accessibility attributes included (role, aria-checked, aria-disabled)

### T6.5: Update AI feature UIs with credit info
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T6.2, T6.4]
- **Skills**: Manual Vue coding, `/e2e-test-ids`
- **Files**:
  - `apps/web/src/features/ai/composables/useAIOperationWithCredits.ts` (NEW)
  - `apps/web/src/features/ai/ui/AIAccessDeniedPrompt.vue` (NEW)
  - `apps/web/src/features/ai/ui/AIOperationResult.vue` (NEW)
  - `apps/web/src/features/createForm/composables/wizard/useQuestionGeneration.ts` (MODIFIED)
  - `apps/web/src/features/createForm/composables/wizard/useFormWizard.ts` (MODIFIED)
  - `apps/web/src/features/publicForm/ui/PublicFormFlow.vue` (MODIFIED)
- **Acceptance Criteria**:
  - [x] Show estimated credits before operation
  - [x] Pre-check access with useAIAccess
  - [x] Handle access denied states (upgrade/topup prompts)
  - [x] Show credits used after operation
- **Notes**: Added useAIOperationWithCredits composable, AIAccessDeniedPrompt and AIOperationResult components

### T6.6: Create CreditHistoryPage
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T5.4]
- **Skills**: Manual Vue coding, `/e2e-test-ids`
- **Files**:
  - `apps/web/src/pages/[org]/settings/credits/index.vue`
  - `apps/web/src/features/credits/ui/CreditHistoryTable.vue`
  - `apps/web/src/features/credits/ui/CreditHistoryTableSkeleton.vue`
  - `apps/web/src/features/credits/ui/CreditHistoryEmptyState.vue`
  - `apps/web/src/features/credits/composables/useCreditHistory.ts`
  - `apps/web/src/features/credits/api/useApiForCredits.ts`
  - `apps/web/src/features/credits/models/index.ts`
- **Acceptance Criteria**:
  - [x] Table with: date, type, capability, credits, balance
  - [x] Pagination with next/prev
  - [x] Filter by transaction type dropdown
  - [x] Positive amounts green, negative red
  - [x] data-testid attributes added (credit-history-table, transaction-row, pagination-next, pagination-prev)
- **Notes**: Color-coded transaction type badges. Follows FSD architecture.

### T6.7: Create TopupPurchaseModal component
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T2.8, T7.1]
- **Skills**: Manual Vue coding, `/e2e-test-ids`
- **Files**:
  - `apps/web/src/features/credits/ui/TopupPurchaseModal.vue`
  - `apps/web/src/features/credits/api/useApiForCredits.ts` (added getTopupPackages, purchaseCredits)
  - `apps/web/src/features/credits/models/index.ts` (added CreditTopupPackage types)
- **Acceptance Criteria**:
  - [x] Shows available packages with pricing
  - [x] Highlights "popular" package
  - [x] Integrates with Stripe checkout (POST /credits/purchase)
  - [x] Success/error handling
  - [x] data-testid attributes added
- **Notes**: Uses Dialog components, auto-selects popular package, redirects to Stripe checkout URL

---

## Phase 7: Billing Integration

Stripe integration and scheduled jobs.

### T7.1: Create Stripe checkout for credit topups
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T2.8]
- **Skills**: `/api-creator`
- **Files**:
  - `api/src/routes/credits.ts` (added to existing)
  - `api/src/shared/schemas/credits.ts` (added purchase schemas)
- **Acceptance Criteria**:
  - [x] POST /credits/purchase with packageId
  - [x] Creates Stripe checkout session
  - [x] Returns checkout URL and sessionId
  - [x] Handles existing Stripe customer
- **Notes**: Uses Stripe SDK. Stores customer ID in org settings. Webhook handler needed separately (T7.2).

### T7.2: Create Stripe webhook handler for topup success
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T7.1, T4.3]
- **Skills**: `/api-creator` (extend existing)
- **Files**:
  - `api/src/routes/webhooks.ts` (NEW - webhook routes)
  - `api/src/shared/schemas/webhooks.ts` (NEW - Zod schemas)
  - `api/src/shared/config/env.ts` (added STRIPE_WEBHOOK_SECRET)
  - `api/src/routes/index.ts` (added webhooks export)
  - `api/src/index.ts` (registered /webhooks route)
- **Acceptance Criteria**:
  - [x] Handles checkout.session.completed for topups
  - [x] Adds credits to bonus_credits
  - [x] Creates credit_transaction (topup_purchase)
  - [x] Idempotent (handles webhook retries via session ID check)
- **Notes**: Uses Stripe signature verification. Stores stripe_session_id in idempotency_key and provider_metadata for audit trail.

### T7.3: Create monthly credit reset scheduled job
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T2.4, T2.5]
- **Skills**: Manual TypeScript coding
- **Files**:
  - `api/src/jobs/resetMonthlyCredits.ts`
  - `api/src/jobs/index.ts`
- **Acceptance Criteria**:
  - [x] Finds orgs where period_end <= NOW()
  - [x] Advances period_start/end
  - [x] Updates monthly_credits from current plan
  - [x] Creates plan_allocation transaction
  - [x] Handles pending plan changes (downgrades)
- **Notes**: Returns detailed result per org. Resets reserved_credits, keeps bonus_credits.

### T7.4: Create reservation cleanup scheduled job
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T2.7]
- **Skills**: Manual TypeScript coding
- **Files**:
  - `api/src/jobs/cleanupReservations.ts`
  - `api/src/jobs/index.ts`
- **Acceptance Criteria**:
  - [x] Finds reservations where status=pending AND expires_at < NOW()
  - [x] Releases reserved_credits
  - [x] Updates reservation status to expired
- **Notes**: Batch processing (100 at a time). Idempotent. Returns expiredCount and errors.

### T7.5: Handle plan upgrades (immediate)
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T2.2, T4.3]
- **Skills**: `/api-creator`
- **Files**:
  - `api/src/routes/billing.ts` (NEW)
  - `api/src/shared/schemas/billing.ts` (NEW - Zod schemas)
- **Acceptance Criteria**:
  - [x] POST /billing/upgrade endpoint
  - [x] Updates plan_id immediately
  - [x] Increases monthly_credits to new level
  - [x] Creates plan_change_adjustment transaction
  - [x] Updates organization_plans.monthly_ai_credits
- **Notes**: Validates plan tier hierarchy (free < pro < team). Uses atomic transaction.

### T7.6: Handle plan downgrades (scheduled)
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T2.3, T7.3]
- **Skills**: `/api-creator`
- **Files**:
  - `api/src/routes/billing.ts` (added downgrade route)
  - `api/src/shared/schemas/billing.ts` (updated DowngradePlanResponseSchema)
- **Acceptance Criteria**:
  - [x] POST /billing/downgrade endpoint
  - [x] Sets pending_plan_id and pending_change_at
  - [x] Does NOT change current access
  - [x] Processed by T7.3 at period end
  - [x] Returns scheduled change date to UI
- **Notes**: Validates plan tier hierarchy. Returns effectiveAt (period_end), currentCredits, newCredits.

### T7.7: Create low balance notification system
- **Status**: [x] ✅ COMPLETED
- **Depends**: [T4.3]
- **Skills**: Manual TypeScript coding
- **Files**:
  - `api/src/features/credits/notifications.ts`
  - `api/src/features/credits/index.ts` (added exports)
- **Acceptance Criteria**:
  - [x] Detects when balance < 20% of monthly
  - [x] Detects when balance depleted (≤ 1 credit)
  - [x] Debounced (max 1 notification per day per threshold)
  - [x] Logs notifications (email integration ready)
- **Notes**: Exports checkAndNotifyLowBalance for use after settleCredits

---

## Phase 8: Testing

### T8.1: Add database migration tests
- **Status**: [ ]
- **Depends**: [Phase 1, Phase 2 complete]
- **Skills**: Manual TypeScript coding, `/e2e-tests-runner`
- **Files**:
  - `api/src/__tests__/migrations/credits.test.ts`
- **Acceptance Criteria**:
  - [ ] Migrations apply cleanly
  - [ ] Rollbacks work
  - [ ] Seed data correct

### T8.2: Add credit operations unit tests
- **Status**: [ ]
- **Depends**: [Phase 4 complete]
- **Skills**: Manual TypeScript coding, `/e2e-tests-runner`
- **Files**:
  - `api/src/features/credits/__tests__/*.test.ts`
- **Acceptance Criteria**:
  - [ ] Test reserve/settle/release flows
  - [ ] Test concurrent reservation handling
  - [ ] Test idempotency
  - [ ] Test monthly vs bonus consumption priority

### T8.3: Add E2E tests for AI credit flow
- **Status**: [ ]
- **Depends**: [Phase 5, Phase 6 complete]
- **Skills**: `/e2e-tests-creator`, `/e2e-tests-runner`
- **Files**:
  - `apps/web/tests/e2e/features/ai-credits/ai-credits.spec.ts`
- **Acceptance Criteria**:
  - [ ] Test AI operation deducts credits
  - [ ] Test insufficient credits shows error
  - [ ] Test quality level restrictions
  - [ ] Test credit balance UI updates

---

## Execution Waves (Parallel Groups)

Tasks grouped by dependency for parallel execution:

### Wave 1: Independent DB Tasks (No Dependencies)
| Task | Description | Skills |
|------|-------------|--------|
| T1.1 | quality_levels table | `/hasura-migrations` |
| T1.2 | ai_capabilities table | `/hasura-migrations` |
| T2.1 | plans.monthly_ai_credits | `/hasura-migrations` |
| T2.3 | org_plans pending columns | `/hasura-migrations` |
| T2.8 | credit_topup_packages | `/hasura-migrations` |

### Wave 2: First Dependencies
| Task | Description | Depends | Skills |
|------|-------------|---------|--------|
| T1.3 | plan_ai_capabilities | T1.2 | `/hasura-migrations` |
| T2.2 | org_plans.monthly_ai_credits | T2.1 | `/hasura-migrations` |

### Wave 3: Second Dependencies
| Task | Description | Depends | Skills |
|------|-------------|---------|--------|
| T1.4 | plan_ai_capability_quality_levels | T1.1, T1.3 | `/hasura-migrations` |
| T1.4b | llm_models table | None | `/hasura-migrations` |
| T2.4 | organization_credit_balances | T2.2 | `/hasura-migrations` |

### Wave 4: Third Dependencies
| Task | Description | Depends | Skills |
|------|-------------|---------|--------|
| T1.4c | plan_quality_level_models junction | T1.4, T1.4b | `/hasura-migrations` |
| T2.5 | credit_transactions | T2.4, T1.2 | `/hasura-migrations` |
| T2.7 | credit_reservations | T2.4, T1.2 | `/hasura-migrations` |

### Wave 4b: After Junction Table
| Task | Description | Depends | Skills |
|------|-------------|---------|--------|
| T1.5 | Seed plan capabilities | T1.4c | Hasura seeds |

### Wave 5: Final DB + Metadata
| Task | Description | Depends | Skills |
|------|-------------|---------|--------|
| T1.4d | Drop allowed_models column | T1.4c, T1.5 | `/hasura-migrations` |
| T1.6 | Hasura metadata (capabilities + llm_models) | T1.5 | `/hasura-permissions` |
| T2.6 | SQL functions | T2.5 | `/hasura-migrations` |
| T2.9 | Hasura metadata (credits) | T2.5, T2.7, T2.8 | `/hasura-permissions` |
| T2.10 | Init credit balances | T2.4, T2.5 | `/hasura-migrations` |

### Wave 6: API Types (After DB)
| Task | Description | Depends | Skills |
|------|-------------|---------|--------|
| T3.1 | Capability access types | T1.6 | Manual |
| T3.4 | AI access errors | T3.1 | Manual |
| T4.1 | checkCreditBalance | T2.6, T2.9 | Manual |

### Wave 7: API Functions
| Task | Description | Depends | Skills |
|------|-------------|---------|--------|
| T3.2 | checkCapabilityAccess | T3.1 | Manual |
| T4.2 | reserveCredits | T4.1, T2.7 | Manual |
| T5.4 | /credits/transactions | T2.9 | `/api-creator` |

### Wave 8: API Integration
| Task | Description | Depends | Skills |
|------|-------------|---------|--------|
| T3.3 | checkAIAccess | T3.2, T4.1 | Manual |
| T4.3 | settleCredits | T4.2, T2.5 | Manual |
| T4.4 | releaseCredits | T4.2 | Manual |
| T5.3 | /credits/balance | T4.1 | `/api-creator` |

### Wave 9: API Wrapper + Endpoints
| Task | Description | Depends | Skills |
|------|-------------|---------|--------|
| T4.5 | executeWithAIAccess | T3.3, T4.2-T4.4 | Manual |
| T4.6 | Barrel exports | T4.1-T4.5 | Manual |
| T5.5 | /ai/access-check | T3.3 | `/api-creator` |
| T7.1 | Stripe checkout | T2.8 | `/api-creator` |
| T7.3 | Monthly reset job | T2.4, T2.5 | Manual |
| T7.4 | Reservation cleanup | T2.7 | Manual |

### Wave 10: AI Endpoints + Frontend Composables
| Task | Description | Depends | Skills |
|------|-------------|---------|--------|
| T5.1 | Update suggest-questions | T4.5 | `/api-creator` |
| T5.2 | Update assemble-testimonial | T4.5 | `/api-creator` |
| T6.1 | useCreditBalance | T5.3 | Manual |
| T6.2 | useAIAccess | T5.5 | Manual |
| T6.6 | CreditHistoryPage | T5.4 | Manual |

### Wave 11: Frontend Components
| Task | Description | Depends | Skills |
|------|-------------|---------|--------|
| T6.3 | CreditBalanceWidget | T6.1 | Manual, `/e2e-test-ids` |
| T6.4 | QualityLevelSelector | T6.2 | Manual, `/e2e-test-ids` |
| T7.2 | Stripe webhook | T7.1, T4.3 | `/api-creator` |
| T7.5 | Plan upgrades | T2.2, T4.3 | `/api-creator` |
| T7.7 | Low balance notifications | T4.3 | Manual |

### Wave 12: Final Features
| Task | Description | Depends | Skills |
|------|-------------|---------|--------|
| T6.5 | Update AI UIs | T6.2, T6.4 | Manual |
| T6.7 | TopupPurchaseModal | T2.8, T7.1 | Manual |
| T7.6 | Plan downgrades | T2.3, T7.3 | `/api-creator` |

### Wave 13: Testing
| Task | Description | Depends | Skills |
|------|-------------|---------|--------|
| T8.1 | Migration tests | Phase 1-2 | Manual, `/e2e-tests-runner` |
| T8.2 | Credit ops tests | Phase 4 | Manual, `/e2e-tests-runner` |
| T8.3 | E2E tests | Phase 5-6 | `/e2e-tests-creator` |

---

## Dependency Graph

```
Phase 1 (Capabilities)                    Phase 2 (Credits)
================================          ========================
T1.1 (quality_levels) ────────┐           T2.1 ───► T2.2 ───► T2.4 ───► T2.5
T1.2 (ai_capabilities) ─► T1.3 ├──► T1.4  T2.3                  │         │
                              │      │    T2.8                  ▼         ▼
T1.4b (llm_models) ───────────┼──────┤                       T2.6      T2.7
                              │      ▼                          │         │
                              ├──► T1.4c                        └────┬────┘
                              │      │                               ▼
                              │      ▼                             T2.9 ───► T2.10
                              └──► T1.5 ───► T1.6
                                     │
                     ┌───────────────┘
                     │                                     │
                     ▼                                     ▼
              ┌──────────────────────────────────────────────┐
              │              Phase 3 + 4 (API)               │
              │  T3.1 ───► T3.2 ───► T3.3                    │
              │  T3.4                  │                     │
              │  T4.1 ───► T4.2 ───► T4.3                    │
              │             │    ───► T4.4                   │
              │             └────────► T4.5 ───► T4.6        │
              └──────────────────────────────────────────────┘
                                       │
                                       ▼
              ┌──────────────────────────────────────────────┐
              │              Phase 5 (Endpoints)             │
              │  T5.1, T5.2 (parallel)                       │
              │  T5.3, T5.4, T5.5                            │
              └──────────────────────────────────────────────┘
                                       │
                                       ▼
              ┌──────────────────────────────────────────────┐
              │              Phase 6 (Frontend)              │
              │  T6.1 ───► T6.3                              │
              │  T6.2 ───► T6.4 ───► T6.5                    │
              │  T6.6                                        │
              │  T6.7 (depends on T7.1)                      │
              └──────────────────────────────────────────────┘
                                       │
                                       ▼
              ┌──────────────────────────────────────────────┐
              │              Phase 7 (Billing)               │
              │  T7.1 ───► T7.2                              │
              │  T7.3, T7.4 (scheduled jobs)                 │
              │  T7.5, T7.6 (plan changes)                   │
              │  T7.7 (notifications)                        │
              └──────────────────────────────────────────────┘
                                       │
                                       ▼
              ┌──────────────────────────────────────────────┐
              │              Phase 8 (Testing)               │
              │  T8.1, T8.2, T8.3                            │
              └──────────────────────────────────────────────┘
```

---

## Completion Checklist

- [x] Phase 1: Database Schema (Capabilities) - 9 tasks → **8 completed, 1 skipped (T1.4d)**
  - [x] T1.1, T1.2, T1.3, T1.4, T1.4b, T1.4c, T1.5, T1.6
  - [-] T1.4d (skipped - column never added)
- [x] Phase 2: Database Schema (Credits) - 10 tasks → **10 completed** ✅
  - [x] T2.1, T2.2, T2.3, T2.4, T2.5, T2.6, T2.7, T2.8, T2.9, T2.10
- [x] Phase 3: API Capability Access - 4 tasks → **4 completed** (T3.1, T3.2, T3.3, T3.4) ✅
- [x] Phase 4: API Credit Management - 6 tasks → **6 completed** (T4.1-T4.6) ✅
- [x] Phase 5: API Integration - 5 tasks → **5 completed** (T5.1-T5.5) ✅
- [x] Phase 6: Frontend - 7 tasks → **7 completed** (T6.1-T6.7) ✅
- [x] Phase 7: Billing Integration - 7 tasks → **7 completed** (T7.1-T7.7) ✅
- [ ] Phase 8: Testing - 3 tasks

**Total: 51 tasks** (added 3 tasks for llm_models normalization)
**Completed: 48 tasks** | **Skipped: 1 task** | **Remaining: 2 tasks** (T8.1, T8.2, T8.3 - Testing)
