# ADR-010: Centralized Auto-Save Controller

## Doc Connections
**ID**: `adr-010-centralized-auto-save`

2026-01-11-1430 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-003-form-autosave` - Original auto-save pattern (being superseded)
- `adr-006-timeline-form-editor` - Timeline editor layout

---

## Status

**Implemented** - 2026-01-11

## Context

The form studio needs auto-save for a seamless editing experience. Following ADR-003, we implemented debounced auto-save, but the current implementation has grown fragmented across multiple composables.

### Current State: Fragmented Save Architecture

| Composable | Purpose | Trigger |
|------------|---------|---------|
| `useFormAutoSave.ts` | Form info (name, product_name) | On field change |
| `useQuestionSave.ts` | Question data | Unknown |
| `useStepSave.ts` | Step question data | Explicit |
| `useSaveFormSteps.ts` | Steps + branching | Explicit button |
| `useStepAutoSave.ts` | Steps auto-save | On CRUD (broken) |
| `useTimelineDesignConfig.ts` | Design config | On change (inline) |

### Problems

| Problem | Description |
|---------|-------------|
| **Circular dependencies** | `useStepAutoSave` → `useSaveFormSteps` → `useTimelineEditor` → `useTimelineStepCrud` → `useStepAutoSave` |
| **Multiple debounce timers** | Each composable runs its own 500ms timer independently |
| **Unpredictable save order** | Saves race each other, unclear what persists when |
| **Hard to reason about** | Need to check 6 files to understand what auto-saves |
| **Scattered dirty tracking** | Each composable tracks its own dirty state |
| **Inconsistent patterns** | Some use `createSharedComposable`, some don't |

### Industry Research: Canva & Figma

| Platform | Pattern | Key Details |
|----------|---------|-------------|
| **Figma** | Real-time delta sync | Watches for changes, saves only deltas, single orchestration layer |
| **Canva** | Adaptive throttled save | Central controller with AIMD algorithm adjusts rate based on load |

**Common insight:** Both use a **central orchestrator** that watches for changes and triggers saves, with modular handlers for different data types.

## Decision

**Implement a Centralized Auto-Save Controller** that separates:

### Schema Reference: Text Fields for Auto-Save

Based on the actual GraphQL schema, these are the text fields that require debounced auto-save:

| Table | Field | Type | Description |
|-------|-------|------|-------------|
| `forms` | `name` | String! | Internal form name for dashboard |
| `forms` | `product_name` | String! | Product/service name shown in form |
| `forms` | `product_description` | String | Description shown to respondent |
| `form_questions` | `question_text` | String! | The main question text |
| `form_questions` | `placeholder` | String | Input placeholder text |
| `form_questions` | `help_text` | String | Help/description text shown to respondent |
| `form_questions` | `scale_min_label` | String | Label for scale minimum endpoint |
| `form_questions` | `scale_max_label` | String | Label for scale maximum endpoint |
| `question_options` | `option_label` | String! | Display text shown to respondent |
| `question_options` | `option_value` | String! | Value submitted when selected |
| `form_steps` | `tips` | [String!] | Array of tip strings shown in step |
| `flows` | `name` | String! | User-facing name for the flow/branch |

**Rule of thumb:** "Typed content" → debounced save. Everything else → immediate save.

**Not included in auto-save** (non-text, saved immediately on change):
- All boolean fields (is_required, is_active, etc.)
- All enum fields (question_type, condition_operator, etc.)
- All FK fields (form_id, question_id, etc.)
- All numeric fields (scale_min, scale_max, min_length, max_length, display_order)

### Architecture
1. **Detection** (modular) - Surgical watchers per entity, mark dirty state
2. **Orchestration** (centralized) - Single debounce timer, dependency ordering
3. **Execution** (modular) - Individual save handlers following SOLID principles

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MODULAR DETECTION                               │
│                    (Surgical Watchers per Entity)                       │
│                                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ formInfo │ │question  │ │ option   │ │ stepTips │ │stepContent│ │ flowName ││
│  │ Watcher  │ │Text      │ │ Text     │ │ Watcher  │ │ Watcher   │ │ Watcher  ││
│  │          │ │Watcher   │ │ Watcher  │ │          │ │           │ │          ││
│  │• name    │ │• question│ │• option_ │ │ • tips   │ │• welcome  │ │ • name   ││
│  │• product_│ │  _text   │ │  label   │ │          │ │• thank_you│ │          ││
│  │  name    │ │• place   │ │• option_ │ │          │ │• consent  │ │          ││
│  │• product_│ │  holder  │ │  value   │ │          │ │• contact  │ │          ││
│  │  desc    │ │• help_   │ │          │ │          │ │• reward   │ │          ││
│  │          │ │  text    │ │          │ │          │ │           │ │          ││
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘ └────┬─────┘│
│       │            │            │            │             │            │      │
│       ▼            ▼            ▼            ▼             ▼            ▼      │
│   dirty.formInfo  dirty.questions dirty.options  dirty.steps      dirty.flows │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     CENTRALIZED ORCHESTRATION                           │
│                      useAutoSaveController                              │
│                    (Singleton via createSharedComposable)               │
│                                                                         │
│  Responsibilities:                                                      │
│  • Own shared dirty state (useDirtyTracker)                             │
│  • Single 500ms debounce timer                                          │
│  • Execute handlers in dependency order                                 │
│  • Aggregate save status for UI                                         │
│  • Clear dirty state after successful save                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────┬───────────┼───────────┬───────────────┐
        ▼               ▼           ▼           ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ FormInfo     │ │ Design       │ │ Steps        │ │ Questions    │ │ Flows        │
│ SaveHandler  │ │ SaveHandler  │ │ SaveHandler  │ │ SaveHandler  │ │ SaveHandler  │
│              │ │              │ │              │ │              │ │              │
│ • name       │ │ • color      │ │ • upsert     │ │ • text       │ │ • add/delete │
│ • product_*  │ │ • logo       │ │ • delete     │ │ • settings   │ │ • name       │
│              │ │              │ │ • reorder    │ │ • options    │ │ • conditions │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
        │               │               │               │               │
        └───────────────┴───────────────┴───────────────┴───────────────┘
                                        │
                                        ▼
                        ┌──────────────────────────────┐
                        │      GraphQL Mutations       │
                        │  (Existing entity layer)     │
                        └──────────────────────────────┘
```

