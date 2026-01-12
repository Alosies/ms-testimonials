# Form Data Model & Cascade Behaviors

## Overview

This document maps the database entity hierarchy, foreign key relationships, and delete cascade behaviors for the form-related tables.

---

## Entity Hierarchy

### Conceptual vs Actual Structure

**User's Mental Model (Intuitive):**
```
forms → flows → steps → questions → options
```

**Actual Database Structure:**

```mermaid
erDiagram
    organizations ||--o{ forms : "owns"
    forms ||--o{ flows : "has"
    forms ||--o{ form_steps : "has (denormalized)"
    forms ||--o{ form_questions : "has"
    flows ||--o{ form_steps : "contains"
    form_questions ||--o{ question_options : "has"
    form_questions ||--o| form_steps : "referenced by"
    form_questions ||--o| flows : "branch point"

    forms {
        string id PK
        string organization_id FK
        string name
        jsonb branching_config
    }

    flows {
        string id PK
        string form_id FK
        string branch_question_id FK "RESTRICT"
        string flow_type
        string name
    }

    form_steps {
        string id PK
        string form_id FK "CASCADE"
        string flow_id FK "CASCADE"
        string question_id FK "CASCADE (optional)"
        string step_type
        int step_order
        jsonb content
    }

    form_questions {
        string id PK
        string form_id FK "CASCADE"
        string question_type_id FK
        string question_text
        int display_order
    }

    question_options {
        string id PK
        string question_id FK "CASCADE"
        string option_value
        string option_label
    }
```

**Key Insight:** Questions are **form-level entities**, not step-owned. Steps merely **reference** questions via an optional FK.

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

    subgraph "Layer 3: Structure"
        FLOW[flows]
        STEP[form_steps]
        QUESTION[form_questions]
    end

    subgraph "Layer 4: Detail"
        OPTION[question_options]
    end

    ORG -->|"1:N CASCADE"| FORM
    FORM -->|"1:N CASCADE"| FLOW
    FORM -->|"1:N CASCADE"| STEP
    FORM -->|"1:N CASCADE"| QUESTION
    FLOW -->|"1:N CASCADE"| STEP
    QUESTION -->|"1:N CASCADE"| OPTION
    QUESTION -.->|"N:1 CASCADE"| STEP
    QUESTION -.->|"N:1 RESTRICT"| FLOW

    style QUESTION fill:#ff9,stroke:#333
    style STEP fill:#9cf,stroke:#333
    style FLOW fill:#9cf,stroke:#333
```

---

## FK Constraints Summary

### forms

| Column | References | ON DELETE | ON UPDATE |
|--------|------------|-----------|-----------|
| `organization_id` | organizations.id | CASCADE | CASCADE |
| `created_by` | users.id | SET NULL | CASCADE |
| `updated_by` | users.id | SET NULL | CASCADE |

### flows

| Column | References | ON DELETE | ON UPDATE |
|--------|------------|-----------|-----------|
| `form_id` | forms.id | **CASCADE** | CASCADE |
| `organization_id` | organizations.id | RESTRICT | CASCADE |
| `branch_question_id` | form_questions.id | **RESTRICT** | CASCADE |

### form_steps

| Column | References | ON DELETE | ON UPDATE |
|--------|------------|-----------|-----------|
| `form_id` | forms.id | **CASCADE** | CASCADE |
| `flow_id` | flows.id | **CASCADE** | CASCADE |
| `organization_id` | organizations.id | RESTRICT | CASCADE |
| `question_id` | form_questions.id | **CASCADE** | CASCADE |
| `created_by` | users.id | SET NULL | CASCADE |
| `updated_by` | users.id | SET NULL | CASCADE |

**Additional:** `trg_form_steps_delete_question` trigger (AFTER DELETE) - deletes associated question

### form_questions

| Column | References | ON DELETE | ON UPDATE |
|--------|------------|-----------|-----------|
| `organization_id` | organizations.id | CASCADE | CASCADE |
| `form_id` | forms.id | **CASCADE** | CASCADE |
| `question_type_id` | question_types.id | RESTRICT | CASCADE |
| `updated_by` | users.id | SET NULL | CASCADE |

### question_options

| Column | References | ON DELETE | ON UPDATE |
|--------|------------|-----------|-----------|
| `organization_id` | organizations.id | CASCADE | CASCADE |
| `question_id` | form_questions.id | **CASCADE** | CASCADE |
| `created_by` | users.id | SET NULL | CASCADE |

---

## Delete Cascade Scenarios

### Scenario 1: Delete Form

```mermaid
flowchart TD
    A[DELETE form] --> B[CASCADE: flows]
    A --> C[CASCADE: form_steps]
    A --> D[CASCADE: form_questions]

    B --> E[CASCADE: form_steps via flow_id]
    E --> F[TRIGGER: delete question]
    F --> G[CASCADE: question_options]

    C --> H[TRIGGER: delete question]
    H --> I[CASCADE: question_options]

    D --> J[CASCADE: question_options]

    style A fill:#f66,stroke:#333
    style B fill:#faa,stroke:#333
    style C fill:#faa,stroke:#333
    style D fill:#faa,stroke:#333
