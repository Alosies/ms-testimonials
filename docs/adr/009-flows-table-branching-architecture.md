# ADR-009: Flows Table for Branching Architecture

## Doc Connections
**ID**: `adr-009-flows-table-branching`

2026-01-06-1430 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-006-timeline-form-editor` - Timeline editor layout
- `db/tables/form_steps` - Form steps table documentation

---

## Status

**Accepted** - 2026-01-06

## Context

The testimonial collection flow requires conditional branching based on customer ratings:
- **Happy customers** (rating >= threshold) → Testimonial flow (detailed questions, consent, public thank you)
- **Unhappy customers** (rating < threshold) → Improvement flow (feedback questions, private thank you)

### Current Implementation

The `form_steps` table uses a `flow_membership` TEXT column:

```sql
form_steps:
  - flow_membership TEXT CHECK (flow_membership IN ('shared', 'testimonial', 'improvement'))
  - step_order SMALLINT
  - is_branch_point BOOLEAN
```

### Problems with Current Approach

| Issue | Description |
|-------|-------------|
| **Hardcoded branch conditions** | "rating >= 4" is in application code, not configurable |
| **Fixed number of flows** | Only 3 values allowed; can't add NPS (3-way) branching |
| **No flow metadata** | Can't name flows, add descriptions, or store flow-level settings |
| **Non-rating branches impossible** | Can't branch on "Did you use Feature X?" (Yes/No) |
| **Threshold not customizable** | Users can't change from "4" to "3" without code changes |

### Industry Analysis

How other form builders handle branching:

| Product | Approach | Flexibility |
|---------|----------|-------------|
| **Google Forms** | Sections with "Go to section" rules | Section-based, configurable |
| **Typeform** | Logic Jumps with conditions | Flexible, per-question |
| **SurveyMonkey** | Skip Logic rules | Condition-based |
| **Zapier/n8n** | Node + Edge graph | Maximum flexibility |

**Common pattern:** Steps/questions have their own ordering; branching logic is stored separately from step definitions.

### Future Requirements

| Requirement | Priority | Current Support |
|-------------|----------|-----------------|
| Single rating-based branch | MVP | Partial (hardcoded) |
| Customizable threshold | MVP+ | No |
| NPS branching (3 flows) | Premium | No |
| Non-rating branch points | Premium | No |
| Named/described flows | Nice-to-have | No |

## Decision

**Introduce a `flows` table** to externalize branching configuration while maintaining backward compatibility with the simple MVP model.

### New Schema

```sql
-- Flows table: defines branching paths for a form
CREATE TABLE public.flows (
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),
    form_id TEXT NOT NULL,

    -- Flow identification
    name TEXT NOT NULL,              -- "Testimonial Flow", "Improvement Flow"
    flow_type TEXT NOT NULL,         -- 'shared' | 'branch'

    -- Branching configuration
    branch_condition JSONB,          -- {"field": "rating", "op": ">=", "value": 4}

    -- Ordering
    display_order SMALLINT NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    UNIQUE (form_id, name)
);

-- Update form_steps to reference flows
ALTER TABLE form_steps ADD COLUMN flow_id TEXT REFERENCES flows(id);
```

### Data Model

```
forms (1) ──────< flows (3+) ──────< form_steps (N)
                    │
                    └── branch_condition: JSONB
```

### Example Data

```sql
-- flows table
┌──────────────┬─────────────┬───────────────────┬───────────┬────────────────────────────────────────────────────────────────────┐
│ id           │ form_id     │ name              │ flow_type │ branch_condition                                                   │
├──────────────┼─────────────┼───────────────────┼───────────┼────────────────────────────────────────────────────────────────────┤
│ flow_shared  │ form_abc123 │ Shared Steps      │ shared    │ NULL                                                               │
│ flow_testi   │ form_abc123 │ Happy Customers   │ branch    │ {"field": "rating", "op": "greater_than_or_equal_to", "value": 4}  │
│ flow_improv  │ form_abc123 │ Needs Improvement │ branch    │ {"field": "rating", "op": "less_than", "value": 4}                 │
└──────────────┴─────────────┴───────────────────┴───────────┴────────────────────────────────────────────────────────────────────┘