### Why Surgical Watchers (Not Snapshot Diffing)

| Approach | How dirty is determined | Performance | Precision |
|----------|------------------------|-------------|-----------|
| **Snapshot diffing** | Compare entire state tree on every change | O(n) - expensive for large forms | Knows IF changed, then must diff to find WHAT |
| **Surgical watchers** | Mark dirty at point of change detection | O(1) - zero diffing | Knows exactly WHAT changed immediately |

**Key insight:** We're already watching for changes (v-model, watchers). Instead of diffing afterward, mark dirty when the change is detected.

### Key Design Principles

#### 1. Two Save Patterns: Typed vs Other Actions

The system uses **two distinct save patterns** based on input type:

| Pattern | Input Type | Use Case | Debounce |
|---------|------------|----------|----------|
| **Immediate** | Buttons, toggles, dropdowns, drag-drop | Discrete user actions | None |
| **Debounced** | Typed content | Continuous typing | 500ms |

**Why this split?**
- Typed input is continuous (user types character by character)
- Other actions are discrete (user clicks, selects, or releases)
- Only continuous typed input benefits from debouncing

#### 2. Dirty State (ID Tracking Required)

The auto-save controller must track **which specific entities** are dirty by ID:

```typescript
interface DirtyState {
  formInfo: boolean;        // Only one form, boolean is sufficient
  questions: Set<string>;   // Question IDs with unsaved text changes
  options: Set<string>;     // Option IDs with unsaved text changes
  steps: Set<string>;       // Step IDs with unsaved tip changes
  flows: Set<string>;       // Flow IDs with unsaved name changes
}
```

**Why ID tracking is required:**
- User types in Question A, then switches to Question B within 500ms
- Debounce fires while Question B is active
- Without ID tracking: We'd save Question B (no changes) and lose Question A's changes
- With ID tracking: We know Question A is dirty and save it specifically

**Why `formInfo` is just a boolean:**
- There's only one form being edited at a time
- No risk of switching to a "different form" mid-edit

#### 3. Save Pattern Mapping

**IMMEDIATE (discrete actions - mutation on interaction):**

| User Action | Handler | Trigger |
|-------------|---------|---------|
| Add/delete/reorder steps | `useTimelineStepCrud` | Button click, drag-drop end |
| Add/delete/reorder options | `useQuestionOptions` | Button click, drag-drop end |
| Toggle isRequired | `useQuestionSettings` | Toggle switch |
| Change question type | `useQuestionSettings` | Dropdown select |
| Set min/max validation | `useQuestionSettings` | Input blur / number change |
| Change primary color | `useDesignSettings` | Color picker close |
| Upload logo | `useDesignSettings` | File upload complete |
| Change branch condition | `useFlowSettings` | Dropdown select |
| Enable/disable branching | `useTimelineStepCrud` | Toggle switch |

**DEBOUNCED (typed content - auto-save controller):**

