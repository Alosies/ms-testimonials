# ADR-023: AI Credits Plan Integration

## Doc Connections
**ID**: `adr-023-ai-credits-plan-integration`

2026-01-26 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-012-ai-service-infrastructure` - AI Service Infrastructure (providers, circuit breaker)
- `prd-005-ai-testimonial-generation` - AI testimonial generation feature

---

## Status

**Implemented** - 2026-02-01 (Phases 1-6 complete, Phase 7 deferred, Phase 8 proposed)

*Originally Proposed: 2026-01-26*
*Amended: 2026-02-21 — Decision 8a: Public Endpoint Customer Identity*

## Context

As we expand AI features in the platform, we need a robust system to:

1. **Gate AI features by credits** - Different plans provide different credit allocations
2. **Track AI usage with audit trail** - Monitor credit consumption per organization
3. **Enable credit top-ups** - Allow users to purchase additional credits
4. **Fair billing** - Charge based on actual usage, not fixed per-operation costs

### Current AI Features

| Feature | Code Name | Description |
|---------|-----------|-------------|
| AI Question Generation | `question_generation` | Generate smart prompt questions for forms |
| AI Testimonial Assembly | `testimonial_assembly` | Craft testimonials from Q&A responses |
| AI Testimonial Polish | `testimonial_polish` | Refine/regenerate testimonials |

### Existing Credit Infrastructure

The API already has credit calculation infrastructure in `api/src/shared/libs/ai/audit.ts`:

```typescript
// Dynamic credit calculation from actual USD cost
function calculateCreditsFromCost(costUsd: number): number
// 1 credit = $0.001 USD
// Minimum 0.25 credits per operation
// Rounds UP to nearest 0.25 increment

// Existing types
type AIOperationType = 'question_generation' | 'testimonial_assembly' | 'testimonial_polish' | 'ai_regenerate';

interface AIAuditRecord {
  transactionId: string;
  organizationId: string;
  operationType: AIOperationType;
  creditsCharged: number;
  usage: AIUsageData;
  // ...
}
```

### Current Plan Structure

| Plan | max_forms | max_testimonials | max_widgets | AI Credits (proposed) |
|------|-----------|------------------|-------------|----------------------|
| Free | 1 | 50 | 1 | 10/month |
| Pro | 5 | unlimited | unlimited | 500/month |
| Team | unlimited | unlimited | unlimited | 2000/month |

### Problems Identified

**1. No Credit Balance Tracking**
- Credits are calculated but not deducted from a balance
- No way to enforce limits or track consumption

**2. No Top-Up Mechanism**
- Users cannot purchase additional credits
- No revenue path for heavy AI users

**3. No Audit Trail**
- Credit consumption is logged but not persisted to database
- Cannot show usage history to users

### Alternatives Considered

| Approach | Description | Verdict |
|----------|-------------|---------|
| **Per-capability limits** | `question_generation: 50/mo` | ❌ Rejected: Inflexible, forces users to optimize per-feature |
| **Fixed per-operation cost** | `testimonial_assembly = 5 credits` | ❌ Rejected: Unfair for short vs long testimonials |
| **Credit pool + dynamic pricing** | Unified pool, charge by actual usage | ✅ Selected: Fair, flexible, leverages existing code |

---

## Decision

Implement a **two-layer AI access control system**:

1. **Feature Gating** (`ai_capabilities` + `plan_ai_capabilities`) - Which AI features each plan can access
2. **Credit Pool** (`organization_credit_balances` + `credit_transactions`) - Usage-based billing with audit trail

This separates "can you use this feature?" from "how much can you use?".

### Architecture Overview

```
┌─────────────────────┐       ┌──────────────────────┐       ┌─────────────────┐
│   ai_capabilities   │       │ plan_ai_capabilities │       │      plans      │
├─────────────────────┤       ├──────────────────────┤       ├─────────────────┤
│ id                  │◄──────│ ai_capability_id     │       │ id              │
│ unique_name         │       │ plan_id              │──────►│ unique_name     │
│ name                │       │ is_enabled           │       │ monthly_ai_     │
│ description         │       │ rate_limit_rpm/rpd   │       │   credits       │
│ category            │       └──────────┬───────────┘       └─────────────────┘
│ is_active           │                  │
└─────────────────────┘                  │
                                         │ 1:N
                                         ▼
                       ┌─────────────────────────────────────┐
                       │ plan_ai_capability_quality_levels   │
                       ├─────────────────────────────────────┤
┌─────────────────┐    │ plan_ai_capability_id               │
│ quality_levels  │◄───│ quality_level_id                    │
├─────────────────┤    │ allowed_models[]                    │
│ id (nanoid)     │    └─────────────────────────────────────┘
│ unique_name     │
│ name            │
│ credit_multipli │
└─────────────────┘                                              │
                                                                     │ (snapshot)
                                                                     ▼
                                                      ┌──────────────────────┐
                                                      │  organization_plans   │
                                                      ├──────────────────────┤
                                                      │ monthly_ai_credits   │
                                                      └──────────────────────┘
                                                                     │
                                                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        organization_credit_balances                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ organization_id     │ FK → organizations                                     │
│ monthly_credits     │ Credits from plan (resets each period)                 │
│ bonus_credits       │ Credits from top-ups/promos (never reset)              │
│ reserved_credits    │ Credits held during active AI operations               │
│ period_start/end    │ Current billing period boundaries                      │
│ [used_this_period]  │ COMPUTED from credit_transactions (not stored)         │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Audit trail
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          credit_transactions                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ id                  │ Transaction ID                                         │
│ organization_id     │ FK → organizations                                     │
│ ai_capability_id    │ FK → ai_capabilities (for consumption)                 │
│ transaction_type    │ 'allocation' | 'consumption' | 'topup' | ...          │
│ credits_amount      │ + for additions, - for consumption                     │
│ balance_after       │ Running balance after this transaction                 │
│ provider_metadata   │ JSONB: tokens, model, cost_usd, request_id             │
│ created_at          │ Timestamp                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Two-Layer Access Control

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AI Feature Request                           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Layer 1: FEATURE ACCESS (plan_ai_capabilities)                      │
│                                                                     │
│   "Can this plan use this AI feature at all?"                       │
│                                                                     │
│   ├── Not in plan → DENY (feature_not_available)                    │
│   ├── is_enabled = false → DENY (feature_disabled)                  │
│   └── Check quality_levels for requested quality                    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                              Feature allowed
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Layer 2: CREDIT CHECK (organization_credit_balances)                │
│                                                                     │
│   "Does the org have enough credits?"                               │
│                                                                     │
│   └── available < estimated_cost → DENY (insufficient_credits)      │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                              Has credits
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Execute AI Operation → Consume Credits → Record Transaction         │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

#### 1. Two Credit Types: Monthly vs Bonus

| Type | Source | Rollover | Priority |
|------|--------|----------|----------|
| **Monthly Credits** | Plan allocation | No - resets each period | Used first |
| **Bonus Credits** | Top-ups, promos, referrals | Yes - never expire | Used after monthly depleted |

This encourages upgrades (monthly resets) while rewarding purchases (bonus persists).

**Credit Consumption Priority Logic:**

When consuming credits, always deduct from monthly first (use-it-or-lose-it), then bonus:

```sql
-- Calculate how much to take from each pool
monthly_available := monthly_credits - get_used_this_period(org_id);
monthly_to_consume := LEAST(actual_credits, monthly_available);
bonus_to_consume := actual_credits - monthly_to_consume;

-- Apply consumption (in settleCredits)
-- Monthly consumption is tracked automatically via credit_transactions
-- Only bonus_credits needs explicit update when monthly is exhausted
UPDATE organization_credit_balances
SET
  bonus_credits = bonus_credits - bonus_to_consume,
  reserved_credits = reserved_credits - estimated_credits
WHERE organization_id = $org_id
  AND bonus_credits >= bonus_to_consume;  -- Prevent negative bonus

-- Record the transaction (this is what tracks monthly usage)
INSERT INTO credit_transactions (
  organization_id, transaction_type, credits_amount, ...
) VALUES (
  $org_id, 'ai_consumption', -$actual_credits, ...
);
```

**Example:**
- User has: 20 monthly remaining, 50 bonus
- Operation costs: 25 credits
- Consumption: 20 from monthly (depleted), 5 from bonus
- After: 0 monthly remaining, 45 bonus
- Transaction recorded: -25 credits (used_this_period now computed as 20 more)

#### 2. Credit Consumption Formula

Credits are calculated **dynamically** based on actual token usage:

```
credits = ceil(cost_usd / 0.001 * 4) / 4
        = ceil(cost_usd * 4000) / 4

Where:
- cost_usd = (input_tokens * input_price + output_tokens * output_price) / 1,000,000
- Minimum: 0.25 credits
- Increment: 0.25 credits
```

Example:
- GPT-4o-mini: ~500 tokens → ~$0.0003 → 0.25 credits (minimum)
- GPT-4o: ~2000 tokens → ~$0.006 → 6 credits
- Claude Sonnet: ~3000 tokens → ~$0.012 → 12 credits

#### 3. Snapshot vs Live Lookup

| Field | Pattern | Reason |
|-------|---------|--------|
| `monthly_credits` | **Snapshot** at subscribe | Consistent billing, upgrade incentive |
| `bonus_credits` | **Live balance** | Always available regardless of plan |

#### 4. Credit Reservation Pattern

To prevent race conditions and avoid charging for failed operations, use a **reserve → execute → settle** pattern:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   RESERVE   │────►│   EXECUTE   │────►│   SETTLE    │
│ (estimated) │     │  (AI call)  │     │  (actual)   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   ▼
       │                   │           ┌─────────────┐
       │                   └──────────►│   RELEASE   │
       │                   (on error)  │(if failed)  │
       │                               └─────────────┘
       ▼
  Blocks other
  operations from
  using reserved
  credits
```

**Reserve** (before AI call):
```sql
UPDATE organization_credit_balances
SET reserved_credits = reserved_credits + $estimated
WHERE organization_id = $org_id
  AND (monthly_credits - get_used_this_period($org_id) - reserved_credits + bonus_credits) >= $estimated
RETURNING *;
```

**Settle** (after successful AI call):
```sql
-- 1. Release the reservation and deduct from bonus if monthly exhausted
UPDATE organization_credit_balances
SET
  bonus_credits = bonus_credits - $bonus_to_consume,  -- Only if monthly exhausted
  reserved_credits = reserved_credits - $estimated
WHERE organization_id = $org_id
RETURNING *;

