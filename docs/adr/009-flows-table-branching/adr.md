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

Form experiences often need **conditional branching** - showing different steps based on user responses. Examples:

| Use Case | Branch Point | Possible Flows |
|----------|--------------|----------------|
| Testimonial collection | Star rating | "Happy Path", "Feedback Path" |
| NPS survey | NPS score (0-10) | "Promoters", "Passives", "Detractors" |
| Product feedback | Feature usage | "Power Users", "New Users", "Non-Users" |
| Event registration | Ticket type | "VIP Experience", "General Admission" |
| Customer support | Issue type | "Billing", "Technical", "General" |

The architecture must support:
- **N-way branching** - any number of conditional paths, not just 2
- **Custom flow names** - user-defined, not hardcoded
- **Any question type** as branch point - ratings, choices, yes/no, etc.
- **Configurable conditions** - operators and thresholds set by users

### Current Implementation (Legacy)

The `form_steps` table uses a hardcoded `flow_membership` column:

```sql
form_steps:
  - flow_membership TEXT CHECK (flow_membership IN ('shared', 'testimonial', 'improvement'))
```

### Problems with Hardcoded Approach

| Issue | Description |
|-------|-------------|
| **Fixed flow names** | Only 'shared', 'testimonial', 'improvement' - no custom names |
| **Fixed flow count** | Exactly 3 flows - can't add more branches |
| **Hardcoded conditions** | Branching logic in application code |
| **Single question type** | Only works with star ratings |
| **No flow metadata** | Can't store descriptions, icons, or settings per flow |

### Industry Analysis

| Product | Approach | Flexibility |
|---------|----------|-------------|
| **Google Forms** | Sections with "Go to section" rules | Section-based, configurable |
| **Typeform** | Logic Jumps with conditions | Flexible, per-question |
| **SurveyMonkey** | Skip Logic rules | Condition-based |
| **Zapier/n8n** | Node + Edge graph | Maximum flexibility |

**Common pattern:** Branching logic stored separately from step definitions, fully configurable.

## Decision

**Introduce a `flows` table** for fully configurable N-way branching with custom names and conditions.

### New Schema

```sql
-- Flows table: defines branching paths for a form
CREATE TABLE public.flows (
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),
    form_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,   -- Denormalized for RLS

    -- Flow identification
    name TEXT NOT NULL,              -- User-defined: "Promoters", "Detractors", etc.
    flow_type TEXT NOT NULL,         -- 'shared' | 'branch'

    -- Branching condition (flattened columns for integrity + queryability)
    branch_question_id TEXT,         -- FK to form_questions (NULL for shared flow)
    branch_field TEXT,               -- Response column: 'answer_integer', 'answer_text', etc.
    branch_operator TEXT,            -- Comparison: 'greater_than_or_equal_to', 'equals', etc.
    branch_value JSONB,              -- Structured value (see BranchValue schema below)

    -- Ordering
    display_order SMALLINT NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    UNIQUE (form_id, name),

    -- Flow type constraint
    CONSTRAINT chk_flows_flow_type
        CHECK (flow_type IN ('shared', 'branch')),

    -- FK for referential integrity - prevents orphaned conditions
    CONSTRAINT fk_flows_branch_question
        FOREIGN KEY (branch_question_id) REFERENCES form_questions(id)
        ON DELETE RESTRICT,

    -- Branch field must be valid response column
    CONSTRAINT chk_flows_branch_field
        CHECK (branch_field IS NULL OR branch_field IN (
            'answer_integer',   -- Star rating (1-5), NPS (0-10), scale values
            'answer_text',      -- Single choice option value, short/long text
            'answer_boolean',   -- Consent checkbox, yes/no questions
            'answer_json'       -- Multiple choice selected values array
        )),

    -- Branch operator must be valid comparison
    CONSTRAINT chk_flows_branch_operator
        CHECK (branch_operator IS NULL OR branch_operator IN (
            'equals',
            'not_equals',
            'greater_than',
            'greater_than_or_equal_to',
            'less_than',
            'less_than_or_equal_to',
            'between',
            'is_one_of',
            'contains',
            'is_empty'
        )),

    -- Shared flows must have no condition, branch flows must have complete condition
    CONSTRAINT chk_flows_condition_completeness CHECK (
        (flow_type = 'shared' AND branch_question_id IS NULL AND branch_field IS NULL AND branch_operator IS NULL AND branch_value IS NULL)
        OR
        (flow_type = 'branch' AND branch_question_id IS NOT NULL AND branch_field IS NOT NULL AND branch_operator IS NOT NULL)
        -- Note: branch_value can be NULL for 'is_empty' operator
    )
);

-- Indexes
CREATE INDEX idx_flows_form_id ON flows(form_id);
CREATE INDEX idx_flows_organization_id ON flows(organization_id);
CREATE INDEX idx_flows_branch_question_id ON flows(branch_question_id);

-- Updated_at trigger
SELECT add_updated_at_trigger('flows', 'public');

-- Update form_steps to reference flows
ALTER TABLE form_steps ADD COLUMN flow_id TEXT NOT NULL REFERENCES flows(id) ON DELETE CASCADE;
```

### Data Model

```
forms (1) ──────< flows (N) ──────< form_steps (N)
                    │
                    └── branch_question_id ──> form_questions (FK)
```

### BranchValue Schema

The `branch_value` column uses structured JSONB with explicit type discrimination:

```typescript
/**
 * Structured value format for branch_value JSONB column.
 * The `type` field enables type-safe parsing and validation.
 * All fields are required - no optional/default values in storage.
 */
type BranchValue =
  | { type: 'number'; value: number }           // For: equals, greater_than, less_than
  | { type: 'string'; value: string }           // For: equals with text
  | { type: 'boolean'; value: boolean }         // For: equals with yes/no
  | {
      type: 'range';
      min: number;
      max: number;
      minInclusive: boolean;  // Always explicit: true = includes min value
      maxInclusive: boolean;  // Always explicit: true = includes max value
    }                                           // For: between operator
  | { type: 'list'; values: (number | string)[] } // For: is_one_of operator
  | null                                         // For: is_empty operator
  ;
```

**Examples by operator:**