| User Action | Schema Field | Dirty State | Notes |
|-------------|--------------|-------------|-------|
| Type form name | `forms.name` | `formInfo = true` | 500ms after last keystroke |
| Type product name | `forms.product_name` | `formInfo = true` | 500ms after last keystroke |
| Type product description | `forms.product_description` | `formInfo = true` | 500ms after last keystroke |
| Type question text | `form_questions.question_text` | `questions.add(id)` | 500ms after last keystroke |
| Type placeholder | `form_questions.placeholder` | `questions.add(id)` | 500ms after last keystroke |
| Type help text | `form_questions.help_text` | `questions.add(id)` | 500ms after last keystroke |
| Type scale min label | `form_questions.scale_min_label` | `questions.add(id)` | 500ms after last keystroke |
| Type scale max label | `form_questions.scale_max_label` | `questions.add(id)` | 500ms after last keystroke |
| Type option label | `question_options.option_label` | `options.add(id)` | 500ms after last keystroke |
| Type option value | `question_options.option_value` | `options.add(id)` | 500ms after last keystroke |
| Type step tip | `form_steps.tips` | `steps.add(id)` | 500ms after last keystroke |
| Type flow name | `flows.name` | `flows.add(id)` | 500ms after last keystroke |

**Key insight:** Auto-save is ONLY for text fields where the user types. Everything else uses immediate mutations triggered by the interaction itself.

#### 4. Dirty Tracker (With ID Tracking)

The dirty tracker uses Sets to track which specific entities need saving:

```typescript
// useDirtyTracker.ts
export const useDirtyTracker = createSharedComposable(() => {
  const dirty = reactive({
    formInfo: false,              // Boolean - only one form
    questions: new Set<string>(), // Question IDs
    options: new Set<string>(),   // Option IDs
    steps: new Set<string>(),     // Step IDs
    flows: new Set<string>(),     // Flow IDs
  });

  const mark = {
    formInfo: () => { dirty.formInfo = true; },
    question: (id: string) => { dirty.questions.add(id); },
    option: (id: string) => { dirty.options.add(id); },
    step: (id: string) => { dirty.steps.add(id); },
    flow: (id: string) => { dirty.flows.add(id); },
  };

  // Snapshot and clear atomically - prevents losing changes that happen during save
  const snapshot = () => {
    const captured = {
      formInfo: dirty.formInfo,
      questions: new Set(dirty.questions),
      options: new Set(dirty.options),
      steps: new Set(dirty.steps),
      flows: new Set(dirty.flows),
    };
    clear();
    return captured;
  };

  const clear = () => {
    dirty.formInfo = false;
    dirty.questions.clear();
    dirty.options.clear();
    dirty.steps.clear();
    dirty.flows.clear();
  };

  const hasPendingChanges = computed(() =>
    dirty.formInfo ||
    dirty.questions.size > 0 ||
    dirty.options.size > 0 ||
    dirty.steps.size > 0 ||
    dirty.flows.size > 0
  );

  // Restore dirty state after failed save - prevents data loss
  const restoreDirtyState = (captured: ReturnType<typeof snapshot>) => {
    if (captured.formInfo) dirty.formInfo = true;
    captured.questions.forEach(id => dirty.questions.add(id));
    captured.options.forEach(id => dirty.options.add(id));
    captured.steps.forEach(id => dirty.steps.add(id));
    captured.flows.forEach(id => dirty.flows.add(id));
  };

  return { dirty: readonly(dirty), mark, snapshot, restoreDirtyState, hasPendingChanges };
});
```

**Why snapshot pattern:**
- User types in Q1, switches to Q2, debounce fires
- `snapshot()` captures `{questions: Set(['q1'])}` and clears
- Handler saves Q1 specifically (even though Q2 is now active)
- Any typing in Q2 during save goes to a fresh dirty state

#### 5. Surgical Watchers (Text Fields Only)

Watchers only track **text field changes**. Non-text controls (toggles, dropdowns, etc.) trigger immediate mutations in their respective composables.

**6 Watchers Total:**
1. `useFormInfoWatcher` - form name, product_name, product_description
2. `useQuestionTextWatcher` - question_text, placeholder, help_text, scale labels
3. `useOptionTextWatcher` - option_label, option_value
4. `useStepTipsWatcher` - tips array
5. `useStepContentWatcher` - welcome/thank_you/consent/contact_info/reward content
6. `useFlowNameWatcher` - flow name