-- 2. Record the consumption (this is what tracks used_this_period)
INSERT INTO credit_transactions (
  organization_id, transaction_type, credits_amount, ai_capability_id, ...
) VALUES (
  $org_id, 'ai_consumption', -$actual, $capability_id, ...
);
```

**Release** (on failure):
```sql
UPDATE organization_credit_balances
SET reserved_credits = reserved_credits - $estimated
WHERE organization_id = $org_id;
```

Available credits = `monthly_credits - get_used_this_period() - reserved_credits + bonus_credits`

#### 5. Credit Transaction Types

| Type | credits_amount | Description |
|------|----------------|-------------|
| `plan_allocation` | +N | Monthly reset from plan |
| `topup_purchase` | +N | User purchased credits |
| `promo_bonus` | +N | Promotional credit grant |
| `referral_bonus` | +N | Referral program credit |
| `ai_consumption` | -N | AI operation consumed credits |
| `admin_adjustment` | ±N | Manual admin adjustment |
| `refund` | +N | Refund for failed operation |
| `plan_change_adjustment` | ±N | Credit adjustment on plan change |

#### 6. Plan Upgrade/Downgrade Handling

**Policy: Immediate upgrades, end-of-cycle downgrades.**

This follows the industry standard (Anthropic, Vercel, etc.) to avoid negative balance confusion and honor the period users have paid for.

##### What Changes on Plan Change

| Area | Source Table | Effect |
|------|--------------|--------|
| AI Capabilities | `plan_ai_capabilities` | Which AI features are enabled |
| Quality Levels | `plan_ai_capability_quality_levels` | Which quality tiers are available |
| Monthly Credits | `organization_credit_balances.monthly_credits` | Credit allocation per period |

##### Upgrade Flow (Immediate)

Upgrades take effect **immediately**. User paid more, give access now.

```
┌─────────────────────────────────────────────────────────────────────┐
│ UPGRADE: Pro → Team (Immediate)                                     │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Update organization_plans.plan_id → Team plan                    │
│                                                                     │
│ 2. Update organization_credit_balances:                             │
│    SET monthly_credits = 2000  (was 500)                            │
│    -- period_start/end unchanged (mid-cycle upgrade)                │
│    -- used_this_period unchanged (computed from transactions)       │
│    -- bonus_credits unchanged                                       │
│                                                                     │
│ 3. Record transaction:                                              │
│    INSERT INTO credit_transactions (                                │
│      transaction_type = 'plan_change_adjustment',                   │
│      credits_amount = +1500,  -- difference                         │
│      note = 'Upgrade from Pro to Team'                              │
│    )                                                                │
│                                                                     │
│ 4. New capabilities/quality levels available immediately            │
│    (looked up via new plan_id → plan_ai_capabilities)               │
└─────────────────────────────────────────────────────────────────────┘
```

**Example - Mid-cycle Upgrade:**
```
Before (Pro plan, day 15 of 30):
  monthly_credits = 500
  used_this_period = 200 (computed)
  available = 500 - 200 = 300

After upgrade to Team:
  monthly_credits = 2000
  used_this_period = 200 (unchanged - same transactions)
  available = 2000 - 200 = 1800  ✓ User gains 1500 credits immediately
```

##### Downgrade Flow (End-of-Cycle)

Downgrades are **scheduled for end of billing period**. User keeps current plan benefits until then.

```
┌─────────────────────────────────────────────────────────────────────┐
│ DOWNGRADE: Team → Pro (End of Cycle)                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ STEP 1: User requests downgrade                                     │
│ ─────────────────────────────────────────────────────────────────── │
│ UPDATE organization_plans                                           │
│ SET pending_plan_id = (Pro plan id),                                │
│     pending_change_at = period_end;                                 │
│                                                                     │
│ → User keeps Team capabilities until period_end                     │
│ → UI shows: "Your plan will change to Pro on Feb 15"                │
│                                                                     │
│ STEP 2: At period_end (scheduled job or Stripe webhook)             │
│ ─────────────────────────────────────────────────────────────────── │
│ UPDATE organization_plans                                           │
│ SET plan_id = pending_plan_id,                                      │
│     pending_plan_id = NULL,                                         │
│     pending_change_at = NULL;                                       │
│                                                                     │
│ UPDATE organization_credit_balances                                 │
│ SET monthly_credits = 500,        -- New plan's allocation          │
│     period_start = NOW(),         -- Start fresh period             │
│     period_end = NOW() + '1 month';                                 │
│                                                                     │
│ INSERT INTO credit_transactions (                                   │
│   transaction_type = 'plan_allocation',                             │
│   credits_amount = 500,                                             │
│   note = 'Monthly allocation for Pro plan'                          │
│ );                                                                  │
│                                                                     │
│ → used_this_period resets to 0 (new period, no transactions yet)    │
│ → No negative balance possible                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Example - End-of-Cycle Downgrade:**
```
Day 20: User requests downgrade Team → Pro
  Current: monthly_credits = 2000, used = 800, available = 1200
  UI shows: "Downgrade scheduled for Feb 15. You'll keep Team until then."

Day 30 (period_end): Scheduled job runs
  New period starts:
    monthly_credits = 500 (Pro plan)
    used_this_period = 0 (fresh period)
    available = 500  ✓ Clean slate, no negative balance
```

##### Cancellation

Cancellation follows the same pattern as downgrade:

```
┌─────────────────────────────────────────────────────────────────────┐
│ CANCELLATION                                                        │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Set pending cancellation:                                        │
│    UPDATE organization_plans                                        │
│    SET pending_plan_id = NULL,  -- NULL = cancelled                 │
│        pending_change_at = period_end;                              │
│                                                                     │
│ 2. User keeps current plan until period_end                         │
│                                                                     │
│ 3. At period_end:                                                   │
│    - Downgrade to Free plan (if available) or                       │
│    - Suspend AI access (set monthly_credits = 0)                    │
│    - Bonus credits preserved (they paid for those)                  │
└─────────────────────────────────────────────────────────────────────┘
```

##### Database Support

Add pending change columns to `organization_plans`:

```sql
ALTER TABLE organization_plans
ADD COLUMN pending_plan_id VARCHAR(12) REFERENCES plans(id),
ADD COLUMN pending_change_at TIMESTAMPTZ;

COMMENT ON COLUMN organization_plans.pending_plan_id IS
    'Plan to switch to at pending_change_at. NULL with pending_change_at = cancellation.';
COMMENT ON COLUMN organization_plans.pending_change_at IS
    'When the pending plan change takes effect. Processed by scheduled job.';

-- Index for scheduled job to find pending changes
CREATE INDEX idx_organization_plans_pending
    ON organization_plans(pending_change_at)
    WHERE pending_change_at IS NOT NULL;
```

##### Summary

| Action | When Applied | Credits | Capabilities |
|--------|--------------|---------|--------------|
| **Upgrade** | Immediately | Increased to new plan level | Expanded immediately |
| **Downgrade** | End of billing period | Reset to new plan level | Reduced at period end |
| **Cancellation** | End of billing period | Set to 0 (or Free tier) | Removed at period end |

This approach:
- ✅ No negative balance scenarios
- ✅ Users get what they paid for until period ends
- ✅ Clean billing boundaries
- ✅ Matches user expectations from other SaaS products

#### 7. Idempotency

All credit-modifying operations must be idempotent to handle retries safely:

- Each API request includes an `idempotency_key` (e.g., `{request_id}-{org_id}-{capability_id}`)
- `credit_transactions.idempotency_key` is UNIQUE
- Duplicate requests return the original transaction result
- Keys expire after 24 hours (can be cleaned up)

#### 8. Audit Log Snapshot Pattern

**Problem:** Credit transactions must maintain historical accuracy even when related entities (users, forms) are renamed or deleted.

**Decision:** Use a **snapshot + FK hybrid pattern** for audit context:

| Field | Type | Purpose |
|-------|------|---------|
| `user_id` | FK (SET NULL) | Links to current user (for navigation) |
| `user_display_name` | TEXT | Snapshot of user email/name at transaction time |
| `form_id` | FK (SET NULL) | Links to current form (for navigation) |
| `form_name` | TEXT | Snapshot of form name at transaction time |

**Why Snapshot Pattern?**

Audit logs must capture **point-in-time truth**:

| Scenario | FK Only (❌) | Snapshot (✅) |
|----------|-------------|---------------|
| Form renamed | Shows new name (misleading) | Shows name at transaction time |
| Form deleted | Shows NULL or error | Preserves historical name |
| User deleted | Shows NULL | Preserves email for accountability |
| Investigating "Why 500 credits in Jan?" | Broken context | Complete historical record |

**Display Logic:**

```typescript
// UI display logic for actor column
function getActorDisplay(tx: CreditTransaction): string {
  if (tx.user_display_name) return tx.user_display_name;
  if (tx.form_name) return `Anonymous • ${tx.form_name}`;
  return 'System';
}
```

**Transaction Types & Context:**

| Transaction Type | User Context | Form Context |
|------------------|--------------|--------------|
| `ai_consumption` (logged-in user) | ✅ User email | ✅ Form name |
| `ai_consumption` (anonymous testimonial) | "Anonymous" | ✅ Form name |
| `plan_allocation` | "System" | — |
| `topup_purchase` | ✅ User email | — |
| `admin_adjustment` | ✅ Admin email | — |

**Migration Required:**

Add to `credit_transactions`:
```sql
-- User context (nullable for system operations)
user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
user_display_name TEXT,  -- Snapshot: "john@company.com" or "Anonymous"

-- Form context (nullable for non-form operations)
form_id TEXT REFERENCES forms(id) ON DELETE SET NULL,
form_name TEXT,  -- Snapshot: "Product Feedback Form"
```

Add to `credit_reservations` (to capture context at reserve time):
```sql
user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
user_display_name TEXT,
form_id TEXT REFERENCES forms(id) ON DELETE SET NULL,
form_name TEXT,
```

**Reference:** This pattern is inspired by Cursor's Usage page which shows minimal but transparent audit info: Date | User | Type | Credits.

#### 8a. Public Endpoint Customer Identity via Google JWT (Amendment — 2026-02-21)

**Problem:** Decision 8 acknowledged that public endpoint operations (testimonial assembly) record `"Anonymous"` as the actor. This creates two issues:

1. **No audit trail** — Form owners cannot see *who* consumed their AI credits
2. **No abuse prevention** — A single person can drain an org's credits by repeatedly regenerating testimonials, since the server has no concept of customer identity
3. **Regeneration limit is client-only** — The `regenerationsRemaining` counter resets on page refresh

**Context:** The public form already requires Google Sign-In (One Tap) before the AI path. The frontend captures `google_id`, `email`, `name`, and `picture` from the Google JWT — but this identity is never sent to the API. The credential is decoded client-side only.

**Decision:** Verify the Google JWT server-side and use the verified identity for audit + per-customer rate limiting.

**Flow:**

```
Customer clicks "Let AI craft your story"
  → Google One Tap popup → receives JWT credential
  → Frontend sends credential in assembleTestimonial request
  → API verifies JWT against Google's public keys
  → Extracts google_id, email, name
  → Passes into executeWithAIAccess audit context
  → Checks per-customer generation count before proceeding
```

**API Changes:**

1. Add `customer_credential` (optional string) to `AssembleTestimonialRequest` schema:
   ```typescript
   customer_credential: z.string().optional()
   // The raw Google One Tap JWT (id_token)
   ```

2. Add server-side Google JWT verification utility:
   ```typescript
   // api/src/shared/utils/googleAuth.ts
   interface VerifiedCustomer {
     google_id: string;
     email: string;
     name: string;
     picture?: string;
   }

   async function verifyGoogleCredential(
     credential: string
   ): Promise<VerifiedCustomer | null>
   // Verifies JWT signature against Google's public keys (JWKS)
   // Validates: iss, aud (our client_id), exp, nbf
   // Returns null if invalid (don't throw — treat as anonymous)
   ```

3. Update `assembleTestimonial` handler audit context:
   ```typescript
   // Before (current):
   userId: null,
   userEmail: null,

   // After:
   userId: null,  // Still null — customer is not a platform user
   userEmail: verifiedCustomer?.email ?? null,
   // New field for display:
   userDisplayName: verifiedCustomer
     ? `${verifiedCustomer.name} (${verifiedCustomer.email})`
     : 'Anonymous',
   ```

