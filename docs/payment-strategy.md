# Payment Strategy — LTD Launch & Beyond

## Overview

Payment integration strategy for launching the testimonial app with Lifetime Deals (LTDs) across various platforms, then transitioning to subscriptions.

## Recommended Setup

**AppSumo + LemonSqueezy** — maximum reach with minimal integration effort.

- **AppSumo** — main LTD launch platform (1M+ deal-hungry buyers, they handle all payments)
- **LemonSqueezy** — direct sales on your own site + future subscriptions

Both are **Merchant of Record (MoR)**, meaning they handle all sales tax, VAT, GST, chargebacks, and invoicing globally. No tax registration needed from you.

---

## Platform Comparison

### Payment Gateways

| Dimension | LemonSqueezy | Paddle | Stripe |
|---|---|---|---|
| **Pricing** | 5% + $0.50/txn | 5% + $0.50/txn | 2.9% + $0.30/txn |
| **MoR (handles tax)** | Yes | Yes | No (you handle it) |
| **License keys** | Built-in, auto-generated | None (use Keygen.sh) | None |
| **Payouts** | Bi-weekly | Monthly | Rolling (2-day) |
| **Payout fees** | 0% US, 1% intl | None | Standard |
| **Approval speed** | Hours | Days to weeks | Instant |
| **Official SDKs** | JS/TS | Node, Python, Go, PHP | All major languages |
| **Webhook Simulator** | No | Yes | Yes |
| **SaaS Analytics** | Basic | ProfitWell built-in | Basic |
| **Checkout** | Hosted + overlay | Overlay on-site | Fully customizable |
| **Tax jurisdictions** | 135+ countries | 200+ countries, 100+ tax | You manage |
| **Storefront** | Built-in (no-code) | No | No |
| **LTD support** | First-class | Supported | Supported |
| **Best for** | Solo devs, LTD launch | Growing SaaS, subscriptions | Scale, full control |

### Why NOT Stripe for LTD Launch

- No MoR — you must register for tax in every jurisdiction with customers
- Adding Stripe Tax, fraud protection erases the fee advantage
- More engineering work for equivalent functionality
- Only worth it at ~$50K+ MRR where fee savings justify the overhead

### Why NOT Paddle for LTD Launch

- No built-in license keys (was in Paddle Classic, removed in Paddle Billing)
- Slow, strict approval process (days to weeks)
- Monthly payouts hurt cash flow for bootstrapped solo devs
- Strengths (ProfitWell analytics, subscription management) solve post-launch problems

### Why LemonSqueezy Wins for LTD Launch

- Native license key generation, activation, validation, deactivation
- Live in hours, not days
- Bi-weekly payouts
- Backed by Stripe infrastructure (acquired July 2024, 99.9999% uptime)
- Built-in storefront to sell without a website

---

## LTD Platforms

All LTD platforms handle payments themselves. Your integration work is license key management and user provisioning.

| Platform | Audience | Revenue Share | Notes |
|---|---|---|---|
| **AppSumo** | 1M+ buyers | 70-95% to you | Largest, most established. Strict vetting. |
| **PitchGround** | Smaller, founder-first | Varies | Lower barrier to entry |
| **DealMirror** | Aggregator | Varies | Good for secondary exposure |
| **StackSocial** | Broad (not SaaS-focused) | Varies | 5M+ products sold |
| **SaaSMantra** | 58K+ businesses, 49 countries | Varies | Community-first |
| **GrabLTD / Earlybird / SaaSPirate** | Niche | Varies | Smaller but less competitive |

### AppSumo Details

- **Revenue share**: 95% from buyers you bring, 70% from returning AppSumo customers
- **Payout timing**: First week of each month, two full months after sale
- **Requirements**: Working app, some MRR, in-house dev team, passes beta tester vetting
- **Lead time**: Weeks to months for vetting — apply early

---

## Merchant of Record — Why It Matters

When LemonSqueezy or Paddle is MoR, **they** are the legal seller on the customer's credit card statement.

**What MoR handles for you:**
- Sales tax, VAT, GST calculation and remittance across 100+ jurisdictions
- Chargeback liability absorption
- Compliant invoicing for every jurisdiction
- Legal entity requirements (EU VAT registration, US state sales tax, etc.)