```typescript
// watchers/useQuestionTextWatcher.ts
// Watches: question_text, placeholder, help_text, scale_min_label, scale_max_label
export const useQuestionTextWatcher = () => {
  const { mark } = useDirtyTracker();
  const { activeQuestion } = useQuestionEditor();

  watch(
    () => activeQuestion.value ? {
      id: activeQuestion.value.id,
      fields: [
        activeQuestion.value.question_text,
        activeQuestion.value.placeholder,
        activeQuestion.value.help_text,
        activeQuestion.value.scale_min_label,
        activeQuestion.value.scale_max_label,
      ],
    } : null,
    (curr, prev) => {
      // IMPORTANT: Only mark dirty when SAME entity changed (curr.id === prev.id)
      // When user switches entities (different IDs), the "change" is just selection,
      // not a text edit. Without this check, switching questions would incorrectly
      // mark the new question as dirty with no actual text changes.
      if (curr && prev && curr.id === prev.id) {
        mark.question(curr.id);  // Track THIS question's ID
      }
    },
    { deep: true }
  );
};

// watchers/useFormInfoWatcher.ts
// Watches: name, product_name, product_description
export const useFormInfoWatcher = () => {
  const { mark } = useDirtyTracker();
  const { form } = useFormEditor();

  watch(
    () => form.value ? [form.value.name, form.value.product_name, form.value.product_description] : null,
    () => mark.formInfo(),  // Boolean flag - only one form
    { deep: true }
  );
};

// watchers/useFlowNameWatcher.ts
// Watches: name
export const useFlowNameWatcher = () => {
  const { mark } = useDirtyTracker();
  const { activeFlow } = useTimelineEditor();

  watch(
    () => activeFlow.value ? { id: activeFlow.value.id, name: activeFlow.value.name } : null,
    (curr, prev) => {
      // Same entity check: ignore selection changes between flows
      if (curr && prev && curr.id === prev.id) {
        mark.flow(curr.id);  // Track THIS flow's ID
      }
    }
  );
};

// watchers/useOptionTextWatcher.ts
// Watches: option_label, option_value for each option
export const useOptionTextWatcher = () => {
  const { mark } = useDirtyTracker();
  const { activeQuestion } = useQuestionEditor();

  watch(
    () => activeQuestion.value?.options?.map(o => ({ id: o.id, label: o.option_label, value: o.option_value })),
    (curr, prev) => {
      if (!curr || !prev) return;
      const prevMap = new Map(prev.map(o => [o.id, o]));
      for (const opt of curr) {
        const old = prevMap.get(opt.id);
        if (old && (opt.label !== old.label || opt.value !== old.value)) {
          mark.option(opt.id);  // Track THIS option's ID
        }
      }
    },
    { deep: true }
  );
};

// watchers/useStepTipsWatcher.ts
// Watches: tips
export const useStepTipsWatcher = () => {
  const { mark } = useDirtyTracker();
  const { activeStep } = useTimelineEditor();

  watch(
    () => activeStep.value ? { id: activeStep.value.id, tips: activeStep.value.tips } : null,
    (curr, prev) => {
      // Same entity check: ignore selection changes between steps
      if (curr && prev && curr.id === prev.id) {
        mark.step(curr.id);  // Track THIS step's ID
      }
    },
    { deep: true }
  );
};
```

#### 6. Minimal Response Mutation Pattern (CRITICAL)

**This is a critical architectural decision documented in ADR-003 that MUST be followed.**

Auto-save mutations must use the **Minimal Response Pattern** to prevent UI flicker and cache corruption:

| Rule | Requirement | Why |
|------|-------------|-----|
| **Use UPDATE, not UPSERT** | Explicit updates for existing entities | Upserts are for creating new records |
| **Return ONLY `id`** | Plus optionally `status`, `updated_at` | Never return content fields being saved |
| **Never return fragments** | Fragments include content fields | Would overwrite Apollo cache with stale data |

**The Problem:**

When a mutation returns the same fields being edited, Apollo automatically updates its cache with the response. This causes:

1. **Stale data overwrite**: User types "abc", save fires, user types "d", response with "abc" overwrites cache
2. **UI flicker**: Screen flashes with old values as cache updates
3. **Lost changes**: New keystrokes during save are lost when response arrives

**The Solution:**

Create dedicated auto-save mutations that return only metadata:

```graphql
# ✅ CORRECT: Return only id and metadata
mutation UpdateFormAutoSave($id: String!, $changes: forms_set_input!) {
  update_forms_by_pk(pk_columns: { id: $id }, _set: $changes) {
    id          # Required for cache normalization
    updated_at  # Metadata we want cached
    # DO NOT include: product_name, product_description
  }
}

# ❌ WRONG: Returns fragments with content fields
mutation UpdateForm($id: String!, $changes: forms_set_input!) {
  update_forms_by_pk(pk_columns: { id: $id }, _set: $changes) {
    ...FormBasic  # Includes product_name, product_description - WILL CAUSE FLICKER
  }
}
```

**Why this works:**

1. We send `product_name`, `product_description` to the server
2. Server saves them and returns only `id`, `updated_at`
3. Apollo normalizes by `id` and merges into cache
4. Only `updated_at` gets overwritten in cache
5. `product_name`, `product_description` stay untouched in cache
6. Local reactive state (from composable) is never affected

**Required mutations for auto-save:**

| Entity | Mutation | Returns |
|--------|----------|---------|
| Forms | `UpdateFormAutoSave` | `id`, `updated_at` |
| Questions | `UpdateFormQuestionAutoSave` | `id`, `updated_at` |
| Options | `UpdateQuestionOptionAutoSave` | `id`, `updated_at` |
| Steps | `UpdateFormStepAutoSave` | `id`, `updated_at` |
| Flows | `UpdateFlowAutoSave` | `id`, `updated_at` |

**Cache Bypass with `fetchPolicy: 'no-cache'`:**

