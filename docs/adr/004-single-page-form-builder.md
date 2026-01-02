# ADR-004: Single-Page Form Builder Pattern

## Doc Connections
**ID**: `adr-004-single-page-form-builder`

2026-01-02-1400 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-003-form-autosave` - Form auto-save pattern (still applies)
- `prd-url-system-notion-inspired` - URL system with eager entity creation

---

## Status

**Accepted** - 2026-01-02

## Context

The form builder was originally implemented as a 4-step wizard:
1. Product Info → 2. AI Suggestions → 3. Customize Questions → 4. Preview/Publish

### Problems with Wizard Pattern

| Issue | Description |
|-------|-------------|
| **Resume complexity** | Need to track both step index AND data; which step to show on return? |
| **URL state confusion** | `?step=2` doesn't capture full state; form might not exist yet |
| **Back/forward friction** | Users must navigate steps to edit earlier sections |
| **Auto-save complexity** | Different save logic per step; questions only saved at step transitions |
| **Code duplication** | Form creation logic duplicated in AISuggestionsStep and CustomizeQuestionsStep |

### UX Research Findings

| App | Pattern | Key Insight |
|-----|---------|-------------|
| **Typeform** | Live editor | No wizard; immediate visual editing |
| **Tally** | Single page | Document-style, Notion-like blocks |
| **Linear** | Inline editing | All fields visible, edit in place |
| **NN/g Guidelines** | Wizard best for: | Infrequent, complex tasks with novice users |

For form creation (moderately frequent, not highly complex), a single-page approach with collapsible sections provides better UX.

## Decision

**Replace the 4-step wizard with a single-page layout featuring 3 collapsible sections:**

```
┌─────────────────────────────────────────────────────────────┐
│  📝 Form Name                                [Saved ✓]      │
├─────────────────────────────────────────────────────────────┤
│  ▼ Product Info                              [Complete ✓]  │
│    ┌─────────────────────────────────────────┐              │
│    │ Product name, description, focus areas │              │
│    │ [Generate Questions ✨]                 │              │
│    └─────────────────────────────────────────┘              │
│                                                             │
│  ▼ Questions                                 [5 questions]  │
│    ┌─────────────────────────────────────────┐              │
│    │ Question list + editor panel            │              │
│    │ [Regenerate] [+ Add] [Save Changes]     │              │
│    └─────────────────────────────────────────┘              │
│                                                             │
│  ▶ Preview & Publish                         [🔒 disabled]  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Section Behavior

| Section | Initial State | Enabled When | Auto-expands When |
|---------|---------------|--------------|-------------------|
| Product Info | Expanded | Always | New form created |
| Questions | Collapsed + disabled | Product info filled | After AI generation |
| Preview | Collapsed + disabled | Questions exist | After questions saved |

### Disabled Sections

- All 3 sections **always visible** (not hidden)
- Disabled sections show: grayed header + lock icon
- Clicking disabled section does nothing
- Clear visual hierarchy of what's needed next

### Data Flow

```
New Form:
1. User lands on /forms/:slug/edit (formId exists from /creating page)
2. Product Info section expanded (others disabled)
3. User fills product info → auto-save triggers
4. User clicks "Generate Questions"
   - Questions section auto-expands
   - Product Info collapses
5. AI returns questions → saved to DB immediately
   - Preview section becomes enabled
6. User edits questions → explicit save button
7. User expands Preview, clicks Publish

Edit Existing Form:
1. User lands on /forms/:slug/edit
2. Form + questions loaded from DB
3. Auto-expand based on state:
   - No questions? → Product Info
   - Has questions? → Preview (ready to publish)
4. User can expand any enabled section to edit
```

### URL State

Single-page URLs are simpler:
- `/forms/:slug/edit` - default view
- `/forms/:slug/edit?section=questions` - focus on questions section
- `/forms/:slug/edit?question=2` - open question editor panel

No need to track step state - page shows current reality.

### Save Behavior (from ADR-003, still applies)

| Data | Save Pattern | Trigger |
|------|--------------|---------|
| Product info | Auto-save | 500ms debounce |
| Questions | Auto-save | After AI generation |
| Question edits | Explicit save | "Save Changes" button |

## Consequences

### Positive

1. **Simpler resume**: Just load the page, auto-expand relevant section
2. **Cleaner URL state**: No step parameter needed
3. **Better overview**: Users see all sections, understand what's needed
4. **Easier editing**: Expand any section without navigation
5. **Less code**: 3 sections vs 4 steps, shared state management
6. **Fewer edge cases**: No "which step am I on" confusion

### Negative

1. **Refactoring effort**: Need to migrate existing wizard components
2. **Visual density**: More content visible (mitigated by collapse)
3. **Mobile considerations**: May need different layout for small screens

### Neutral

1. **Learning curve**: Users familiar with wizard may need adjustment
2. **Testing**: Need to test section interactions thoroughly

## Implementation

### New Files
- `ui/sections/ProductInfoSection.vue` (~120 lines)
- `ui/sections/QuestionsSection.vue` (~180 lines)
- `ui/sections/PreviewSection.vue` (~100 lines)
- `ui/FormSectionHeader.vue` (~80 lines)
- `composables/useFormSections.ts` (~60 lines)
- `composables/useQuestionGeneration.ts` (~120 lines)

### Modified Files
- `CreateFormFeature.vue` - Refactor to single-page layout
- `useCreateFormWizard.ts` - Remove step navigation, keep state
- `models/index.ts` - Add SectionId type, remove WizardStep

### Deprecated Files (delete after migration)
- `ui/steps/ProductInfoStep.vue`
- `ui/steps/AISuggestionsStep.vue`
- `ui/steps/CustomizeQuestionsStep.vue`
- `ui/steps/PreviewPublishStep.vue`

## References

- NN/g Wizard Guidelines: https://www.nngroup.com/articles/wizards/
- Typeform builder UX research (internal)
- ADR-003: Form Auto-Save Pattern
