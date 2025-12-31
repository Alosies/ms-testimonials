# Credits, Plans & AI Models

Version: 1.0
Date: December 31, 2025

---

## Overview

This document defines the credits system, pricing plans, and AI model options for the Testimonials platform. The goal is to provide a sustainable business model that:

1. Offers generous value to LTD buyers
2. Passes AI costs to heavy users fairly
3. Maintains ~70% margin on AI operations
4. Keeps the UX simple and transparent

---

## Table of Contents

1. [Plans & Pricing](#plans--pricing)
2. [AI Credits System](#ai-credits-system)
3. [AI Quality Levels](#ai-quality-levels)
4. [Credit Operations](#credit-operations)
5. [User-Facing Experience](#user-facing-experience)
6. [Database Schema](#database-schema)
7. [API Design](#api-design)
8. [Business Rules](#business-rules)
9. [Admin & Analytics](#admin--analytics)
10. [Audit & Reconciliation](#audit--reconciliation)

---

## Plans & Pricing

### Subscription Tiers

| Tier | Price | Type | Target User |
|------|-------|------|-------------|
| **Free** | $0 | Forever | Hobbyists, evaluation |
| **Pro** | $49 | Lifetime Deal | Freelancers, small business |
| **Team** | $99 | Lifetime Deal | Agencies, growing teams |

### Plan Features Matrix

| Feature | Free | Pro LTD | Team LTD |
|---------|------|---------|----------|
| **Testimonials** | 50 | Unlimited | Unlimited |
| **Forms** | 1 | 5 | Unlimited |
| **Widgets** | 1 | Unlimited | Unlimited |
| **AI Credits Included** | 100 | 2,000 | 5,000 |
| **AI Quality Levels** | ⚡ Fast only | ⚡✨🚀 All | ⚡✨🚀 All |
| **Credit Top-ups** | ❌ | ✅ | ✅ |
| **Remove Branding** | ❌ | ✅ | ✅ |
| **Team Members** | 1 | 1 | 3 |
| **Priority Support** | ❌ | ❌ | ✅ |
| **Custom Domain** | ❌ | ❌ | ✅ |

### Credit Top-Up Packs

Available for Pro and Team tiers only.

| Pack | Credits | Price | Per Credit | Stripe Net | AI Cost (worst) | Margin |
|------|---------|-------|------------|------------|-----------------|--------|
| **Starter** | 1,000 | $5 | $0.005 | $4.55 | $1.40 | 69% |
| **Growth** | 3,000 | $15 | $0.005 | $14.27 | $4.20 | 71% |
| **Scale** | 6,000 | $29 | $0.00483 | $27.46 | $8.40 | 69% |

---

## AI Credits System

### Core Concept

AI Credits are the currency for AI-powered features. Each AI operation consumes credits based on the quality level selected.

```
1 Credit = $0.005 value
```

### Credit Value Proposition

| Plan | Credits | Dollar Value | Included In |
|------|---------|--------------|-------------|
| Free | 100 | $0.50 | Plan |
| Pro LTD | 2,000 | $10.00 | $49 plan |
| Team LTD | 5,000 | $25.00 | $99 plan |

### Credit Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    CREDIT LIFECYCLE                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  ACQUIRE │───▶│  BALANCE │───▶│ CONSUME  │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│       │               │               │                     │
│       ▼               ▼               ▼                     │
│  • Plan signup    • Tracked per   • AI operations          │
│  • Top-up         • organization  • Deducted in            │
│  • Bonus/promo    • Never expires │  real-time             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Credit Properties

| Property | Value |
|----------|-------|
| Expiration | **Never** - Credits don't expire |
| Transferable | **No** - Bound to organization |
| Refundable | **No** - Non-refundable once purchased |
| Negative Balance | **No** - Operations blocked at 0 |
| Minimum Balance | 0 |
| Maximum Balance | Unlimited |

---

## AI Quality Levels

### User-Facing Tiers

We expose three quality levels to users, abstracting away the underlying model names:

| Level | Display Name | Icon | Credits | Description |
|-------|--------------|------|---------|-------------|
| `fast` | **Fast** | ⚡ | 1 | Quick & efficient. Great for most use cases. |
| `enhanced` | **Enhanced** | ✨ | 5 | Better phrasing and nuance. Professional quality. |
| `premium` | **Premium** | 🚀 | 12 | Our best AI. Exceptional quality for high-stakes content. |

### Internal Model Mapping

Users never see model names. We map quality levels to models internally:

```typescript
const QUALITY_TO_MODEL = {
  fast: {
    openai: 'gpt-4o-mini',
    anthropic: 'claude-3-5-haiku-latest',
  },
  enhanced: {
    openai: 'gpt-4o',
    anthropic: 'claude-3-5-sonnet-latest',
  },
  premium: {
    openai: 'gpt-5',
    anthropic: 'claude-opus-4-5-20250514',
  },
};
```

### Cost Analysis

| Level | Credits | User Pays | Our Cost (OpenAI) | Our Cost (Anthropic) | Margin |
|-------|---------|-----------|-------------------|---------------------|--------|
| Fast | 1 | $0.005 | $0.0004 | $0.0034 | 92% / 32% |
| Enhanced | 5 | $0.025 | $0.007 | $0.0102 | 72% / 59% |
| Premium | 12 | $0.06 | $0.017 | $0.017 | 72% / 72% |

**Note:** OpenAI is more cost-effective for Fast tier. Anthropic catches up at Premium tier.

### Quality Level Access

| Plan | Fast ⚡ | Enhanced ✨ | Premium 🚀 |
|------|--------|-------------|------------|
| Free | ✅ | ❌ | ❌ |
| Pro | ✅ | ✅ | ✅ |
| Team | ✅ | ✅ | ✅ |

---

## Credit Operations

### AI Operations That Consume Credits

| Operation | Code | Description | Default Quality |
|-----------|------|-------------|-----------------|
| Question Generation | `question_generation` | Generate form questions from product description | User-selected |
| Testimonial Assembly | `testimonial_assembly` | Assemble customer answers into testimonial | Form setting |
| Testimonial Polish | `testimonial_polish` | Rewrite/improve existing testimonial | User-selected |
| AI Regenerate | `ai_regenerate` | Regenerate previous AI output | Same as original |

### Credit Consumption Rules

```typescript
const CREDIT_COSTS: Record<QualityLevel, number> = {
  fast: 1,
  enhanced: 5,
  premium: 12,
};
```

### Operations Flow

```
┌─────────────────────────────────────────────────────────────┐
│              AI OPERATION FLOW                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User triggers AI operation                                  │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ Check balance   │                                        │
│  │ >= credit cost? │                                        │
│  └────────┬────────┘                                        │
│           │                                                  │
│     ┌─────┴─────┐                                           │
│     │           │                                           │
│    YES          NO                                          │
│     │           │                                           │
│     ▼           ▼                                           │
│  ┌──────┐   ┌──────────────┐                               │
│  │Deduct│   │Show "Low     │                               │
│  │credit│   │Credits" modal│                               │
│  └──┬───┘   └──────────────┘                               │
│     │                                                        │
│     ▼                                                        │
│  ┌──────────────┐                                           │
│  │Execute AI op │                                           │
│  └──────┬───────┘                                           │
│         │                                                    │
│    ┌────┴────┐                                              │
│    │         │                                              │
│  SUCCESS   FAILURE                                          │
│    │         │                                              │
│    ▼         ▼                                              │
│  ┌─────┐  ┌─────────┐                                      │
│  │Done │  │Refund   │                                      │
│  │     │  │credits  │                                      │
│  └─────┘  └─────────┘                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Refund Policy

Credits are refunded automatically if:
- AI API call fails (network error, API error)
- AI returns invalid/unparseable response
- Operation times out

Credits are **NOT** refunded if:
- User doesn't like the output
- User cancels mid-operation
- Output is valid but low quality

---

## User-Facing Experience

### Credit Balance Display

Always visible in the app header/sidebar:

```
┌─────────────────────────────┐
│  ⚡ 1,847 credits           │
│  [Top Up]                   │
└─────────────────────────────┘
```

### Quality Selector Component

Shown when user triggers an AI operation:

```
┌─────────────────────────────────────────────────────────────┐
│  Choose AI Quality                                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ● ⚡ Fast (1 credit)                              DEFAULT  │
│    Quick generation, great for most products                 │
│                                                              │
│  ○ ✨ Enhanced (5 credits)                                  │
│    Better phrasing and industry-specific nuance              │
│                                                              │
│  ○ 🚀 Premium (12 credits)                                  │
│    Best quality for complex B2B/enterprise products          │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│  Your balance: 1,847 credits                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Low Credits Warning

Shown when balance < 50 credits:

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ Low Credits                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  You have 23 credits remaining.                              │
│                                                              │
│  [Top Up Now]  [Remind Me Later]                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Insufficient Credits Modal

Shown when user tries operation with insufficient balance:

```
┌─────────────────────────────────────────────────────────────┐
│  Insufficient Credits                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  This operation requires 5 credits.                          │
│  Your balance: 3 credits                                     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Top Up Options                                      │    │
│  │                                                      │    │
│  │  ○ 1,000 credits - $5                               │    │
│  │  ● 3,000 credits - $15              BEST VALUE      │    │
│  │  ○ 6,000 credits - $29                              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  [Purchase]  [Use Fast Instead (1 credit)]  [Cancel]        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Form Settings: Default Assembly Quality

Form owners can set the default quality for testimonial assembly:

```
┌─────────────────────────────────────────────────────────────┐
│  Form Settings                                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Testimonial Assembly Quality                                │
│                                                              │
│  When customers submit testimonials, use:                    │
│                                                              │
│  ● ⚡ Fast (1 credit per submission)                        │
│  ○ ✨ Enhanced (5 credits per submission)                   │
│  ○ 🚀 Premium (12 credits per submission)                   │
│                                                              │
│  💡 Most users stick with Fast. Upgrade if you want more    │
│     polished testimonials for enterprise clients.            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Credit History Page

Accessible from account settings:

```
┌─────────────────────────────────────────────────────────────┐
│  Credit History                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Current Balance: 1,847 credits                              │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Date       │ Operation           │ Credits │ Balance│    │
│  ├────────────┼─────────────────────┼─────────┼────────┤    │
│  │ Dec 31     │ Question Gen (Fast) │ -1      │ 1,847  │    │
│  │ Dec 31     │ Assembly (Fast)     │ -1      │ 1,848  │    │
│  │ Dec 30     │ Question Gen (Enh)  │ -5      │ 1,849  │    │
│  │ Dec 30     │ Top-up (Starter)    │ +1,000  │ 1,854  │    │
│  │ Dec 29     │ Assembly (Fast)     │ -1      │ 854    │    │
│  │ Dec 15     │ Plan: Pro LTD       │ +2,000  │ 855    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  [Load More]                                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Organizations Table (Extended)

```sql
-- Add to existing organizations table
ALTER TABLE organizations ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'
  CHECK (plan IN ('free', 'pro', 'team'));
ALTER TABLE organizations ADD COLUMN plan_purchased_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN ai_credits_balance INTEGER NOT NULL DEFAULT 0;
ALTER TABLE organizations ADD COLUMN ai_credits_lifetime_purchased INTEGER NOT NULL DEFAULT 0;
ALTER TABLE organizations ADD COLUMN ai_credits_lifetime_used INTEGER NOT NULL DEFAULT 0;
```

### Credit Transactions Table

```sql
CREATE TABLE credit_transactions (
  id TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Transaction type
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'plan_credit',      -- Credits from plan purchase
    'topup_purchase',   -- Credits from top-up purchase
    'usage',            -- Credits consumed by AI operation
    'refund',           -- Credits refunded due to failed operation
    'bonus',            -- Promotional credits
    'adjustment'        -- Manual admin adjustment
  )),

  -- Amount (positive for additions, negative for usage)
  amount INTEGER NOT NULL,

  -- Running balance after this transaction
  balance_after INTEGER NOT NULL,

  -- For usage/refund transactions
  operation_type TEXT CHECK (operation_type IN (
    'question_generation',
    'testimonial_assembly',
    'testimonial_polish',
    'ai_regenerate'
  )),
  quality_level TEXT CHECK (quality_level IN ('fast', 'enhanced', 'premium')),
  related_entity_type TEXT CHECK (related_entity_type IN ('form', 'testimonial', 'form_question')),
  related_entity_id TEXT,

  -- For purchase transactions
  topup_pack TEXT CHECK (topup_pack IN ('starter', 'growth', 'scale')),
  stripe_payment_intent_id TEXT,

  -- For plan credits
  plan_type TEXT CHECK (plan_type IN ('free', 'pro', 'team')),

  -- Metadata
  notes TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Indexes
  CONSTRAINT valid_usage CHECK (
    (transaction_type = 'usage' AND operation_type IS NOT NULL AND quality_level IS NOT NULL) OR
    (transaction_type != 'usage')
  ),
  CONSTRAINT valid_purchase CHECK (
    (transaction_type = 'topup_purchase' AND topup_pack IS NOT NULL) OR
    (transaction_type != 'topup_purchase')
  )
);

-- Indexes for common queries
CREATE INDEX idx_credit_transactions_org ON credit_transactions(organization_id);
CREATE INDEX idx_credit_transactions_created ON credit_transactions(created_at DESC);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(transaction_type);
```

### Forms Table (Extended)

```sql
-- Add default AI quality setting to forms
ALTER TABLE forms ADD COLUMN default_assembly_quality TEXT NOT NULL DEFAULT 'fast'
  CHECK (default_assembly_quality IN ('fast', 'enhanced', 'premium'));
```

---

## API Design

### Check Credit Balance

```typescript
// GET /api/credits/balance
interface CreditBalanceResponse {
  balance: number;
  lifetime_purchased: number;
  lifetime_used: number;
  plan: 'free' | 'pro' | 'team';
  can_topup: boolean;
}
```

### Check Operation Affordability

```typescript
// POST /api/credits/check
interface CheckCreditsRequest {
  operation: 'question_generation' | 'testimonial_assembly' | 'testimonial_polish';
  quality: 'fast' | 'enhanced' | 'premium';
}

interface CheckCreditsResponse {
  can_afford: boolean;
  cost: number;
  balance: number;
  balance_after: number;
}
```

### Consume Credits (Internal)

```typescript
// Called internally before AI operations
async function consumeCredits(
  organizationId: string,
  operation: OperationType,
  quality: QualityLevel,
  relatedEntityType?: string,
  relatedEntityId?: string
): Promise<{ success: boolean; balance: number; error?: string }>;
```

### Refund Credits (Internal)

```typescript
// Called internally when AI operation fails
async function refundCredits(
  organizationId: string,
  amount: number,
  originalTransactionId: string,
  reason: string
): Promise<{ success: boolean; balance: number }>;
```

### Purchase Credits

```typescript
// POST /api/credits/purchase
interface PurchaseCreditsRequest {
  pack: 'starter' | 'growth' | 'scale';
  payment_method_id: string; // Stripe payment method
}

interface PurchaseCreditsResponse {
  success: boolean;
  credits_added: number;
  new_balance: number;
  transaction_id: string;
  receipt_url: string;
}
```

### Get Credit History

```typescript
// GET /api/credits/history?limit=20&offset=0
interface CreditHistoryResponse {
  transactions: {
    id: string;
    type: string;
    amount: number;
    balance_after: number;
    operation_type?: string;
    quality_level?: string;
    topup_pack?: string;
    created_at: string;
  }[];
  total: number;
  has_more: boolean;
}
```

---

## Business Rules

### Plan Upgrades

| From | To | Credit Handling |
|------|-----|-----------------|
| Free | Pro | Add 2,000 credits (don't remove existing) |
| Free | Team | Add 5,000 credits |
| Pro | Team | Add 3,000 credits (difference) |

### Plan Downgrades

Not supported for LTD. Once purchased, plan is permanent.

### Credit Grants on Signup

| Plan | Initial Credits | Source |
|------|-----------------|--------|
| Free | 100 | Automatic on org creation |
| Pro | 2,000 | On successful payment |
| Team | 5,000 | On successful payment |

### Quality Level Restrictions

```typescript
function canUseQualityLevel(plan: Plan, quality: QualityLevel): boolean {
  if (plan === 'free') {
    return quality === 'fast';
  }
  return true; // Pro and Team can use all levels
}
```

### Minimum Balance Warning

- Show warning when balance < 50 credits
- Show critical warning when balance < 10 credits
- Block operations when balance < cost

### Failed Operation Handling

```typescript
async function executeAIOperation(params: AIOperationParams) {
  // 1. Check balance
  const check = await checkCredits(params.orgId, params.operation, params.quality);
  if (!check.can_afford) {
    throw new InsufficientCreditsError(check.cost, check.balance);
  }

  // 2. Deduct credits optimistically
  const transaction = await consumeCredits(params.orgId, params.operation, params.quality);

  try {
    // 3. Execute AI operation
    const result = await callAI(params);
    return result;
  } catch (error) {
    // 4. Refund on failure
    await refundCredits(params.orgId, transaction.amount, transaction.id, error.message);
    throw error;
  }
}
```

---

## Admin & Analytics

### Admin Dashboard Metrics

| Metric | Description |
|--------|-------------|
| Total Credits Sold | Sum of all purchased credits |
| Total Credits Used | Sum of all consumed credits |
| Credits Outstanding | Total balance across all orgs |
| Revenue from Top-ups | Total top-up revenue |
| Avg Credits/User | Average balance per organization |
| Usage by Quality | Breakdown of Fast/Enhanced/Premium usage |
| Usage by Operation | Breakdown by operation type |

### SQL Queries for Analytics

```sql
-- Credits sold vs used
SELECT
  SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as credits_sold,
  SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as credits_used,
  SUM(amount) as credits_outstanding
FROM credit_transactions;

-- Usage by quality level
SELECT
  quality_level,
  COUNT(*) as operation_count,
  SUM(ABS(amount)) as credits_used
FROM credit_transactions
WHERE transaction_type = 'usage'
GROUP BY quality_level;

-- Top users by consumption
SELECT
  o.name as org_name,
  SUM(ABS(ct.amount)) as credits_used
FROM credit_transactions ct
JOIN organizations o ON ct.organization_id = o.id
WHERE ct.transaction_type = 'usage'
GROUP BY o.id, o.name
ORDER BY credits_used DESC
LIMIT 20;

-- Revenue from top-ups
SELECT
  topup_pack,
  COUNT(*) as purchases,
  SUM(CASE
    WHEN topup_pack = 'starter' THEN 5
    WHEN topup_pack = 'growth' THEN 15
    WHEN topup_pack = 'scale' THEN 29
  END) as revenue
FROM credit_transactions
WHERE transaction_type = 'topup_purchase'
GROUP BY topup_pack;
```

### Alerts

| Alert | Trigger | Action |
|-------|---------|--------|
| High Usage | Org uses >500 credits/day | Review for abuse |
| Zero Balance | Org hits 0 credits | Send top-up reminder email |
| Failed Operations | >10 failures/hour | Check AI provider status |
| Unusual Pattern | Sudden spike in usage | Flag for review |

---

## Audit & Reconciliation

### Purpose

Track AI provider usage alongside internal credit consumption to:
1. Verify our credit calculations are correct
2. Catch discrepancies between what we charged and actual costs
3. Provide audit trail for cost analysis
4. Reconcile internal credits with provider billing

### Provider Audit Capabilities

| Provider | Request ID | Actual Cost | Token Counts | Dashboard |
|----------|------------|-------------|--------------|-----------|
| **OpenRouter** | ✅ generationId | ✅ totalCost | ✅ | ✅ Full audit |
| **OpenAI** | ✅ request_id | ❌ Calculated | ✅ | ✅ Usage dashboard |
| **Anthropic** | ✅ request_id | ❌ Calculated | ✅ | ✅ Console |

**Recommendation:** Use OpenRouter for production - it returns actual cost per request for exact reconciliation.

### Extended Credit Transactions Schema

Add provider audit columns to track actual AI usage:

```sql
-- Extend credit_transactions table with audit fields
ALTER TABLE credit_transactions ADD COLUMN ai_provider TEXT;
ALTER TABLE credit_transactions ADD COLUMN ai_model TEXT;
ALTER TABLE credit_transactions ADD COLUMN ai_request_id TEXT;
ALTER TABLE credit_transactions ADD COLUMN ai_input_tokens INTEGER;
ALTER TABLE credit_transactions ADD COLUMN ai_output_tokens INTEGER;
ALTER TABLE credit_transactions ADD COLUMN ai_total_tokens INTEGER;
ALTER TABLE credit_transactions ADD COLUMN ai_actual_cost_usd NUMERIC(10, 8);
ALTER TABLE credit_transactions ADD COLUMN ai_estimated_cost_usd NUMERIC(10, 8);

-- Index for reconciliation queries
CREATE INDEX idx_credit_transactions_ai_request
  ON credit_transactions(ai_request_id)
  WHERE ai_request_id IS NOT NULL;

CREATE INDEX idx_credit_transactions_provider
  ON credit_transactions(ai_provider, created_at DESC)
  WHERE ai_provider IS NOT NULL;
```

### Audit Data Capture

Our AI abstraction captures audit data automatically:

```typescript
interface AIUsageData {
  provider: 'openai' | 'anthropic' | 'openrouter';
  model: string;                    // Actual model used
  requestId: string;                // Provider's request/generation ID
  inputTokens: number;              // Prompt tokens
  outputTokens: number;             // Completion tokens
  totalTokens: number;              // Total tokens
  costUsd: number | null;           // Actual cost (OpenRouter) or estimated
  timestamp: Date;                  // When operation occurred
}
```

### Tracking Tags

Each AI request includes a tracking tag for provider dashboard filtering:

```
org:{organizationId}|op:{operationType}|q:{qualityLevel}
```

Example: `org:abc123|op:question_generation|q:enhanced`

This allows filtering usage in provider dashboards by organization or operation type.

### Reconciliation Queries

```sql
-- 1. Compare credits charged vs actual AI cost
SELECT
  DATE(created_at) as date,
  quality_level,
  COUNT(*) as operations,
  SUM(ABS(amount)) as credits_charged,
  SUM(ABS(amount) * 0.005) as revenue_usd,
  SUM(COALESCE(ai_actual_cost_usd, ai_estimated_cost_usd)) as ai_cost_usd,
  SUM(ABS(amount) * 0.005) - SUM(COALESCE(ai_actual_cost_usd, ai_estimated_cost_usd)) as margin_usd,
  ROUND(
    (SUM(ABS(amount) * 0.005) - SUM(COALESCE(ai_actual_cost_usd, ai_estimated_cost_usd)))
    / SUM(ABS(amount) * 0.005) * 100, 2
  ) as margin_pct
FROM credit_transactions
WHERE transaction_type = 'usage'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), quality_level
ORDER BY date DESC, quality_level;

-- 2. Identify potential discrepancies (margin < 50% or > 90%)
SELECT
  id,
  organization_id,
  operation_type,
  quality_level,
  ABS(amount) as credits,
  ai_provider,
  ai_model,
  ai_total_tokens,
  ai_actual_cost_usd,
  ai_estimated_cost_usd,
  ABS(amount) * 0.005 as revenue,
  ROUND(
    (ABS(amount) * 0.005 - COALESCE(ai_actual_cost_usd, ai_estimated_cost_usd))
    / (ABS(amount) * 0.005) * 100, 2
  ) as margin_pct
FROM credit_transactions
WHERE transaction_type = 'usage'
  AND (
    -- Margin too low (potentially losing money)
    (ABS(amount) * 0.005 - COALESCE(ai_actual_cost_usd, ai_estimated_cost_usd))
    / (ABS(amount) * 0.005) < 0.5
    OR
    -- Margin too high (potential calculation error)
    (ABS(amount) * 0.005 - COALESCE(ai_actual_cost_usd, ai_estimated_cost_usd))
    / (ABS(amount) * 0.005) > 0.9
  );

-- 3. Token usage by model (for cost optimization)
SELECT
  ai_model,
  COUNT(*) as operations,
  AVG(ai_input_tokens) as avg_input_tokens,
  AVG(ai_output_tokens) as avg_output_tokens,
  AVG(ai_total_tokens) as avg_total_tokens,
  SUM(ai_total_tokens) as total_tokens,
  SUM(COALESCE(ai_actual_cost_usd, ai_estimated_cost_usd)) as total_cost
FROM credit_transactions
WHERE transaction_type = 'usage'
  AND ai_model IS NOT NULL
GROUP BY ai_model
ORDER BY total_cost DESC;

-- 4. Cross-reference with provider billing (monthly)
SELECT
  ai_provider,
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as operations,
  SUM(ai_total_tokens) as total_tokens,
  SUM(ai_actual_cost_usd) as actual_cost,
  SUM(ai_estimated_cost_usd) as estimated_cost
FROM credit_transactions
WHERE transaction_type = 'usage'
  AND ai_provider IS NOT NULL
GROUP BY ai_provider, DATE_TRUNC('month', created_at)
ORDER BY month DESC, ai_provider;
```

### OpenRouter Specific Audit

OpenRouter provides the most comprehensive audit data:

```typescript
// OpenRouter returns in experimental_providerMetadata
const openrouterMeta = result.experimental_providerMetadata?.openrouter;

{
  generationId: 'gen-abc123...',  // Unique generation ID
  totalCost: 0.0012,              // Actual cost in USD
}
```

Use generationId to look up individual requests in OpenRouter dashboard.

### Monthly Reconciliation Process

1. **Export credit_transactions** for the month with AI audit fields
2. **Download provider usage** from OpenRouter/OpenAI/Anthropic dashboards
3. **Match by request_id** to verify all operations are tracked
4. **Compare costs** - our estimated vs provider's actual
5. **Investigate discrepancies** >10% difference
6. **Adjust credit pricing** if systematic under/over-charging

### Alerts

| Alert | Condition | Action |
|-------|-----------|--------|
| Cost Spike | Single operation > $0.10 | Review immediately |
| Margin Drop | Daily margin < 60% | Review pricing |
| Missing Audit | Usage without ai_request_id | Fix tracking code |
| Provider Mismatch | Internal cost ≠ provider by >20% | Reconcile |

---

## Implementation Checklist

### Phase 1: Database & Core

- [ ] Add columns to organizations table
- [ ] Create credit_transactions table
- [ ] Create credit service functions (consume, refund, check)
- [ ] Add credits to plan signup flow

### Phase 2: API Endpoints

- [ ] GET /api/credits/balance
- [ ] POST /api/credits/check
- [ ] POST /api/credits/purchase (Stripe integration)
- [ ] GET /api/credits/history

### Phase 3: UI Components

- [ ] Credit balance display (header)
- [ ] Quality selector component
- [ ] Low credits warning
- [ ] Insufficient credits modal
- [ ] Top-up purchase flow
- [ ] Credit history page

### Phase 4: Integration

- [ ] Integrate credit check into AI operations
- [ ] Add quality selector to form builder
- [ ] Add default quality to form settings
- [ ] Add credit consumption to testimonial assembly

### Phase 5: Admin & Analytics

- [ ] Admin credits dashboard
- [ ] Usage analytics
- [ ] Alert system

---

## Appendix: Pricing Summary

### For Users

| What You Get | Free | Pro ($49) | Team ($99) |
|--------------|------|-----------|------------|
| AI Credits | 100 | 2,000 | 5,000 |
| Fast AI ⚡ | ✅ | ✅ | ✅ |
| Enhanced AI ✨ | ❌ | ✅ | ✅ |
| Premium AI 🚀 | ❌ | ✅ | ✅ |
| Top-up Available | ❌ | ✅ | ✅ |

### Credit Costs

| Quality | Credits | Best For |
|---------|---------|----------|
| ⚡ Fast | 1 | Most use cases |
| ✨ Enhanced | 5 | Professional quality |
| 🚀 Premium | 12 | Enterprise/complex products |

### Top-Up Packs

| Pack | Credits | Price |
|------|---------|-------|
| Starter | 1,000 | $5 |
| Growth | 3,000 | $15 |
| Scale | 6,000 | $29 |
