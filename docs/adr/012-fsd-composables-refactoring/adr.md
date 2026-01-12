# ADR-012: FSD-Compliant Composables Refactoring

## Doc Connections
**ID**: `adr-012-fsd-composables-refactoring`

2026-01-12

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-010-centralized-auto-save` - Auto-save pattern (affected by this refactoring)
- `adr-011-immediate-save-actions` - Immediate save pattern (affected by this refactoring)

**Analysis Document**:
- `docs/analysis/composables-architecture-review.md` - Detailed SOLID analysis

**Data Model**:
- `data-model.md` - Entity hierarchy and delete cascade behaviors

---

## Status

**Proposed** - 2026-01-12

---

## Context

The `features/createForm/composables/` folder has grown to **~7,100 lines across 42 files**. While individual composables are well-documented, the overall architecture suffers from SOLID principle violations and FSD layer boundary violations.

### Current Problems

| Problem | Impact |
|---------|--------|
| **God Composable** | `useTimelineEditor` returns 80+ methods/properties |
| **FSD Violations** | Feature layer doing entity-level work |
| **SRP Violations** | Single composables handling 6+ responsibilities |
| **OCP Violations** | Adding new step types requires modifying 5+ files |
| **ISP Violations** | All components get access to all 80+ methods |
| **DIP Violations** | Features directly call GraphQL mutations |
| **Dual Save Mechanisms** | Auto-save + immediate save with complex coordination |
| **Type Duplication** | Same concepts defined in multiple places |

### Code Evidence

```typescript
// useTimelineEditor returns 80+ items
return {
  // Form context (4), Step state (7), Selection (6),
  // CRUD operations (11), Persistence operations (8),
  // Branching state (15), Branching operations (15),
  // Design config (18)
  // ... 80+ total
};
```

### FSD Layer Rules Being Violated

```
FSD Import Rules:
├── features/ → can import from → entities/  ✅
├── entities/ → can import from → shared/    ✅
└── entities/ → can import from → entities/  ❌ VIOLATION
```

**Current violations:**
- Types in `features/createForm/models/` that belong in entities
- Data operations in feature composables that belong in entity mutations
- Functions that orchestrate multiple entities placed in wrong layer

---

## Current Data Flow Model

This section maps the high-level data flow inside `features/createForm/` to help understand what's happening.

### Database Entities (GraphQL/Hasura)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATABASE LAYER                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  forms                     flows                    form_steps           │
│  ├── id                    ├── id                   ├── id               │
│  ├── name                  ├── form_id (FK)         ├── form_id (FK)     │
│  ├── product_name          ├── flow_type            ├── flow_id (FK)     │
│  ├── product_description   │   (shared|branch)      ├── step_type        │
│  ├── branching_config      ├── branch_question_id   ├── step_order       │
│  └── organization_id       ├── branch_operator      ├── question_id (FK) │
│                            ├── branch_value         ├── content (JSONB)  │
│                            └── display_order        └── tips             │
│                                                                          │
│  form_questions            question_options                              │
│  ├── id                    ├── id                                        │
│  ├── form_id (FK)          ├── question_id (FK)                          │
│  ├── question_text         ├── option_label                              │
│  ├── question_type_id      ├── option_value                              │
│  ├── display_order         └── display_order                             │
│  └── is_required                                                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Two Main User Flows

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER FLOW 1: WIZARD                               │
│                     (Create New Form from Scratch)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. ConceptTypeScreen     2. DescriptionScreen    3. FocusAreasScreen   │
│     └─► Select type          └─► Enter name          └─► Enter focus    │
│         (testimonial,            product_name             areas for AI   │
│          feedback, etc.)         description                             │
│                                                                          │
│  4. GeneratingScreen      5. PreviewScreen                               │
│     └─► AI generates         └─► Review questions                        │
│         questions               Edit/reorder                             │
│         (typing effect)         └─► "Create Form" button                 │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ useCreateFormWithSteps() - Creates ALL entities in sequence:    │    │
│  │   1. createForm()        → forms table                          │    │
│  │   2. createFormQuestions() → form_questions table               │    │
│  │   3. createFlows()       → flows table (shared + branches)      │    │
│  │   4. createFormSteps()   → form_steps table                     │    │
│  │   5. updateForm()        → branching_config on form             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      USER FLOW 2: FORM STUDIO                            │
│                       (Edit Existing Form)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FormStudioPage.vue                                                      │
│  ├── TimelineSidebar (step list, reorder, add/remove)                   │
│  ├── StepPreview (visual preview of selected step)                      │
│  └── PropertiesPanel (edit step content, question, design)              │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ useTimelineEditor (SINGLETON) - Central State Manager           │    │
│  │                                                                  │    │
│  │ Composes:                                                        │    │
│  │ ├── useStepState        → steps[], originalSteps[], isDirty     │    │
│  │ ├── useTimelineSelection → selectedIndex, selectStep()          │    │
│  │ ├── useTimelineStepCrud  → addStep, removeStep, updateStep      │    │
│  │ ├── useTimelineBranching → branchingConfig, enable/disable      │    │
│  │ └── useTimelineDesignConfig → primaryColor, logoUrl             │    │
│  │                                                                  │    │
│  │ Returns 80+ methods/properties to ALL consumers                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ useAutoSaveController (SINGLETON) - Watches & Saves             │    │
│  │                                                                  │    │
│  │ ├── useDirtyTracker      → tracks which entities changed        │    │
│  │ ├── watchers             → watch text fields for changes        │    │
│  │ ├── handlers             → save form, questions, steps, etc.    │    │
│  │ └── useSaveLock          → coordinate with immediate saves      │    │
│  │                                                                  │    │
│  │ Triggers: User idle 500ms + hasPendingChanges                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Immediate Save Actions (*WithPersist methods)                   │    │
│  │                                                                  │    │
│  │ For discrete actions that shouldn't wait for auto-save:         │    │
│  │ ├── addStepWithPersist()                                        │    │
│  │ ├── removeStepWithPersist()                                     │    │
│  │ ├── reorderStepsWithPersist()                                   │    │
│  │ └── disableBranchingWithPersist()                               │    │
│  │                                                                  │    │
│  │ Uses useSaveLock to coordinate with auto-save                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Current Composable Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CURRENT COMPOSABLE STRUCTURE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FormStudioPage.vue                                                      │
│       │                                                                  │
│       ├──► useTimelineEditor (SINGLETON, 389 lines)                     │
│       │         │                                                        │
│       │         ├──► useStepState (151 lines)                           │
│       │         ├──► useTimelineSelection (93 lines)                    │
│       │         ├──► useTimelineStepCrud (396 lines)                    │
│       │         │         │                                              │
│       │         │         └──► useStepQuestionService (154 lines)       │
│       │         │                                                        │
│       │         ├──► useTimelineBranching (415 lines)                   │
│       │         │         │                                              │
│       │         │         ├──► useBranchingDisable (162 lines)          │
│       │         │         ├──► useBranchingFlowFocus (87 lines)         │
│       │         │         └──► useBranchingDetection (117 lines)        │
│       │         │                                                        │
│       │         └──► useTimelineDesignConfig (145 lines)                │
│       │                                                                  │
│       └──► useAutoSaveController (SINGLETON, 230 lines)                 │
│                 │                                                        │
│                 ├──► useDirtyTracker (66 lines)                         │
│                 ├──► useSaveLock (53 lines)                             │
│                 ├──► watchers (273 lines)                               │
│                 └──► handlers (201 lines)                               │
│                                                                          │
│  FormWizard.vue                                                          │
│       │                                                                  │
│       ├──► useFormWizard (267 lines)                                    │
│       │         │                                                        │
│       │         └──► useCreateFormWizard (153 lines)                    │
│       │                                                                  │
│       ├──► useQuestionGeneration (230 lines)                            │
│       │         │                                                        │
│       │         └──► useQuestionSave (241 lines)                        │
│       │                                                                  │
│       └──► useCreateFormWithSteps (451 lines)                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Types Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       TYPE TRANSFORMATION FLOW                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  WIZARD FLOW:                                                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │ AI Response  │───►│ QuestionData │───►│ FormQuestion │              │
│  │ (AIQuestion) │    │ (+ isNew,    │    │ (DB entity)  │              │
│  │              │    │   isModified)│    │              │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│                                                                          │
│  TIMELINE FLOW:                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │ GraphQL      │───►│ FormStep     │───►│ FormStepInput│              │
│  │ Response     │    │ (UI model    │    │ (mutation    │              │
│  │              │    │  w/ question)│    │  input)      │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│        │                   │                                             │
│        │    stepTransform  │                                             │
│        └───────────────────┘                                             │
│        (in useFormStudioData)                                            │
│                                                                          │
│  TYPE LOCATIONS (current - scattered):                                   │
│  ├── features/createForm/models/    → QuestionData, FormData            │
│  ├── shared/stepCards/models/       → FormStep, StepContent             │
│  ├── shared/api/                    → AIQuestion, AIContext             │
│  └── entities/*/models/             → GraphQL-generated types           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Save Mechanism Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SAVE MECHANISM FLOW                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  USER EDITS TEXT FIELD                                                   │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────┐                                                    │
│  │ Watchers detect │ (useQuestionTextWatcher, useStepContentWatcher)    │
│  │ change          │                                                    │
│  └────────┬────────┘                                                    │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────┐                                                    │
│  │ Mark entity     │ useDirtyTracker.markDirty(entityType, id)         │
│  │ as dirty        │                                                    │
│  └────────┬────────┘                                                    │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────┐    ┌─────────────────┐                            │
│  │ User idle 500ms │───►│ Auto-save       │                            │
│  │ + hasPending    │    │ executes        │                            │
│  └─────────────────┘    └────────┬────────┘                            │
│                                  │                                       │
│                                  ▼                                       │
│  ┌───────────────────────────────────────────────────────────┐         │
│  │ Parallel execution of handlers:                           │         │
│  │ ├── saveFormInfo()     → updateFormAutoSave mutation      │         │
│  │ ├── saveQuestions()    → updateFormQuestionAutoSave       │         │
│  │ ├── saveOptions()      → upsertQuestionOptions            │         │
│  │ ├── saveSteps()        → updateFormStepAutoSave           │         │
│  │ └── saveFlows()        → updateFlow                       │         │
│  └───────────────────────────────────────────────────────────┘         │
│                                                                          │
│  DISCRETE ACTION (e.g., Add Step)                                        │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────┐                                                    │
│  │ Acquire lock    │ useSaveLock.withLock('add-step', ...)             │
│  └────────┬────────┘                                                    │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────┐                                                    │
│  │ Execute         │ addStepWithPersist()                               │
│  │ immediately     │ - Create question if needed                        │
│  └────────┬────────┘ - Create step                                      │
│           │          - Update local state                               │
│           ▼                                                              │
│  ┌─────────────────┐                                                    │
│  │ Release lock    │ Auto-save can resume                              │
│  └─────────────────┘                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Decision

**Refactor createForm composables to be FSD-compliant**, following these principles:

### Core Principles

1. **Entities own their data** — types, validation, single-entity functions, GraphQL operations
2. **Entities do NOT import from other entities** — cross-entity logic belongs in features
3. **Features orchestrate** — compose entities, manage UI state for workflows
4. **Features should be THIN** — if growing large, push logic down to entities

### Function Placement Rule

```
If function needs 1 entity type  → entities/{entity}/functions/
If function needs 2+ entity types → features/{feature}/functions/
```

### Target Architecture

```
entities/
├── form/
│   ├── models/index.ts              ← Form, FormData types
│   └── composables/mutations/
│
├── formStep/
│   ├── models/index.ts              ← FormStep type
│   ├── config/stepTypeRegistry.ts   ← Step type configuration (OCP fix)
│   ├── functions/
│   │   ├── stepValidation.ts        ← Single-entity functions only
│   │   └── stepTransform.ts
│   └── composables/
│       ├── mutations/
│       └── useStepPersistence.ts    ← Unified save strategy
│
├── formQuestion/
│   └── ...
│
└── flow/
    └── composables/mutations/
        └── useDisableBranching.ts   ← High-level operation