4. Add per-customer generation limit check:
   ```typescript
   // Before executing AI operation, query credit_transactions:
   // COUNT(*) WHERE form_id = :formId
   //   AND customer_google_id = :googleId
   //   AND created_at > NOW() - INTERVAL '24 hours'
   //   AND transaction_type = 'ai_consumption'
   //
   // If count >= MAX_GENERATIONS_PER_CUSTOMER (e.g., 4), deny with:
   //   { code: 'CUSTOMER_LIMIT_EXCEEDED', message: '...' }
   ```

**Schema Changes:**

Add `customer_google_id` to `credit_transactions` and `credit_reservations`:

```sql
-- credit_transactions (audit log)
ALTER TABLE credit_transactions
  ADD COLUMN customer_google_id TEXT;
-- Not a FK — external identity, no referential integrity needed

CREATE INDEX idx_credit_transactions_customer
  ON credit_transactions (form_id, customer_google_id, created_at DESC)
  WHERE customer_google_id IS NOT NULL;

-- credit_reservations (in-flight tracking)
ALTER TABLE credit_reservations
  ADD COLUMN customer_google_id TEXT;
```

**Updated Transaction Types & Context (extends Decision 8 table):**

| Transaction Type | User Context | Form Context | Customer Context |
|------------------|--------------|--------------|------------------|
| `ai_consumption` (logged-in user) | ✅ User email | ✅ Form name | — |
| `ai_consumption` (public, verified) | — | ✅ Form name | ✅ Google email + ID |
| `ai_consumption` (public, anonymous) | — | ✅ Form name | "Anonymous" |
| `plan_allocation` | "System" | — | — |

**Updated Display Logic (extends Decision 8):**

```typescript
function getActorDisplay(tx: CreditTransaction): string {
  if (tx.user_display_name) return tx.user_display_name;
  if (tx.customerGoogleId && tx.form_name) {
    return `${tx.user_display_name} • ${tx.form_name}`;
  }
  if (tx.form_name) return `Anonymous • ${tx.form_name}`;
  return 'System';
}
```

**Per-Customer Limit Constants:**

| Constant | Value | Rationale |
|----------|-------|-----------|
| `MAX_GENERATIONS_PER_CUSTOMER_PER_FORM` | 4 | 1 initial + 3 refinements. Matches frontend counter. |
| `CUSTOMER_LIMIT_WINDOW_HOURS` | 24 | Resets daily. Prevents accumulation exploits. |

**Why verify server-side instead of trusting the client?**

| Approach | Trust | Abuse Risk | Effort |
|----------|-------|------------|--------|
| Trust client-sent email | None | High — anyone can send `"ceo@company.com"` | Low |
| Verify Google JWT server-side | Cryptographic | Low — can't forge Google's signature | Medium |
| Full account creation | Full | Lowest | High (overkill for testimonial customers) |

**Graceful degradation:** If `customer_credential` is missing or verification fails, the operation proceeds as anonymous (current behavior). This ensures backwards compatibility and handles edge cases (expired token, Google outage). The per-customer limit simply doesn't apply for anonymous requests — the existing org-level rate limits still protect against bulk abuse.

**Frontend changes:**

- `useTestimonialAIFlow` sends `customerInfo.credential` (the raw JWT) alongside existing request fields
- `useCustomerGoogleAuth` stores the raw `credential` string in addition to the decoded info
- Regeneration counter becomes server-informed: API returns `generations_remaining` in response

---

## Database Schema

### Table: `ai_capabilities`

Master list of AI features. Adding new capabilities = new row, not schema change.

```sql
CREATE TABLE ai_capabilities (
    id              VARCHAR(12) PRIMARY KEY DEFAULT generate_nanoid_12(),
    unique_name     VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,

    -- Categorization
    category        VARCHAR(50) NOT NULL DEFAULT 'generation',
    -- Categories: 'generation', 'analysis', 'moderation', 'translation'

    -- For UI display
    icon            VARCHAR(50),  -- e.g., 'sparkles', 'wand', 'language'

    -- Estimated credit cost (for pre-operation display)
    estimated_credits_fast      DECIMAL(6,2) NOT NULL DEFAULT 0.25,
    estimated_credits_enhanced  DECIMAL(6,2) NOT NULL DEFAULT 2.0,
    estimated_credits_premium   DECIMAL(6,2) NOT NULL DEFAULT 5.0,

    -- Global toggle (for outages, deprecation)
    is_active       BOOLEAN NOT NULL DEFAULT true,

    -- Audit
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ai_capabilities IS
    'Master list of AI features. New capabilities = new row, not schema change.';
COMMENT ON COLUMN ai_capabilities.unique_name IS
    'Code identifier: question_generation, testimonial_assembly, testimonial_polish';
COMMENT ON COLUMN ai_capabilities.category IS
    'Feature grouping for UI: generation, analysis, moderation, translation';
COMMENT ON COLUMN ai_capabilities.estimated_credits_fast IS
    'Estimated credits for fast quality (shown in UI before operation)';
```

### Table: `quality_levels`

Reference table for AI quality tiers. Using a table instead of an enum allows:
- Easy addition/removal of quality levels without `ALTER TYPE`
- Metadata per level (display name, description, pricing multiplier)
- Extensibility for model mappings per capability

```sql
CREATE TABLE quality_levels (
    id              VARCHAR(12) PRIMARY KEY DEFAULT generate_nanoid_12(),
    unique_name     VARCHAR(30) NOT NULL UNIQUE,  -- 'fast', 'enhanced', 'premium'
    name            VARCHAR(50) NOT NULL,
    description     TEXT,
    display_order   INT NOT NULL DEFAULT 0,

    -- Pricing hint (actual cost computed from tokens)
    credit_multiplier   DECIMAL(4,2) NOT NULL DEFAULT 1.0,

    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed quality levels
INSERT INTO quality_levels (unique_name, name, description, display_order, credit_multiplier) VALUES
    ('fast', 'Fast', 'Quick results using efficient models (GPT-4o-mini)', 1, 1.0),
    ('enhanced', 'Enhanced', 'Better quality with more capable models (GPT-4o)', 2, 4.0),
    ('premium', 'Premium', 'Best quality using top-tier models (Claude Sonnet)', 3, 10.0);

COMMENT ON TABLE quality_levels IS
    'Reference table for AI quality tiers. Replaces enum for flexibility.';
COMMENT ON COLUMN quality_levels.unique_name IS
    'Code identifier: fast, enhanced, premium. Used in API requests.';
COMMENT ON COLUMN quality_levels.credit_multiplier IS
    'Relative cost multiplier for UI estimates. Actual cost from token usage.';
```

### Table: `plan_ai_capabilities`

Junction table defining which AI features each plan can access.

```sql
CREATE TABLE plan_ai_capabilities (
    id                  VARCHAR(12) PRIMARY KEY DEFAULT generate_nanoid_12(),
    plan_id             VARCHAR(12) NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    ai_capability_id    VARCHAR(12) NOT NULL REFERENCES ai_capabilities(id) ON DELETE CASCADE,

    -- Access control
    is_enabled          BOOLEAN NOT NULL DEFAULT true,

    -- NOTE: Quality levels moved to plan_ai_capability_quality_levels table
    -- This allows per-quality-level configuration (e.g., allowed models)

    -- Rate limiting (independent of credits)
    -- NULL = unlimited, 0 = blocked
    rate_limit_rpm      INT,  -- Requests per minute (deferred - requires caching)
    rate_limit_rph      INT,  -- Requests per hour (sliding 60-min window)
    rate_limit_rpd      INT,  -- Requests per day (since midnight UTC)

    -- Audit
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(plan_id, ai_capability_id)
);

CREATE INDEX idx_plan_ai_capabilities_plan ON plan_ai_capabilities(plan_id);
CREATE INDEX idx_plan_ai_capabilities_capability ON plan_ai_capabilities(ai_capability_id);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_plan_ai_capabilities_updated_at
    BEFORE UPDATE ON plan_ai_capabilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE plan_ai_capabilities IS
    'Junction table: which plans can access which AI features.';
COMMENT ON COLUMN plan_ai_capabilities.is_enabled IS
    'Soft toggle. false = temporarily disabled without deleting config.';
COMMENT ON COLUMN plan_ai_capabilities.rate_limit_rpm IS
    'Max requests per minute. NULL=unlimited. Deferred - requires caching layer.';
COMMENT ON COLUMN plan_ai_capabilities.rate_limit_rph IS
    'Max requests per hour (sliding 60-min window). NULL=unlimited. Primary abuse protection.';
COMMENT ON COLUMN plan_ai_capabilities.rate_limit_rpd IS
    'Max requests per day (since midnight UTC). NULL=unlimited. Prevents abuse on free tier.';
```

### Table: `plan_ai_capability_quality_levels`

Junction table defining which quality levels each plan can use for each capability,
with extensibility for model restrictions.

```sql
CREATE TABLE plan_ai_capability_quality_levels (
    id                      VARCHAR(12) PRIMARY KEY DEFAULT generate_nanoid_12(),
    plan_ai_capability_id   VARCHAR(12) NOT NULL
                            REFERENCES plan_ai_capabilities(id) ON DELETE CASCADE,
    quality_level_id        VARCHAR(12) NOT NULL
                            REFERENCES quality_levels(id) ON DELETE CASCADE,

    -- Model restrictions (NULL = use capability defaults)
    -- Allows different plans to access different models at the same quality level
    allowed_models          TEXT[],  -- e.g., ['gpt-4o-mini', 'claude-3-haiku']

    -- Future extensibility
    -- max_tokens_override  INT,     -- Override default token limits
    -- priority             INT,     -- Queue priority for this plan

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(plan_ai_capability_id, quality_level_id)
);

-- Index for checking "can this plan use this quality level?"
CREATE INDEX idx_pacql_lookup
    ON plan_ai_capability_quality_levels(plan_ai_capability_id, quality_level_id);

-- Index for reverse lookup ("which plans have premium access?")
CREATE INDEX idx_pacql_quality
    ON plan_ai_capability_quality_levels(quality_level_id);

COMMENT ON TABLE plan_ai_capability_quality_levels IS
    'Which quality levels each plan can use per capability. Extensible for model restrictions.';
COMMENT ON COLUMN plan_ai_capability_quality_levels.allowed_models IS
    'Restrict models for this plan+capability+quality. NULL = use capability defaults.';
```

### Seed Data: AI Capabilities & Plan Mappings

