# Form Data Model & Cascade Behaviors

## Overview

This document maps the database entity hierarchy, foreign key relationships, and delete cascade behaviors for the form-related tables.

**Schema Definition:** See `docs/adr/013-form-entities-schema-refactoring/adr.md` for the authoritative schema specification.

---

## Entity Hierarchy

### Clean Ownership Chain

The ownership model follows a simple linear hierarchy:

```
form → flow → step → question → options
```

```mermaid
erDiagram
    organizations ||--o{ forms : "owns"
    forms ||--|| flows : "has exactly one primary"
    forms ||--o{ flows : "has zero or more branches"
    flows ||--o{ form_steps : "contains"
    form_steps ||--o| form_questions : "has (0:1)"
    form_questions ||--o{ question_options : "has"

    organizations {
        string id PK
    }

    forms {
        string id PK
        string organization_id FK "CASCADE"
        string name
        jsonb branching_config
    }

    flows {
        string id PK
        string form_id FK "CASCADE"
        string organization_id FK "RLS"
        boolean is_primary "UNIQUE per form"
        string branch_question_id FK "RESTRICT"
    }

    form_steps {
        string id PK
        string flow_id FK "CASCADE - ONLY PARENT"
        string organization_id FK "RLS"
        string step_type
        int step_order
        jsonb content
    }

    form_questions {
        string id PK
        string step_id FK "CASCADE - NULLABLE"
        string organization_id FK "RLS"
        string question_text
        string question_type_id FK
    }

    question_options {
        string id PK
        string question_id FK "CASCADE"
        string organization_id FK "RLS"
        string option_value
        string option_label
    }
```

### Key Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Single Parent** | Each entity has exactly one owning parent |
| **Linear Cascade** | Delete cascades follow the ownership chain |
| **RLS Denormalization** | `organization_id` on all tables for Hasura row-level security |
| **No Redundant FKs** | Derive form via joins: `question.step.flow.form_id` |

---

## Foreign Key Relationships

```mermaid
flowchart TB
    subgraph "Layer 1: Tenant"
        ORG[organizations]
    end

    subgraph "Layer 2: Form"
        FORM[forms]
    end

    subgraph "Layer 3: Flow"
        FLOW[flows]
    end

    subgraph "Layer 4: Step"
        STEP[form_steps]
    end

    subgraph "Layer 5: Question"
        QUESTION[form_questions]
    end

    subgraph "Layer 6: Options"
        OPTION[question_options]
    end

    ORG -->|"1:N CASCADE"| FORM
    FORM -->|"1:N CASCADE"| FLOW
    FLOW -->|"1:N CASCADE"| STEP
    STEP -->|"1:1 CASCADE"| QUESTION
    QUESTION -->|"1:N CASCADE"| OPTION

    QUESTION -.->|"N:1 RESTRICT"| FLOW

    style QUESTION fill:#ff9,stroke:#333
```

**Note:** The dashed line shows `flows.branch_question_id → form_questions.id` (RESTRICT) for branch point protection.

---

## FK Constraints Summary

### forms

| Column | References | ON DELETE |
|--------|------------|-----------|
| `organization_id` | organizations.id | CASCADE |

### flows

| Column | References | ON DELETE | Notes |
|--------|------------|-----------|-------|
| `form_id` | forms.id | CASCADE | |
| `organization_id` | organizations.id | CASCADE | RLS |
| `branch_question_id` | form_questions.id | **RESTRICT** | Protects branch points |

### form_steps

| Column | References | ON DELETE | Notes |
|--------|------------|-----------|-------|
| `flow_id` | flows.id | CASCADE | **Only parent** |
| `organization_id` | organizations.id | CASCADE | RLS |

### form_questions

| Column | References | ON DELETE | Notes |
|--------|------------|-----------|-------|
| `step_id` | form_steps.id | CASCADE | **Nullable** - steps without questions |
| `organization_id` | organizations.id | CASCADE | RLS |
| `question_type_id` | question_types.id | RESTRICT | |

### question_options