Even with minimal response, Apollo's cache normalization can still trigger reactivity when a mutation returns data. The mutation response (even just `id`) causes Apollo to:
1. Trigger cache watchers/subscriptions
2. Potentially cause re-renders that pull cached values
3. Create a loop where local edits get overwritten

**Solution:** Use `fetchPolicy: 'no-cache'` on all auto-save mutation composables:

```typescript
// useUpdateFormStepAutoSave.ts
export function useUpdateFormStepAutoSave() {
  const { mutate, loading, error, onDone, onError } = useUpdateFormStepAutoSaveMutation({
    fetchPolicy: 'no-cache',  // CRITICAL: Completely bypass Apollo cache
  });
  // ...
}
```

**What `fetchPolicy: 'no-cache'` does:**
- Executes the mutation normally (saves to database)
- **Completely skips writing the response to Apollo cache**
- Local reactive state (Vue refs) remains completely untouched
- No cache normalization, no watchers triggered

**Why this is safe for auto-save:**
- Auto-save is silent background persistence
- We don't need the response to update any UI
- The local state is the source of truth during editing
- Fresh data is loaded on page reload anyway

**Reference:** See ADR-003 for detailed analysis of why this pattern is necessary.

#### 7. Save Handlers (With ID Lookup)

Handlers receive **dirty IDs** and look up current values from state. This ensures we save the entity that was modified, not just whatever is currently active.

**IMPORTANT:** All handlers MUST use UPDATE mutations with minimal response (see section 6).

```typescript
// handlers.ts
// All handlers use UPDATE mutations that return only id + updated_at

export const saveFormInfo = async (formId: string, form: Form) => {
  // Use dedicated auto-save mutation with minimal response
  await updateFormAutoSave({
    id: formId,
    changes: {
      product_name: form.product_name,
      product_description: form.product_description,
    },
  });
  // Returns only { id, updated_at } - no content fields
};

export const saveQuestions = async (questionIds: Set<string>, allQuestions: FormQuestion[]) => {
  const toSave = allQuestions.filter(q => questionIds.has(q.id));
  if (toSave.length === 0) return;

  // Use UPDATE (not UPSERT) for each question
  await Promise.all(
    toSave.map(q =>
      updateFormQuestionAutoSave({
        id: q.id,
        changes: {
          question_text: q.question_text,
          placeholder: q.placeholder,
          help_text: q.help_text,
          scale_min_label: q.scale_min_label,
          scale_max_label: q.scale_max_label,
        },
      })
    )
  );
  // Each returns only { id, updated_at }
};

export const saveOptions = async (optionIds: Set<string>, allOptions: QuestionOption[]) => {
  const toSave = allOptions.filter(o => optionIds.has(o.id));
  if (toSave.length === 0) return;

  await Promise.all(
    toSave.map(o =>
      updateQuestionOptionAutoSave({
        id: o.id,
        changes: {
          option_label: o.option_label,
          option_value: o.option_value,
        },
      })
    )
  );
};

export const saveSteps = async (stepIds: Set<string>, allSteps: FormStep[]) => {
  const toSave = allSteps.filter(s => stepIds.has(s.id));
  if (toSave.length === 0) return;

  await Promise.all(
    toSave.map(s =>
      updateFormStepAutoSave({
        id: s.id,
        changes: { tips: s.tips, content: s.content },
      })
    )
  );
};

export const saveFlows = async (flowIds: Set<string>, allFlows: Flow[]) => {
  const toSave = allFlows.filter(f => flowIds.has(f.id));
  if (toSave.length === 0) return;

  await Promise.all(
    toSave.map(f =>
      updateFlowAutoSave({
        id: f.id,
        changes: { name: f.name },
      })
    )
  );
};
```

#### 8. Central Controller (With Snapshot and Idle-Based Trigger)

The controller uses `useIdle` from VueUse to detect when the user stops interacting, combined with `whenever` to trigger saves only when both idle AND there are pending changes.

