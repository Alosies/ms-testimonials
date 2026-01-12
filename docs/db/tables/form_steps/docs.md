# Form Steps Table Documentation

## Doc Connections
**ID**: `table-form_steps`

2026-01-12-1055 IST

**Parent ReadMes**:
- `db-layer-3-business` - Layer 3 business tables

**Related ReadMes**:
- `table-flows` - Steps belong to flows
- `table-form_questions` - Steps own questions (1:1 relationship)
- `table-organizations` - Org-scoped for multi-tenancy

---

## Overview

Stores step configuration for the timeline editor. Each step represents a screen in the testimonial collection flow (welcome, question, rating, consent, contact_info, reward, thank_you). Steps belong to flows and own questions (1:1 relationship).

## Migration History

| Migration | Summary |
|-----------|----------|
| `1767425106405__form_steps__create_table` | Create table with step_type, content JSONB |
| `1767504570210__form_steps__add_flow_membership` | Add flow_membership column |
| `1767694235607__form_steps__add_flow_id` | Add flow_id FK |
| `1767698771766__form_steps__finalize_flow_id` | Make flow_id NOT NULL |
| `1768018796784__form_steps__add_question_cascade_trigger` | Add cascade trigger (later removed) |
| `1768192140913__form_steps__drop_question_id_column` | Drop question_id (ADR-013: invert relationship) |
| `1768192143898__form_steps__drop_form_id_column` | Drop form_id (ADR-013: derive via flow) |
| `1768192149496__form_steps__drop_cascade_trigger` | Drop trigger (ADR-013: FK handles cascade) |

## Relationships

### Object Relationships (Many-to-One)
- `flow` -> flows via flow_id (parent - CASCADE delete)
- `organization` -> organizations via organization_id
- `creator` -> users via created_by
- `updater` -> users via updated_by

### Array Relationships (One-to-Many)
- `questions` <- form_questions via step_id (1:1, CASCADE delete)

## Documentation Files
- [Schema Reference](schema.md) - Table structure and relationships
- [GraphQL Examples](graphql.md) - Basic CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