| Operator | branch_value JSONB | Matches |
|----------|-------------------|---------|
| `equals` (number) | `{"type": "number", "value": 5}` | 5 |
| `equals` (string) | `{"type": "string", "value": "billing"}` | "billing" |
| `equals` (boolean) | `{"type": "boolean", "value": true}` | true |
| `greater_than` | `{"type": "number", "value": 4}` | 5, 6, 7... |
| `less_than_or_equal_to` | `{"type": "number", "value": 6}` | ...4, 5, 6 |
| `between` (both inclusive) | `{"type": "range", "min": 7, "max": 8, "minInclusive": true, "maxInclusive": true}` | 7, 8 |
| `between` (max exclusive) | `{"type": "range", "min": 7, "max": 10, "minInclusive": true, "maxInclusive": false}` | 7, 8, 9 |
| `between` (both exclusive) | `{"type": "range", "min": 0, "max": 7, "minInclusive": false, "maxInclusive": false}` | 1, 2, 3, 4, 5, 6 |
| `is_one_of` (numbers) | `{"type": "list", "values": [1, 2, 3]}` | 1, 2, or 3 |
| `is_one_of` (strings) | `{"type": "list", "values": ["billing", "technical"]}` | "billing" or "technical" |
| `is_empty` | `null` | null, undefined, "" |

**Parsing example:**

```typescript
function parseBranchValue(jsonb: BranchValue): string {
  if (jsonb === null) return 'is empty';

  switch (jsonb.type) {
    case 'number':
      return `= ${jsonb.value}`;
    case 'string':
      return `= "${jsonb.value}"`;
    case 'boolean':
      return jsonb.value ? 'is true' : 'is false';
    case 'range': {
      const minOp = jsonb.minInclusive ? '>=' : '>';
      const maxOp = jsonb.maxInclusive ? '<=' : '<';
      return `${minOp} ${jsonb.min} AND ${maxOp} ${jsonb.max}`;
    }
    case 'list':
      return `in [${jsonb.values.join(', ')}]`;
    default:
      throw new Error(`Unknown branch_value type: ${(jsonb as any).type}`);
  }
}

// Example output:
// { type: 'range', min: 7, max: 8, minInclusive: true, maxInclusive: true }
// => ">= 7 AND <= 8"
```

### Why Flattened Columns (Not Full JSONB)?

| Aspect | Full JSONB | Flattened Columns |
|--------|------------|-------------------|
| **Referential integrity** | No FK possible inside JSONB | FK on `branch_question_id` |
| **Field/operator validation** | Application-only | CHECK constraints enforce |
| **Sync issues** | `question_id` in two places | Single source of truth |
| **Queryability** | Expression indexes needed | Standard column indexes |
| **Value polymorphism** | ✓ Handles any type | ✓ JSONB only for `branch_value` |

**Benefits:**
1. **No sync issue** - `question_id` only exists as FK column
2. **Database validates** - CHECK constraints on `field` and `operator`
3. **FK prevents orphans** - Can't delete referenced question
4. **Easy to query** - Find all flows using a specific operator, field, etc.

**Usage pattern:**
```typescript
// Create a branch flow with structured BranchValue (GraphQL mutation)
const { mutate: insertFlow } = useInsertFlowMutation();
await insertFlow({
  object: {
    form_id: formId,
    organization_id: orgId,
    name: 'Promoters',
    flow_type: 'branch',
    branch_question_id: npsQuestionId,
    branch_field: 'answer_integer',
    branch_operator: 'greater_than_or_equal_to',
    branch_value: { type: 'number', value: 9 },  // Structured JSONB
  }
});

// Read flow data (GraphQL query)
const { flow } = useGetFlowQuery({ flowId });
// Flow includes: branch_question_id, branch_field, branch_operator, branch_value
```

### Example Data

The flows table supports any branching configuration. Examples use structured `branch_value` JSONB:

#### Example A: NPS Survey (3-way branching)

```sql
-- Promoters (9-10), Passives (7-8), Detractors (0-6)
INSERT INTO flows (id, form_id, name, flow_type, branch_question_id, branch_field, branch_operator, branch_value) VALUES
  ('flow_intro', 'form_nps', 'Introduction', 'shared', NULL, NULL, NULL, NULL),
  ('flow_promo', 'form_nps', 'Promoters', 'branch', 'q_nps_score', 'answer_integer', 'greater_than_or_equal_to', '{"type": "number", "value": 9}'),
  ('flow_pass', 'form_nps', 'Passives', 'branch', 'q_nps_score', 'answer_integer', 'between', '{"type": "range", "min": 7, "max": 8, "minInclusive": true, "maxInclusive": true}'),
  ('flow_detr', 'form_nps', 'Detractors', 'branch', 'q_nps_score', 'answer_integer', 'less_than_or_equal_to', '{"type": "number", "value": 6}');
```

#### Example B: Product Feedback (choice-based branching)

```sql
-- Branch on issue type selection
INSERT INTO flows (id, form_id, name, flow_type, branch_question_id, branch_field, branch_operator, branch_value) VALUES
  ('flow_common', 'form_prod', 'Common Steps', 'shared', NULL, NULL, NULL, NULL),
  ('flow_billing', 'form_prod', 'Billing Issues', 'branch', 'q_issue_type', 'answer_text', 'equals', '{"type": "string", "value": "billing"}'),
  ('flow_tech', 'form_prod', 'Technical Help', 'branch', 'q_issue_type', 'answer_text', 'equals', '{"type": "string", "value": "technical"}'),
  ('flow_other', 'form_prod', 'General Query', 'branch', 'q_issue_type', 'answer_text', 'equals', '{"type": "string", "value": "other"}');
```

#### Example C: Simple 2-way (testimonial use case)

```sql
-- Happy customers (>= 4 stars) vs needs improvement (< 4 stars)
INSERT INTO flows (id, form_id, name, flow_type, branch_question_id, branch_field, branch_operator, branch_value) VALUES
  ('flow_shared', 'form_testi', 'Welcome', 'shared', NULL, NULL, NULL, NULL),
  ('flow_happy', 'form_testi', 'Share Story', 'branch', 'q_rating', 'answer_integer', 'greater_than_or_equal_to', '{"type": "number", "value": 4}'),
  ('flow_improve', 'form_testi', 'Help Us Improve', 'branch', 'q_rating', 'answer_integer', 'less_than', '{"type": "number", "value": 4}');
```

**Key points:**
- Flow names are user-defined, not hardcoded
- Any number of branch flows per form
- Any question type can be a branch point
- Conditions stored in explicit columns with CHECK constraints