```sql
-- Insert AI capabilities
INSERT INTO ai_capabilities (unique_name, name, description, category, estimated_credits_fast, estimated_credits_enhanced, estimated_credits_premium) VALUES
    ('question_generation', 'AI Question Generation',
     'Generate smart prompt questions tailored to your product',
     'generation', 0.5, 2.0, 5.0),
    ('testimonial_assembly', 'AI Testimonial Assembly',
     'Craft polished testimonials from customer Q&A responses',
     'generation', 1.0, 4.0, 10.0),
    ('testimonial_polish', 'AI Testimonial Polish',
     'Refine and improve existing testimonials',
     'generation', 0.5, 2.0, 5.0);

-- =============================================================================
-- Plan AI Capabilities (base access)
-- =============================================================================

-- Free plan: Only question_generation enabled, strict rate limits
INSERT INTO plan_ai_capabilities (plan_id, ai_capability_id, is_enabled, rate_limit_rpm, rate_limit_rpd)
SELECT p.id, ac.id,
    ac.unique_name = 'question_generation',  -- Only enable question_generation
    CASE WHEN ac.unique_name = 'question_generation' THEN 5 ELSE NULL END,
    CASE WHEN ac.unique_name = 'question_generation' THEN 20 ELSE NULL END
FROM plans p, ai_capabilities ac
WHERE p.unique_name = 'free';

-- Pro plan: All capabilities enabled, moderate rate limits
INSERT INTO plan_ai_capabilities (plan_id, ai_capability_id, is_enabled, rate_limit_rpm, rate_limit_rpd)
SELECT p.id, ac.id, true, 30, 500
FROM plans p, ai_capabilities ac
WHERE p.unique_name = 'pro';

-- Team plan: All capabilities enabled, unlimited rate limits
INSERT INTO plan_ai_capabilities (plan_id, ai_capability_id, is_enabled, rate_limit_rpm, rate_limit_rpd)
SELECT p.id, ac.id, true, NULL, NULL
FROM plans p, ai_capabilities ac
WHERE p.unique_name = 'team';

-- =============================================================================
-- Quality Level Access (per plan + capability)
-- =============================================================================

-- Free plan: Only 'fast' quality for question_generation
INSERT INTO plan_ai_capability_quality_levels (plan_ai_capability_id, quality_level_id, allowed_models)
SELECT pac.id, ql.id, ARRAY['gpt-4o-mini']
FROM plan_ai_capabilities pac
JOIN plans p ON p.id = pac.plan_id
JOIN ai_capabilities ac ON ac.id = pac.ai_capability_id
JOIN quality_levels ql ON ql.unique_name = 'fast'
WHERE p.unique_name = 'free' AND ac.unique_name = 'question_generation';

-- Pro plan: 'fast' + 'enhanced' for all capabilities
INSERT INTO plan_ai_capability_quality_levels (plan_ai_capability_id, quality_level_id, allowed_models)
SELECT pac.id, ql.id,
    CASE ql.unique_name
        WHEN 'fast' THEN ARRAY['gpt-4o-mini', 'claude-3-haiku']
        WHEN 'enhanced' THEN ARRAY['gpt-4o', 'claude-3-5-sonnet']
    END
FROM plan_ai_capabilities pac
JOIN plans p ON p.id = pac.plan_id
CROSS JOIN quality_levels ql
WHERE p.unique_name = 'pro' AND ql.unique_name IN ('fast', 'enhanced');

-- Team plan: All quality levels for all capabilities
INSERT INTO plan_ai_capability_quality_levels (plan_ai_capability_id, quality_level_id, allowed_models)
SELECT pac.id, ql.id,
    CASE ql.unique_name
        WHEN 'fast' THEN ARRAY['gpt-4o-mini', 'claude-3-haiku']
        WHEN 'enhanced' THEN ARRAY['gpt-4o', 'claude-3-5-sonnet']
        WHEN 'premium' THEN ARRAY['gpt-4o', 'claude-3-5-sonnet', 'claude-3-opus']
    END
FROM plan_ai_capabilities pac
JOIN plans p ON p.id = pac.plan_id
CROSS JOIN quality_levels ql
WHERE p.unique_name = 'team';
```

### Plan AI Access Summary

| Plan | question_generation | testimonial_assembly | testimonial_polish | Quality Levels | Models | Rate Limits |
|------|---------------------|---------------------|-------------------|----------------|--------|-------------|
| Free | ✅ Enabled | ❌ Disabled | ❌ Disabled | fast | gpt-4o-mini | 10/hour, 50/day |
| Pro | ✅ Enabled | ✅ Enabled | ✅ Enabled | fast, enhanced | gpt-4o-mini, claude-3-haiku, gpt-4o, claude-3-5-sonnet | 100/hour, 500/day |
| Team | ✅ Enabled | ✅ Enabled | ✅ Enabled | all | All models including claude-3-opus | Unlimited |

#### Rate Limit Rationale

**Free Plan (10/hour, 50/day):**
- Prevents burst abuse: attackers can't exhaust daily quota quickly
- Forces usage spread over 5+ hours at max rate
- Combined with RPM limit, hitting max rate triggers hourly limit in ~1 minute
- Makes scripted abuse much less attractive while allowing legitimate exploration

**Pro Plan (100/hour, 500/day):**
- Allows productive work sessions during business hours
- Prevents runaway scripts from burning through quota in minutes
- Business users typically work in bursts; 100/hour accommodates this

**Team Plan (Unlimited):**
- Enterprise-grade trust; customers pay for capacity
- No artificial limits that could disrupt production workflows

---

### Migration: Add `monthly_ai_credits` to Plans

```sql
-- Add AI credits column to plans table
ALTER TABLE plans
ADD COLUMN monthly_ai_credits INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN plans.monthly_ai_credits IS
    'AI credits allocated per month. 0=no AI, -1=unlimited';

-- Update existing plans
UPDATE plans SET monthly_ai_credits = 10 WHERE unique_name = 'free';
UPDATE plans SET monthly_ai_credits = 500 WHERE unique_name = 'pro';
UPDATE plans SET monthly_ai_credits = 2000 WHERE unique_name = 'team';
```

### Migration: Add `monthly_ai_credits` to Organization Plans

```sql
-- Add AI credits column to organization_plans (snapshot)
ALTER TABLE organization_plans
ADD COLUMN monthly_ai_credits INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN organization_plans.monthly_ai_credits IS
    'AI credits per month, copied from plan at subscription time';
```

### Table: `organization_credit_balances`

```sql
CREATE TABLE organization_credit_balances (
    -- PK is organization_id (1:1 relationship)
    organization_id     VARCHAR(12) PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,

    -- Monthly credits from plan (resets each period)
    monthly_credits     DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Bonus credits from top-ups (never reset, never expire)
    bonus_credits       DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Reserved credits (held during AI operation execution)
    reserved_credits    DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- NOTE: used_this_period is COMPUTED from credit_transactions, not stored
    -- See get_used_this_period() function below

    -- Grace period: small overdraft allowed for better UX
    overdraft_limit     DECIMAL(10,2) NOT NULL DEFAULT 2.0,

    -- Current billing period
    period_start        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    period_end          TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),

    -- Constraints
    CONSTRAINT positive_balances CHECK (
        monthly_credits >= 0 AND
        bonus_credits >= 0 AND
        reserved_credits >= 0 AND
        overdraft_limit >= 0
    ),

    -- Audit
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for monthly reset job (find orgs needing reset)
CREATE INDEX idx_credit_balances_period_end
    ON organization_credit_balances(period_end)
    WHERE period_end <= NOW();

-- Trigger to auto-update updated_at
CREATE TRIGGER update_credit_balances_updated_at
    BEFORE UPDATE ON organization_credit_balances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE organization_credit_balances IS
    'Credit balance per organization. available = monthly - used - reserved + bonus + overdraft';
COMMENT ON COLUMN organization_credit_balances.reserved_credits IS
    'Credits held during AI operation execution. Released on completion or failure.';
COMMENT ON COLUMN organization_credit_balances.overdraft_limit IS
    'Small grace buffer to prevent hard cutoff. Recovered from next allocation.';

-- =============================================================================
-- COMPUTED FIELD: used_this_period
-- =============================================================================
-- Instead of storing used_this_period as a column, we compute it from
-- credit_transactions. This eliminates drift between the balance table and
-- the audit log, making credit_transactions the single source of truth.
--
-- Performance: With proper indexing, aggregating 1,000-5,000 rows takes 1-5ms.
-- This is negligible compared to AI operation latency (2-10 seconds).
-- =============================================================================

-- Partial covering index optimized for consumption aggregation
CREATE INDEX idx_credit_transactions_consumption_sum
    ON credit_transactions(organization_id, created_at)
    INCLUDE (credits_amount)
    WHERE transaction_type = 'ai_consumption';

-- Function to compute used credits this period from transactions
CREATE OR REPLACE FUNCTION get_used_this_period(org_id VARCHAR(12))
RETURNS DECIMAL(10,2) AS $$
    SELECT COALESCE(
        (SELECT SUM(-ct.credits_amount)
         FROM credit_transactions ct
         JOIN organization_credit_balances ocb ON ocb.organization_id = ct.organization_id
         WHERE ct.organization_id = org_id
           AND ct.transaction_type = 'ai_consumption'
           AND ct.created_at >= ocb.period_start),
        0
    );
$$ LANGUAGE SQL STABLE;

-- Function to get available credits (accounts for reservations)
CREATE OR REPLACE FUNCTION get_available_credits(org_id VARCHAR(12))
RETURNS DECIMAL(10,2) AS $$
    SELECT COALESCE(
        (SELECT monthly_credits - get_used_this_period(org_id) - reserved_credits + bonus_credits + overdraft_limit
         FROM organization_credit_balances
         WHERE organization_id = org_id),
        0
    );
$$ LANGUAGE SQL STABLE;

-- Function to get spendable credits (available minus overdraft buffer)
CREATE OR REPLACE FUNCTION get_spendable_credits(org_id VARCHAR(12))
RETURNS DECIMAL(10,2) AS $$
    SELECT COALESCE(
        (SELECT monthly_credits - get_used_this_period(org_id) - reserved_credits + bonus_credits
         FROM organization_credit_balances
         WHERE organization_id = org_id),
        0
    );
$$ LANGUAGE SQL STABLE;
```

### Table: `credit_transactions`

```sql
CREATE TABLE credit_transactions (
    id                  VARCHAR(12) PRIMARY KEY DEFAULT generate_nanoid_12(),
    organization_id     VARCHAR(12) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Idempotency key to prevent duplicate charges on retry
    idempotency_key     VARCHAR(64) UNIQUE,

    -- Transaction details
    transaction_type    VARCHAR(30) NOT NULL
                        CHECK (transaction_type IN (
                            'plan_allocation',
                            'topup_purchase',
                            'promo_bonus',
                            'referral_bonus',
                            'ai_consumption',
                            'admin_adjustment',
                            'refund',
                            'plan_change_adjustment'
                        )),

    -- Amount: positive for additions, negative for consumption
    credits_amount      DECIMAL(10,2) NOT NULL,

    -- Running balance after this transaction
    balance_after       DECIMAL(10,2) NOT NULL,

    -- For AI consumption: link to ai_capabilities table
    ai_capability_id    VARCHAR(12) REFERENCES ai_capabilities(id) ON DELETE SET NULL,

    -- For top-up purchases: link to package
    topup_package_id    VARCHAR(12) REFERENCES credit_topup_packages(id) ON DELETE SET NULL,

    -- Related entity (form, testimonial, payment, etc.)
    related_entity_type VARCHAR(50),
    related_entity_id   VARCHAR(12),

    -- User who triggered (NULL for system operations)
    user_id             VARCHAR(12) REFERENCES users(id) ON DELETE SET NULL,

    -- AI provider metadata (for consumption transactions)
    provider_metadata   JSONB,
    -- Schema: {
    --   provider: 'openai' | 'anthropic' | 'google',
    --   model: string,
    --   input_tokens: number,
    --   output_tokens: number,
    --   cost_usd: number,
    --   request_id: string,
    --   quality_level: string,      -- unique_name: 'fast' | 'enhanced' | 'premium'
    --   estimated_credits: number,  -- What was reserved
    --   actual_credits: number      -- What was charged
    -- }

    -- Payment metadata (for topup transactions)
    payment_metadata    JSONB,
    -- Schema: {
    --   payment_provider: 'stripe',
    --   payment_intent_id: string,
    --   amount_paid_cents: number,
    --   currency: string
    -- }

    -- Optional note
    note                TEXT,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Estimation accuracy tracking (for ai_consumption only)
    -- Allows analytics: "Our estimates are typically X% over/under actual"
    estimation_variance DECIMAL(6,2) GENERATED ALWAYS AS (
        CASE
            WHEN provider_metadata->>'estimated_credits' IS NOT NULL
            THEN (provider_metadata->>'estimated_credits')::DECIMAL + credits_amount
            ELSE NULL
        END
    ) STORED,
    -- Positive = overestimated (reserved more than used)
    -- Negative = underestimated (used more than reserved)
    -- Example: estimated 5, actual 4.2 → variance = 5 + (-4.2) = 0.8 (overestimate)

    -- Enforce credit amount sign based on transaction type
    CONSTRAINT check_credits_amount_sign CHECK (
        (transaction_type = 'ai_consumption' AND credits_amount < 0)
        OR (transaction_type IN ('plan_allocation', 'topup_purchase', 'promo_bonus', 'referral_bonus', 'refund') AND credits_amount > 0)
        OR (transaction_type IN ('admin_adjustment', 'plan_change_adjustment'))  -- Can be either sign
    )
);

-- Indexes for common queries
CREATE INDEX idx_credit_transactions_org_time
    ON credit_transactions(organization_id, created_at DESC);

CREATE INDEX idx_credit_transactions_type
    ON credit_transactions(transaction_type, created_at DESC);

-- Index for capability usage analytics
CREATE INDEX idx_credit_transactions_capability
    ON credit_transactions(ai_capability_id, created_at DESC)
    WHERE ai_capability_id IS NOT NULL;

-- Index for finding duplicate requests (idempotency check)
CREATE INDEX idx_credit_transactions_idempotency
    ON credit_transactions(idempotency_key)
    WHERE idempotency_key IS NOT NULL;

COMMENT ON TABLE credit_transactions IS
    'Immutable audit log of all credit movements. Never UPDATE or DELETE.';
COMMENT ON COLUMN credit_transactions.idempotency_key IS
    'Unique key to prevent duplicate transactions on retry. Format: {request_id}-{org_id}-{capability_id}';
COMMENT ON COLUMN credit_transactions.balance_after IS
    'Running balance at time of transaction. Computed via trigger for consistency.';
COMMENT ON COLUMN credit_transactions.estimation_variance IS
    'Difference between estimated and actual credits. Positive=overestimate. For analytics.';
```