**Bottom line:** The 2-3% premium over Stripe pays for itself many times over in saved accounting, legal, and compliance costs for a solo developer.

---

## Technical Integration Plan

### What You Need to Build

#### 1. Webhook Endpoints (Hono.js API)

```
POST /webhooks/appsumo        — Purchase/activate/deactivate/upgrade events
POST /webhooks/lemonsqueezy   — Order/subscription/license events
```

Both require HMAC SHA256 signature verification.

#### 2. AppSumo Licensing API v2

**Webhook events to handle:**
- `purchase` — Store license key, prepare account
- `activate` — Create/link user account, grant access
- `upgrade` — Increase plan limits
- `downgrade` — Decrease plan limits
- `deactivate` — Revoke access (refund)

**Also required:**
- OAuth redirect URL for AppSumo SSO
- Credentials: `client_id`, `client_secret`, `redirect_url`, `webhook_url`, `webhook_secret`

#### 3. LemonSqueezy Integration

**Webhook events to handle:**
- `order_created` — Record purchase, provision user
- `subscription_created` — Grant access
- `subscription_updated` — Handle plan changes
- `subscription_cancelled` — Handle cancellation grace period
- `license_key_created` — Store license key mapping

**Env vars needed:**
- `LEMONSQUEEZY_API_KEY`
- `LEMONSQUEEZY_STORE_ID`
- `LEMONSQUEEZY_WEBHOOK_SECRET`

#### 4. User Provisioning Flow (Shared)

```
Webhook received (purchase/activate)
  → Verify HMAC SHA256 signature
  → Extract email + license key from payload
  → Check if user exists in Supabase Auth
      → Yes: Link license to existing user
      → No: Create invite / magic link
  → Set plan tier + limits in PostgreSQL
  → Store license_key in licenses table
  → Return 200 OK to webhook sender
```

#### 5. Database: Licenses Table

```sql
CREATE TABLE licenses (
  id TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
  user_id TEXT REFERENCES users(id),
  source TEXT NOT NULL,            -- 'appsumo' | 'lemonsqueezy' | 'direct'
  license_key TEXT NOT NULL UNIQUE,
  plan_tier TEXT NOT NULL,         -- 'starter' | 'pro' | 'lifetime'
  status TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'deactivated'
  email TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  activated_at TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Integration Effort

| Task | Effort |
|---|---|
| LemonSqueezy setup + webhook endpoint | ~1 day |
| AppSumo Licensing API v2 integration | ~1-2 days |
| User provisioning flow | ~1 day |
| Licenses table + Hasura metadata | ~0.5 day |
| **Total** | **~3-4 days** |

---

## Phased Rollout

### Phase 1: LTD Launch (Start Here)

1. Set up LemonSqueezy account, create LTD product with pricing tiers
2. Apply to AppSumo as a partner (do this early — vetting takes weeks)
3. Build webhook endpoints for both platforms
4. Build shared user provisioning flow
5. Create `licenses` table with Hasura metadata
6. Add plan/tier logic to existing auth/permissions
7. Launch LTD on AppSumo + your own site simultaneously

### Phase 2: Post-LTD (Subscriptions)

- Keep LemonSqueezy for monthly/annual subscriptions
- Add subscription webhook handling
- Build billing management UI in dashboard

### Phase 3: Scale (If Needed)

- If exceeding ~$50K MRR, evaluate migrating to Stripe or Paddle for lower fees
- Paddle becomes compelling here for ProfitWell analytics and advanced dunning
- Consider Stripe direct if you have resources for tax compliance

---

## References

- [AppSumo Licensing API v2](https://docs.licensing.appsumo.com/)
- [AppSumo Webhook Security](https://docs.licensing.appsumo.com/webhook/webhook__security.html)
- [LemonSqueezy API Docs](https://docs.lemonsqueezy.com/api)
- [LemonSqueezy License Keys](https://docs.lemonsqueezy.com/help/licensing/generating-license-keys)
- [LemonSqueezy Webhooks](https://docs.lemonsqueezy.com/help/webhooks)
- [Paddle Developer Docs](https://developer.paddle.com/)
- [Paddle Pricing](https://www.paddle.com/pricing)
- [Stripe Managed Payments (LemonSqueezy)](https://www.lemonsqueezy.com/blog/2026-update)