-- form_steps table (updated)
┌──────────────┬─────────────┬────────────┬────────────┬──────────────┐
│ id           │ form_id     │ step_type  │ step_order │ flow_id      │
├──────────────┼─────────────┼────────────┼────────────┼──────────────┤
│ step_001     │ form_abc123 │ welcome    │ 0          │ flow_shared  │
│ step_002     │ form_abc123 │ question   │ 1          │ flow_shared  │
│ step_003     │ form_abc123 │ rating     │ 2          │ flow_shared  │
│ step_004     │ form_abc123 │ question   │ 0          │ flow_testi   │
│ step_005     │ form_abc123 │ consent    │ 1          │ flow_testi   │
│ step_006     │ form_abc123 │ thank_you  │ 2          │ flow_testi   │
│ step_007     │ form_abc123 │ question   │ 0          │ flow_improv  │
│ step_008     │ form_abc123 │ thank_you  │ 1          │ flow_improv  │
└──────────────┴─────────────┴────────────┴────────────┴──────────────┘
```

### Branch Condition Schema

```typescript
interface BranchCondition {
  field: string;           // "rating", "nps", "used_feature_x"
  op: ConditionOperator;   // "greater_than_or_equal_to", "less_than", "equals", "between"
  value: number | boolean | [number, number];  // 4, true, [7, 8]
}

/**
 * Verbose operator names for clarity and self-documentation.
 * Follows Notion/Typeform conventions for form builders.
 */
type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'greater_than_or_equal_to'
  | 'less_than'
  | 'less_than_or_equal_to'
  | 'between'
  | 'is_one_of'    // matches any value in array (future: NPS segments)
  | 'contains'     // future: text matching
  | 'is_empty'     // future: optional field checks
  ;
```

**Examples:**

```json
// Rating >= 4 (testimonial)
{"field": "rating", "op": "greater_than_or_equal_to", "value": 4}

// Rating < 4 (improvement)
{"field": "rating", "op": "less_than", "value": 4}

// NPS Promoters (9-10)
{"field": "nps", "op": "greater_than_or_equal_to", "value": 9}

// NPS Passives (7-8)
{"field": "nps", "op": "between", "value": [7, 8]}

// NPS Detractors (0-6)
{"field": "nps", "op": "less_than_or_equal_to", "value": 6}

// Boolean branch
{"field": "used_feature_x", "op": "equals", "value": true}

// Multi-value match (future)
{"field": "nps", "op": "is_one_of", "value": [9, 10]}
```

### MVP Behavior

For MVP, auto-create 3 flows per form with fixed configuration:

```typescript
async function createFormFlows(formId: string): Promise<void> {
  await db.flows.createMany({
    data: [
      {
        form_id: formId,
        name: 'Shared Steps',
        flow_type: 'shared',
        display_order: 0,
        branch_condition: null
      },
      {
        form_id: formId,
        name: 'Testimonial Flow',
        flow_type: 'branch',
        display_order: 1,
        branch_condition: { field: 'rating', op: 'greater_than_or_equal_to', value: 4 }
      },
      {
        form_id: formId,
        name: 'Improvement Flow',
        flow_type: 'branch',
        display_order: 2,
        branch_condition: { field: 'rating', op: 'less_than', value: 4 }
      },
    ]
  });
}
```

**UI still shows fixed "Testimonial/Improvement"** — just reads from flows table instead of hardcoded values.

### Premium Features (Future)

With flows table in place, premium features require only:

1. **Custom threshold**: Update `branch_condition.value` (no schema change)
2. **NPS branching**: Add third flow row with appropriate condition
3. **Non-rating branches**: Change `branch_condition.field` to question reference
4. **Named flows**: Already supported via `name` column

### Query Patterns

**Get all steps with flow info (Form Builder):**

```sql
SELECT
  s.id, s.step_type, s.step_order, s.content,
  f.id as flow_id, f.name as flow_name, f.flow_type, f.branch_condition
FROM form_steps s
JOIN flows f ON s.flow_id = f.id
WHERE s.form_id = $1
ORDER BY f.display_order, s.step_order;
```

**Runtime flow evaluation (Public Form):**

```typescript
// 1. Get shared steps
const sharedFlow = await getFlowByType(formId, 'shared');
const sharedSteps = await getStepsByFlow(sharedFlow.id);

// 2. Show shared steps, collect rating at branch point
const ratingValue = submission.rating;

// 3. Evaluate branch conditions
const branchFlows = await getBranchFlows(formId);
const matchingFlow = branchFlows.find(flow =>
  evaluateCondition(flow.branch_condition, submission)
);

// 4. Show matching branch steps
const branchSteps = await getStepsByFlow(matchingFlow.id);
```

### Deletion Handling

When deleting the branch point (rating step):

```typescript
async function handleBranchPointDeletion(stepId: string): Promise<void> {
  const step = await getStep(stepId);

  // Find steps in branch flows
  const branchFlows = await db.flows.findMany({
    where: { form_id: step.form_id, flow_type: 'branch' }
  });

  const branchedSteps = await db.form_steps.findMany({
    where: { flow_id: { in: branchFlows.map(f => f.id) } }
  });

  if (branchedSteps.length > 0) {
    // Show confirmation dialog
    const userChoice = await showBranchDeleteDialog({
      flows: branchFlows,
      stepCounts: countStepsPerFlow(branchedSteps)
    });

    switch (userChoice) {
      case 'keep-testimonial':
        await convertFlowToShared('testimonial');
        await deleteFlow('improvement');
        break;
      case 'keep-improvement':
        await convertFlowToShared('improvement');
        await deleteFlow('testimonial');
        break;
      case 'delete-all':
        await deleteAllBranchFlows();
        break;
      case 'cancel':
        return;
    }
  }

  await deleteStep(stepId);
}
```

### Migration Strategy

**Phase 1: Add flows table (non-breaking)**
```sql
CREATE TABLE flows (...);
ALTER TABLE form_steps ADD COLUMN flow_id TEXT;
```

**Phase 2: Backfill existing data**
```sql
-- Create flows for existing forms
INSERT INTO flows (id, form_id, name, flow_type, branch_condition, display_order)
SELECT
  generate_nanoid_12(),
  f.id,
  'Shared Steps',
  'shared',
  NULL,
  0
