# ADR-003: Form Auto-Save Pattern

## Doc Connections
**ID**: `adr-003-form-autosave`

2026-01-01-1200 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `prd-url-system-notion-inspired` - URL system with eager entity creation
- `table-forms` - Forms table documentation

---

## Status

**Accepted** - 2026-01-01

## Context

The form builder needs a seamless saving experience similar to modern apps like Linear, Notion, and Figma. Users expect:

1. No manual "Save" button for simple fields
2. No data loss on page refresh or accidental close
3. No UI flicker when saves complete
4. Clear feedback on save status

### The Challenge

When implementing auto-save with Apollo Client:

| Problem | Description |
|---------|-------------|
| **Cache overwrites** | Apollo automatically updates cache with mutation response, overwriting user's in-progress edits |
| **Race conditions** | User types "abc", save triggers, user types "d", save completes with "abc" - cache shows stale data |
| **UI flicker** | If mutation response updates local state, screen flashes with old values |
| **Complexity** | Questions have complex nested structure (options, validation rules) - harder to diff and sync |

### Form Builder Structure

The form builder has two categories of data:

1. **Simple fields**: `product_name`, `product_description` - text inputs, easy to sync
2. **Complex data**: Questions array with nested options, validation rules, ordering - harder to sync

## Decision

**Implement a hybrid save pattern:**

1. **Auto-save for simple fields** (`product_name`, `product_description`)
   - 500ms debounce after typing stops
   - One-way sync: local → server only
   - Minimal response mutation to prevent cache overwrites

2. **Explicit save for questions**
   - "Save Questions" button in Customize step
   - Batch create/update all questions at once
   - Show "Unsaved changes" indicator

3. **Eager draft creation**
   - Create form in DB immediately on "Create New Form" click
   - Form exists with `status: 'draft'` from the start
   - Redirect to `/forms/{slug}_{id}/edit` URL

### One-Way Sync Pattern: Minimal Response Mutation

The key insight from Apollo documentation:

> "Apollo automatically overwrites only fields present in the mutation response."

**Solution:** Create a dedicated auto-save mutation that returns only metadata fields:

```graphql
mutation UpdateFormAutoSave($id: String!, $changes: forms_set_input!) {
  update_forms_by_pk(pk_columns: { id: $id }, _set: $changes) {
    id          # Required for cache normalization
    status      # Metadata we want cached
    updated_at  # Metadata we want cached
    # DO NOT include: product_name, product_description
  }
}
```

**Why this works:**
- We send `product_name`, `product_description` to the server
- Server saves them and returns only `id`, `status`, `updated_at`
- Apollo normalizes by `id` and merges into cache
- Only `status` and `updated_at` get overwritten in cache
- `product_name` and `product_description` stay untouched
- Local reactive state (from composable) is never affected

### Data Flow

| Action | Direction | What Happens |
|--------|-----------|--------------|
| Initial load (edit mode) | Server → Local | Query populates local `formData` |
| User types | Local only | Reactive state updates, triggers debounce |
| Auto-save fires | Local → Server | Sends content, receives only metadata |
| Apollo cache update | Metadata only | Only `status`, `updated_at` updated |
| Save success | Status only | Update `saveStatus` indicator |
| Page refresh | Server → Local | Fresh fetch, re-initialize local state |

### Implementation Details

```typescript
// useFormAutoSave.ts
const saveFormInfo = useDebounceFn(async () => {
  saveStatus.value = 'saving';

  try {
    // Mutation returns only id, status, updated_at
    await autoSaveMutate({
      id: formId.value,
      changes: {
        product_name: formData.value.product_name,
        product_description: formData.value.product_description,
      },
    });

    saveStatus.value = 'saved';
    lastSavedAt.value = new Date();

    // Reset to idle after 2s
    setTimeout(() => {
      if (saveStatus.value === 'saved') saveStatus.value = 'idle';
    }, 2000);

  } catch (error) {
    saveStatus.value = 'error';
    saveError.value = error.message;
  }
}, 500);
```

## Consequences

### Positive

1. **No UI flicker**: Mutation response never overwrites user's typing
2. **No race conditions**: Local state is source of truth for UI
3. **Seamless UX**: Simple fields save automatically, feels modern
4. **No data loss**: Draft exists in DB from the start
5. **Simple mental model**: Auto-save for text, explicit save for complex data
6. **Clean implementation**: No `fetchPolicy` hacks or complex `update` functions

### Negative

1. **Two save patterns**: Users must remember to save questions explicitly
2. **Questions can be lost**: If user closes page before saving questions
3. **Slight inconsistency**: Product info auto-saves, questions don't
4. **Additional mutation**: Need separate `updateFormAutoSave.gql` mutation

### Neutral

1. **Status indicator required**: Must show save status for user confidence
2. **Unsaved changes warning**: Need to warn on navigation if questions unsaved
3. **Draft cleanup optional**: Empty/abandoned drafts may accumulate (acceptable for MVP)

## Alternatives Considered

### Alternative 1: Full Auto-Save for Everything
- **Rejected**: Questions have complex structure (nested options, validation rules). Diffing and syncing individual question changes adds significant complexity. Risk of conflicts when reordering.

### Alternative 2: Manual Save for Everything
- **Rejected**: Feels outdated. Users expect modern apps to save automatically. Higher risk of data loss.

### Alternative 3: Use `fetchPolicy: 'no-cache'` for Mutations
- **Rejected**: This prevents the `update` function from being called, making it impossible to update even metadata like `updated_at`. Too aggressive.

### Alternative 4: Use `update` Function to Selectively Merge
- **Rejected**: The `update` function runs AFTER automatic normalization, so it can't prevent the overwrite. Also adds complexity.

### Alternative 5: Optimistic UI with Merge Prevention
- **Rejected**: Apollo doesn't have built-in support for "optimistic only, no merge back". Complex workarounds required.

## References

- Apollo Client Mutations: https://www.apollographql.com/docs/react/data/mutations
- Apollo Cache Normalization: https://www.apollographql.com/docs/react/caching/advanced-topics
- VueUse Debounce: https://vueuse.org/shared/useDebounceFn/
- Linear/Notion/Figma auto-save research (internal)