**Estimation Accuracy Analytics Query:**

```sql
-- Average estimation accuracy by capability (last 30 days)
SELECT
    ac.name AS capability,
    COUNT(*) AS operations,
    AVG(ct.estimation_variance) AS avg_variance,
    AVG(ABS(ct.estimation_variance)) AS avg_abs_variance,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ct.estimation_variance) AS median_variance
FROM credit_transactions ct
JOIN ai_capabilities ac ON ct.ai_capability_id = ac.id
WHERE ct.transaction_type = 'ai_consumption'
  AND ct.estimation_variance IS NOT NULL
  AND ct.created_at > NOW() - INTERVAL '30 days'
GROUP BY ac.name
ORDER BY avg_abs_variance DESC;

-- Example output:
-- | capability            | operations | avg_variance | avg_abs_variance | median_variance |
-- |-----------------------|------------|--------------|------------------|-----------------|
-- | AI Testimonial Polish | 1523       | 0.42         | 0.68             | 0.25            |
-- | AI Question Gen       | 892        | -0.15        | 0.32             | 0.00            |
-- Interpretation: Testimonial Polish estimates are typically 0.42 credits too high
```

### Trigger: Auto-Calculate `balance_after`

To prevent `balance_after` from drifting, calculate it automatically:

```sql
CREATE OR REPLACE FUNCTION calculate_balance_after()
RETURNS TRIGGER AS $$
BEGIN
    -- Get current available balance and add the transaction amount
    NEW.balance_after := get_spendable_credits(NEW.organization_id) + NEW.credits_amount;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_balance_after
    BEFORE INSERT ON credit_transactions
    FOR EACH ROW EXECUTE FUNCTION calculate_balance_after();
```

### Table: `credit_reservations` (For Tracking Active Reservations)

Tracks individual credit reservations for debugging, cleanup, and analytics.

```sql
CREATE TABLE credit_reservations (
    id                  VARCHAR(12) PRIMARY KEY DEFAULT generate_nanoid_12(),
    organization_id     VARCHAR(12) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    ai_capability_id    VARCHAR(12) NOT NULL REFERENCES ai_capabilities(id) ON DELETE CASCADE,

    -- Reservation details
    credits_amount      DECIMAL(10,2) NOT NULL,
    idempotency_key     VARCHAR(64) NOT NULL UNIQUE,

    -- Status tracking
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'settled', 'released', 'expired')),

    -- Timing
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '5 minutes'),
    settled_at          TIMESTAMPTZ,

    -- Settlement details (populated on settle)
    actual_credits      DECIMAL(10,2),
    transaction_id      VARCHAR(12) REFERENCES credit_transactions(id),

    -- Release details (populated on release/expire)
    release_reason      VARCHAR(50)  -- 'operation_failed', 'operation_cancelled', 'timeout', 'expired'
);

-- Index for cleanup job (find expired pending reservations)
CREATE INDEX idx_credit_reservations_cleanup
    ON credit_reservations(expires_at)
    WHERE status = 'pending';

-- Index for org reservation lookup
CREATE INDEX idx_credit_reservations_org
    ON credit_reservations(organization_id, created_at DESC);

-- Index for idempotency check
CREATE INDEX idx_credit_reservations_idempotency
    ON credit_reservations(idempotency_key);

COMMENT ON TABLE credit_reservations IS
    'Tracks individual credit reservations. Enables cleanup of orphaned reservations.';
COMMENT ON COLUMN credit_reservations.expires_at IS
    'Auto-release if not settled within 5 minutes. Protects against server crashes.';
```

**Reservation Cleanup Job** (runs every minute):

```sql
-- Find and release expired reservations
WITH expired AS (
    UPDATE credit_reservations
    SET status = 'expired', release_reason = 'timeout'
    WHERE status = 'pending' AND expires_at < NOW()
    RETURNING organization_id, credits_amount
)
UPDATE organization_credit_balances ocb
SET reserved_credits = reserved_credits - expired.credits_amount
FROM expired
WHERE ocb.organization_id = expired.organization_id;
```

### Table: `credit_topup_packages` (For Pricing)

```sql
CREATE TABLE credit_topup_packages (
    id                  VARCHAR(12) PRIMARY KEY DEFAULT generate_nanoid_12(),
    unique_name         VARCHAR(50) NOT NULL UNIQUE,
    name                VARCHAR(100) NOT NULL,
    description         TEXT,

    -- Credits granted
    credits             INT NOT NULL,

    -- Pricing
    price_usd_cents     INT NOT NULL,  -- Price in cents
    price_per_credit    DECIMAL(6,4) GENERATED ALWAYS AS (
        price_usd_cents::DECIMAL / 100 / credits
    ) STORED,

    -- Availability
    is_active           BOOLEAN NOT NULL DEFAULT true,
    display_order       INT NOT NULL DEFAULT 0,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed packages
INSERT INTO credit_topup_packages (unique_name, name, description, credits, price_usd_cents, display_order) VALUES
    ('starter', 'Starter Pack', 'Get started with AI features', 100, 999, 1),
    ('popular', 'Popular Pack', 'Most popular choice', 500, 3999, 2),
    ('power', 'Power Pack', 'For heavy AI users', 2000, 12999, 3);

COMMENT ON TABLE credit_topup_packages IS
    'Available credit packages for purchase. Displayed on upgrade/purchase pages.';
```

---

## API Design

### Layer 1: Check AI Capability Access

```typescript
// api/src/features/ai/checkCapabilityAccess.ts

interface AICapabilityAccessResult {
  allowed: boolean;
  capability: {
    id: string;
    uniqueName: string;
    name: string;
    estimatedCredits: number;  // For the requested quality
  } | null;
  reason?:
    | 'capability_not_found'      // ai_capabilities.unique_name doesn't exist
    | 'capability_disabled'       // ai_capabilities.is_active = false (global)
    | 'not_in_plan'              // No row in plan_ai_capabilities for this plan
    | 'plan_disabled'            // plan_ai_capabilities.is_enabled = false
    | 'quality_not_allowed'      // No row in plan_ai_capability_quality_levels
    | 'model_not_allowed';       // Requested model not in allowed_models
  allowedQualityLevels?: string[];  // Quality level IDs this plan CAN use
  allowedModels?: string[];         // Models allowed for requested quality
}

/**
 * Check if an organization's plan allows access to an AI capability
 * @param qualityLevelUniqueName - Quality level unique_name: 'fast' | 'enhanced' | 'premium'
 */
async function checkCapabilityAccess(
  organizationId: string,
  capabilityUniqueName: string,
  qualityLevelUniqueName: string = 'fast',
  requestedModel?: string  // Optional: check specific model access
): Promise<AICapabilityAccessResult>;
```

### Layer 2: Check Credit Balance

```typescript
// api/src/features/credits/checkBalance.ts

interface CreditBalanceResult {
  available: number;       // Total available (monthly remaining + bonus)
  monthlyRemaining: number; // monthly_credits - get_used_this_period()
  bonusCredits: number;     // From top-ups
  periodEndsAt: Date;       // When monthly resets
  estimatedCost: number;    // Estimated credits for this operation
  canProceed: boolean;      // available >= estimatedCost
}

async function checkCreditBalance(
  organizationId: string,
  capabilityId: string,
  qualityLevelUniqueName: string = 'fast'
): Promise<CreditBalanceResult>;
```

### Combined Access Check (Convenience Function)

```typescript
// api/src/features/ai/checkAIAccess.ts

interface AIAccessResult {
  allowed: boolean;

  // From capability check
  capability: AICapabilityAccessResult['capability'];
  capabilityDeniedReason?: AICapabilityAccessResult['reason'];

  // From credit check (only populated if capability allowed)
  credits?: {
    available: number;
    estimatedCost: number;
    canProceed: boolean;
    periodEndsAt: Date;
  };

  // For UI: What to show the user
  userMessage?: string;
  upgradeRequired?: boolean;
  topupRequired?: boolean;
}

/**
 * Combined check: capability access + credit balance
 * Use this in API endpoints before executing AI operations
 * @param qualityLevelUniqueName - Quality level unique_name: 'fast' | 'enhanced' | 'premium'
 */
async function checkAIAccess(
  organizationId: string,
  capabilityUniqueName: string,
  qualityLevelUniqueName: string = 'fast',
  requestedModel?: string
): Promise<AIAccessResult>;
```

### Credit Operations (Reserve → Settle → Release)

```typescript
// api/src/features/credits/creditOperations.ts

// ============================================
// RESERVE: Hold credits before AI operation
// ============================================

interface ReserveCreditsInput {
  organizationId: string;
  aiCapabilityId: string;
  estimatedCredits: number;
  idempotencyKey: string;  // Prevents duplicate reservations
}

interface ReserveCreditsResult {
  success: boolean;
  reservationId: string;  // Used for settle/release
  creditsReserved: number;
  availableAfterReservation: number;
  error?: 'insufficient_credits' | 'duplicate_request';
}

async function reserveCredits(input: ReserveCreditsInput): Promise<ReserveCreditsResult>;

// ============================================
// SETTLE: Finalize credits after successful AI operation
// ============================================

interface SettleCreditsInput {
  organizationId: string;
  reservationId: string;
  aiCapabilityId: string;
  actualCredits: number;     // May differ from estimated
  estimatedCredits: number;  // Original reservation amount
  userId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  idempotencyKey: string;
  providerMetadata: {
    provider: AIProvider;
    model: string;
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
    requestId: string;
    qualityLevel: string;  // unique_name: 'fast' | 'enhanced' | 'premium'
  };
}

interface SettleCreditsResult {
  success: boolean;
  transactionId: string;
  creditsCharged: number;
  balanceAfter: number;
  overageFromEstimate: number;  // actual - estimated (can be negative)
}

async function settleCredits(input: SettleCreditsInput): Promise<SettleCreditsResult>;

// ============================================
// RELEASE: Return reserved credits on failure
// ============================================

interface ReleaseCreditsInput {
  organizationId: string;
  reservationId: string;
  estimatedCredits: number;
  reason: 'operation_failed' | 'operation_cancelled' | 'timeout';
}

async function releaseCredits(input: ReleaseCreditsInput): Promise<{ success: boolean }>;
```