FROM forms f;

-- Repeat for testimonial and improvement flows...

-- Update form_steps with flow_id
UPDATE form_steps fs
SET flow_id = fl.id
FROM flows fl
WHERE fs.form_id = fl.form_id
  AND fl.name = CASE fs.flow_membership
    WHEN 'shared' THEN 'Shared Steps'
    WHEN 'testimonial' THEN 'Testimonial Flow'
    WHEN 'improvement' THEN 'Improvement Flow'
  END;
```

**Phase 3: Make flow_id required**
```sql
ALTER TABLE form_steps ALTER COLUMN flow_id SET NOT NULL;
ALTER TABLE form_steps ADD CONSTRAINT fk_form_steps_flow_id
  FOREIGN KEY (flow_id) REFERENCES flows(id) ON DELETE CASCADE;
```

**Phase 4: Remove flow_membership (optional)**
```sql
-- Keep for backward compatibility or drop
ALTER TABLE form_steps DROP COLUMN flow_membership;
```

## Alternatives Considered

### Alternative 1: Keep flow_membership, Add Constraint Column

```sql
ALTER TABLE form_steps ADD COLUMN branch_threshold SMALLINT DEFAULT 4;
```

**Rejected because:**
- Still limited to 3 flows
- Threshold stored on steps, not at form/flow level
- Doesn't scale to non-rating branches

### Alternative 2: Full Graph Model (Nodes + Edges)

```sql
CREATE TABLE step_edges (
  from_step_id TEXT,
  to_step_id TEXT,
  condition JSONB
);
```

**Rejected because:**
- Over-engineering for current requirements
- Requires recursive CTEs for ordered retrieval
- Complex UI (visual graph editor)
- Significant implementation effort

### Alternative 3: Parent ID Based Ordering

```sql
ALTER TABLE form_steps ADD COLUMN parent_step_id TEXT REFERENCES form_steps(id);
```

**Rejected because:**
- Doesn't solve the "number of flows" limitation
- Complicates queries (recursive CTEs)
- Reordering logic becomes complex
- Still needs flow identification for branching

## Consequences

### Positive

1. **Future-proof** — No migration needed for premium branching features
2. **Data-driven** — Branch conditions stored in DB, not hardcoded
3. **Configurable** — Threshold changes are data updates, not code changes
4. **Extensible** — NPS (3-way), boolean branches supported by adding rows
5. **Metadata support** — Flow names, descriptions, icons possible
6. **Simple queries** — Standard JOINs, no recursive CTEs
7. **GraphQL friendly** — Native Hasura relationship support

### Negative

1. **Extra table** — One more entity to manage
2. **Extra JOIN** — Queries need to join flows table
3. **Migration effort** — Existing data needs backfill
4. **Constraint management** — Must ensure flow_id integrity

### Neutral

1. **MVP unchanged** — Same UX, data just structured differently
2. **Learning curve** — Developers need to understand flows concept

## Implementation Checklist

### Database

- [ ] Create `flows` table migration
- [ ] Add `flow_id` column to `form_steps`
- [ ] Create backfill migration for existing data
- [ ] Update unique constraint: `(form_id, flow_id, step_order)`
- [ ] Add foreign key constraint after backfill
- [ ] Configure Hasura relationships and permissions

### Backend

- [ ] Update form creation to auto-create 3 flows
- [ ] Update step creation to reference flow_id
- [ ] Add flow evaluation logic for runtime
- [ ] Update step deletion to handle branch point

### Frontend

- [ ] Update GraphQL queries to include flow data
- [ ] Update form editor to use flow_id instead of flow_membership
- [ ] Add branch point deletion confirmation dialog
- [ ] (Future) Add threshold customization UI

## References

- Google Forms Section Logic: https://support.google.com/docs/answer/7322334
- Typeform Logic Jumps: https://www.typeform.com/help/a/add-logic-to-your-typeforms-360052749251/
- SurveyMonkey Skip Logic: https://help.surveymonkey.com/en/create/skip-logic/
- ADR-006: Timeline Form Editor Layout