### Branch Condition Schema

#### Mental Model: "Branch on Question's Answer"

The core principle is simple: **branch conditions evaluate a question's answer, not a step container**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           THE MENTAL MODEL                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   "When the answer to [QUESTION] is [CONDITION], show [FLOW]"               │
│                                                                              │
│   Example:                                                                   │
│   "When the answer to 'Rate us 1-5' is >= 4, show Testimonial Flow"         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Why `question_id` (Not `step_id`)

A step is a **container**; a question is the **content**. Conditions should reference content.

| Approach | Problem |
|----------|---------|
| `step_id` reference | Step's question can be replaced → condition silently evaluates wrong data |
| `question_id` reference | Direct link to the actual question → clear validation, no indirection |

**The step-question indirection problem:**

```
OLD (step_id): condition → step → step.question_id → question → response
                                        ↑
                                  Can change!

NEW (question_id): condition → question → response
                                   ↑
                              Direct link, validated
```

#### Data Flow and Relationships

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────────────┐
│   form_steps    │     │  form_questions │     │ form_question_responses  │
├─────────────────┤     ├─────────────────┤     ├──────────────────────────┤
│ id              │     │ id ◄────────────┼─────│ question_id              │
│ form_id         │     │ form_id         │     │ submission_id            │
│ step_type       │     │ question_type   │     │                          │
│ step_order      │     │ question_text   │     │ answer_integer           │ ← Rating, NPS
│ question_id ────┼────►│                 │     │ answer_text              │ ← Choice value
│ flow_id         │     │                 │     │ answer_boolean           │ ← Yes/No
│                 │     │                 │     │ answer_json              │ ← Multi-choice
└─────────────────┘     └─────────────────┘     └──────────────────────────┘
                               ▲
                               │ FK
┌──────────────────────────────┴──────────────────────────────────────────────┐
│                         flows (flattened columns)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ branch_question_id  TEXT    ← FK to form_questions (with ON DELETE RESTRICT)│
│ branch_field        TEXT    ← 'answer_integer', 'answer_text', etc.         │
│ branch_operator     TEXT    ← 'greater_than_or_equal_to', 'equals', etc.    │
│ branch_value        JSONB   ← Structured: {"type":"number","value":4}       │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Branch Condition Columns

The condition is stored as **four separate columns** (not JSONB) for better integrity:

```typescript
/**
 * Branch condition stored as flattened columns on the flows table.
 *
 * KEY DESIGN: Separate columns enable FK constraints, CHECK constraints,
 * and standard indexes - unlike a JSONB blob.
 */
interface FlowBranchColumns {
  question_id: string;       // form_questions.id - the question whose answer we evaluate
  field: ResponseField;      // Column name in form_question_responses table
  op: ConditionOperator;     // How to compare
  value: ConditionValue;     // What to compare against
}

/**
 * Response field maps directly to form_question_responses columns.
 * This explicit mapping prevents ambiguity.
 */
type ResponseField =
  | 'answer_integer'   // For: star rating (1-5), NPS (0-10), scale values
  | 'answer_text'      // For: single choice option value, short/long text
  | 'answer_boolean'   // For: consent checkbox, yes/no questions
  | 'answer_json'      // For: multiple choice selected values array
  ;

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
  | 'is_one_of'
  | 'contains'
  | 'is_empty'
  ;

// ConditionValue uses the structured BranchValue JSONB format
// See "BranchValue Schema" section above for complete type definition
```

#### Field Mapping by Question Type

| Question Type | Response Column | Example Value | Operators |
|---------------|-----------------|---------------|-----------|
| `star_rating` | `answer_integer` | 1, 2, 3, 4, 5 | `>=`, `<`, `equals`, `between` |
| `nps` | `answer_integer` | 0-10 | `>=`, `<`, `between`, `is_one_of` |
| `scale` | `answer_integer` | 1-10 | `>=`, `<`, `between` |
| `single_choice` | `answer_text` | `"option_a"` | `equals`, `is_one_of` |
| `dropdown` | `answer_text` | `"premium"` | `equals`, `is_one_of` |
| `yes_no` | `answer_boolean` | `true`/`false` | `equals` |
| `consent` | `answer_boolean` | `true`/`false` | `equals` |
| `multiple_choice` | `answer_json` | `["a","c"]` | `contains`, `is_one_of` |
| `short_text` | `answer_text` | `"feedback"` | `contains`, `is_empty` |

#### Complete Examples

**Example 1: Star Rating Branching (MVP)**

```json
// Testimonial Flow: Rating >= 4
{
  "branch_question_id": "q_rate_abc123",
  "branch_field": "answer_integer",
  "branch_operator": "greater_than_or_equal_to",
  "branch_value": { "type": "number", "value": 4 }
}

// Improvement Flow: Rating < 4
{
  "branch_question_id": "q_rate_abc123",
  "branch_field": "answer_integer",
  "branch_operator": "less_than",
  "branch_value": { "type": "number", "value": 4 }
}
```

**Example 2: NPS 3-Way Branching**

```json
// Promoters Flow: NPS 9-10
{
  "branch_question_id": "q_nps_xyz789",
  "branch_field": "answer_integer",
  "branch_operator": "greater_than_or_equal_to",
  "branch_value": { "type": "number", "value": 9 }
}

// Passives Flow: NPS 7-8
{
  "branch_question_id": "q_nps_xyz789",
  "branch_field": "answer_integer",
  "branch_operator": "between",
  "branch_value": { "type": "range", "min": 7, "max": 8, "minInclusive": true, "maxInclusive": true }
}

// Detractors Flow: NPS 0-6
{
  "branch_question_id": "q_nps_xyz789",
  "branch_field": "answer_integer",
  "branch_operator": "less_than_or_equal_to",
  "branch_value": { "type": "number", "value": 6 }
}
```

**Example 3: Single Choice Branching**

```json
// Premium Users Flow
{
  "branch_question_id": "q_plan_type",
  "branch_field": "answer_text",
  "branch_operator": "is_one_of",
  "branch_value": { "type": "list", "values": ["pro", "enterprise"] }
}

// Free Users Flow
{
  "branch_question_id": "q_plan_type",
  "branch_field": "answer_text",
  "branch_operator": "equals",
  "branch_value": { "type": "string", "value": "free" }
}
```

**Example 4: Yes/No Branching**