### Integration with Existing AI Audit

Modify the existing `recordAIUsage` flow to include two-layer access control:

```typescript
// api/src/shared/libs/ai/withAIAccess.ts

import { calculateCreditsFromCost, extractUsageFromResponse } from './audit';
import { checkAIAccess } from '@/features/ai/checkAIAccess';
import { consumeCredits } from '@/features/credits';

// Custom error types
class AIAccessDeniedError extends Error {
  constructor(
    public reason: string,
    public upgradeRequired: boolean,
    public userMessage: string
  ) {
    super(userMessage);
    this.name = 'AIAccessDeniedError';
  }
}

class InsufficientCreditsError extends Error {
  constructor(
    public available: number,
    public required: number
  ) {
    super(`Insufficient credits: have ${available}, need ${required}`);
    this.name = 'InsufficientCreditsError';
  }
}

/**
 * Full context for AI operations with two-layer access control
 */
interface AIOperationContext {
  organizationId: string;
  capabilityUniqueName: string;      // e.g., 'question_generation'
  qualityLevelUniqueName: string;    // 'fast' | 'enhanced' | 'premium'
  model?: string;                    // Specific model, or let system choose from allowed
  userId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

/**
 * Wrapper that handles capability access + credit reservation + consumption
 * Uses reserve → execute → settle/release pattern for safety
 */
async function executeWithAIAccess<T>(
  context: AIOperationContext,
  operation: () => Promise<{ result: T; response: AIResponse }>
): Promise<{ result: T; creditsUsed: number; balanceRemaining: number }> {
  const idempotencyKey = `${context.requestId}-${context.organizationId}-${context.capabilityUniqueName}`;

  // 1. Check capability access + credit balance (combined)
  const access = await checkAIAccess(
    context.organizationId,
    context.capabilityUniqueName,
    context.qualityLevelUniqueName,
    context.model
  );

  if (!access.allowed) {
    throw new AIAccessDeniedError(
      access.capabilityDeniedReason ?? 'unknown',
      access.upgradeRequired ?? false,
      access.userMessage ?? 'AI feature not available'
    );
  }

  if (!access.credits?.canProceed) {
    throw new InsufficientCreditsError(
      access.credits?.available ?? 0,
      access.credits?.estimatedCost ?? 0
    );
  }

  const estimatedCredits = access.credits.estimatedCost;

  // 2. RESERVE credits before executing AI operation
  const reservation = await reserveCredits({
    organizationId: context.organizationId,
    aiCapabilityId: access.capability!.id,
    estimatedCredits,
    idempotencyKey,
  });

  if (!reservation.success) {
    if (reservation.error === 'duplicate_request') {
      // Return cached result for idempotent request
      throw new DuplicateRequestError(idempotencyKey);
    }
    throw new InsufficientCreditsError(0, estimatedCredits);
  }

  try {
    // 3. Execute AI operation
    const { result, response } = await operation();

    // 4. Extract actual usage and calculate credits
    const usage = extractUsageFromResponse(response, context.provider, context.model);
    const actualCredits = calculateCreditsFromCost(usage.costUsd ?? 0);

    // 5. SETTLE: Finalize the transaction with actual credits
    const settlement = await settleCredits({
      organizationId: context.organizationId,
      reservationId: reservation.reservationId,
      aiCapabilityId: access.capability!.id,
      actualCredits,
      estimatedCredits,
      userId: context.userId,
      relatedEntityType: context.relatedEntityType,
      relatedEntityId: context.relatedEntityId,
      idempotencyKey,
      providerMetadata: {
        provider: usage.provider ?? 'openai',
        model: usage.model ?? 'unknown',
        inputTokens: usage.inputTokens ?? 0,
        outputTokens: usage.outputTokens ?? 0,
        costUsd: usage.costUsd ?? 0,
        requestId: usage.requestId ?? '',
        qualityLevel: context.qualityLevelUniqueName,  // 'fast' | 'enhanced' | 'premium'
      },
    });

    return {
      result,
      creditsUsed: settlement.creditsCharged,
      balanceRemaining: settlement.balanceAfter,
    };

  } catch (error) {
    // 6. RELEASE: Return reserved credits on any failure
    await releaseCredits({
      organizationId: context.organizationId,
      reservationId: reservation.reservationId,
      estimatedCredits,
      reason: 'operation_failed',
    });

    throw error;  // Re-throw original error
  }
}

export { executeWithAIAccess, AIAccessDeniedError, InsufficientCreditsError };
```

### Top-Up Purchase Flow

```typescript
// api/src/features/credits/purchaseTopup.ts

interface PurchaseTopupInput {
  organizationId: string;
  packageId: string;
  paymentIntentId: string;  // From Stripe
}

async function purchaseTopup(input: PurchaseTopupInput): Promise<{
  transactionId: string;
  creditsAdded: number;
  newBalance: number;
}> {
  // 1. Verify payment with Stripe
  // 2. Get package details
  // 3. Add credits to bonus_credits
  // 4. Record transaction
}
```

---

## Usage Flow (Reserve → Execute → Settle)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AI Feature Request                           │
│   e.g., POST /ai/assemble-testimonial { quality: 'enhanced' }       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 1: Capability Access Check (plan_ai_capabilities)             │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Lookup ai_capability by unique_name ('testimonial_assembly')     │
│    └── Not found → 404 (capability_not_found)                       │
│                                                                     │
│ 2. Check ai_capability.is_active = true                             │
│    └── false → 503 (capability_disabled - global outage)            │
│                                                                     │
│ 3. Get org's plan → lookup plan_ai_capabilities                     │
│    └── No row → 403 (not_in_plan - "Upgrade to Pro")                │
│                                                                     │
│ 4. Check plan_ai_capabilities.is_enabled = true                     │
│    └── false → 403 (plan_disabled)                                  │
│                                                                     │
│ 5. Check quality in plan_ai_capability_quality_levels               │
│    └── No row for 'premium' → 403 (quality_not_allowed)             │
│                                                                     │
│ 6. Check model in allowed_models (if specified)                     │
│    └── 'claude-3-opus' not in allowed_models → 403 (model_denied)   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                          ✅ Capability allowed
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 2: Credit Balance Check (organization_credit_balances)        │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Get estimated cost from ai_capabilities.estimated_credits_*      │
│                                                                     │
│ 2. Query organization_credit_balances + get_used_this_period()      │
│    spendable = monthly - get_used_this_period() - reserved + bonus  │
│                                                                     │
│ 3. spendable >= estimated_cost?                                     │
│    └── No → 402 (insufficient_credits - "Top up or wait for reset") │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                          ✅ Has credits
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: RESERVE CREDITS                                             │
├─────────────────────────────────────────────────────────────────────┤
│ UPDATE organization_credit_balances                                 │
│ SET reserved_credits = reserved_credits + $estimated                │
│ WHERE organization_id = $org_id                                     │
│   AND (monthly - get_used_this_period() - reserved + bonus) >= $est;│
│                                                                     │
│ └── Generates idempotency_key: {request_id}-{org_id}-{capability}   │
│ └── Returns reservation_id for settle/release                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                          ✅ Credits reserved
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: EXECUTE AI OPERATION                                        │
│    └── Call provider (OpenAI/Anthropic/Google)                      │
│    └── Get actual token usage from response                         │
│    └── calculateCreditsFromCost(actual_cost_usd)                    │
└─────────────────────────────────────────────────────────────────────┘
                      │                         │
              ✅ Success                   ❌ Failure
                      │                         │
                      ▼                         ▼
┌─────────────────────────────┐   ┌─────────────────────────────────┐
│ STEP 5a: SETTLE CREDITS     │   │ STEP 5b: RELEASE RESERVATION    │
├─────────────────────────────┤   ├─────────────────────────────────┤
│ BEGIN;                      │   │ UPDATE organization_credit_     │
│                             │   │   balances                      │
│ UPDATE org_credit_balances  │   │ SET reserved = reserved - $est  │
│ SET                         │   │ WHERE organization_id = $org;   │
│   bonus = bonus - $overflow,│   │                                 │
│   reserved = reserved - $est│   │ -- No transaction recorded      │
│ WHERE organization_id = $o; │   │ -- Credits returned to pool     │
│                             │   └─────────────────────────────────┘
│ INSERT INTO credit_trans (  │
│   organization_id,          │
│   idempotency_key,          │
│   ai_capability_id,         │
│   transaction_type,         │
│   credits_amount,           │  ← Negative (consumption)
│   balance_after,            │  ← Computed by trigger
│   provider_metadata         │
│ );                          │  ← This INSERT updates used_this_period
│                             │    (computed from transactions)
│ COMMIT;                     │
└─────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 6: RETURN RESULT TO USER                                       │
│    {                                                                 │
│      "testimonial": "...",                                          │
│      "credits_used": 3.5,                                           │
│      "credits_estimated": 4.0,                                      │
│      "balance_remaining": 46.5                                      │
│    }                                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Concurrent Request Handling

The reservation pattern prevents race conditions when multiple AI operations run simultaneously:

```
Time →
────────────────────────────────────────────────────────────────────►

Request A                    Request B
    │                            │
    ▼                            ▼
Reserve 5 credits           Reserve 5 credits
    │                            │
    │   ┌────────────────────────┘
    │   │  Pool: 10 credits
    │   │  Reserved: 5 (A) + 5 (B) = 10
    │   │  Spendable: 10 - 10 = 0
    ▼   ▼
Both execute...             Request C arrives
    │                            │
    │                       Reserve 3 credits
    │                            │
    │                       ❌ DENIED (spendable = 0)
    │
Settle 4.5 (A)
    │
Settle 5.2 (B)
    │
Pool: 10 - 4.5 - 5.2 = 0.3 remaining
```

---

## Frontend Integration

### Credit Balance Display

```vue
<!-- CreditBalanceWidget.vue -->
<template>
  <div class="credit-balance">
    <div class="balance-display">
      <span class="amount">{{ available.toFixed(1) }}</span>
      <span class="label">credits available</span>
    </div>

    <div v-if="monthlyRemaining > 0" class="monthly-info">
      {{ monthlyRemaining.toFixed(1) }} monthly + {{ bonusCredits.toFixed(1) }} bonus
    </div>

    <div class="period-info">
      Resets {{ formatRelative(periodEndsAt) }}
    </div>

    <Button v-if="available < 10" variant="outline" @click="showTopupModal">
      Get More Credits
    </Button>
  </div>
</template>
```

### Pre-Operation Access Check (Capability + Credits)