```

**Result:** Everything deleted. Form deletion is a clean cascade.

---

### Scenario 2: Delete Flow

```mermaid
flowchart TD
    A[DELETE flow] --> B[CASCADE: form_steps]
    B --> C[TRIGGER: delete question]
    C --> D{Is question a branch point?}
    D -->|NO| E[DELETE question]
    E --> F[CASCADE: question_options]
    D -->|YES| G[FK RESTRICT BLOCKS]
    G --> H[Transaction FAILS]

    style A fill:#f66,stroke:#333
    style G fill:#f00,stroke:#333,color:#fff
    style H fill:#f00,stroke:#333,color:#fff
```

**Edge Case:** If a flow contains a step with a question that is used as a branch point by another flow, the delete will fail.

---

### Scenario 3: Delete Step

```mermaid
flowchart TD
    A[DELETE step] --> B[TRIGGER fires]
    B --> C{step.question_id IS NOT NULL?}
    C -->|NO| D[Step deleted, done]
    C -->|YES| E[Attempt DELETE question]
    E --> F{Is question a branch point?}
    F -->|NO| G[DELETE question succeeds]
    G --> H[CASCADE: question_options]
    F -->|YES| I[FK RESTRICT BLOCKS]
    I --> J[Transaction FAILS]

    style A fill:#f66,stroke:#333
    style I fill:#f00,stroke:#333,color:#fff
    style J fill:#f00,stroke:#333,color:#fff
```

**Important:** You cannot delete a step that has a question used as a branch point.

---

### Scenario 4: Delete Question (Direct)

```mermaid
flowchart TD
    A[DELETE question] --> B{Referenced by flows.branch_question_id?}
    B -->|YES| C[FK RESTRICT BLOCKS]
    C --> D[DELETE FAILS immediately]
    B -->|NO| E[CASCADE: form_steps]
    E --> F[Steps referencing this question DELETED]
    A --> G[CASCADE: question_options]
    G --> H[Options DELETED]

    style A fill:#f66,stroke:#333
    style C fill:#f00,stroke:#333,color:#fff
    style D fill:#f00,stroke:#333,color:#fff
```

**Bi-directional Cascade Note:**
- Delete question → cascades to delete step (via FK)
- Delete step → trigger deletes question

This is consistent but creates mutual deletion. Either operation cleans up both.

---

### Scenario 5: Delete Question Options

```mermaid
flowchart TD
    A[DELETE option] --> B[No cascades - leaf node]
    B --> C[Option deleted]

    style A fill:#f66,stroke:#333
```

---

## Branch Point Protection

### What is a Branch Point?

A question used for conditional branching (e.g., rating question that splits flow into testimonial vs improvement paths).

```mermaid
flowchart LR
    subgraph "Shared Flow"
        W[Welcome] --> R[Rating Question]
    end

    R -->|"rating >= 4"| T[Testimonial Flow]
    R -->|"rating < 4"| I[Improvement Flow]

    subgraph "flows table"
        F1[shared flow]
        F2[testimonial flow]
        F3[improvement flow]
    end

    F2 -.->|"branch_question_id"| R
    F3 -.->|"branch_question_id"| R

    style R fill:#ff9,stroke:#f00,stroke-width:3px
```

The rating question is **protected** by `ON DELETE RESTRICT` - it cannot be deleted while flows reference it.

### Protection Rules

| Operation | Branch Point Question | Non-Branch Question |
|-----------|----------------------|---------------------|
| Delete question directly | **BLOCKED** | Allowed (cascades to step) |
| Delete step with question | **BLOCKED** | Allowed (trigger deletes question) |
| Delete flow containing step | **BLOCKED** | Allowed |
| Delete form | **ALLOWED** | Allowed (cascade cleans all) |

### How to Delete a Branch Point Question

```mermaid
sequenceDiagram
    participant App
    participant DB

    App->>DB: Check if question is branch point
    DB-->>App: Yes, referenced by flows

    App->>DB: UPDATE flows SET branch_question_id = NULL
    Note over DB: Disable branching first

    App->>DB: DELETE step (with question)
    Note over DB: Trigger deletes question
    DB-->>App: Success
```

**Application Code Pattern:**
```typescript
async function deleteRatingStep(stepId: string) {
  const step = await getStep(stepId);
  const isBranchPoint = await isBranchPointQuestion(step.question_id);

  if (isBranchPoint) {
    // 1. Disable branching first
    await disableBranching(formId);
  }

  // 2. Now safe to delete step
  await deleteStep(stepId);
}
```

---

## Dual Parentage: form_steps

### Why Steps Have Both form_id AND flow_id

```mermaid
flowchart TB
    subgraph "Denormalized Structure"
        FORM[forms]
        FLOW[flows]
        STEP[form_steps]

        FORM -->|"form_id CASCADE"| STEP
        FLOW -->|"flow_id CASCADE"| STEP
        FORM -->|"form_id CASCADE"| FLOW
    end

    subgraph "Benefits"
        B1[Direct query: all steps for form]
        B2[RLS: organization_id on step]
        B3[Cascade: form delete cleans all]
    end
