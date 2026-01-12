# Phase 1: Move Types to Entities

## Overview

**Effort:** Low
**Risk:** Low
**Dependencies:** None

Move types from `features/createForm/models/` to appropriate entity layers.

---

## Current State

Types are scattered across:
- `features/createForm/models/` - Feature-level types (VIOLATION)
- `shared/stepCards/models/` - Shared step types
- `shared/api/` - AI types
- `entities/*/models/` - GraphQL-generated types

---

## Tasks

### Task 1.1: Audit Current Types

**Goal:** Identify all types and their proper destinations

**Source Files:**
```
apps/web/src/features/createForm/models/
├── index.ts
├── question.ts
├── form.ts
└── stepContent.ts
```

**Expected Type Destinations:**

| Type | Current Location | Target Location | Reason |
|------|------------------|-----------------|--------|
| `QuestionData` | features/createForm/models | entities/formQuestion/models | Single entity type |
| `FormData` | features/createForm/models | entities/form/models | Single entity type |
| `StepContent` | features/createForm/models | entities/formStep/models | Single entity type |
| `WizardState` | features/createForm/models | features/createForm/models | Multi-entity workflow state - OK |
| `AIQuestion` | shared/api | shared/api | API response type - OK |

**Verification:**
- [ ] Run `grep -r "from.*models/question" apps/web/src/` to find all imports
- [ ] Run `grep -r "from.*models/form" apps/web/src/` to find all imports
- [ ] Run `grep -r "from.*models/stepContent" apps/web/src/` to find all imports

---

### Task 1.2: Move QuestionData to Entity

**Goal:** Move `QuestionData` type to `entities/formQuestion/models/`

**Steps:**

1. Read current type definition:
   ```
   apps/web/src/features/createForm/models/question.ts
   ```

2. Create/update entity model file:
   ```
   apps/web/src/entities/formQuestion/models/questionData.ts
   ```

3. Add export to barrel file:
   ```
   apps/web/src/entities/formQuestion/models/index.ts
   ```

4. Add export to entity public API:
   ```
   apps/web/src/entities/formQuestion/index.ts
   ```

5. Update all imports in feature layer to use entity path

**Code to Add:**
```typescript
// entities/formQuestion/models/questionData.ts
export interface QuestionData {
  id: string;
  question_text: string;
  question_type_id: string;
  question_key: string;
  placeholder?: string;
  help_text?: string;
  is_required: boolean;
  display_order: number;
  flow_membership: FlowMembership;
  isNew?: boolean;
  isModified?: boolean;
}
```

**Imports to Update:**
- [ ] `features/createForm/composables/wizard/useQuestionGeneration.ts`
- [ ] `features/createForm/composables/wizard/useCreateFormWithSteps.ts`
- [ ] `features/createForm/ui/wizard/screens/PreviewScreen.vue`

---

### Task 1.3: Move FormData to Entity

**Goal:** Move `FormData` type to `entities/form/models/`

**Steps:**

1. Read current type definition:
   ```
   apps/web/src/features/createForm/models/form.ts
   ```

2. Create/update entity model file:
   ```
   apps/web/src/entities/form/models/formData.ts
   ```

3. Add export to barrel files

4. Update all imports

**Imports to Update:**
- [ ] `features/createForm/composables/autoSave/`
- [ ] `features/createForm/composables/timeline/`

---

### Task 1.4: Move StepContent Types to Entity

**Goal:** Move `StepContent` types to `entities/formStep/models/`

**Steps:**

1. Read current type definition:
   ```
   apps/web/src/features/createForm/models/stepContent.ts
   ```

2. Check if similar types exist in:
   ```
   apps/web/src/shared/stepCards/models/
   ```

3. Consolidate into:
   ```
   apps/web/src/entities/formStep/models/stepContent.ts
   ```

4. Update imports across codebase

**Note:** If types exist in both locations, prefer the more complete definition and create re-exports for backward compatibility.

---

### Task 1.5: Update Feature Models Index

**Goal:** Clean up feature models, keeping only multi-entity types

**After Migration:**
```typescript
// features/createForm/models/index.ts

// Multi-entity workflow types stay here
export * from './wizardState';

// Re-export from entities for backward compatibility (temporary)
// These can be removed once all imports are updated
export type { QuestionData } from '@/entities/formQuestion';
export type { FormData } from '@/entities/form';
export type { StepContent } from '@/entities/formStep';
```

---

### Task 1.6: Run Verification

**Commands:**
```bash
# Type check entire project
pnpm typecheck

# Check no broken imports
pnpm build

# Verify entity import pattern
grep -r "from '@/entities/formQuestion'" apps/web/src/features/createForm/
```

**Expected Results:**
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Feature layer imports types from entities (not defining own)

---

## Acceptance Criteria

- [ ] `QuestionData` is exported from `entities/formQuestion/`
- [ ] `FormData` is exported from `entities/form/`
- [ ] `StepContent` is exported from `entities/formStep/`
- [ ] No type definitions remain in `features/createForm/models/` except workflow state types
- [ ] All imports updated to use entity paths
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes

---

## Rollback Plan

If issues arise:
1. Keep re-exports in feature models (`export type { X } from '@/entities/...'`)
2. This maintains backward compatibility while types live in correct location

---

## Next Phase

After completion, proceed to: **Phase 2: Add stepTypeRegistry**