```typescript
// apps/web/src/features/ai/composables/useAIAccess.ts

interface QualityLevelOption {
  id: string;           // NanoID
  uniqueName: string;   // 'fast', 'enhanced', 'premium'
  name: string;         // 'Fast', 'Enhanced', 'Premium'
  allowedModels: string[];
  estimatedCredits: number;
}

interface AIAccessState {
  // Layer 1: Capability access
  capabilityAllowed: boolean;
  capabilityDeniedReason?: string;
  allowedQualityLevels: QualityLevelOption[];

  // Layer 2: Credit balance
  creditsAvailable: number;
  estimatedCost: number;
  hasEnoughCredits: boolean;

  // Combined
  canProceed: boolean;
  upgradeRequired: boolean;
  topupRequired: boolean;
}

function useAIAccess(capabilityUniqueName: string, qualityLevelUniqueName: string = 'fast') {
  // Fetches from checkAIAccess API
  // Returns reactive state for UI binding
}
```

```vue
<!-- TestimonialPathSelector.vue -->
<template>
  <!-- Layer 1: Capability not available for this plan -->
  <div v-if="!capabilityAllowed" class="upgrade-prompt">
    <Icon icon="lock" />
    <p>AI testimonial crafting requires a Pro or Team plan.</p>
    <Button @click="showUpgradeModal">Upgrade Plan</Button>
  </div>

  <!-- Layer 2: Capability allowed but insufficient credits -->
  <div v-else-if="!hasEnoughCredits" class="topup-prompt">
    <p>This operation costs ~{{ estimatedCost }} credits.</p>
    <p>You have {{ creditsAvailable }} credits remaining.</p>
    <Button @click="showTopupModal">Get More Credits</Button>
  </div>

  <!-- All checks passed -->
  <div v-else class="ai-option">
    <p>Let AI craft your testimonial</p>
    <div class="flex items-center gap-2">
      <span class="cost-badge">~{{ estimatedCost }} credits</span>
      <QualitySelector
        v-model="selectedQuality"
        :allowed="allowedQualityLevels"
      />
    </div>
  </div>
</template>

<script setup>
const selectedQuality = ref('fast');

const {
  capabilityAllowed,
  allowedQualityLevels,  // QualityLevelOption[] with models info
  creditsAvailable,
  estimatedCost,
  hasEnoughCredits,
} = useAIAccess('testimonial_assembly', selectedQuality);
</script>
```

### Usage History

```vue
<!-- CreditHistoryTable.vue -->
<template>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>AI Feature</th>
        <th>Credits</th>
        <th>Balance</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="tx in transactions" :key="tx.id">
        <td>{{ formatDate(tx.created_at) }}</td>
        <td>{{ formatTransactionType(tx.transaction_type) }}</td>
        <td>{{ tx.ai_capability?.name ?? '-' }}</td>
        <td :class="tx.credits_amount > 0 ? 'positive' : 'negative'">
          {{ tx.credits_amount > 0 ? '+' : '' }}{{ tx.credits_amount.toFixed(2) }}
        </td>
        <td>{{ tx.balance_after.toFixed(2) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
// GraphQL query joins credit_transactions with ai_capabilities
// to get the human-readable capability name
</script>
```

---

## Monthly Reset Process

When billing period ends, a scheduled job advances the billing period. Since `used_this_period` is computed from `credit_transactions` filtered by `period_start`, simply advancing the period "resets" usage automatically.

```typescript
// Scheduled job (daily or webhook from Stripe)
async function resetMonthlyCredits(organizationId: string) {
  const balance = await getOrganizationCreditBalance(organizationId);
  const plan = await getOrganizationPlan(organizationId);

  // Record the reset as a transaction
  await db.transaction(async (tx) => {
    // 1. Advance the billing period
    // NOTE: No need to reset used_this_period - it's computed from transactions
    // filtered by period_start, so advancing period_start automatically "resets" it
    await tx.update(organizationCreditBalances)
      .set({
        monthly_credits: plan.monthly_ai_credits,
        period_start: new Date(),
        period_end: addMonths(new Date(), 1),
      })
      .where(eq(organizationCreditBalances.organizationId, organizationId));

    // 2. Record allocation transaction
    await tx.insert(creditTransactions).values({
      organizationId,
      transactionType: 'plan_allocation',
      creditsAmount: plan.monthly_ai_credits,
      balanceAfter: plan.monthly_ai_credits + balance.bonus_credits,
      note: `Monthly allocation for ${plan.name} plan`,
    });
  });
}
```

**How the reset works:**
- `get_used_this_period()` filters transactions by `created_at >= period_start`
- When `period_start` advances to today, old consumption transactions are excluded
- Historical transactions remain in `credit_transactions` for audit purposes

---

## Welcome Bonus for New Organizations

New organizations receive bonus credits to try AI features without upgrading. This follows industry practice (Vercel, Supabase, OpenAI).

### Bonus Amounts by Plan

| Plan | Welcome Bonus | Rationale |
|------|---------------|-----------|
| Free | 10 credits | Try AI question generation |
| Pro | 25 credits | Explore enhanced quality |
| Team | 50 credits | Test premium features |

### Implementation

```typescript
// Called during organization creation
async function initializeOrganizationCredits(
  organizationId: string,
  plan: Plan
) {
  const welcomeBonus = getWelcomeBonusByPlan(plan.unique_name);

  await db.transaction(async (tx) => {
    // 1. Create credit balance with welcome bonus
    // NOTE: No usedThisPeriod field - it's computed from transactions
    await tx.insert(organizationCreditBalances).values({
      organizationId,
      monthlyCredits: plan.monthly_ai_credits,
      bonusCredits: welcomeBonus,
      periodStart: new Date(),
      periodEnd: addMonths(new Date(), 1),
    });

    // 2. Record welcome bonus transaction
    if (welcomeBonus > 0) {
      await tx.insert(creditTransactions).values({
        organizationId,
        transactionType: 'promo_bonus',
        creditsAmount: welcomeBonus,
        balanceAfter: plan.monthly_ai_credits + welcomeBonus,
        note: 'Welcome bonus for new organization',
      });
    }

    // 3. Record initial allocation
    await tx.insert(creditTransactions).values({
      organizationId,
      transactionType: 'plan_allocation',
      creditsAmount: plan.monthly_ai_credits,
      balanceAfter: plan.monthly_ai_credits + welcomeBonus,
      note: `Initial allocation for ${plan.name} plan`,
    });
  });
}

function getWelcomeBonusByPlan(planName: string): number {
  const bonuses: Record<string, number> = {
    free: 10,
    pro: 25,
    team: 50,
  };
  return bonuses[planName] ?? 0;
}
```

### Transaction History View

After signup, the user sees:

| Date | Type | Credits | Balance |
|------|------|---------|---------|
| Jan 27 | Welcome Bonus | +10 | 20 |
| Jan 27 | Monthly Allocation | +10 | 10 |

---

## Webhook Events

For external integrations and internal notifications, the credit system emits webhook events:

### Event Types

| Event | Trigger | Payload |
|-------|---------|---------|
| `credits.low_balance` | Available credits < 20% of monthly | `{ org_id, available, monthly, threshold_percent }` |
| `credits.depleted` | Available credits ≤ 0 | `{ org_id, bonus_remaining, period_ends_at }` |
| `credits.allocated` | Monthly reset or plan change | `{ org_id, credits_added, new_balance }` |
| `credits.topup_purchased` | User bought credit package | `{ org_id, package_id, credits_added, payment_id }` |
| `credits.consumption` | AI operation charged credits | `{ org_id, capability_id, credits_used, balance_after }` |

### Internal Notifications

```typescript
// Triggered in settleCredits() when balance crosses threshold
async function checkAndEmitBalanceEvents(
  organizationId: string,
  balanceAfter: number,
  monthlyCredits: number
) {
  const thresholdPercent = 0.20;  // 20%
  const threshold = monthlyCredits * thresholdPercent;

  if (balanceAfter <= 0) {
    await emitEvent('credits.depleted', { organizationId, ... });
    // Send email notification to org admins
    await sendLowBalanceEmail(organizationId, 'depleted');
  } else if (balanceAfter <= threshold) {
    await emitEvent('credits.low_balance', { organizationId, ... });
    // Send email notification (debounced - max 1 per day)
    await sendLowBalanceEmail(organizationId, 'low');
  }
}
```

### Notification Preferences

Organizations can configure credit notification preferences:
- Email notifications: on/off
- Slack integration: webhook URL
- Custom threshold: 10-50% (default 20%)

---

## Data Retention & Partitioning

### credit_transactions Table

The `credit_transactions` table will grow significantly over time. Strategy:

1. **Partitioning by month** (recommended for scale):
   ```sql
   -- Convert to partitioned table if needed
   CREATE TABLE credit_transactions_new (
     LIKE credit_transactions INCLUDING ALL
   ) PARTITION BY RANGE (created_at);

   -- Create monthly partitions
   CREATE TABLE credit_transactions_2026_01
     PARTITION OF credit_transactions_new
     FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
   ```

2. **Retention policy**:
   - Keep detailed records for 2 years
   - Aggregate older records into monthly summaries
   - Archive raw data to cold storage after 2 years

3. **Idempotency key cleanup**:
   - `idempotency_key` only needs to prevent duplicates for ~24 hours
   - Daily job to NULL out old idempotency keys (keeps index small):
   ```sql
   UPDATE credit_transactions
   SET idempotency_key = NULL
   WHERE idempotency_key IS NOT NULL
     AND created_at < NOW() - INTERVAL '48 hours';
   ```

---

## Consequences

### Positive

| Benefit | Description |
|---------|-------------|
| **Two-layer control** | Separate "can use" (capabilities) from "how much" (credits) |
| **Fair pricing** | Users pay for actual usage, not arbitrary per-feature limits |
| **Race-condition safe** | Reservation pattern prevents concurrent overdraw |
| **No charge on failure** | Credits released if AI operation fails |
| **Idempotent** | Duplicate requests safely ignored via idempotency key |
| **Extensibility** | New AI features = new row in `ai_capabilities`, not schema change |
| **Quality tiering** | Plans can restrict quality levels (Free=fast, Pro=enhanced, Team=premium) |
| **Revenue opportunity** | Top-up purchases create additional revenue stream |
| **Full audit trail** | Every credit movement tracked with ai_capability reference |
| **Leverages existing code** | Uses `calculateCreditsFromCost()` already in codebase |
| **Single source of truth** | `used_this_period` computed from transactions, no drift possible |

### Negative

| Trade-off | Mitigation |
|-----------|------------|
| Two-layer complexity | Clear separation: capabilities for access, credits for billing |
| Credit estimation may differ from actual | Show "~X credits" with tooltip explaining variance |
| Monthly reset requires scheduled job | Can trigger from Stripe webhook on billing cycle |
| More tables to maintain | Well-documented relationships, Hasura handles joins |
| Computed `used_this_period` slightly slower (~1-5ms vs <0.1ms) | Negligible vs AI operation latency (2-10s). Add Redis cache if needed later. |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Race condition on balance update | ~~Medium~~ **Low** | Low | ✅ Mitigated: Reservation pattern with `reserved_credits` column |
| Negative balance from async operations | ~~Low~~ **Very Low** | Medium | ✅ Mitigated: Reserve before execute, settle/release after |
| Orphaned reservations (server crash) | Low | Low | Background job clears reservations older than 5 minutes |
| Provider cost changes break estimates | Low | Low | Update `COST_PER_MILLION_TOKENS` map |
| Capability config drift between plans | Low | Low | Admin UI for plan_ai_capabilities management |
| Idempotency key collisions | Very Low | Medium | Use UUID + org_id + capability format |
| balance_after drift over time | ~~Low~~ **Eliminated** | Low | ✅ Mitigated: Trigger calculates balance_after on insert |
| used_this_period drift | **Eliminated** | N/A | ✅ Mitigated: Computed from transactions, not stored |