```typescript
// useAutoSaveController.ts
export const useAutoSaveController = createSharedComposable(() => {
  const { snapshot, restoreDirtyState, hasPendingChanges } = useDirtyTracker();
  const { form, allQuestions, allOptions, allSteps, allFlows } = useFormEditor();

  // useIdle detects when user stops all interaction for 500ms
  // Events tracked: mousemove, mousedown, resize, keydown, touchstart, wheel
  const { idle } = useIdle(500);

  const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Register watchers (6 total)
  useFormInfoWatcher();
  useQuestionTextWatcher();
  useOptionTextWatcher();
  useStepTipsWatcher();
  useStepContentWatcher();  // Welcome, ThankYou, Consent step content
  useFlowNameWatcher();

  const executeSave = async () => {
    if (!hasPendingChanges.value) return;

    saveStatus.value = 'saving';
    const toSave = snapshot();  // Capture dirty IDs and clear atomically

    try {
      const promises: Promise<void>[] = [];

      if (toSave.formInfo && form.value) {
        promises.push(saveFormInfo(form.value));
      }
      if (toSave.questions.size > 0) {
        promises.push(saveQuestions(toSave.questions, allQuestions.value));
      }
      if (toSave.options.size > 0) {
        promises.push(saveOptions(toSave.options, allOptions.value));
      }
      if (toSave.steps.size > 0) {
        promises.push(saveSteps(toSave.steps, allSteps.value));
      }
      if (toSave.flows.size > 0) {
        promises.push(saveFlows(toSave.flows, allFlows.value));
      }

      await Promise.all(promises);

      // Transition: saving → saved → idle
      // UI component (SaveStatusPill) handles display timing
      saveStatus.value = 'saved';
      await nextTick();
      saveStatus.value = 'idle';

    } catch (error) {
      saveStatus.value = 'error';
      console.error('[AutoSave] Save failed:', error);

      // CRITICAL: Restore dirty state on failure to prevent data loss
      restoreDirtyState(toSave);
    }
  };

  // Save when BOTH conditions are true:
  // 1. User has been idle for 500ms (no keyboard/mouse activity)
  // 2. There are pending changes to save
  //
  // Using `whenever` instead of debounce because:
  // - It fires when the condition BECOMES true
  // - Handles edge case where user is already idle when changes are made
  whenever(
    () => idle.value && hasPendingChanges.value,
    () => executeSave()
  );

  return { saveStatus: readonly(saveStatus), hasPendingChanges };
});
```

#### 8. Navigation Warning (Unsaved Changes Protection)

Prevents data loss when user navigates away with pending changes:

```typescript
// useNavigationGuard.ts
export const useNavigationGuard = () => {
  const { hasPendingChanges } = useDirtyTracker();
  const router = useRouter();

  // Browser close/refresh warning
  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
  });

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  });

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasPendingChanges.value) {
      e.preventDefault();
      e.returnValue = ''; // Chrome requires returnValue to be set
    }
  };

  // Vue Router navigation guard
  onBeforeRouteLeave((to, from, next) => {
    if (hasPendingChanges.value) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmed) return next(false);
    }
    next();
  });
};

// Usage in FormStudioPage.vue
useNavigationGuard();
```

**Why ID tracking is essential:**
- User types in Q1, switches to Q2 within 500ms
- Snapshot captures `{questions: Set(['q1'])}`
- Handler looks up Q1 from `allQuestions` and saves it
- Q2 (now active) is unaffected - no data loss

### Data Flow

**Typed Content (Debounced Auto-Save):**

```
User types in Question A, then switches to Question B
         │
         ▼
┌─────────────────────────┐
│ v-model updates Q.A     │  ← Reactive state changes
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ useQuestionTextWatcher  │  ← Detects change
│ mark.question('qa-id')  │     Adds ID to dirty Set
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ User switches to Q.B    │  ← Within 500ms
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 500ms debounce fires    │
│ snapshot() captures:    │
│ {questions: Set(['qa'])}│
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ saveQuestions(ids, all) │  ← Looks up Q.A by ID
│ Saves Q.A (not Q.B!)    │     from allQuestions
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ saveStatus: 'saved'     │  ← Q.A saved correctly
└─────────────────────────┘
```

**Non-Text Change (Immediate Mutation):**

```
User toggles isRequired switch
         │
         ▼
┌─────────────────────────┐
│ @change handler         │  ← Discrete action
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ useQuestionSettings     │  ← Immediate mutation
│ updateQuestionMutation()│     No debounce needed
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Done                    │  ← Instant feedback
└─────────────────────────┘
```

**No dependency ordering needed** - all text field handlers can run in parallel.

### Handler Responsibilities

**Auto-Save Handlers (Typed Content - Debounced):**

| Handler | Schema Fields | What it saves |
|---------|---------------|---------------|
| `saveFormInfo(form)` | `forms.name`, `product_name`, `product_description` | Current form (only one) |
| `saveQuestions(ids, all)` | `form_questions.question_text`, `placeholder`, `help_text`, `scale_*_label` | Questions by ID from state |
| `saveOptions(ids, all)` | `question_options.option_label`, `option_value` | Options by ID from state |
| `saveSteps(ids, all)` | `form_steps.tips` | Steps by ID from state |
| `saveFlows(ids, all)` | `flows.name` | Flows by ID from state |

**Immediate Mutation Composables (Non-Text - No Debounce):**

| Composable | Actions | Notes |
|------------|---------|-------|
| `useTimelineStepCrud` | Add/delete/reorder steps, enable branching | Structural changes |
| `useQuestionSettings` | Toggle isRequired, change type, set validation | Settings changes |
| `useQuestionOptions` | Add/delete/reorder options | Structural changes |
| `useDesignSettings` | Change color, upload logo | Design changes |
| `useFlowSettings` | Change branch conditions | Dropdown selections |


### UI Integration

