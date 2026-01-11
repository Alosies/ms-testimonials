# ADR-012: AI Service Infrastructure

## Doc Connections
**ID**: `adr-012-ai-service-infrastructure`

2026-01-11 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `prd-005-ai-testimonial-generation` - AI testimonial generation feature
- `api/src/features/ai/suggestQuestions` - Existing AI feature implementation

---

## Status

**Draft** - 2026-01-11

## Context

As we add more AI-powered features (question suggestions, testimonial assembly, future features), we need consistent infrastructure for:

| Concern | Current State | Problem |
|---------|---------------|---------|
| Credit management | Basic check before operation | Race conditions with concurrent requests |
| Provider failures | None | Single point of failure, no graceful degradation |
| Rate limiting | Per-feature, inconsistent | No unified approach, abuse vectors |
| Timeout handling | Hardcoded per feature | Inconsistent UX during outages |
| Abuse prevention | None for public endpoints | Credit exhaustion attacks possible |

### Current AI Features

| Feature | Endpoint | Auth | Credits |
|---------|----------|------|---------|
| Question Suggestions | `POST /ai/suggest-questions` | Authenticated | Yes |
| Testimonial Assembly | `POST /ai/assemble-testimonial` | Public (form-based) | Yes |

### Problems Identified

**1. Credit Reservation Race Condition**

Current pattern:
```typescript
// Gap between check and deduction allows race conditions
const hasCredits = await checkCredits(orgId, amount);
if (!hasCredits) throw new InsufficientCreditsError();

const result = await generateWithAI(request);  // Slow operation
await deductCredits(orgId, actualAmount);      // Another request could slip through
```

**2. No Provider Failover**

If OpenAI is down, all AI features fail. No fallback to alternative providers.

**3. Inconsistent Rate Limiting**

Each feature implements its own limits (or none), leading to:
- Inconsistent user experience
- Abuse vectors on features without limits
- Duplicate rate limiting code

**4. Public Endpoint Vulnerability**

`/ai/assemble-testimonial` is public (no JWT required). Without proper controls:
- Attackers can exhaust organization credits
- No CAPTCHA protection
- IP-based limits easily bypassed

---

## Decision

Implement a centralized AI Service layer with the following components:

### 1. Atomic Credit Reservation

Reserve-then-finalize pattern with row-level locking:

```typescript
// api/src/shared/libs/ai/credits.ts

interface CreditReservation {
  id: string;
  organization_id: string;
  amount: number;
  status: 'reserved' | 'finalized' | 'released';
  operation_type: string;
  created_at: Date;
}

export async function reserveCredits(
  orgId: string,
  amount: number,
  operationType: string
): Promise<{ success: true; reservation: CreditReservation } | { success: false; reason: string }> {
  // Atomic: only succeeds if sufficient credits available
  const result = await db.query(`
    UPDATE organizations
    SET credits_reserved = credits_reserved + $1
    WHERE id = $2
      AND (credits_available - credits_reserved) >= $1
    RETURNING id, credits_available, credits_reserved
  `, [amount, orgId]);

  if (result.rowCount === 0) {
    return { success: false, reason: 'insufficient_credits' };
  }

  const reservation = await db.query(`
    INSERT INTO credit_reservations (organization_id, amount, status, operation_type)
    VALUES ($1, $2, 'reserved', $3)
    RETURNING *
  `, [orgId, amount, operationType]);

  return { success: true, reservation: reservation.rows[0] };
}

export async function finalizeCredits(reservationId: string, actualAmount: number): Promise<void> {
  await db.transaction(async (tx) => {
    const reservation = await tx.query(`
      UPDATE credit_reservations
      SET status = 'finalized', amount = $1, finalized_at = NOW()
      WHERE id = $2 AND status = 'reserved'
      RETURNING *
    `, [actualAmount, reservationId]);

    if (reservation.rowCount === 0) {
      throw new Error('Reservation not found or already processed');
    }

    const { organization_id, amount: originalAmount } = reservation.rows[0];

    // Adjust reserved amount and deduct from available
    await tx.query(`
      UPDATE organizations
      SET credits_reserved = credits_reserved - $1,
          credits_available = credits_available - $2
      WHERE id = $3
    `, [originalAmount, actualAmount, organization_id]);
  });
}

export async function releaseCredits(reservationId: string): Promise<void> {
  await db.transaction(async (tx) => {
    const reservation = await tx.query(`
      UPDATE credit_reservations
      SET status = 'released'
      WHERE id = $1 AND status = 'reserved'
      RETURNING *
    `, [reservationId]);

    if (reservation.rowCount === 0) return; // Already processed

    const { organization_id, amount } = reservation.rows[0];

    await tx.query(`
      UPDATE organizations
      SET credits_reserved = credits_reserved - $1
      WHERE id = $2
    `, [amount, organization_id]);
  });
}
```

### 2. Circuit Breaker with Provider Fallback

Distributed circuit breaker using Redis for multi-instance deployments:

```typescript
// api/src/shared/libs/ai/circuitBreaker.ts

interface CircuitBreakerConfig {
  failureThreshold: number;    // Open after N failures
  resetTimeoutMs: number;      // Time before half-open
  halfOpenRequests: number;    // Test requests in half-open
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeoutMs: 60_000,
  halfOpenRequests: 2,
};

type CircuitState = 'closed' | 'open' | 'half-open';

export class DistributedCircuitBreaker {
  constructor(
    private redis: Redis,
    private provider: string,
    private config: CircuitBreakerConfig = DEFAULT_CONFIG
  ) {}

  async getState(): Promise<CircuitState> {
    const key = `circuit:${this.provider}`;
    const data = await this.redis.hgetall(key);

    if (!data.failures) return 'closed';

    const failures = parseInt(data.failures, 10);
    const lastFailure = parseInt(data.lastFailure, 10);
    const now = Date.now();

    if (failures < this.config.failureThreshold) return 'closed';

    if (now - lastFailure > this.config.resetTimeoutMs) return 'half-open';

    return 'open';
  }

  async recordFailure(): Promise<void> {
    const key = `circuit:${this.provider}`;
    await this.redis.pipeline()
      .hincrby(key, 'failures', 1)
      .hset(key, 'lastFailure', Date.now().toString())
      .expire(key, Math.ceil(this.config.resetTimeoutMs / 1000) * 2)
      .exec();
  }

  async recordSuccess(): Promise<void> {
    const key = `circuit:${this.provider}`;
    await this.redis.del(key);
  }
}
```

### 3. Model Fallback Chains

Configuration-driven fallback per quality tier:

```typescript
// api/src/shared/libs/ai/models.ts

export type QualityLevel = 'fast' | 'enhanced' | 'premium';

interface ModelConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  maxTokens: number;
  costPerToken: number;
}

export const MODEL_CHAINS: Record<QualityLevel, ModelConfig[]> = {
  fast: [
    { provider: 'openai', model: 'gpt-4o-mini', maxTokens: 1000, costPerToken: 0.00015 },
    { provider: 'anthropic', model: 'claude-3-5-haiku-20241022', maxTokens: 1000, costPerToken: 0.00025 },
  ],
  enhanced: [
    { provider: 'openai', model: 'gpt-4o', maxTokens: 2000, costPerToken: 0.005 },
    { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', maxTokens: 2000, costPerToken: 0.003 },
  ],
  premium: [
    { provider: 'openai', model: 'gpt-4o', maxTokens: 4000, costPerToken: 0.005 },
    { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', maxTokens: 4000, costPerToken: 0.003 },
  ],
};

export async function generateWithFallback<T>(
  request: GenerationRequest,
  quality: QualityLevel
): Promise<GenerationResult<T>> {
  const chain = MODEL_CHAINS[quality];

  for (const modelConfig of chain) {
    const breaker = getCircuitBreaker(modelConfig.provider);

    const state = await breaker.getState();
    if (state === 'open') {
      logger.info(`Circuit open for ${modelConfig.provider}, trying next`);
      continue;
    }

    try {
      const result = await generateWithTimeout({
        ...request,
        model: modelConfig.model,
        maxTokens: modelConfig.maxTokens,
      });

      await breaker.recordSuccess();
      return result;

    } catch (error) {
      await breaker.recordFailure();
      logger.warn(`Generation failed for ${modelConfig.provider}`, { error });
      continue;
    }
  }

  throw new AllProvidersFailedError('All AI providers unavailable');
}
```

### 4. Unified Rate Limiting

Multi-level rate limiting with Redis:

```typescript
// api/src/shared/libs/ai/rateLimit.ts

interface RateLimitConfig {
  perIp: { requests: number; windowSeconds: number };
  perOrg: { requests: number; windowSeconds: number };
  perForm: { requests: number; windowSeconds: number };  // For public endpoints
}

const DEFAULT_LIMITS: RateLimitConfig = {
  perIp: { requests: 20, windowSeconds: 60 },
  perOrg: { requests: 100, windowSeconds: 60 },
  perForm: { requests: 50, windowSeconds: 3600 },
};

export async function checkRateLimit(
  context: { ip: string; orgId?: string; formId?: string },
  config: RateLimitConfig = DEFAULT_LIMITS
): Promise<{ allowed: boolean; retryAfter?: number; limitType?: string }> {
  const checks = [
    { key: `rate:ip:${context.ip}`, limit: config.perIp, type: 'ip' },
  ];

  if (context.orgId) {
    checks.push({ key: `rate:org:${context.orgId}`, limit: config.perOrg, type: 'org' });
  }

  if (context.formId) {
    checks.push({ key: `rate:form:${context.formId}`, limit: config.perForm, type: 'form' });
  }

  for (const { key, limit, type } of checks) {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, limit.windowSeconds);
    }

    if (current > limit.requests) {
      const ttl = await redis.ttl(key);
      return { allowed: false, retryAfter: ttl, limitType: type };
    }
  }

  return { allowed: true };
}
```

### 5. Timeout Configuration

Centralized timeout management:

```typescript
// api/src/shared/libs/ai/timeout.ts

export const TIMEOUT_CONFIG = {
  generation: {
    fast: 10_000,      // 10 seconds
    enhanced: 15_000,  // 15 seconds
    premium: 20_000,   // 20 seconds
  },
  modification: 12_000,  // Modifications are typically faster
  analysis: 8_000,       // Metadata analysis
} as const;

export async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  operationName: string
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new TimeoutError(`${operationName} timed out after ${timeoutMs}ms`));
        });
      }),
    ]);

    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

### 6. CAPTCHA Integration (Public Endpoints)

For abuse prevention on public endpoints:

```typescript
// api/src/shared/libs/ai/captcha.ts

interface CaptchaConfig {
  provider: 'turnstile' | 'recaptcha';
  siteKey: string;
  secretKey: string;
  threshold: number;  // Score threshold for challenge
}

export async function verifyCaptcha(
  token: string,
  ip: string,
  config: CaptchaConfig
): Promise<{ valid: boolean; score?: number }> {
  if (config.provider === 'turnstile') {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: config.secretKey,
        response: token,
        remoteip: ip,
      }),
    });

    const result = await response.json();
    return { valid: result.success, score: result.score };
  }

  // Add other providers as needed
  throw new Error(`Unknown CAPTCHA provider: ${config.provider}`);
}

// Middleware for public AI endpoints
export function captchaMiddleware(config: CaptchaConfig) {
  return async (c: Context, next: Next) => {
    const token = c.req.header('X-Captcha-Token');

    // Skip CAPTCHA for authenticated users
    const jwt = c.get('jwt');
    if (jwt) {
      return next();
    }

    // Require CAPTCHA for public requests
    if (!token) {
      return c.json({ error: 'CAPTCHA_REQUIRED' }, 428);
    }

    const result = await verifyCaptcha(token, c.req.header('CF-Connecting-IP') ?? '', config);
    if (!result.valid) {
      return c.json({ error: 'CAPTCHA_FAILED' }, 403);
    }

    return next();
  };
}
```

---

## Database Migrations

```sql
-- Credit reservations table
CREATE TABLE credit_reservations (
  id TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved', 'finalized', 'released')),
  operation_type TEXT NOT NULL,  -- 'testimonial_assembly', 'question_suggestion', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finalized_at TIMESTAMPTZ,

  -- For audit/debugging
  request_id TEXT,
  metadata JSONB
);

CREATE INDEX idx_credit_reservations_org
ON credit_reservations (organization_id, status, created_at);

CREATE INDEX idx_credit_reservations_pending
ON credit_reservations (status, created_at)
WHERE status = 'reserved';

-- Add reserved credits column to organizations
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS credits_reserved INTEGER NOT NULL DEFAULT 0;

-- Cleanup stale reservations (run via cron, release after 5 minutes)
-- UPDATE credit_reservations
-- SET status = 'released'
-- WHERE status = 'reserved'
--   AND created_at < NOW() - INTERVAL '5 minutes';
```

---

## File Structure

```
api/src/shared/libs/ai/
├── index.ts                 # Main exports
├── credits.ts               # Credit reservation/finalization
├── circuitBreaker.ts        # Distributed circuit breaker
├── models.ts                # Model chains and fallback
├── rateLimit.ts             # Multi-level rate limiting
├── timeout.ts               # Timeout configuration
├── captcha.ts               # CAPTCHA verification
└── types.ts                 # Shared types
```

---

## Consequences

### Positive

| Benefit | Description |
|---------|-------------|
| **Consistency** | All AI features use same patterns |
| **Reliability** | Automatic failover between providers |
| **Security** | Unified rate limiting prevents abuse |
| **Observability** | Centralized logging and metrics |
| **Cost control** | No credit race conditions |

### Negative

| Trade-off | Mitigation |
|-----------|------------|
| Redis dependency | Can fall back to in-memory for single instance |
| Added complexity | Well-documented, reusable patterns |
| Latency overhead | Minimal (~5ms for rate limit check) |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Redis outage | Low | High | Graceful degradation to in-memory |
| All providers down | Very Low | High | Show user-friendly error, allow retry |
| Rate limit too aggressive | Medium | Medium | Configurable per-org overrides |

---

## Implementation Phases

### Phase 1: Credit Reservation (Required for PRD-005)
- [ ] Add `credits_reserved` column to organizations
- [ ] Create `credit_reservations` table
- [ ] Implement reserve/finalize/release functions
- [ ] Migrate `suggestQuestions` to use new pattern

### Phase 2: Circuit Breaker & Fallback
- [ ] Implement distributed circuit breaker
- [ ] Configure model fallback chains
- [ ] Add provider health monitoring

### Phase 3: Rate Limiting
- [ ] Implement multi-level rate limiting
- [ ] Add rate limit headers to responses
- [ ] Create admin override mechanism

### Phase 4: CAPTCHA Integration
- [ ] Set up Cloudflare Turnstile
- [ ] Add CAPTCHA middleware for public endpoints
- [ ] Implement progressive CAPTCHA (suspicious behavior only)

---

## References

- PRD-005: AI Testimonial Generation (depends on this ADR)
- Existing implementation: `/api/src/features/ai/suggestQuestions/`
- Cloudflare Turnstile: https://developers.cloudflare.com/turnstile/