```json
// Used Feature Flow
{
  "branch_question_id": "q_used_feature_x",
  "branch_field": "answer_boolean",
  "branch_operator": "equals",
  "branch_value": { "type": "boolean", "value": true }
}

// Didn't Use Feature Flow
{
  "branch_question_id": "q_used_feature_x",
  "branch_field": "answer_boolean",
  "branch_operator": "equals",
  "branch_value": { "type": "boolean", "value": false }
}
```

#### Runtime Evaluation

```typescript
/**
 * Evaluate a branch condition against a submission's responses.
 * Uses the structured BranchValue format for type-safe comparison.
 */
function evaluateBranchCondition(
  flow: Flow,  // Contains branch_question_id, branch_field, branch_operator, branch_value
  responses: FormQuestionResponse[]  // All responses for this submission
): boolean {
  // Skip shared flows (no condition)
  if (flow.flow_type === 'shared') return true;

  // 1. Find the response for the referenced question (direct lookup via FK)
  const response = responses.find(r => r.question_id === flow.branch_question_id);
  if (!response) return false;

  // 2. Extract the field value (field name = column name)
  const actualValue = response[flow.branch_field];
  if (actualValue === undefined || actualValue === null) {
    return flow.branch_operator === 'is_empty';
  }

  // 3. Evaluate using structured BranchValue
  return evaluateWithBranchValue(
    flow.branch_operator,
    actualValue,
    flow.branch_value  // Structured JSONB: { type: 'number', value: 4 }
  );
}

/**
 * Evaluate operator with structured BranchValue.
 * Type-safe comparison using the discriminated union.
 */
function evaluateWithBranchValue(
  operator: string,
  actual: number | boolean | string | any[],
  branchValue: BranchValue
): boolean {
  switch (operator) {
    case 'equals':
      if (branchValue?.type === 'number') return actual === branchValue.value;
      if (branchValue?.type === 'string') return actual === branchValue.value;
      if (branchValue?.type === 'boolean') return actual === branchValue.value;
      return false;

    case 'not_equals':
      if (branchValue?.type === 'number') return actual !== branchValue.value;
      if (branchValue?.type === 'string') return actual !== branchValue.value;
      if (branchValue?.type === 'boolean') return actual !== branchValue.value;
      return false;

    case 'greater_than':
      return branchValue?.type === 'number' && (actual as number) > branchValue.value;

    case 'greater_than_or_equal_to':
      return branchValue?.type === 'number' && (actual as number) >= branchValue.value;

    case 'less_than':
      return branchValue?.type === 'number' && (actual as number) < branchValue.value;

    case 'less_than_or_equal_to':
      return branchValue?.type === 'number' && (actual as number) <= branchValue.value;

    case 'between':
      if (branchValue?.type === 'range') {
        const val = actual as number;
        // All fields are explicit - no defaults needed
        const meetsMin = branchValue.minInclusive ? val >= branchValue.min : val > branchValue.min;
        const meetsMax = branchValue.maxInclusive ? val <= branchValue.max : val < branchValue.max;
        return meetsMin && meetsMax;
      }
      return false;

    case 'is_one_of':
      if (branchValue?.type === 'list') {
        return branchValue.values.includes(actual as number | string);
      }
      return false;

    case 'contains':
      return branchValue?.type === 'string' && String(actual).includes(branchValue.value);

    case 'is_empty':
      return actual === null || actual === undefined || actual === '';

    default:
      return false;
  }
}
```

### Data Integrity and Edge Cases

#### Edge Case 1: Question Deleted

**Scenario:** User deletes a question that is referenced by a branch condition.

**Protection:** The `branch_question_id` FK with `ON DELETE RESTRICT` blocks deletion at the database level.

```sql
-- Attempting to delete a referenced question:
DELETE FROM form_questions WHERE id = 'q_rating_abc123';
-- ERROR: update or delete on table "form_questions" violates foreign key constraint
-- "fk_flows_branch_question" on table "flows"
```

**Detection (for UI pre-check):**
```sql
-- Find flows that reference a question (using indexed FK column)
SELECT f.id, f.name, f.branch_field, f.branch_operator, f.branch_value
FROM flows f
WHERE f.branch_question_id = 'q_rating_abc123';
```

**Handling:**
```typescript
async function deleteQuestion(questionId: string): Promise<DeleteResult> {
  // 1. Check if question is used in any branch condition (GraphQL query)
  const { flows: affectedFlows } = await useGetFlowsByBranchQuestionQuery({
    branchQuestionId: questionId
  });

  if (affectedFlows.length > 0) {
    // 2. Show user-friendly error before DB rejects
    throw new BranchingConflictError({
      type: 'QUESTION_DELETION_BLOCKED',
      message: 'This question is used for branching',
      affectedFlows: affectedFlows.map(f => ({
        flowId: f.id,
        flowName: f.name,
        formName: f.form.name
      })),
      options: [
        { action: 'REMOVE_BRANCHING', label: 'Remove branching and delete question' },
        { action: 'CANCEL', label: 'Keep question' }
      ]
    });
  }

  // 3. Safe to delete - no FK reference exists
  const { mutate: deleteFormQuestion } = useDeleteFormQuestionMutation();
  return deleteFormQuestion({ questionId });
}
```

**UI Prompt:**
```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️  Question Used for Branching                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ The question "How would you rate us?" is used to determine      │
│ which flow customers see:                                        │
│                                                                  │
│   • Rating ≥ 4 → Testimonial Flow (3 steps)                     │
│   • Rating < 4 → Improvement Flow (2 steps)                     │
│                                                                  │
│ Deleting this question will:                                     │
│   ✗ Remove all branching from this form                         │
│   ✓ Keep all steps (moved to a single flow)                     │
│                                                                  │
│ ┌────────────────────┐  ┌────────────────────┐                  │
│ │  Delete & Remove   │  │      Cancel        │                  │
│ │     Branching      │  │                    │                  │
│ └────────────────────┘  └────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Edge Case 2: Question Replaced in Step

**Scenario:** User changes the question linked to a step (e.g., swaps a 5-star rating for NPS).

**Detection:**
```typescript
async function updateStepQuestion(
  stepId: string,
  newQuestionId: string,
  step: FormStep  // From GraphQL query with question relation
): Promise<void> {
  const oldQuestionId = step.question_id;

  // Check if old question is used in branch conditions (GraphQL query using FK column)
  const { flows: affectedFlows } = await useGetFlowsByBranchQuestionQuery({
    branchQuestionId: oldQuestionId
  });

  if (affectedFlows.length > 0) {
    // Question is branch point - require user decision
    throw new BranchingConflictError({
      type: 'QUESTION_REPLACEMENT_CONFLICT',
      message: 'This question is used for branching',
      options: [
        { action: 'UPDATE_CONDITIONS', label: 'Update branching to use new question' },
        { action: 'REMOVE_BRANCHING', label: 'Remove branching' },
        { action: 'CANCEL', label: 'Keep current question' }
      ]
    });
  }
}
```

**UI Flow:**
```
User changes question in rating step
         │
         ▼
