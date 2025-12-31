# AI Provider Documentation

This folder contains research, analysis, and decision documentation for the AI-powered question generation feature.

## Documents

| Document | Description |
|----------|-------------|
| [decision.md](./decision.md) | **ADR: AI Provider Selection** - Final decision and rationale |
| [provider-comparison.md](./provider-comparison.md) | Cross-provider analysis (OpenAI, Anthropic, Gemini) |
| [quality-comparison.md](./quality-comparison.md) | Quality tier analysis with raw responses |

## Quick Reference

### Current Configuration

```env
AI_PROVIDER=google
```

### Default Quality: Enhanced (gemini-2.5-flash)

### Models by Provider

| Provider | Fast | Enhanced | Premium |
|----------|------|----------|---------|
| Google | gemini-2.0-flash | gemini-2.5-flash | gemini-2.5-pro |
| OpenAI | gpt-4o-mini | gpt-4o | gpt-4o |
| Anthropic | claude-3-5-haiku | claude-sonnet-4 | claude-sonnet-4 |

### Cost per Request (Estimated)

| Quality | Credits | Gemini | OpenAI | Anthropic |
|---------|---------|--------|--------|-----------|
| Fast | 1 | $0.0001 | $0.0005 | $0.003 |
| Enhanced | 5 | $0.0003 | $0.008 | $0.012 |
| Premium | 12 | $0.003 | $0.008 | $0.012 |
