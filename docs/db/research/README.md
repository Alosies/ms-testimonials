# Database Schema Research

**Date:** December 29, 2025
**Status:** Research Complete (v3 - Proper Relational Design)

---

## Overview

This directory contains the database schema design for the Testimonials MVP. The schema follows a **scalable, provider-agnostic, properly normalized** approach.

## Document Index

| Document | Description |
|----------|-------------|
| [layer-1-authentication.md](./layer-1-authentication.md) | Users, user_identities, roles tables |
| [layer-2-multitenancy.md](./layer-2-multitenancy.md) | Plans, organizations, subscriptions |
| [layer-3-business.md](./layer-3-business.md) | Forms, testimonials, widgets |
| [erd.md](./erd.md) | Entity relationship diagram |
| [migrations.md](./migrations.md) | Migration order and dependencies |
| [computed-fields.md](./computed-fields.md) | Hasura computed fields for usage counts |
| [queries.md](./queries.md) | Common SQL and GraphQL examples |
| [permissions.md](./permissions.md) | Hasura permission configuration |
| [design-decisions.md](./design-decisions.md) | JSONB policy, patterns, benefits |
| [plan-question-types.md](./plan-question-types.md) | Plan-based question type access control |

---

## Design Principles

1. **Provider-Agnostic Auth** - Federated `user_identities` table, no vendor lock-in
2. **Multi-Tenant by Default** - Organizations as the tenant boundary
3. **Proper Relational Design** - No JSONB shortcuts for structured data
4. **Constraint-Driven Integrity** - Database enforces business rules, not just application
5. **Query-Optimized** - Indexed for actual access patterns
6. **Migration-Friendly** - Schema changes via migrations, not hidden in JSONB

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              AUTHENTICATION LAYER                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌─────────────┐         ┌──────────────────┐                                  │
│   │   USERS     │◄────────│ USER_IDENTITIES  │  ← Supabase, Google, GitHub      │
│   │             │ 1    N  │ (provider_metadata JSONB - appropriate)             │
│   └──────┬──────┘         └──────────────────┘                                  │
│          │                                                                      │
└──────────┼──────────────────────────────────────────────────────────────────────┘
           │
┌──────────┼──────────────────────────────────────────────────────────────────────┐
│          │                    MULTI-TENANCY LAYER                               │
├──────────┼──────────────────────────────────────────────────────────────────────┤
│          │                                                                      │
│          │    ┌───────────────┐       ┌─────────────┐                           │
│          └───►│ ORGANIZATIONS │──────►│   PLANS     │  ← Normalized plan config │
│               └───────┬───────┘       └─────────────┘                           │
│                       │                                                         │
│          ┌────────────┴────────────┐                                            │
│          ▼                         ▼                                            │
│   ┌─────────────────┐       ┌─────────────┐                                     │
│   │ ORG_ROLES       │       │    ROLES    │  ← Normalized roles                 │
│   └─────────────────┘       └─────────────┘                                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
           │
┌──────────┼──────────────────────────────────────────────────────────────────────┐
│          │                    BUSINESS ENTITIES                                 │
├──────────┼──────────────────────────────────────────────────────────────────────┤
│          ▼                                                                      │
│   ┌─────────────┐      ┌────────────────┐                                       │
│   │    FORMS    │─────►│ FORM_QUESTIONS │  ← Normalized questions               │
│   └──────┬──────┘ 1  N └───────┬────────┘                                       │
│          │                     │                                                │
│          │ 1                   │ 1                                              │
│          ▼ N                   ▼ N                                              │
│   ┌──────────────┐      ┌──────────────────────┐                                │
│   │ TESTIMONIALS │◄────►│ TESTIMONIAL_ANSWERS  │  ← Normalized answers          │
│   └──────┬───────┘      └──────────────────────┘                                │
│          │                                                                      │
│          │ N                                                                    │
│          ▼ M                                                                    │
│   ┌───────────────────┐      ┌─────────────┐                                    │
│   │ WIDGET_TESTIMONIALS│◄────│   WIDGETS   │  ← Proper junction table           │
│   └───────────────────┘  N 1 └─────────────┘                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Table Summary

### Layer 1: Authentication (3 tables)

| Table | Purpose | JSONB Fields |
|-------|---------|--------------|
| `users` | Application user identity | None |
| `user_identities` | Federated auth providers | `provider_metadata` (appropriate) |
| `roles` | Permission definitions | None |

### Layer 2: Multi-Tenancy (5 tables)

| Table | Purpose | JSONB Fields |
|-------|---------|--------------|
| `plans` | Plan templates (features/limits) | None |
| `plan_prices` | Multi-currency pricing | None |
| `organizations` | Tenant/workspace | `settings` (UI prefs only) |
| `organization_plans` | Subscription records with overrides | None |
| `organization_roles` | User ↔ Org ↔ Role junction | None |

### Layer 3: Business Entities (6 tables)

| Table | Purpose | JSONB Fields |
|-------|---------|--------------|
| `forms` | Collection forms | `settings` (UI prefs only) |
| `form_questions` | Questions per form | None |
| `testimonials` | Customer testimonials | `source_metadata` (import data) |
| `testimonial_answers` | Answers linked to questions | None |
| `widgets` | Embeddable displays | `settings` (UI prefs only) |
| `widget_testimonials` | Widget ↔ Testimonial junction | None |

**Total: 14 tables** (properly normalized)

---

## References

- `docs/mvp.md` - Product requirements
- `docs/testimonial-competitor-deepdive.md` - Competitor analysis
- `db/CLAUDE.md` - Database conventions
