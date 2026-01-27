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

**Proposed** - 2026-01-26

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
│ description         │       │ quality_levels[]     │       │   credits       │
│ category            │       └──────────────────────┘       └─────────────────┘
│ is_active           │                                              │
└─────────────────────┘                                              │
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
│ used_this_period    │ Credits consumed this billing period                   │
│ period_start/end    │ Current billing period boundaries                      │
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

#### 4. Balance Update Strategy

Use **atomic operations** with `RETURNING` to prevent race conditions:

```sql
UPDATE organization_credit_balances
SET used_this_period = used_this_period + $1
WHERE organization_id = $2
  AND (monthly_credits - used_this_period + bonus_credits) >= $1
RETURNING *;
```

If no rows returned → insufficient credits.

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

### Table: `plan_ai_capabilities`

Junction table defining which AI features each plan can access.

```sql
CREATE TABLE plan_ai_capabilities (
    id                  VARCHAR(12) PRIMARY KEY DEFAULT generate_nanoid_12(),
    plan_id             VARCHAR(12) NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    ai_capability_id    VARCHAR(12) NOT NULL REFERENCES ai_capabilities(id) ON DELETE CASCADE,

    -- Access control
    is_enabled          BOOLEAN NOT NULL DEFAULT true,

    -- Quality level restrictions (NULL = all levels allowed)
    -- Array of allowed quality levels: ['fast', 'enhanced', 'premium']
    allowed_quality_levels  TEXT[] DEFAULT ARRAY['fast', 'enhanced', 'premium'],

    -- Audit
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(plan_id, ai_capability_id)
);

CREATE INDEX idx_plan_ai_capabilities_plan ON plan_ai_capabilities(plan_id);
CREATE INDEX idx_plan_ai_capabilities_capability ON plan_ai_capabilities(ai_capability_id);

COMMENT ON TABLE plan_ai_capabilities IS
    'Junction table: which plans can access which AI features.';
COMMENT ON COLUMN plan_ai_capabilities.is_enabled IS
    'Whether this capability is enabled for this plan';
COMMENT ON COLUMN plan_ai_capabilities.allowed_quality_levels IS
    'Quality levels this plan can use. NULL or empty = all levels.';
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

-- Free plan: Only question_generation with fast quality
INSERT INTO plan_ai_capabilities (plan_id, ai_capability_id, is_enabled, allowed_quality_levels)
SELECT p.id, ac.id,
    CASE
        WHEN ac.unique_name = 'question_generation' THEN true
        ELSE false  -- testimonial_assembly and polish disabled
    END,
    CASE
        WHEN ac.unique_name = 'question_generation' THEN ARRAY['fast']
        ELSE ARRAY[]::TEXT[]
    END
FROM plans p, ai_capabilities ac
WHERE p.unique_name = 'free';

-- Pro plan: All capabilities, fast + enhanced quality
INSERT INTO plan_ai_capabilities (plan_id, ai_capability_id, is_enabled, allowed_quality_levels)
SELECT p.id, ac.id, true, ARRAY['fast', 'enhanced']
FROM plans p, ai_capabilities ac
WHERE p.unique_name = 'pro';

-- Team plan: All capabilities, all quality levels
INSERT INTO plan_ai_capabilities (plan_id, ai_capability_id, is_enabled, allowed_quality_levels)
SELECT p.id, ac.id, true, ARRAY['fast', 'enhanced', 'premium']
FROM plans p, ai_capabilities ac
WHERE p.unique_name = 'team';
```

### Plan AI Access Summary

| Plan | question_generation | testimonial_assembly | testimonial_polish | Quality Levels |
|------|---------------------|---------------------|-------------------|----------------|
| Free | ✅ Enabled | ❌ Disabled | ❌ Disabled | fast only |
| Pro | ✅ Enabled | ✅ Enabled | ✅ Enabled | fast, enhanced |
| Team | ✅ Enabled | ✅ Enabled | ✅ Enabled | all |

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

    -- Bonus credits from top-ups (never reset)
    bonus_credits       DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Usage tracking
    used_this_period    DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Current billing period
    period_start        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    period_end          TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),

    -- Audit
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Computed column helper (for queries)
COMMENT ON TABLE organization_credit_balances IS
    'Credit balance per organization. available = monthly_credits - used_this_period + bonus_credits';

