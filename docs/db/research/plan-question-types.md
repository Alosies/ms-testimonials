# Plan-Based Question Type Access Control

**Date:** January 1, 2026
**Status:** Proposed
**Author:** System Design
**Last Updated:** January 1, 2026 (aligned with Google Forms restructuring)

---

## Problem Statement

Currently, question type availability is controlled via:
1. `is_active` flag on `question_types` table (global on/off)
2. Frontend constant `MVP_QUESTION_TYPE_IDS` (hardcoded filtering)

This approach has issues:
- **Frontend gatekeeping**: Business logic in the wrong layer
- **No plan differentiation**: All users see the same question types
- **No scalability**: Adding premium question types requires code changes

### Current Question Types (16 total)

| unique_name | name | icon | category | Plan |
|-------------|------|------|----------|------|
| text_short | Short answer | minus | text | Free |
| text_long | Paragraph | bars-3-bottom-left | text | Free |
| text_email | Email | envelope | text | Pro |
| text_url | URL | link | text | Team |
| choice_single | Multiple choice | stop-circle | choice | Pro |
| choice_multiple | Checkboxes | check-circle | choice | Pro |
| choice_dropdown | Dropdown | chevron-up-down | choice | Team |
| rating_star | Star rating | star | rating | Free |
| rating_scale | Linear scale | ellipsis-horizontal | rating | Pro |
| media_file | File upload | cloud-arrow-up | media | Team |
| media_video | Video | video-camera | media | Team |
| input_date | Date | calendar | input | Team |
| input_time | Time | clock | input | Team |
| input_switch | Switch | arrow-path-rounded-square | input | Pro |
| input_checkbox | Checkbox | check-square | input | Free |
| special_hidden | Hidden field | eye-slash | special | Team |

### Plan Breakdown

| Plan | Types | Count |
|------|-------|-------|
| **Free** | text_short, text_long, rating_star, input_checkbox | 4 |
| **Pro** | Free + text_email, choice_single, choice_multiple, rating_scale, input_switch | 9 |
| **Team** | All types | 16 |

**Rationale:**
- **Free**: Core testimonial collection (text + star rating + consent checkbox)
- **Pro**: Add choices, email collection, switch toggles, linear scale
- **Team**: Full access including media uploads, date/time, dropdown, hidden fields

---

## Options Considered

### Option 1: Use `is_active` Flag Only

Set `is_active = false` for non-MVP types.

| Pros | Cons |
|------|------|
| No schema changes | Global toggle only |
| Immediate solution | No plan differentiation |
| Simple | Can't have "Pro-only" types |

**Verdict:** Too limited for a SaaS product with tiered plans.

### Option 2: Add `required_plan_tier` Column

Add a tier column to `question_types`:

```sql
ALTER TABLE question_types
ADD COLUMN required_plan_tier SMALLINT NOT NULL DEFAULT 0;
-- 0 = free, 1 = pro, 2 = team
```

| Pros | Cons |
|------|------|
| Simple schema change | Assumes linear hierarchy |
| Easy query filtering | Can't skip tiers (e.g., Free + Team but not Pro) |
| Single join | Less flexible |

**Verdict:** Works for simple hierarchies but inflexible.

### Option 3: Junction Table `plan_question_types` (Recommended)

Create a many-to-many relationship between plans and question types.

| Pros | Cons |
|------|------|
| Full flexibility | Extra table |
| Data-driven | Slightly more complex queries |
| Change without deploy | More seed data to manage |
| Supports any combination | |

**Verdict:** Best long-term solution for a SaaS product.

---

## Recommended Solution

### Schema Design