The controller exposes minimal state for UI:

```typescript
// In FormStudioPage.vue
const autoSave = useAutoSaveController();

// Header shows save status
<FormEditorHeader :save-status="autoSave.saveStatus.value" />

// Optional: Show what's pending (for debugging/power users)
<div v-if="autoSave.hasPendingChanges.value" class="text-yellow-500">
  Unsaved changes...
</div>
```

### Initialization

The controller is initialized once at the page level and uses `createSharedComposable` for singleton access:

```typescript
// FormStudioPage.vue - initializes on mount
const autoSave = useAutoSaveController();

// Any child component can access the same instance
// useTimelineStepCrud.ts - just modifies state, doesn't trigger save directly
const autoSave = useAutoSaveController(); // Same instance, for status if needed
```

### Error Handling

```typescript
interface SaveResult {
  success: boolean;
  handler: string;           // Which handler failed
  error?: Error;
  retryable: boolean;        // Can user retry?
  affectedEntities?: string[]; // Which steps/fields failed
}

// Controller aggregates errors from all handlers
const lastError = ref<SaveResult | null>(null);

// UI can show specific error messages
if (lastError.value?.handler === 'steps') {
  showToast('Failed to save step changes. Please try again.');
}
```

## Consequences

### Positive

1. **Crystal clear separation** - Text fields debounced, everything else immediate
2. **Simple mental model** - "Am I typing? → Auto-save. Clicking? → Immediate."
3. **No dependency ordering** - All handlers can run in parallel
4. **Reasonable code** - ~250 lines total for auto-save system
5. **Easy debugging** - Save history, dev tools, clear logs
6. **Efficient batching** - Multiple keystrokes batch into single save
7. **O(1) change detection** - Watchers mark dirty immediately
8. **No circular dependencies** - Clean architecture

### Negative

1. **Two save patterns to maintain** - Auto-save for text, immediate for rest
2. **Must add immediate saves** - Non-text controls need mutation on change

### Neutral

1. **Learning curve** - Developers understand text vs non-text distinction
2. **Existing composables may need updates** - Add immediate mutations for settings

## Implementation Checklist

### Phase 1: Core Auto-Save (~320 lines total)

- [x] Create `useDirtyTracker.ts` - ID tracking with Sets + snapshot + restore (~60 lines)
- [x] Create `watchers.ts` - 6 watchers that track entity IDs (~100 lines)
- [x] Create `handlers.ts` - 5 save functions with ID lookup (~60 lines)
- [x] Create `useAutoSaveController.ts` - Orchestration with useIdle + whenever (~70 lines)
- [ ] Create `useNavigationGuard.ts` - beforeunload + route guard (~30 lines)

### Phase 2: Ensure Immediate Mutations Exist

- [ ] `useTimelineStepCrud` - add/delete/reorder steps
- [ ] `useQuestionSettings` - toggle/dropdown changes
- [ ] `useQuestionOptions` - add/delete/reorder options
- [ ] `useDesignSettings` - color/logo changes
- [ ] `useFlowSettings` - condition changes
- [ ] **Context-specific error messages** - e.g., "Failed to save question changes" not "Save failed"

### Phase 3: Wire Up & Test

- [ ] Initialize controller in `FormStudioPage.vue`
- [ ] Connect UI save status indicator
- [ ] Test: Type in question text → debounced save
- [ ] Test: Toggle isRequired → immediate save
- [ ] Test: Rapid typing → batches into single save

### Phase 4: Cleanup

- [ ] Remove deprecated composables: `useFormAutoSave`, `useQuestionSave`, `useStepSave`, `useStepAutoSave`
- [ ] Update exports

### Nice to Have (Post-MVP)

These features are not required for launch but improve user experience:

- [ ] **Manual Save Button** - Escape hatch for users who want explicit control. Shows "Saved" state normally, becomes "Save Now" when dirty. Useful for users on unreliable networks or who prefer explicit saves.
- [ ] **Offline Queue** - Queue changes when offline, sync when connection restored
- [ ] **Multi-Tab Sync** - Broadcast channel to sync saves across tabs
- [ ] **Retry with Backoff** - Automatic retry with exponential backoff on transient failures

## Alternatives Considered

### Alternative 1: Keep Fragmented Approach, Fix Circular Deps

Move auto-save trigger to page level but keep separate composables.

**Rejected because:**
- Still multiple debounce timers
- Still hard to reason about
- Doesn't solve the "what saves when" problem

### Alternative 2: Event-Based Pub/Sub

Components emit events, central listener handles saves.

**Rejected because:**
- Adds indirection (harder to trace)
- Event bus patterns problematic in Vue 3
- Still need central controller logic anyway

### Alternative 3: Vuex/Pinia Actions

Move all save logic to Pinia store actions.

**Rejected because:**
- Pinia stores meant for state, not complex orchestration
- Would create large monolithic store
- Harder to compose with GraphQL mutations