---

## Implementation Phases

> **Implementation Status**: Updated 2026-02-01

### Phase 1: Schema & Migrations (Capabilities) ✅ COMPLETE
- [x] Create `quality_levels` reference table
- [x] Create `ai_capabilities` table
- [x] Create `plan_ai_capabilities` table
- [x] Create `plan_ai_capability_quality_levels` junction table
- [x] Create `plan_quality_level_models` junction table (normalized model mapping)
- [x] Create `llm_models` reference table (7 models with pricing)
- [x] Seed quality levels (fast, enhanced, premium)
- [x] Seed initial capabilities (question_generation, testimonial_assembly, testimonial_polish)
- [x] Seed plan mappings (Free, Pro, Team) with quality levels and allowed models
- [x] Add Hasura metadata (permissions, relationships)

### Phase 2: Schema & Migrations (Credits) ✅ COMPLETE
- [x] Add `monthly_ai_credits` to `plans` table
- [x] Add `monthly_ai_credits` to `organization_plans` table
- [x] Create `organization_credit_balances` table
- [x] Create `credit_transactions` table (with audit context: user_email, form_name snapshots)
- [x] Create `credit_reservations` table
- [x] Create `credit_topup_packages` table
- [x] Seed topup packages (starter, popular, power)
- [x] Create utility SQL functions (`get_used_this_period`, `get_available_credits`)

### Phase 3: API - Capability Access ✅ COMPLETE
- [x] Implement `checkCapabilityAccess()` function (`api/src/shared/libs/aiAccess/operations/checkCapabilityAccess.ts`)
- [x] Implement `checkAIAccess()` combined function (`api/src/shared/libs/aiAccess/operations/checkAIAccess.ts`)
- [x] Add error types (AIAccessDeniedError, InsufficientCreditsError)

### Phase 4: API - Credit Management ✅ COMPLETE
- [x] Implement `checkCreditBalance()` function (`api/src/features/credits/operations/checkBalance.ts`)
- [x] Implement `reserveCredits()` function (`api/src/features/credits/operations/reserveCredits.ts`)
- [x] Implement `settleCredits()` function (`api/src/features/credits/operations/settleCredits.ts`)
- [x] Implement `releaseCredits()` function (`api/src/features/credits/operations/releaseCredits.ts`)
- [x] Create `executeWithAIAccess()` wrapper (`api/src/shared/libs/aiAccess/operations/executeWithAIAccess.ts`)
- [x] Implement low balance notifications (`api/src/features/credits/operations/notifications.ts`)
- [x] Create REST endpoints: `GET /credits/balance`, `GET /credits/transactions`
- [x] Create purchase initiation endpoint: `POST /credits/purchase` (initiates Stripe checkout)

### Phase 5: Integration with AI Operations ✅ COMPLETE
- [x] Wrap `/ai/suggest-questions` with `executeWithAIAccess`
- [x] Wrap `/ai/assemble-testimonial` with `executeWithAIAccess`
- [x] Add credits + capability info to AI response body and headers (`X-Credits-Used`, `X-Balance-Remaining`)
- [x] Pass audit context (userId, userEmail, formId, formName) to transactions
- [ ] Implement `/ai/polish-testimonial` handler (capability seeded but no handler)

### Phase 6: Frontend ✅ COMPLETE
- [x] Create `useCreditBalance` composable (`apps/web/src/features/credits/composables/useCreditBalance.ts`)
- [x] Create `useCreditHistory` composable (`apps/web/src/features/credits/composables/useCreditHistory.ts`)
- [x] Create `useAIAccess` composable (`apps/web/src/features/ai/composables/useAIAccess.ts`)
- [x] Create `CreditBalanceWidget` component (`apps/web/src/features/credits/ui/CreditBalanceWidget.vue`)
- [x] Create `CreditHistoryTable` component with audit context display
- [x] Create `CreditHistoryRow` component (shows user/form snapshots)
- [x] Create `TopupPurchaseModal` component (Stripe checkout redirect)
- [x] Create credit models and types (`apps/web/src/features/credits/models/index.ts`)

### Phase 8: Public Endpoint Customer Identity ⏳ PROPOSED

Implements Decision 8a — verified customer identity on public AI endpoints.

- [ ] Add `customer_credential` field to `AssembleTestimonialRequest` schema (API + frontend)
- [ ] Create `verifyGoogleCredential()` utility in `api/src/shared/utils/googleAuth.ts`
- [ ] Store raw Google JWT `credential` in `useCustomerGoogleAuth` composable
- [ ] Send credential from `useTestimonialAIFlow` to `assembleTestimonial` API
- [ ] Verify JWT in `assembleTestimonial` handler and populate audit context
- [ ] Migration: add `customer_google_id` column to `credit_transactions` and `credit_reservations`
- [ ] Add per-customer generation count query + limit enforcement (4 per form per 24h)
- [ ] Return `generations_remaining` in `AssembleTestimonialResponse`
- [ ] Frontend: use server-returned `generations_remaining` instead of client-only counter
- [ ] Update Usage History ACTOR display to show verified customer name/email

### Phase 7: Billing Integration ⏳ DEFERRED
Stripe integration is deferred to a later stage.

- [ ] Implement Stripe webhook handler (`POST /webhooks/stripe`)
- [ ] Process `checkout.session.completed` events to provision credits
- [x] Implement monthly reset job (`api/src/jobs/resetMonthlyCredits.ts`)
- [x] Implement reservation cleanup job (`api/src/jobs/cleanupReservations.ts`)
- [x] Configure cron triggers in Hasura (`cleanup_credit_reservations` every 5 min, `reset_monthly_credits` daily)
- [ ] Handle plan upgrades/downgrades with credit adjustment (partially implemented in reset job)

### Known Gaps (Not Blocking)

| Gap | Description | Priority |
|-----|-------------|----------|
| ~~Rate limit enforcement~~ | ~~`rate_limit_rpm`/`rpd` values returned but not enforced at runtime~~ | ✅ Implemented |
| ~~Usage tracking for rate limits~~ | ~~`usedToday`/`usedThisMonth` hardcoded to 0 in `checkCapabilityAccess`~~ | ✅ Implemented |
| RPM (per-minute) enforcement | `rate_limit_rpm` exists but requires caching layer for performance | Low |
| Model fallback on failure | No logic to try alternate models from `allowedModels` on failure | Low |
| Model deprecation handling | `llm_models.replacement_model_id` exists but no auto-fallback logic | Low |
| Admin adjustment endpoint | No API to manually adjust credits (transaction type exists) | Low |
| Testimonial polish handler | Capability seeded but `/ai/polish-testimonial` not implemented | Low |
| Public endpoint customer identity | Google JWT collected but not verified or sent to API (see Decision 8a) | Medium — Phase 8 |
| Per-customer generation limit | Regeneration counter is client-only, resets on refresh | Medium — Phase 8 |

#### Rate Limit Enforcement Implementation (2026-02-02)

**Files Added:**
- `api/src/shared/libs/aiAccess/operations/getCapabilityUsage.ts` - Queries `credit_transactions` to count AI operations

**Files Modified:**
- `api/src/shared/libs/aiAccess/types/aiCapability.ts` - Added `hourlyLimit`, `usedThisHour` fields
- `api/src/shared/libs/aiAccess/operations/checkCapabilityAccess.ts` - Integrated usage query and enforcement
- `api/src/shared/libs/aiAccess/operations/checkAIAccess.ts` - Improved rate limit error messages

**Enforcement Logic:**
1. Parse `rate_limit_rph` (hourly) and `rate_limit_rpd` (daily) from plan configuration
2. If either limit is set, query `credit_transactions` for usage counts
3. Check hourly limit first (more restrictive), then daily
4. Return `rate_limit_exceeded` denial if either limit is reached
5. Include helpful error messages distinguishing hourly vs daily limits

---

## Relationship to Existing Code

### `api/src/shared/libs/ai/audit.ts`

This ADR builds on the existing audit infrastructure:

| Existing | ADR-023 Addition |
|----------|------------------|
| `calculateCreditsFromCost()` | Used to calculate actual charge |
| `AIAuditRecord` | Becomes `credit_transactions.provider_metadata` |
| `logAIUsage()` | Replaced by database-persisted transactions |
| `AIOperationType` | Used in `credit_transactions.ai_operation_type` |

### `api/src/shared/libs/ai/providers.ts`

| Existing | ADR-023 Usage |
|----------|---------------|
| `CREDIT_COSTS` (estimates) | Used for pre-operation balance check |
| `getModelInfo()` | Get quality/model for metadata |

---

## Open Questions

### Resolved in This ADR

1. **What happens if a user starts an operation but credits are consumed mid-operation?**
   - ✅ Resolved: Reservation pattern prevents this. Credits are held before execution.

2. **How do we handle refunds for failed AI operations?**
   - ✅ Resolved: Release pattern returns reserved credits on failure. If tokens were partially consumed, record a refund transaction.

3. **Race conditions with concurrent requests?**
   - ✅ Resolved: `reserved_credits` column blocks concurrent requests from overdrawing.

4. **Should `used_this_period` be stored or computed?**
   - ✅ Resolved: Computed from `credit_transactions`. Single source of truth, no drift risk.
   - Performance: 1-5ms with proper indexing, negligible vs AI operation latency.
   - Fallback: Add Redis cache (5s TTL) if UI polling causes issues at scale.

### Pending Decisions

4. **Should bonus credits ever expire?**
   - Current: No expiration
   - Option A: Never expire (simple, user-friendly)
   - Option B: 12-month expiration (cleaner accounting, prevents liability accumulation)
   - Recommendation: Start with no expiration, add expiration later if accounting requires

5. **Multi-currency support for top-up packages?**
   - Current: USD only (price_usd_cents)
   - Needs: EUR, GBP support for international customers
   - Proposal: Add `prices JSONB` column: `{"usd": 999, "eur": 899, "gbp": 799}`
   - Decision deferred to billing integration phase

6. **What's the reservation timeout?**
   - AI operations typically complete in 5-30 seconds
   - Edge case: What if server crashes mid-operation?
   - Proposal: Background job clears reservations older than 5 minutes
   - Need: `reservation_created_at` timestamp on balance row, or separate reservations table

7. **Should we track per-user credit usage within an organization?**
   - Current: Credits tracked at org level only
   - Use case: Team plan with multiple users, want to see who uses most
   - Proposal: `credit_transactions.user_id` already exists; add dashboard view
   - Decision: Implement reporting in Phase 6 (Frontend)

8. **How do we handle Stripe webhook failures?**
   - Scenario: User pays for top-up but webhook fails to deliver
   - Mitigation 1: Stripe retries webhooks for 3 days
   - Mitigation 2: Reconciliation job compares Stripe payments to our transactions
   - Proposal: Daily reconciliation + alert on mismatch

9. **Credit pricing model for new AI capabilities?**
   - Current: Manual estimate columns per capability
   - Future: May want dynamic pricing based on model costs
   - Proposal: Store base multiplier per capability, calculate from model costs dynamically

---

## References

- [ADR-012: AI Service Infrastructure](../012-ai-service-infrastructure.md)
- [PRD-005: AI Testimonial Generation](../../prd/005-ai-testimonial-generation.md)
- Existing credit calculation: `api/src/shared/libs/ai/audit.ts`
- Existing plan structure: `plans`, `organization_plans` tables