```

**Reasons:**

1. **Query Performance:** Direct access to all steps for a form without joining flows
2. **RLS Efficiency:** `organization_id` denormalized for row-level security
3. **Cascade Simplicity:** Form deletion cascades directly to steps

**Consistency Guarantee:** When creating steps, application must ensure:
```
step.form_id = flow.form_id
step.organization_id = form.organization_id
```

---

## Summary: Delete Behavior Matrix

| Entity Deleted | flows | form_steps | form_questions | question_options |
|----------------|-------|------------|----------------|------------------|
| **form** | CASCADE | CASCADE | CASCADE | CASCADE |
| **flow** | - | CASCADE | Trigger* | CASCADE* |
| **step** | - | - | Trigger* | CASCADE* |
| **question** | RESTRICT** | CASCADE | - | CASCADE |
| **option** | - | - | - | - |

\* Via trigger `trg_form_steps_delete_question`
\*\* If question is branch point

---

## Application Code Implications

### Safe Deletion Order

```mermaid
flowchart LR
    subgraph "❌ WRONG"
        W1[deleteSteps] --> W2[deleteQuestions]
        W2 --> W3[deleteFlows]
        W3 --> W4[deleteForm]
    end

    subgraph "✅ CORRECT"
        C1[deleteForm] --> C2[Cascades Everything]
    end
```

**Best Practice:** Let database cascades handle cleanup. Delete the form, everything else follows.

### When Deleting Individual Entities

```typescript
// Delete step safely
async function safeDeleteStep(stepId: string): Promise<boolean> {
  const step = await getStep(stepId);

  // Check if question is protected
  if (step.question_id) {
    const isProtected = await isBranchPointQuestion(step.question_id);
    if (isProtected) {
      throw new Error('Cannot delete step: question is branch point. Disable branching first.');
    }
  }

  // Safe to delete - trigger handles question cleanup
  await deleteFormStep(stepId);
  return true;
}
```

---

## Historical Context: Why Questions Are Form-Level

### The Question

> Why is `form_questions` directly under `forms` instead of under `form_steps`?

### Answer: Historical Artifact

**There is no documented design reasoning.** The current structure is a result of incremental schema evolution:

```mermaid
timeline
    title Schema Evolution
    Dec 30, 2025 : form_questions created
                 : Direct child of forms
                 : Simple form_id FK
    Jan 3, 2026  : form_steps created
                 : Added as UI/workflow layer
                 : References questions via question_id FK
    Jan 13, 2026 : Cascade trigger added
                 : trg_form_steps_delete_question
                 : Patches the relationship
```

### Migration Timestamps (Evidence)

| Migration | Timestamp | Date |
|-----------|-----------|------|
| `form_questions__create_table` | 1767078192000 | Dec 30, 2025 |
| `form_steps__create_table` | 1767425106405 | Jan 3, 2026 |
| `form_steps__add_question_cascade_trigger` | 1768018796784 | Jan 13, 2026 |

**Key Insight:** Questions were created **4 days before** steps existed. The schema was not restructured when steps were added.

### ADR-009 Confirmation

ADR-009 states:
> "Steps and questions have 1:1 relationship"

This confirms the design intent: **every question belongs to exactly one step**. There is no use case for orphan questions.

### Current Consequences

```mermaid
flowchart TB
    subgraph "Mental Model Mismatch"
        EXPECT["Expected: forms → steps → questions"]
        ACTUAL["Actual: forms → questions (sibling to steps)"]
    end

    subgraph "Technical Debt"
        TD1["Orphan risk: questions can exist without steps"]
        TD2["Bi-directional cascade complexity"]
        TD3["Confusing developer experience"]
        TD4["Trigger-based consistency (fragile)"]
    end

    EXPECT -.->|"≠"| ACTUAL
    ACTUAL --> TD1
    ACTUAL --> TD2
    ACTUAL --> TD3
    ACTUAL --> TD4
```

### Potential Refactor (Not Recommended for MVP)

The "correct" structure would be:

```mermaid
erDiagram
    forms ||--o{ flows : "has"
    flows ||--o{ form_steps : "contains"
    form_steps ||--o| form_questions : "owns"
    form_questions ||--o{ question_options : "has"

    form_steps {
        string id PK
        string flow_id FK
    }

    form_questions {
        string id PK
        string step_id FK "replaces form_id"
    }
```

**Why Not Refactor Now:**
1. Requires data migration for existing forms
2. All GraphQL queries/mutations need updating
3. Application code assumes current structure
4. Risk of breaking existing functionality

**Recommendation:** Document as technical debt, address post-MVP if needed.

---

## References

- `db/hasura/migrations/default/1767078132000__forms__create_table/up.sql`
- `db/hasura/migrations/default/1767693641260__flows__create_table/up.sql`
- `db/hasura/migrations/default/1767425106405__form_steps__create_table/up.sql`
- `db/hasura/migrations/default/1768018796784__form_steps__add_question_cascade_trigger/up.sql`
- `db/hasura/migrations/default/1768018541454__flows__add_branch_columns/up.sql`
- `docs/adr/009-step-based-form-architecture/adr.md` (1:1 relationship confirmation)