| Column | References | ON DELETE |
|--------|------------|-----------|
| `question_id` | form_questions.id | CASCADE |
| `organization_id` | organizations.id | CASCADE |

---

## Delete Cascade Scenarios

### Scenario 1: Delete Form (Clean Cascade)

```mermaid
flowchart TD
    A[DELETE form] --> B[CASCADE: flows]
    B --> C[CASCADE: form_steps]
    C --> D[CASCADE: form_questions]
    D --> E[CASCADE: question_options]

    style A fill:#f66,stroke:#333
    style B fill:#faa,stroke:#333
    style C fill:#faa,stroke:#333
    style D fill:#faa,stroke:#333
    style E fill:#faa,stroke:#333
```

**Result:** Single cascade chain cleans everything. No triggers needed.

---

### Scenario 2: Delete Flow

```mermaid
flowchart TD
    A[DELETE flow] --> B{Is primary flow?}
    B -->|YES| C[Application PREVENTS this]
    B -->|NO| D[CASCADE: form_steps]
    D --> E[CASCADE: form_questions]
    E --> F{Is question a branch point?}
    F -->|NO| G[CASCADE: question_options]
    F -->|YES| H[FK RESTRICT BLOCKS]
    H --> I[Transaction FAILS]

    style A fill:#f66,stroke:#333
    style C fill:#ff0,stroke:#333
    style H fill:#f00,stroke:#333,color:#fff
    style I fill:#f00,stroke:#333,color:#fff
```

**Application Rule:** Never delete the primary flow. Delete the form instead.

---

### Scenario 3: Delete Step

```mermaid
flowchart TD
    A[DELETE step] --> B[CASCADE: form_questions via step_id]
    B --> C{Is question a branch point?}
    C -->|NO| D[CASCADE: question_options]
    D --> E[Step + Question + Options deleted]
    C -->|YES| F[FK RESTRICT BLOCKS]
    F --> G[Transaction FAILS]

    style A fill:#f66,stroke:#333
    style F fill:#f00,stroke:#333,color:#fff
    style G fill:#f00,stroke:#333,color:#fff
```

**Note:** The FK on `form_questions.step_id` handles cascade automatically. No trigger needed.

---

### Scenario 4: Delete Question Directly

```mermaid
flowchart TD
    A[DELETE question] --> B{Is branch point?}
    B -->|YES| C[FK RESTRICT BLOCKS]
    C --> D[DELETE FAILS]
    B -->|NO| E[CASCADE: question_options]
    E --> F[Question + Options deleted]
    F --> G[Step remains - orphaned]

    style A fill:#f66,stroke:#333
    style C fill:#f00,stroke:#333,color:#fff
    style D fill:#f00,stroke:#333,color:#fff
    style G fill:#ff0,stroke:#333
```

**Application Rule:** Delete the step, not the question directly. Step deletion cascades cleanly.

---

## Branch Point Protection

A **branch point** is a question (typically rating) that determines which flow path the respondent takes.

```mermaid
flowchart LR
    subgraph "Primary Flow"
        W[Welcome] --> R[Rating ⭐]
    end

    R -->|"≥ 4 stars"| T[Testimonial Flow]
    R -->|"< 4 stars"| I[Improvement Flow]

    subgraph "flows table"
        F1["Primary Flow<br/>is_primary: true<br/>branch_question_id: NULL"]
        F2["Testimonial Flow<br/>is_primary: false<br/>branch_question_id: rating_q"]
        F3["Improvement Flow<br/>is_primary: false<br/>branch_question_id: rating_q"]
    end

    F2 -.->|"FK RESTRICT"| R
    F3 -.->|"FK RESTRICT"| R

    style R fill:#ff9,stroke:#f00,stroke-width:3px
```

### Protection Rules

| Operation | Branch Point Question | Non-Branch Question |
|-----------|----------------------|---------------------|
| Delete question directly | **BLOCKED** | Allowed |
| Delete step with question | **BLOCKED** | Allowed (cascades) |
| Delete flow containing step | **BLOCKED** | Allowed (cascades) |
| Delete form | **ALLOWED** | Allowed |

