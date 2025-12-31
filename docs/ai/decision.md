# ADR: AI Provider Selection for Question Generation

**Status:** Accepted
**Date:** December 31, 2025
**Decision Makers:** Engineering Team

---

## Context

The Testimonials platform uses AI to generate smart prompts (questions) for testimonial collection forms. The system needs to:

1. Analyze product descriptions to infer context (industry, audience, value props)
2. Generate 5 tailored questions with placeholders and help text
3. Support three quality tiers: Fast, Enhanced, Premium
4. Operate cost-effectively at scale

We evaluated three AI providers:
- **OpenAI** (GPT-4o family)
- **Anthropic** (Claude family)
- **Google Gemini** (Gemini 2.x family)

---

## Decision

### Primary Provider: Google Gemini
### Default Quality: Enhanced (gemini-2.5-flash)

```env
AI_PROVIDER=google
```

---

## Rationale

### 1. Quality Analysis

We tested all providers with a complex enterprise product (DataForge Analytics - BI platform) and scored outputs on:
- Response elicitation capability
- Specificity prompting (getting quantifiable results)
- Help text coverage
- Quote-worthiness of expected responses
- Value proposition extraction depth

| Provider/Tier | Quality Score | Help Text Coverage |
|---------------|---------------|-------------------|
| **Gemini Enhanced** | **45/50** | 80% |
| Anthropic Enhanced | 42/50 | 80% |
| Anthropic Premium | 42/50 | 80% |
| Anthropic Fast | 39/50 | 80% |
| Gemini Premium | 38/50 | 60% |
| OpenAI Premium | 37/50 | 80% |
| OpenAI Enhanced | 36/50 | 60% |
| OpenAI Fast | 25/50 | 20% |
| Gemini Fast | 19/50 | 0% |

**Finding:** Gemini Enhanced achieves the highest quality score (45/50).

### 2. Cost Analysis

| Quality | Gemini | OpenAI | Anthropic | Gemini Savings |
|---------|--------|--------|-----------|----------------|
| Fast | $0.0001 | $0.0005 | $0.003 | 80-97% |
| Enhanced | $0.0003 | $0.008 | $0.012 | 96-97% |
| Premium | $0.003 | $0.008 | $0.012 | 62-75% |

**Finding:** Gemini is 62-97% cheaper than alternatives.

### 3. Value Ratio (Quality per Dollar)

| Rank | Provider/Tier | Value Ratio |
|------|---------------|-------------|
| 1 | Gemini Fast | 190,000 |
| 2 | **Gemini Enhanced** | **150,000** |
| 3 | OpenAI Fast | 50,000 |
| 4 | Anthropic Fast | 13,000 |
| 5 | Gemini Premium | 12,700 |
| 6 | OpenAI Enhanced | 4,500 |
| 7 | OpenAI Premium | 4,600 |
| 8 | Anthropic Enhanced/Premium | 3,500 |

**Finding:** Gemini Enhanced offers the best balance of quality and cost.

### 4. Projected Cost Impact

| Monthly Volume | OpenAI Enhanced | Gemini Enhanced | Savings |
|----------------|-----------------|-----------------|---------|
| 1,000 | $8.00 | $0.30 | $7.70 (96%) |
| 10,000 | $80.00 | $3.00 | $77.00 (96%) |
| 100,000 | $800.00 | $30.00 | $770.00 (96%) |

---

## Alternatives Considered

### OpenAI (gpt-4o)
- **Pros:** Most reliable/predictable, good documentation
- **Cons:** 27x more expensive than Gemini, lower quality scores
- **Verdict:** Not cost-effective for our use case

### Anthropic (Claude Sonnet 4)
- **Pros:** Best help text quality, professional tone
- **Cons:** 40x more expensive than Gemini, Claude 3.5 Sonnet deprecated
- **Verdict:** Reserved for enterprise customers who need premium quality

### Premium Tier Across All Providers
- **Finding:** Premium provides minimal quality improvement over Enhanced
- **Verdict:** Not recommended as default; offer as optional upsell

---

## Implementation

### Configuration

```typescript
// api/src/shared/libs/ai/providers.ts
const MODEL_CONFIG = {
  google: {
    fast: 'gemini-2.0-flash',
    balanced: 'gemini-2.5-flash',    // Default
    powerful: 'gemini-2.5-pro',
  },
  openai: {
    fast: 'gpt-4o-mini',
    balanced: 'gpt-4o',
    powerful: 'gpt-4o',
  },
  anthropic: {
    fast: 'claude-3-5-haiku-latest',
    balanced: 'claude-sonnet-4-20250514',
    powerful: 'claude-sonnet-4-20250514',
  },
};
```

### Environment Variable

```env
# Default provider
AI_PROVIDER=google

# All provider keys configured for flexibility
GOOGLE_API_KEY=xxx
OPENAI_API_KEY=xxx
ANTHROPIC_API_KEY=xxx
```

### Quality-to-Credits Mapping

| Quality | Credits | Model (Gemini) |
|---------|---------|----------------|
| fast | 1 | gemini-2.0-flash |
| enhanced | 5 | gemini-2.5-flash |
| premium | 12 | gemini-2.5-pro |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Gemini API outage | Low | High | Fallback to OpenAI configured |
| Model deprecation | Medium | Medium | Using stable model IDs, monitoring announcements |
| Quality regression | Low | Medium | Periodic quality audits with test prompts |
| Rate limiting | Low | Low | Request queuing, exponential backoff |

### Fallback Strategy

```typescript
// If primary provider fails, fall back in order:
// 1. Google Gemini (primary)
// 2. OpenAI (fallback)
// 3. Anthropic (last resort)
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Cost per request | < $0.001 | Monthly invoice / request count |
| Success rate | > 99% | Failed requests / total requests |
| Response latency | < 3s (p95) | API response time monitoring |
| Quality score | > 40/50 | Quarterly manual review |

---

## Review Schedule

- **Monthly:** Cost analysis from provider dashboards
- **Quarterly:** Quality audit with sample outputs
- **Annually:** Full provider comparison refresh

---

## References

- [Provider Comparison](./provider-comparison.md) - Detailed cross-provider analysis
- [Quality Comparison](./quality-comparison.md) - Tier-by-tier output comparison
- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs) - Provider abstraction layer

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-12-31 | Initial decision | Engineering |
