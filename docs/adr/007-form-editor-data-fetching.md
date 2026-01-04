# ADR-007: Form Editor Data Fetching Strategy

## Doc Connections
**ID**: `adr-007-form-editor-data-fetching`

2026-01-04-0922 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-003-form-autosave` - Form auto-save pattern
- `adr-006-timeline-form-editor` - Timeline form editor architecture
- `table-form-steps` - Form steps table documentation
- `table-form-questions` - Form questions table documentation

---

## Status

**Accepted** - 2026-01-04

## Context

The Form Editor (Form Studio) needs to fetch and display form data including:
- Form metadata (name, product_name, product_description)
- Form steps (welcome, questions, rating, thank_you, etc.)
- Question details (question_text, question_type, question_options for MCQ)

### Data Model

```
forms (1) ─────────── (*) form_steps
                           │
                           └── (0..1) form_questions
                                        │
                                        └── (*) question_options (for MCQ)
```

### Key Characteristics

| Factor | Value | Impact |
|--------|-------|--------|
| Typical form size | 5-10 steps | Small payload |
| Question complexity | Text, rating, MCQ (3-5 options) | Manageable |
| User behavior | Frequently switches between steps | Needs instant navigation |
| Edit frequency | Moderate | Can tolerate refetch |

### The Challenge

How should we fetch form data for the editor?

1. **What to fetch**: Full data upfront vs lazy load on demand
2. **How to cache**: Apollo's automatic normalization vs manual management
3. **How to update**: After mutations, how do we refresh the UI?

## Decision

**Single comprehensive query with `refetch()` after mutations**

### Approach

1. **Single Query**: Fetch form + all steps + all questions in one query when entering the editor route
2. **Upfront Loading**: All data available immediately, no loading states when switching steps
3. **Simple Cache Updates**: After mutations, call `refetch()` on the main query
4. **Fragment Consistency**: Use GraphQL fragments for consistent data shapes

### Why This Approach

| Benefit | Explanation |
|---------|-------------|
| **Instant step navigation** | All data in memory, no loading spinners when clicking between steps |
| **Simple mental model** | One query to understand, one refetch after mutations |
| **Small payload** | 5-10 steps × small question data = negligible size |
| **No coordination** | No need to coordinate multiple queries or manage partial loading states |
| **MVP-appropriate** | Simple to implement, easy to reason about, sufficient for current needs |

### Query Structure

```graphql
# GetFormForEditor.gql
query GetFormForEditor($formId: String!) {
  forms_by_pk(id: $formId) {
    ...FormBasic
    form_steps(order_by: { step_order: asc }) {
      ...FormStepBasic
      question {
        ...QuestionWithOptions
      }
    }
  }
}

fragment QuestionWithOptions on form_questions {
  id
  question_text
  question_type {
    id
    unique_name
    category
  }
  question_options(order_by: { display_order: asc }) {
    id
    option_text
    display_order
  }
}
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Form Editor Page                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   1. Route entered: /forms/{slug}_{id}/edit                         │
│                          │                                           │
│                          ▼                                           │
│   2. useGetFormForEditor(formId)                                    │
│                          │                                           │
│                          ▼                                           │
│   3. Apollo fetches full form data                                  │
│                          │                                           │
│                          ▼                                           │
│   4. Transform & set editor state                                   │
│                          │                                           │
│                          ▼                                           │
│   5. User edits step → mutation fires                               │
│                          │                                           │
│                          ▼                                           │
│   6. Mutation success → refetch() query                             │
│                          │                                           │
│                          ▼                                           │
│   7. Apollo updates cache → UI re-renders                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Cache Update Strategy

For MVP, we use the simplest approach:

```typescript
// After any mutation that modifies form data
async function saveStep(step: FormStep) {
  await updateStepMutation({ variables: { id: step.id, changes: {...} } });

  // Simple: refetch the main query
  await formQueryRefetch();
}
```

**Why refetch instead of fragment-based updates:**
1. Mutations happen infrequently (user edits, saves)
2. Payload is small, network cost is negligible
3. Guarantees consistency - no risk of stale data
4. No complex `update` functions or cache manipulation
5. Simpler debugging - query shows exact server state