┌─────────────────────────┐
│ Is old question used    │
│ in branch_condition?    │
└───────────┬─────────────┘
            │
      ┌─────┴─────┐
      │           │
     YES          NO
      │           │
      ▼           ▼
┌───────────┐  ┌──────────────┐
│ Show      │  │ Allow change │
│ warning   │  │ silently     │
│ dialog    │  └──────────────┘
└─────┬─────┘
      │
      ▼
┌─────────────────────────────────────────┐
│ Options:                                 │
│ 1. Update conditions to new question    │
│ 2. Remove branching                      │
│ 3. Cancel                                │
└─────────────────────────────────────────┘
```

#### Edge Case 3: Question Type Mismatch

**Scenario:** User tries to update a condition to reference a question with incompatible type.

**Validation:**
```typescript
const VALID_FIELD_BY_QUESTION_TYPE: Record<string, ResponseField[]> = {
  'star_rating': ['answer_integer'],
  'nps': ['answer_integer'],
  'scale': ['answer_integer'],
  'single_choice': ['answer_text'],
  'dropdown': ['answer_text'],
  'yes_no': ['answer_boolean'],
  'consent': ['answer_boolean'],
  'multiple_choice': ['answer_json'],
  'short_text': ['answer_text'],
  'long_text': ['answer_text'],
};

function validateBranchCondition(
  condition: BranchCondition,
  question: FormQuestion
): ValidationResult {
  const validFields = VALID_FIELD_BY_QUESTION_TYPE[question.question_type];

  if (!validFields?.includes(condition.field)) {
    return {
      valid: false,
      error: `Field '${condition.field}' is not valid for question type '${question.question_type}'`
    };
  }

  return { valid: true };
}
```

#### Edge Case 4: Step Deleted (Cascades to Question)

**Scenario:** User deletes a step. The step's question is deleted too (CASCADE). If the question is used for branching, deletion is blocked.

**Design:** Steps and questions have a 1:1 relationship. Orphan questions are not allowed. Since the FK points FROM step TO question, we use a trigger to cascade step deletion to its question.

```sql
-- FK direction: step references question
-- ON DELETE RESTRICT prevents deleting a question that has a step
ALTER TABLE form_steps
ADD CONSTRAINT fk_form_steps_question_id
FOREIGN KEY (question_id) REFERENCES form_questions(id)
ON DELETE RESTRICT;

-- Trigger: When step is deleted, delete its question too
-- This ensures no orphan questions exist
CREATE OR REPLACE FUNCTION delete_step_question()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the question (will be blocked if used in branching via flows.branch_question_id RESTRICT)
  DELETE FROM form_questions WHERE id = OLD.question_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_form_steps_delete_question
AFTER DELETE ON form_steps
FOR EACH ROW
EXECUTE FUNCTION delete_step_question();

-- The flows.branch_question_id FK with ON DELETE RESTRICT
-- will block the question deletion if it's a branch point
```

**Handling:**

```typescript
async function deleteStep(
  step: FormStep,
  branchFlows: Flow[]  // Flows using this step's question as branch point
): Promise<void> {
  // Check if step's question is used for branching
  if (branchFlows.length > 0) {
    // Get all steps in downstream branch flows
    const downstreamSteps = await getStepsByFlowIds(branchFlows.map(f => f.id));

    // Must resolve branching before deletion - show dialog
    const userChoice = await showBranchPointDeleteDialog({
      step,
      branchFlows,
      downstreamSteps,
      options: [
        {
          action: 'KEEP_FIRST_BRANCH',
          label: `Keep "${branchFlows[0].name}" steps, delete others`,
          description: `Converts ${branchFlows[0].name} to shared flow. Deletes ${branchFlows.slice(1).map(f => f.name).join(', ')} and their ${countSteps(branchFlows.slice(1))} steps.`
        },
        {
          action: 'KEEP_SECOND_BRANCH',
          label: `Keep "${branchFlows[1].name}" steps, delete others`,
          description: `Converts ${branchFlows[1].name} to shared flow. Deletes ${branchFlows[0].name} and its ${countSteps([branchFlows[0]])} steps.`
        },
        {
          action: 'DELETE_ALL_BRANCHES',
          label: 'Delete all branch flows and their steps',
          description: `Removes branching entirely. Deletes ${downstreamSteps.length} steps across all branches.`
        },
        {
          action: 'CANCEL',
          label: 'Cancel'
        }
      ]
    });

    const { mutate: updateFlow } = useUpdateFlowMutation();
    const { mutate: deleteFlow } = useDeleteFlowMutation();

    switch (userChoice) {
      case 'KEEP_FIRST_BRANCH':
        // Convert first branch to shared, delete others (steps CASCADE)
        await updateFlow({
          flowId: branchFlows[0].id,
          _set: { flow_type: 'shared', branch_question_id: null, branch_field: null, branch_operator: null, branch_value: null }
        });
        for (const flow of branchFlows.slice(1)) {
          await deleteFlow({ flowId: flow.id });  // Steps CASCADE delete
        }
        break;

      case 'KEEP_SECOND_BRANCH':
        await updateFlow({
          flowId: branchFlows[1].id,
          _set: { flow_type: 'shared', branch_question_id: null, branch_field: null, branch_operator: null, branch_value: null }
        });
        await deleteFlow({ flowId: branchFlows[0].id });
        break;

      case 'DELETE_ALL_BRANCHES':
        for (const flow of branchFlows) {
          await deleteFlow({ flowId: flow.id });  // Steps CASCADE delete
        }
        break;

      case 'CANCEL':
        return;
    }
  }

  // Now safe to delete step (question will CASCADE delete)
  const { mutate: deleteFormStep } = useDeleteFormStepMutation();
  await deleteFormStep({ stepId: step.id });
}
```

**UI Dialog:**
```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️  This step controls branching                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ The question "How would you rate us?" determines which path     │
│ customers see. Deleting it will affect these branches:          │
│                                                                  │
│   • Share Your Story (3 steps)                                  │
│   • Help Us Improve (2 steps)                                   │
│                                                                  │
│ What would you like to do?                                       │
│                                                                  │
│ ○ Keep "Share Your Story" steps, delete "Help Us Improve"       │
│ ○ Keep "Help Us Improve" steps, delete "Share Your Story"       │
│ ○ Delete all branch steps (5 steps total)                       │
│                                                                  │
│ ┌────────────────────┐  ┌────────────────────┐                  │
│ │      Confirm       │  │      Cancel        │                  │
│ └────────────────────┘  └────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