```sql
-- Plan-to-Question-Type mapping
-- Controls which question types are available per plan
CREATE TABLE public.plan_question_types (
    id                  TEXT NOT NULL DEFAULT generate_nanoid_12(),
    plan_id             TEXT NOT NULL,
    question_type_id    TEXT NOT NULL,

    -- Audit fields
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          TEXT NULL,
    updated_by          TEXT NULL,

    PRIMARY KEY (id),
    CONSTRAINT plan_question_types_plan_fk
        FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    CONSTRAINT plan_question_types_question_type_fk
        FOREIGN KEY (question_type_id) REFERENCES question_types(id) ON DELETE CASCADE,
    CONSTRAINT plan_question_types_created_by_fk
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT plan_question_types_updated_by_fk
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT plan_question_types_unique
        UNIQUE (plan_id, question_type_id)
);

-- Index for efficient lookups
CREATE INDEX idx_plan_question_types_plan_id
    ON plan_question_types(plan_id);

-- Auto-update updated_at trigger
CREATE TRIGGER plan_question_types_updated_at_trigger
    BEFORE UPDATE ON plan_question_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Column Definitions

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `id` | TEXT | NOT NULL | `generate_nanoid_12()` | Primary key |
| `plan_id` | TEXT | NOT NULL | - | FK to plans |
| `question_type_id` | TEXT | NOT NULL | - | FK to question_types |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | When mapping was created |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | When mapping was last modified |
| `created_by` | TEXT | NULL | - | User who created the mapping |
| `updated_by` | TEXT | NULL | - | User who last modified the mapping |

### Entity Relationship

```
┌─────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│   plans     │─────────│  plan_question_types │─────────│  question_types │
│             │ 1     N │                      │ N     1 │                 │
│ id          │         │ plan_id              │         │ id              │
│ unique_name │         │ question_type_id     │         │ unique_name     │
│ name        │         │                      │         │ name            │
└─────────────┘         └──────────────────────┘         └─────────────────┘
```

### Seed Data

Based on current plans (free, pro, team):

| Plan | Question Types | Count |
|------|----------------|-------|
| **free** | text_short, text_long, rating_star, input_checkbox | 4 |
| **pro** | All free + text_email, choice_single, choice_multiple, rating_scale, input_switch | 9 |
| **team** | All 16 types | 16 |

```sql
-- Seed data for plan_question_types
-- Audit user: alosies@gmail.com (id: 64CEjXjqSXST)

-- Free plan: Core testimonial collection (4 types)
INSERT INTO plan_question_types (plan_id, question_type_id, created_by, updated_by)
SELECT p.id, qt.id, '64CEjXjqSXST', '64CEjXjqSXST'
FROM plans p, question_types qt
WHERE p.unique_name = 'free'
  AND qt.unique_name IN ('text_short', 'text_long', 'rating_star', 'input_checkbox');

-- Pro plan: Free + choices, email, scale, switch (9 types)
INSERT INTO plan_question_types (plan_id, question_type_id, created_by, updated_by)
SELECT p.id, qt.id, '64CEjXjqSXST', '64CEjXjqSXST'
FROM plans p, question_types qt
WHERE p.unique_name = 'pro'
  AND qt.unique_name IN (
    -- Free types
    'text_short', 'text_long', 'rating_star', 'input_checkbox',
    -- Pro additions
    'text_email', 'choice_single', 'choice_multiple', 'rating_scale', 'input_switch'
  );

-- Team plan: All types (16 types)
INSERT INTO plan_question_types (plan_id, question_type_id, created_by, updated_by)
SELECT p.id, qt.id, '64CEjXjqSXST', '64CEjXjqSXST'
FROM plans p, question_types qt
WHERE p.unique_name = 'team'
  AND qt.is_active = true;
```

---

## Query Patterns

### Get Available Question Types for User's Plan

```graphql
query GetAvailableQuestionTypes($planId: String!) {
  plan_question_types(
    where: { plan_id: { _eq: $planId } }
    order_by: { question_type: { display_order: asc } }
  ) {
    question_type {
      id
      unique_name
      name
      category
      description
      input_component
      supports_options
      # ... other fields
    }
  }
}
```

### Alternative: Direct Query via Plan Relationship

```graphql
query GetQuestionTypesForPlan($planUniqueName: String!) {
  plans(where: { unique_name: { _eq: $planUniqueName } }) {
    question_types {
      question_type {
        id
        unique_name
        name
        # ...
      }
    }
  }
}
```

### Check if Question Type is Available

```graphql
query IsQuestionTypeAvailable($planId: String!, $questionTypeId: String!) {
  plan_question_types(
    where: {
      plan_id: { _eq: $planId }
      question_type_id: { _eq: $questionTypeId }
    }
  ) {
    id
  }
}
```

---

## Hasura Configuration

### Relationships

**On `plans` table:**
```yaml
- name: question_types
  using:
    foreign_key_constraint_on:
      column: plan_id
      table:
        name: plan_question_types
        schema: public
```

**On `question_types` table:**
```yaml
- name: available_in_plans
  using:
    foreign_key_constraint_on:
      column: question_type_id
      table:
        name: plan_question_types
        schema: public