## Consequences

### Positive

1. **Zero loading states between steps**: User can click any step instantly
2. **Simple implementation**: One query, one refetch pattern
3. **Predictable cache**: Always reflects server state after refetch
4. **Easy debugging**: Apollo DevTools shows single query
5. **No coordination bugs**: Can't have stale question data
6. **Works with Apollo's normalization**: `__typename` + `id` still works

### Negative

1. **Slightly larger initial load**: Fetching all questions upfront (negligible)
2. **Full refetch after mutations**: Fetches everything even for small changes (acceptable for MVP)
3. **Not optimal for very large forms**: Would need pagination (not relevant for testimonials)

### Neutral

1. **Requires loading state on initial load**: Need skeleton/spinner when entering editor
2. **Offline support not considered**: MVP is online-only
3. **Real-time collaboration not considered**: Single-user editing for now

## Alternatives Considered

### Alternative 1: Lazy Loading Per Step

**How it works**: Fetch minimal step list initially, load full question details when step is selected.

```graphql
# Initial: Just step IDs and types
query GetFormStepsMinimal($formId: String!) {
  form_steps(where: { form_id: { _eq: $formId } }) {
    id
    step_type
    step_order
  }
}

# On step select: Full question data
query GetQuestionDetails($questionId: String!) {
  form_questions_by_pk(id: $questionId) {
    ...QuestionWithOptions
  }
}
```

**Rejected because**:
- Loading spinner every time user clicks a step = poor UX
- More complex state management (which steps are loaded?)
- Cache coordination between queries
- Over-engineering for small data size

### Alternative 2: Fragment-Based Cache Updates

**How it works**: Mutations return the same fragments as the query, Apollo automatically merges.

```graphql
mutation UpdateQuestion($id: String!, $changes: form_questions_set_input!) {
  update_form_questions_by_pk(pk_columns: { id: $id }, _set: $changes) {
    ...QuestionWithOptions  # Same fragment as query
  }
}
```

**Not rejected, but deferred**:
- Good approach, will consider for future optimization
- Requires careful fragment alignment between queries and mutations
- More setup work for MVP
- Refetch is simpler and sufficient for current scale

### Alternative 3: Optimistic Updates

**How it works**: Update UI immediately, sync with server in background.

```typescript
const { mutate } = useMutation(UPDATE_QUESTION, {
  optimisticResponse: {
    update_form_questions_by_pk: {
      ...existingQuestion,
      ...changes,
    }
  }
});
```

**Not rejected, but deferred**:
- Great for perceived performance
- Adds complexity (rollback on error, conflict resolution)
- Need to maintain client-side data structure matching server schema
- Refetch gives us correctness guarantee without complexity

## Future Optimizations

When/if we need to optimize:

1. **Fragment-based mutations**: Return same fragments, Apollo auto-merges
2. **Optimistic updates**: For immediate feedback on saves
3. **Subscription**: For real-time collaboration (if needed)
4. **Partial refetch**: Apollo's `refetchQueries` with specific queries

**Trigger for optimization**: When we notice:
- Slow mutation round-trips affecting UX
- Network usage becoming a concern
- Need for real-time collaboration

## Implementation Notes

### Current Query Split (Temporary)

Currently we have two queries:
- `GetForm` - Form metadata
- `GetFormSteps` - Steps with questions

**TODO**: Consolidate into single `GetFormForEditor` query for efficiency.

### Step Data Transformation

```typescript
// FormEditPage.vue
watch(formSteps, (steps) => {
  const transformed = steps.map((step) => ({
    id: step.id,
    stepType: step.step_type,
    stepOrder: step.step_order,
    questionId: step.question_id,
    question: step.question ? {
      id: step.question.id,
      questionText: step.question.question_text,
      questionType: step.question.question_type,
    } : null,
    content: step.content,
    tips: step.tips,
  }));
  editor.setSteps(transformed);
});
```

## References

- Apollo Client Caching: https://www.apollographql.com/docs/react/caching/overview
- Apollo Refetching: https://www.apollographql.com/docs/react/data/refetching
- ADR-003: Form Auto-Save Pattern (related patterns)
- ADR-006: Timeline Form Editor (architecture context)