-- Function to get available credits
CREATE OR REPLACE FUNCTION get_available_credits(org_id VARCHAR(12))
RETURNS DECIMAL(10,2) AS $$
    SELECT COALESCE(
        (SELECT monthly_credits - used_this_period + bonus_credits
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

    -- Transaction details
    transaction_type    VARCHAR(30) NOT NULL
                        CHECK (transaction_type IN (
                            'plan_allocation',
                            'topup_purchase',
                            'promo_bonus',
                            'referral_bonus',
                            'ai_consumption',
                            'admin_adjustment',
                            'refund'
                        )),

    -- Amount: positive for additions, negative for consumption
    credits_amount      DECIMAL(10,2) NOT NULL,

    -- Running balance after this transaction
    balance_after       DECIMAL(10,2) NOT NULL,

    -- For AI consumption: link to ai_capabilities table
    ai_capability_id    VARCHAR(12) REFERENCES ai_capabilities(id) ON DELETE SET NULL,

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
    --   quality: 'fast' | 'enhanced' | 'premium'
    -- }

    -- Payment metadata (for topup transactions)
    payment_metadata    JSONB,
    -- Schema: {
    --   payment_provider: 'stripe',
    --   payment_intent_id: string,
    --   amount_paid: number,
    --   currency: string
    -- }

    -- Optional note
    note                TEXT,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_credit_transactions_org_time
    ON credit_transactions(organization_id, created_at DESC);

CREATE INDEX idx_credit_transactions_type
    ON credit_transactions(transaction_type, created_at DESC);

COMMENT ON TABLE credit_transactions IS
    'Immutable audit log of all credit movements. Never UPDATE or DELETE.';
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
    | 'quality_not_allowed';     // Requested quality not in allowed_quality_levels
  allowedQualityLevels?: QualityLevel[];  // What this plan CAN use
}

/**
 * Check if an organization's plan allows access to an AI capability
 */
async function checkCapabilityAccess(
  organizationId: string,
  capabilityUniqueName: string,
  requestedQuality: QualityLevel = 'fast'
): Promise<AICapabilityAccessResult>;
```

### Layer 2: Check Credit Balance

```typescript
// api/src/features/credits/checkBalance.ts

interface CreditBalanceResult {
  available: number;       // Total available (monthly remaining + bonus)
  monthlyRemaining: number; // monthly_credits - used_this_period
  bonusCredits: number;     // From top-ups
  periodEndsAt: Date;       // When monthly resets
  estimatedCost: number;    // Estimated credits for this operation
  canProceed: boolean;      // available >= estimatedCost
}