features/createForm/
├── functions/
│   └── buildStepsFromQuestions.ts   ← Multi-entity orchestration
│
├── composables/
│   ├── wizard/
│   │   ├── useWizardState.ts        ← Wizard screen state
│   │   └── useFormCreation.ts       ← Orchestrates entity calls
│   │
│   ├── timeline/
│   │   ├── useTimelineState.ts      ← UI state only
│   │   ├── useTimelineActions.ts    ← Thin orchestrator
│   │   └── useTimelineReader.ts     ← Read-only interface (ISP)
│   │
│   ├── branching/
│   │   ├── useBranchingState.ts
│   │   └── useBranchingActions.ts
│   │
│   └── design/
│       └── useDesignConfig.ts
│
└── ui/
```

### SOLID Fixes Applied

| Principle | Current Violation | Fix |
|-----------|-------------------|-----|
| **SRP** | `useTimelineEditor` does 6+ things | Split into focused composables |
| **OCP** | Step types hardcoded in 5+ files | `stepTypeRegistry` in entity |
| **LSP** | `addStep`/`addStepAsync`/`addStepWithPersist` | Single method + options |
| **ISP** | 80+ methods to all consumers | Separate Reader/Mutator/Control |
| **DIP** | Feature calls GraphQL directly | Entity provides high-level ops |

---

## Implementation Phases

| Phase | Scope | Effort | Risk | File |
|-------|-------|--------|------|------|
| **1** | Move types to entities | Low | Low | `phase-1-types-to-entities.md` |
| **2** | Add stepTypeRegistry | Low | Low | `phase-2-step-type-registry.md` |
| **3** | Create focused composables (ISP) | Medium | Low | `phase-3-focused-composables.md` |
| **4** | Extract multi-entity functions | Medium | Low | `phase-4-multi-entity-functions.md` |
| **5** | Split useTimelineEditor (SRP) | High | Medium | `phase-5-split-timeline-editor.md` |
| **6** | Unify save mechanism | High | Medium | `phase-6-unified-save.md` |

**Recommended approach:** Execute phases 1-4 first (low risk). Phases 5-6 can be done incrementally.

---

## Consequences

### Positive

- **Easier reasoning** — Each composable has single responsibility
- **Better testability** — Entity functions are pure, easily unit tested
- **Safer components** — Read-only components can't accidentally mutate
- **Extensibility** — New step types added via registry, not code changes
- **FSD compliance** — Clear layer boundaries, predictable imports

### Negative

- **Migration effort** — Significant refactoring across many files
- **Temporary complexity** — During migration, old and new patterns coexist
- **Learning curve** — Team needs to understand new patterns

### Neutral

- **More files** — But each file is smaller and focused
- **More imports** — But imports are explicit and traceable

---

## Success Criteria

| Metric | Current | Target |
|--------|---------|--------|
| `features/createForm/composables/` lines | ~7,100 | ~1,500 |
| Methods returned by main composable | 80+ | <15 per composable |
| Files to modify for new step type | 5+ | 1 (registry) |
| Entity-to-entity imports | Multiple | 0 |

---

## References

- [Feature-Sliced Design](https://feature-sliced.design/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- `docs/analysis/composables-architecture-review.md` — Full analysis with code examples