```

### Permissions

| Role | Select | Insert | Update | Delete |
|------|--------|--------|--------|--------|
| admin | All | All | All | All |
| user | Where plan = user's org plan | None | None | None |
| anonymous | None | None | None | None |

**User permission filter:**
```json
{
  "plan_id": {
    "_in": "X-Hasura-Allowed-Plan-Ids"
  }
}
```

---

## Frontend Changes

### Remove Hardcoded Constants

**Before (frontend gatekeeping):**
```typescript
// apps/web/src/entities/questionType/composables/queries/useGetQuestionTypes.ts
export const MVP_QUESTION_TYPE_IDS = [
  'text_short', 'text_long', 'rating_star',
  'choice_single', 'choice_multiple', 'special_consent',
] as const;

// Filter in frontend
const { questionTypes } = useGetQuestionTypes({ mvpOnly: true });
```

**After (data-driven):**
```typescript
// Query based on user's plan
const { questionTypes } = useGetAvailableQuestionTypes(currentPlanId);
```

### New Composable

```typescript
// apps/web/src/entities/questionType/composables/queries/useGetAvailableQuestionTypes.ts
export function useGetAvailableQuestionTypes(planId: Ref<string | null>) {
  const { result, loading } = useGetAvailableQuestionTypesQuery(
    () => ({ planId: planId.value }),
    () => ({ enabled: !!planId.value })
  );

  const questionTypes = computed(() =>
    result.value?.plan_question_types.map(pqt => pqt.question_type) ?? []
  );

  return { questionTypes, loading };
}
```

---

## Migration Plan

### Step 1: Create Table
- Migration: `[timestamp]__plan_question_types__create_table`
- Creates table with constraints and indexes

### Step 2: Seed Data
- Migration: `[timestamp]__plan_question_types__seed_data`
- Populates mappings for existing plans

### Step 3: Hasura Metadata
- Track table in Hasura
- Add relationships
- Configure permissions

### Step 4: Frontend Update
- Create GraphQL query
- Create new composable
- Remove `MVP_QUESTION_TYPE_IDS` constant
- Update components to use new composable

### Step 5: Cleanup
- Remove `mvpOnly` option from `useGetQuestionTypes`
- Update documentation

---

## Future Considerations

### AI Question Generation
The AI prompt should be updated to only suggest question types available in the user's plan:

```typescript
// Fetch available types before AI generation
const availableTypes = await getAvailableQuestionTypes(organizationPlanId);
const allowedTypeIds = availableTypes.map(t => t.unique_name);

// Include in AI prompt
const prompt = `Available question types: ${allowedTypeIds.join(', ')}`;
```

### Upgrade Prompts
When a user tries to use a premium question type:

```typescript
if (!isQuestionTypeAvailable(typeId, currentPlanId)) {
  showUpgradeModal({
    feature: 'Image Upload questions',
    requiredPlan: 'pro',
  });
}
```

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-31 | Junction table over tier column | Flexibility for non-linear plan features |
| 2025-12-31 | Cascade deletes | If plan deleted, mappings should go too |
| 2025-12-31 | Keep `is_active` on question_types | Global disable still useful for deprecation |
| 2025-12-31 | Add audit fields (created_by, updated_by) | Track who modified plan features for accountability |
| 2025-12-31 | Nullable audit user FKs | Seed data has no user context; SET NULL on user delete |
| 2026-01-01 | Align with Google Forms field types | Industry standard, familiar UX for users |
| 2026-01-01 | Remove rating_nps, special_consent | Simplified to linear_scale and input_checkbox |
| 2026-01-01 | Add input_switch + input_checkbox | Two boolean types following Fillout pattern |
| 2026-01-01 | Add input_date + input_time | Common form fields from Google Forms |
| 2026-01-01 | Rename media_image → media_file | Generic file upload instead of image-only |
| 2026-01-01 | Add icon column | Heroicons for form builder UI |
| 2026-01-01 | Free plan: 4 types | Core testimonial: text, paragraph, star rating, checkbox |
| 2026-01-01 | Pro plan: 9 types | Add choices, email, scale, switch for professional use |
| 2026-01-01 | Team plan: 16 types | Full access for enterprise needs |

---

## References

- [plans schema](../tables/plans/schema.md)
- [question_types schema](../tables/question_types/schema.md)
- [design-decisions.md](./design-decisions.md)