**Key points:**
- Step → Question is 1:1 with CASCADE delete (no orphans)
- Branch point question deletion blocked by FK RESTRICT
- User must explicitly choose what happens to downstream steps
- Flow deletion CASCADE deletes its steps

#### Edge Case 5: Multiple Steps Reference Same Question

**Scenario:** Two steps in different flows reference the same question (shouldn't happen, but validate).

**Prevention:**
```sql
-- Unique constraint: A question can only be in one step
ALTER TABLE form_steps
ADD CONSTRAINT unique_question_per_form
UNIQUE (form_id, question_id);
```

#### Edge Case 6: Orphaned Conditions (Not Possible)

**Scenario:** With the flattened column approach, orphaned conditions **cannot exist**.

**Why:**
- `branch_question_id` has FK constraint with `ON DELETE RESTRICT`
- Database blocks deletion of any question referenced by a flow
- No JSONB means no hidden references that can become stale

**Verification Query:**
```sql
-- This should always return 0 rows (confirms FK is working)
SELECT f.id, f.name, f.branch_question_id
FROM flows f
WHERE f.branch_question_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM form_questions q
    WHERE q.id = f.branch_question_id
  );
```

### Summary: Why Flattened Columns

| Concern | JSONB Approach | Flattened Columns |
|---------|----------------|-------------------|
| **Reference stability** | `question_id` in JSONB can become stale | FK enforced by database |
| **Validation** | Application must validate JSONB structure | CHECK constraints on each column |
| **Sync issues** | `question_id` in two places needs sync | Single source of truth |
| **Deletion handling** | Application must check JSONB | FK `ON DELETE RESTRICT` blocks |
| **Type safety** | Runtime validation only | Database enforces valid values |
| **Queryability** | Expression indexes needed | Standard column indexes |

### Form Templates (Feature)

> **Note:** This section defines template structures for future implementation. A separate ADR will cover:
> - Template selection UI/UX
> - Form creation wizard
> - AI generation integration with template context
> - Step pre-population based on `branchQuestionType`
>
> The types and examples below serve as reference for that future work.

Pre-built templates for feedback collection. Templates are organized by capability level, with testimonial collection as a premium add-on to positive feedback paths.

#### Template Types

```typescript
interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string;                      // For UI display
  hasTestimonialCollection: boolean;

  // Branch question config (for templates with branching)
  branchQuestionType?: BranchQuestionType;  // Question type that triggers branching
  branchQuestionText?: string;              // Default question text

  flows: FlowDefinition[];
}

type TemplateCategory =
  | 'simple'                // No branching
  | 'branched'              // Branching without testimonials
  | 'branched-testimonial'  // Branching + testimonial on positive path
  | 'nps-testimonial'       // NPS + testimonial from promoters
  ;

type BranchQuestionType =
  | 'star_rating'      // 1-5 stars (answer_integer)
  | 'nps'              // 0-10 NPS score (answer_integer)
  | 'yes_no'           // Boolean (answer_boolean)
  | 'single_choice'    // Radio/dropdown (answer_text)
  ;

interface FlowDefinition {
  name: string;
  flowType: 'shared' | 'branch';
  collectsTestimonial?: boolean;   // Flag for testimonial collection steps
  branchField?: 'answer_integer' | 'answer_text' | 'answer_boolean' | 'answer_json';
  branchOperator?: BranchOperator;
  branchValue?: BranchValue;
}
```

#### Template Categories (Marketing View)

| Category | What It Does | Best For |
|----------|--------------|----------|
| **Simple Feedback** | Collect feedback, no branching | Quick surveys, feature requests, bug reports |
| **Branched Feedback** | Different paths based on response | CSAT, exit surveys, onboarding check-ins |
| **Branched + Testimonial** | Branching + collect testimonials from happy customers | Product reviews, customer stories |
| **NPS + Testimonial** | NPS survey + testimonials from promoters | Net Promoter Score with social proof |

#### 1. Simple Feedback

No branching - single flow for all respondents.

```typescript
const SIMPLE_FEEDBACK: FormTemplate = {
  id: 'simple-feedback',
  name: 'Simple Feedback',
  description: 'Quick feedback collection without branching',
  category: 'simple',
  icon: 'message-square',
  hasTestimonialCollection: false,
  flows: [
    { name: 'Feedback', flowType: 'shared' }
  ]
};
```

**Use cases:** Feature requests, bug reports, quick pulse checks, suggestions box

#### 2. Branched Feedback

Route respondents to different paths based on their response. No testimonial collection.

```typescript
const BRANCHED_FEEDBACK: FormTemplate = {
  id: 'branched-feedback',
  name: 'Branched Feedback',
  description: 'Different follow-up questions based on satisfaction',
  category: 'branched',
  icon: 'git-branch',
  hasTestimonialCollection: false,

  // Branching based on star rating
  branchQuestionType: 'star_rating',
  branchQuestionText: 'How would you rate your experience?',

  flows: [
    { name: 'Rate Experience', flowType: 'shared' },
    {
      name: 'Positive Feedback',
      flowType: 'branch',
      branchField: 'answer_integer',
      branchOperator: 'greater_than_or_equal_to',
      branchValue: { type: 'number', value: 4 }
    },
    {
      name: 'Improvement Areas',
      flowType: 'branch',
      branchField: 'answer_integer',
      branchOperator: 'less_than',
      branchValue: { type: 'number', value: 4 }
    }
  ]
};
```

**Use cases:** CSAT surveys, exit surveys, onboarding feedback, support follow-ups

#### 3. Branched Feedback + Testimonial

Branching with testimonial collection on the positive path. Happy customers are guided through testimonial prompts.

```typescript
const BRANCHED_TESTIMONIAL: FormTemplate = {
  id: 'branched-testimonial',
  name: 'Branched Feedback + Testimonial',
  description: 'Collect testimonials from happy customers, feedback from others',
  category: 'branched-testimonial',
  icon: 'star',
  hasTestimonialCollection: true,

  // Branching based on star rating (1-5)
  branchQuestionType: 'star_rating',
  branchQuestionText: 'How would you rate your experience with us?',

  flows: [
    { name: 'Welcome', flowType: 'shared' },
    {
      name: 'Share Your Story',
      flowType: 'branch',
      collectsTestimonial: true,  // ⭐ Testimonial collection enabled
      branchField: 'answer_integer',
      branchOperator: 'greater_than_or_equal_to',
      branchValue: { type: 'number', value: 4 }
    },
    {
      name: 'Help Us Improve',
      flowType: 'branch',
      collectsTestimonial: false,
      branchField: 'answer_integer',
      branchOperator: 'less_than',
      branchValue: { type: 'number', value: 4 }
    }
  ]
};
```

**Use cases:** Product reviews, customer stories, case study collection, social proof

#### 4. NPS + Testimonial

Industry-standard NPS survey with testimonial collection from promoters (9-10 scores).

```typescript
const NPS_TESTIMONIAL: FormTemplate = {
  id: 'nps-testimonial',
  name: 'NPS + Testimonial',
  description: 'Net Promoter Score with testimonials from promoters',
  category: 'nps-testimonial',
  icon: 'trending-up',
  hasTestimonialCollection: true,

  // Branching based on NPS score (0-10)
  branchQuestionType: 'nps',
  branchQuestionText: 'How likely are you to recommend us to a friend or colleague?',

  flows: [
    { name: 'NPS Question', flowType: 'shared' },
    {
      name: 'Promoters',
      flowType: 'branch',
      collectsTestimonial: true,  // ⭐ Testimonial collection enabled
      branchField: 'answer_integer',
      branchOperator: 'greater_than_or_equal_to',
      branchValue: { type: 'number', value: 9 }
    },
    {
      name: 'Passives',
      flowType: 'branch',
      collectsTestimonial: false,
      branchField: 'answer_integer',
      branchOperator: 'between',
      branchValue: { type: 'range', min: 7, max: 8, minInclusive: true, maxInclusive: true }
    },
    {
      name: 'Detractors',
      flowType: 'branch',
      collectsTestimonial: false,
      branchField: 'answer_integer',
      branchOperator: 'less_than_or_equal_to',
      branchValue: { type: 'number', value: 6 }
    }
  ]
};
```

**Use cases:** NPS benchmarking, promoter testimonials, customer advocacy programs

#### Template Registry

```typescript
const FORM_TEMPLATES: FormTemplate[] = [
  SIMPLE_FEEDBACK,
  BRANCHED_FEEDBACK,
  BRANCHED_TESTIMONIAL,  // ⭐ Default for new users
  NPS_TESTIMONIAL,
];

// UI grouping for template selection
const TEMPLATE_CATEGORIES = {
  'simple': {
    label: 'Simple Feedback',
    description: 'Quick collection, no branching',
    badge: null
  },
  'branched': {
    label: 'Branched Feedback',
    description: 'Smart routing based on responses',
    badge: null
  },
  'branched-testimonial': {
    label: 'Branched + Testimonial',
    description: 'Collect testimonials from happy customers',
    badge: 'Popular'
  },
  'nps-testimonial': {
    label: 'NPS + Testimonial',
    description: 'Industry-standard NPS with social proof',
    badge: 'Pro'
  }
};
```

#### Template Selection UI

```
┌─────────────────────────────────────────────────────────────────┐
│ Choose a template                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌─────────────────────┐  ┌─────────────────────┐                │
│ │ 📝 Simple Feedback  │  │ 🔀 Branched Feedback│                │
│ │                     │  │                     │                │
│ │ Quick collection,   │  │ Smart routing based │                │
│ │ no branching        │  │ on responses        │                │
│ └─────────────────────┘  └─────────────────────┘                │
│                                                                  │
│ ┌─────────────────────┐  ┌─────────────────────┐                │
│ │ ⭐ Branched +       │  │ 📈 NPS + Testimonial│                │
│ │    Testimonial      │  │              [Pro]  │                │
│ │         [Popular]   │  │                     │                │
│ │ Collect testimonials│  │ NPS with social     │                │
│ │ from happy customers│  │ proof from promoters│                │
│ └─────────────────────┘  └─────────────────────┘                │
│                                                                  │
│ ┌─────────────────────┐                                         │
│ │ ➕ Start from       │                                         │
│ │    Scratch          │                                         │
│ └─────────────────────┘                                         │
└─────────────────────────────────────────────────────────────────┘
```

**Users can:**
- Select a template that matches their use case
- See which templates include testimonial collection
- Customize any template after selection
- Start from scratch for custom flows

#### Template Tracking

Forms track which template they were created from via a simple column (no separate table):

```sql
-- Add template_id to forms table
ALTER TABLE forms ADD COLUMN template_id TEXT;

-- Optional: CHECK constraint for valid template IDs
ALTER TABLE forms ADD CONSTRAINT chk_forms_template_id
CHECK (template_id IS NULL OR template_id IN (
  'simple-feedback',
  'branched-feedback',
  'branched-testimonial',
  'nps-testimonial'
));

COMMENT ON COLUMN forms.template_id IS
  'Template used to create this form. NULL = created from scratch. Templates defined in code.';
```

**Usage:**
- `NULL` = Form created from scratch
- `'branched-testimonial'` = Created from Branched + Testimonial template
- Template definitions remain in code (TypeScript constants)
- Column enables analytics: "How many forms use each template?"

```typescript
// When creating a form from template
const { mutate: insertForm } = useInsertFormMutation();
await insertForm({
  object: {
    name: 'My Feedback Form',
    template_id: 'branched-testimonial',  // Track which template was used
    // ... other fields
  }
});
```

### Flow Management API

```typescript
// Create custom flow with flattened condition columns (GraphQL mutation)
const { mutate: insertFlow } = useInsertFlowMutation();

await insertFlow({
  object: {
    form_id: formId,
    organization_id: organizationId,
    name: 'Promoters',
    flow_type: 'branch',
    display_order: nextDisplayOrder,
    branch_question_id: npsQuestionId,
    branch_field: 'answer_integer',
    branch_operator: 'greater_than_or_equal_to',
    branch_value: { type: 'number', value: 9 },  // Structured JSONB
  }
});

// Update flow name or condition (GraphQL mutation)
const { mutate: updateFlow } = useUpdateFlowMutation();

await updateFlow({
  flowId: flowId,
  _set: {
    name: 'Updated Name',
    branch_operator: 'greater_than',
    branch_value: { type: 'number', value: 8 },
  }
});

// Delete flow - steps cascade via ON DELETE CASCADE (GraphQL mutation)
const { mutate: deleteFlow } = useDeleteFlowMutation();

await deleteFlow({ flowId });
```

### Capabilities Summary

The flows table enables full branching flexibility without schema changes:

| Capability | How It Works |
|------------|--------------|
| **Custom flow names** | `flows.name` is user-defined text |
| **N-way branching** | Add any number of `flow_type='branch'` rows |
| **Any question as branch point** | Set `branch_question_id` to any question |
| **Any question type** | Use appropriate `branch_field` column |
| **Custom thresholds** | Set `branch_value` using structured format (e.g., `{type: 'number', value: 4}`) |
| **Multiple operators** | Set `branch_operator` - CHECK constraint validates |
| **Reorder flows** | Update `display_order` |
| **Add/remove flows** | INSERT/DELETE rows |

### Flow Convergence (Outro Support)

The architecture supports **flow convergence** - branches merging back to common steps - using `display_order` positioning. No additional schema changes required.

#### How It Works

```
Form
├── Shared Flow (display_order=0)  ← Before branches (intro)
├── Branch Flow (display_order=1)  ← Conditional branch 1
├── Branch Flow (display_order=2)  ← Conditional branch 2
└── Shared Flow (display_order=3)  ← After branches (outro)
```

**Semantics:**
- `flow_type: 'shared'` = Always shown (unconditional)
- `flow_type: 'branch'` = Shown conditionally (only ONE branch executes)
- `display_order` determines position relative to branches

**Runtime logic:**
1. Show `shared` flows where `display_order < min(branch display_order)` → **intro**
2. Evaluate branch conditions → show the ONE matching branch
3. Show `shared` flows where `display_order > max(branch display_order)` → **outro**

#### Runtime Implementation

```typescript
function getFlowSequence(flows: Flow[]) {
  const shared = flows.filter(f => f.flow_type === 'shared');
  const branches = flows.filter(f => f.flow_type === 'branch');

  if (branches.length === 0) {
    return { intro: shared, branches: [], outro: [] };
  }

  const minBranchOrder = Math.min(...branches.map(f => f.display_order));
  const maxBranchOrder = Math.max(...branches.map(f => f.display_order));

  return {
    intro: shared.filter(f => f.display_order < minBranchOrder),
    branches: branches,
    outro: shared.filter(f => f.display_order > maxBranchOrder),
  };
}
```

#### Examples

| Use Case | Flow Structure |
|----------|----------------|
| **2-way rating** | Shared(0) → Happy(1) OR Unhappy(2) → Shared(3) |
| **3-way NPS** | Shared(0) → Promoters(1) OR Passives(2) OR Detractors(3) → Shared(4) |
| **5-way custom** | Shared(0) → 5 branches(1-5) → Shared(6) |

#### Advantages

| Aspect | Benefit |
|--------|---------|
| No schema change | Existing `flow_type` constraint unchanged |
| No data migration | All existing flows work as-is |
| N-way branching | Supports 2, 3, or any number of branches |
| Multiple intro/outro | Could have multiple shared sections before/after |
| Position-based | `display_order` already exists and is indexed |

For detailed analysis and alternatives considered, see [Flow Convergence Research](./flow-convergence-research.md).

### Query Patterns

**Get all steps with flow info (Form Builder):**

```sql
SELECT
  s.id, s.step_type, s.step_order, s.content,
  f.id as flow_id, f.name as flow_name, f.flow_type,
  f.branch_question_id, f.branch_field, f.branch_operator, f.branch_value
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

// 2. Show shared steps, collect response at branch point
const submission = await collectResponses(sharedSteps);

// 3. Evaluate branch conditions using structured BranchValue
const branchFlows = await getBranchFlows(formId);
const matchingFlow = await branchFlows.find(async flow =>
  await evaluateBranchCondition(flow, submission.id)
  // Uses flow.branch_question_id, branch_field, branch_operator, branch_value
  // branch_value is structured: { type: 'number', value: 4 }
);

// 4. Show matching branch steps
const branchSteps = await getStepsByFlow(matchingFlow.id);
```

### Deletion Handling

When deleting the branch point (rating step):

```typescript
async function handleBranchPointDeletion(
  step: FormStep,
  branchFlows: Flow[],       // From GraphQL query: flows where flow_type = 'branch'
  branchedSteps: FormStep[]  // From GraphQL query: steps in branch flows
): Promise<void> {
  if (branchedSteps.length > 0) {
    // Show confirmation dialog
    const userChoice = await showBranchDeleteDialog({
      flows: branchFlows,
      stepCounts: countStepsPerFlow(branchedSteps)
    });

    const { mutate: updateFlow } = useUpdateFlowMutation();
    const { mutate: deleteFlow } = useDeleteFlowMutation();

    switch (userChoice) {
      case 'keep-first-branch':
        await updateFlow({ flowId: branchFlows[0].id, _set: { flow_type: 'shared' } });
        await deleteFlow({ flowId: branchFlows[1].id });
        break;
      case 'keep-second-branch':
        await updateFlow({ flowId: branchFlows[1].id, _set: { flow_type: 'shared' } });
        await deleteFlow({ flowId: branchFlows[0].id });
        break;
      case 'delete-all':
        for (const flow of branchFlows) {
          await deleteFlow({ flowId: flow.id });
        }
        break;
      case 'cancel':
        return;
    }
  }

  const { mutate: deleteFormStep } = useDeleteFormStepMutation();
  await deleteFormStep({ stepId: step.id });
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

## Related Documents

- [Flow Convergence Research](./flow-convergence-research.md) - Analysis of converging diverged paths, industry research, and architecture options
- [Implementation Plan](./implementation-plan.md)
- [Phase 2 Implementation](./phase-2-implementation.md)
- [Testing Plan](./testing-plan.md)