async function checkCreditBalance(
  organizationId: string,
  capabilityId: string,
  quality: QualityLevel = 'fast'
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
 */
async function checkAIAccess(
  organizationId: string,
  capabilityUniqueName: string,
  quality: QualityLevel = 'fast'
): Promise<AIAccessResult>;
```

### Consume Credits (Atomic)

```typescript
// api/src/features/credits/consumeCredits.ts

interface ConsumeCreditsInput {
  organizationId: string;
  aiCapabilityId: string;  // FK to ai_capabilities
  creditsToCharge: number;
  userId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  providerMetadata: {
    provider: AIProvider;
    model: string;
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
    requestId: string;
    quality: QualityLevel;
  };
}

interface ConsumeCreditsResult {
  success: boolean;
  transactionId: string;
  balanceAfter: number;
  error?: 'insufficient_credits';
}

async function consumeCredits(input: ConsumeCreditsInput): Promise<ConsumeCreditsResult>;
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
  capabilityUniqueName: string;  // e.g., 'question_generation'
  quality: QualityLevel;
  userId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

/**
 * Wrapper that handles capability access + credit consumption for AI operations
 */
async function executeWithAIAccess<T>(
  context: AIOperationContext,
  operation: () => Promise<{ result: T; response: AIResponse }>
): Promise<T> {
  // 1. Check capability access + credit balance (combined)
  const access = await checkAIAccess(
    context.organizationId,
    context.capabilityUniqueName,
    context.quality
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

  // 2. Execute AI operation
  const { result, response } = await operation();

  // 3. Extract actual usage and calculate credits
  const usage = extractUsageFromResponse(response, context.provider, context.model);
  const creditsToCharge = calculateCreditsFromCost(usage.costUsd ?? 0);

  // 4. Consume credits (atomic) - linked to ai_capability
  const consumption = await consumeCredits({
    organizationId: context.organizationId,
    aiCapabilityId: access.capability!.id,  // Use capability ID, not string
    creditsToCharge,
    userId: context.userId,
    relatedEntityType: context.relatedEntityType,
    relatedEntityId: context.relatedEntityId,
    providerMetadata: {
      provider: usage.provider ?? 'openai',
      model: usage.model ?? 'unknown',
      inputTokens: usage.inputTokens ?? 0,
      outputTokens: usage.outputTokens ?? 0,
      costUsd: usage.costUsd ?? 0,
      requestId: usage.requestId ?? '',
      quality: context.quality,
    },
  });

  if (!consumption.success) {
    // Race condition: credits depleted between check and execute
    // Could implement refund logic here if needed
    throw new InsufficientCreditsError(0, creditsToCharge);
  }

  return result;
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

## Usage Flow

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
│ 5. Check requested quality in allowed_quality_levels                │
│    └── 'premium' not in ['fast','enhanced'] → 403 (quality_denied)  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                          ✅ Capability allowed
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 2: Credit Balance Check (organization_credit_balances)        │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Get estimated cost from ai_capabilities.estimated_credits_*      │
│                                                                     │
│ 2. Query organization_credit_balances                               │
│    available = monthly_credits - used_this_period + bonus_credits   │
│                                                                     │
│ 3. available >= estimated_cost?                                     │
│    └── No → 402 (insufficient_credits - "Top up or wait for reset") │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                          ✅ Has credits
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. Execute AI Operation                                             │
│    └── Call provider (OpenAI/Anthropic/Google)                      │
│    └── Get actual token usage from response                         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. Calculate Actual Credits                                         │
│    └── calculateCreditsFromCost(actual_cost_usd)                    │
│    └── May differ from estimate (based on response length)          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. Consume Credits (atomic transaction)                             │
├─────────────────────────────────────────────────────────────────────┤
│ BEGIN;                                                              │
│                                                                     │
│   UPDATE organization_credit_balances                               │
│   SET used_this_period = used_this_period + $credits                │
│   WHERE organization_id = $org_id                                   │
│     AND (monthly_credits - used_this_period + bonus_credits) >= $c; │
│                                                                     │
│   INSERT INTO credit_transactions (                                 │
│     organization_id, ai_capability_id, transaction_type,            │
│     credits_amount, balance_after, provider_metadata                │
│   ) VALUES (...);                                                   │
│                                                                     │
│ COMMIT;                                                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 6. Return Result to User                                            │
│    {                                                                 │
│      "testimonial": "...",                                          │
│      "credits_used": 3.5,                                           │
│      "balance_remaining": 46.5                                      │
│    }                                                                 │
└─────────────────────────────────────────────────────────────────────┘
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

interface AIAccessState {
  // Layer 1: Capability access
  capabilityAllowed: boolean;
  capabilityDeniedReason?: string;
  allowedQualityLevels: QualityLevel[];

  // Layer 2: Credit balance
  creditsAvailable: number;
  estimatedCost: number;
  hasEnoughCredits: boolean;

  // Combined
  canProceed: boolean;
  upgradeRequired: boolean;
  topupRequired: boolean;
}

function useAIAccess(capabilityName: string, quality: QualityLevel = 'fast') {
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
const selectedQuality = ref<QualityLevel>('fast');

const {
  capabilityAllowed,
  allowedQualityLevels,
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

When billing period ends, a scheduled job resets monthly usage:

```typescript
// Scheduled job (daily or webhook from Stripe)
async function resetMonthlyCredits(organizationId: string) {
  const balance = await getOrganizationCreditBalance(organizationId);
  const plan = await getOrganizationPlan(organizationId);

  // Record the reset as a transaction
  await db.transaction(async (tx) => {
    // 1. Reset used_this_period
    await tx.update(organizationCreditBalances)
      .set({
        used_this_period: 0,
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

---

## Consequences

### Positive

| Benefit | Description |
|---------|-------------|
| **Two-layer control** | Separate "can use" (capabilities) from "how much" (credits) |
| **Fair pricing** | Users pay for actual usage, not arbitrary per-feature limits |
| **Extensibility** | New AI features = new row in `ai_capabilities`, not schema change |
| **Quality tiering** | Plans can restrict quality levels (Free=fast, Pro=enhanced, Team=premium) |
| **Revenue opportunity** | Top-up purchases create additional revenue stream |
| **Full audit trail** | Every credit movement tracked with ai_capability reference |
| **Leverages existing code** | Uses `calculateCreditsFromCost()` already in codebase |

### Negative

| Trade-off | Mitigation |
|-----------|------------|
| Two-layer complexity | Clear separation: capabilities for access, credits for billing |
| Credit estimation may differ from actual | Show "~X credits" with tooltip explaining variance |
| Monthly reset requires scheduled job | Can trigger from Stripe webhook on billing cycle |
| More tables to maintain | Well-documented relationships, Hasura handles joins |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Race condition on balance update | Medium | Low | Atomic UPDATE with WHERE clause |
| Negative balance from async operations | Low | Medium | Pre-check + post-check with refund if needed |
| Provider cost changes break estimates | Low | Low | Update `COST_PER_MILLION_TOKENS` map |
| Capability config drift between plans | Low | Low | Admin UI for plan_ai_capabilities management |

---

## Implementation Phases

### Phase 1: Schema & Migrations (Capabilities)
- [ ] Create `ai_capabilities` table
- [ ] Create `plan_ai_capabilities` table
- [ ] Seed initial capabilities (question_generation, testimonial_assembly, testimonial_polish)
- [ ] Seed plan mappings (Free, Pro, Team)
- [ ] Add Hasura metadata (permissions, relationships)

### Phase 2: Schema & Migrations (Credits)
- [ ] Add `monthly_ai_credits` to `plans` table
- [ ] Add `monthly_ai_credits` to `organization_plans` table
- [ ] Create `organization_credit_balances` table
- [ ] Create `credit_transactions` table
- [ ] Create `credit_topup_packages` table
- [ ] Seed topup packages

### Phase 3: API - Capability Access
- [ ] Implement `checkCapabilityAccess()` function
- [ ] Implement `checkAIAccess()` combined function
- [ ] Add error types (AIAccessDeniedError, InsufficientCreditsError)

### Phase 4: API - Credit Management
- [ ] Implement `checkCreditBalance()` function
- [ ] Implement `consumeCredits()` function (atomic)
- [ ] Implement `purchaseTopup()` endpoint
- [ ] Create `executeWithAIAccess()` wrapper

### Phase 5: Integration with AI Operations
- [ ] Wrap `/ai/suggest-questions` with `executeWithAIAccess`
- [ ] Wrap `/ai/assemble-testimonial` with `executeWithAIAccess`
- [ ] Add credits + capability info to AI response metadata
- [ ] Update existing AI audit logging

### Phase 4: Frontend
- [ ] Create `useCreditBalance` composable
- [ ] Create `CreditBalanceWidget` component
- [ ] Update AI feature UIs with credit info
- [ ] Build credit history page
- [ ] Build top-up purchase modal

### Phase 5: Billing Integration
- [ ] Integrate Stripe for top-up payments
- [ ] Implement monthly reset job
- [ ] Handle plan upgrades/downgrades

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

1. **What happens if a user starts an operation but credits are consumed mid-operation?**
   - Proposal: Allow operation to complete, even if it causes slight negative balance. Refund mechanism available.

2. **Should bonus credits ever expire?**
   - Current: No expiration. Could add 12-month expiration for accounting reasons.

3. **How do we handle refunds for failed AI operations?**
   - Proposal: Automatic refund transaction if AI provider returns error after tokens consumed.

---

## References

- [ADR-012: AI Service Infrastructure](../012-ai-service-infrastructure.md)
- [PRD-005: AI Testimonial Generation](../../prd/005-ai-testimonial-generation.md)
- Existing credit calculation: `api/src/shared/libs/ai/audit.ts`
- Existing plan structure: `plans`, `organization_plans` tables