### How to Delete a Branch Point Question

```typescript
// 1. First disable branching (clears branch_question_id on flows)
await disableBranching(formId);

// 2. Now safe to delete the step (cascades to question)
await deleteStep(ratingStepId);
```

---

## Step-Question Relationship

### Steps Can Exist Without Questions

The `step_id` on `form_questions` is **nullable** because some step types don't have questions:

| Step Type | Has Question |
|-----------|--------------|
| `welcome` | No |
| `thank_you` | No |
| `consent` | No |
| `question` | Yes |
| `rating` | Yes |
| `multiple_choice` | Yes |

```mermaid
flowchart LR
    subgraph "Steps with Questions"
        S1[question step] --> Q1[form_question]
        S2[rating step] --> Q2[form_question]
    end

    subgraph "Steps without Questions"
        S3[welcome step]
        S4[thank_you step]
        S5[consent step]
    end

    style S3 fill:#ddd,stroke:#333
    style S4 fill:#ddd,stroke:#333
    style S5 fill:#ddd,stroke:#333
```

---

## Delete Behavior Matrix

| Entity Deleted | flows | form_steps | form_questions | question_options |
|----------------|-------|------------|----------------|------------------|
| **form** | CASCADE | CASCADE | CASCADE | CASCADE |
| **flow** | - | CASCADE | CASCADE | CASCADE |
| **step** | - | - | CASCADE | CASCADE |
| **question** | RESTRICT* | - | - | CASCADE |
| **option** | - | - | - | - |

\* Only if question is a branch point

---

## Application Code Patterns

### Creating Entities (Top-Down)

```typescript
// 1. Create form
const form = await createForm({ organization_id, name });

// 2. Create primary flow
const flow = await createFlow({
  form_id: form.id,
  organization_id,
  is_primary: true
});

// 3. Create step
const step = await createFormStep({
  flow_id: flow.id,
  organization_id,
  step_type: 'question',
  step_order: 0
});

// 4. Create question (references step)
const question = await createFormQuestion({
  step_id: step.id,
  organization_id,
  question_text: 'How would you rate us?'
});

// 5. Create options
await createQuestionOptions({
  question_id: question.id,
  organization_id,
  options: [...]
});
```

### Deleting Entities (Let Cascade Handle It)

```typescript
// ✅ CORRECT: Delete form, cascade handles everything
await deleteForm(formId);

// ✅ CORRECT: Delete step, cascade handles question + options
await deleteFormStep(stepId);

// ⚠️ AVOID: Deleting question directly (orphans step)
// await deleteFormQuestion(questionId);
```

### Safe Step Deletion

```typescript
async function safeDeleteStep(stepId: string): Promise<void> {
  const step = await getStep(stepId);

  // Check if associated question is a branch point
  if (step.question?.id) {
    const isProtected = await isBranchPointQuestion(step.question.id);
    if (isProtected) {
      throw new Error(
        'Cannot delete step: question is branch point. Disable branching first.'
      );
    }
  }

  // Safe to delete - FK cascade handles question cleanup
  await deleteFormStep(stepId);
}
```

---

## Querying Across Hierarchy

### Get Steps by Form

```graphql
query GetFormSteps($formId: String!) {
  form_steps(
    where: { flow: { form_id: { _eq: $formId } } }
    order_by: [
      { flow: { display_order: asc } },
      { step_order: asc }
    ]
  ) {
    id
    step_type
    step_order
    flow_id
    question {
      id
      question_text
      options { id option_label option_value }
    }
  }
}
```

### Get Questions by Form

```graphql
query GetFormQuestions($formId: String!) {
  form_questions(
    where: { step: { flow: { form_id: { _eq: $formId } } } }
  ) {
    id
    question_text
    step_id
    step {
      id
      step_type
      flow_id
    }
  }
}
```

---

## References

- `docs/adr/013-form-entities-schema-refactoring/adr.md` - Authoritative schema specification
- `docs/adr/009-step-based-form-architecture/adr.md` - Step/flow architecture decisions