### Alternative 4: Snapshot-Based Diffing

Maintain a snapshot of last-saved state, deep compare on every reactive change.

```typescript
// This approach was considered but rejected
const snapshot = ref<SaveSnapshot>(createEmptySnapshot());
const dirtyState = computed(() => computeDirtyState(currentState, snapshot.value));
// ^ Runs deepEqual on every reactive change
```

**Rejected because:**
- O(n) performance cost on every change (expensive for 50+ steps)
- Knows IF something changed, but must diff again to find WHAT
- Snapshot memory overhead
- Complex comparison logic for nested objects

**Surgical watchers are preferred** because they mark dirty state at O(1) cost with precise knowledge of what changed.

## Maintainability & Troubleshooting

### File Structure

```
composables/autoSave/
├── index.ts                      # Public exports
├── useAutoSaveController.ts      # ~70 lines - orchestration with useIdle
├── useDirtyTracker.ts            # ~60 lines - ID tracking with Sets + restore
├── useNavigationGuard.ts         # ~30 lines - beforeunload + route guard
├── watchers.ts                   # ~100 lines - 6 watchers with ID tracking
└── handlers.ts                   # ~60 lines - 5 save functions with ID lookup
```

**Total: ~320 lines** for the entire auto-save system.

### UX Timing Architecture (Separation of Concerns)

The auto-save controller reports **actual data state** only. All **display timing** is handled by the UI component (SaveStatusPill):

| Layer | Responsibility |
|-------|----------------|
| **Controller** | Reports state: `idle` → `saving` → `saved` → `idle` (immediately via nextTick) |
| **SaveStatusPill** | Handles display timing: min 800ms for "Saving...", 2500ms display for "Saved" |

**Why this split:**
- Data layer shouldn't know about UX requirements
- UI timing can be adjusted without touching business logic
- Controller is easier to test (no artificial delays)
- Display timing is configurable via props on SaveStatusPill

**Immediate mutation composables (existing, not part of auto-save):**
```
composables/
├── useTimelineStepCrud.ts        # Add/delete/reorder steps
├── useQuestionSettings.ts        # Toggle/dropdown changes
├── useQuestionOptions.ts         # Add/delete/reorder options
├── useDesignSettings.ts          # Color/logo changes
└── useFlowSettings.ts            # Condition changes
```

### Dev Tools

Expose debugging utilities in development:

```typescript
// In useAutoSaveController.ts
if (import.meta.env.DEV) {
  (window as any).__AUTOSAVE__ = {
    getState: () => ({
      status: saveStatus.value,
      dirty: dirty,
      history: saveHistory.value,
    }),
    forceSave: () => debouncedSave.flush(),
    getDirty: () => summarizeDirty(dirty),
  };
}
```

**Console usage:**
```javascript
__AUTOSAVE__.getState()           // Inspect current state
__AUTOSAVE__.forceSave()          // Trigger immediate save
__AUTOSAVE__.getDirty()           // See pending changes
__AUTOSAVE__.getState().history   // See last 20 saves
```

### Troubleshooting Guide

#### "Changes aren't saving"

1. Check `__AUTOSAVE__.getState().status` - is it 'error'?
2. Check `__AUTOSAVE__.getDirty()` - are changes detected?
3. Check Network tab - are mutations firing?
4. Check `__AUTOSAVE__.getState().history` - last save result?

#### "Wrong data saved"

1. Check which watcher should have detected the change
2. Verify the watcher is watching the correct field
3. Check if mark function was called: add console.log to mark.*
4. Check save history: which handler ran?

#### "Save spinning forever"

1. Check for hung mutation in Network tab
2. Check `saveStatus` stuck on 'saving'
3. Force save: `__AUTOSAVE__.forceSave()`

#### "Duplicate saves / too many requests"

1. Check debounce is working: should see 500ms gap between changes and save
2. Verify single controller instance (createSharedComposable)
3. Check if multiple watchers firing for same change

### Logging

```typescript
// Structured logging for production debugging
const log = (event: string, data?: object) => {
  if (import.meta.env.DEV) {
    console.log(`[AutoSave] ${event}`, data);
  }
};

// Usage in controller
log('save_started', { handlers: handlersExecuted });
log('save_completed', { duration, handlers: handlersExecuted });
log('save_failed', { handler: failedHandler, error: error.message });
```

**Console output:**
```
[AutoSave] save_started { handlers: ['steps-delete', 'formInfo'] }
[AutoSave] save_completed { duration: 234, handlers: ['steps-delete', 'formInfo'] }
```

## References

- ADR-003: Form Auto-Save Pattern (original implementation)
- Figma Blog: Behind the Feature - Autosave (https://www.figma.com/blog/behind-the-feature-autosave/)
- Canva Engineering: Knowing When to Back Off (https://product.canva.com/backing-off/)
- Vue Composition API: Shared Composables (https://vueuse.org/shared/createSharedComposable/)
