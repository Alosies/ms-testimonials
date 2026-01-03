# Implementation Plan: Timeline Form Editor (ADR-006)

**Date**: 2026-01-03
**Status**: Planning
**Estimated Phases**: 6
**Reference**: `docs/adr/006-timeline-form-editor.md`

---

## Executive Summary

This plan transforms the form editor from a collapsible-section layout to a three-panel timeline editor inspired by PowerPoint/Keynote and Senja's "form as a journey" pattern. The goal is to give users a clear visualization of the customer journey while editing.

---

## Current State Analysis

### What We Have

| Component | Location | Purpose |
|-----------|----------|---------|
| `CreateFormFeature.vue` | `features/createForm/` | Main orchestrator (270 lines) |
| `ProductInfoSection.vue` | `ui/sections/` | Product name, description, focus areas |
| `QuestionsSection.vue` | `ui/sections/` | Question list with drag-reorder |
| `PreviewSection.vue` | `ui/sections/` | Preview + publish button |
| `QuestionEditorPanel.vue` | `ui/questionEditor/` | Slide-in panel for editing |
| `QuestionCard.vue` | `ui/questionEditor/` | Question list item |
| `AuthLayout.vue` | `layouts/` | Sidebar + main content area |

### Key Composables to Preserve/Extend

| Composable | Purpose | Reuse Strategy |
|------------|---------|----------------|
| `useFormEditor.ts` | Form data loading, save status | Extend for steps |
| `useQuestionEditorPanel.ts` | Question editing logic | Rename to `useStepEditorPanel.ts` |
| `useQuestionPanelUrl.ts` | URL-synced panel state | Extend for step types |
| `useFormAutoSave.ts` | Debounced auto-save | Keep as-is |
| `useQuestionGeneration.ts` | AI question generation | Keep as-is |
| `useCreateFormWizard.ts` | State management | Extend for steps |

### Design System Principles to Apply

From `docs/design-system/`:

1. **Progressive Disclosure** - Show info when relevant, hide when resolved
2. **Status Indicators** - Amber pills for unsaved, green for saved, disappearing confirmation
3. **Color Psychology** - Amber = attention, Emerald = success, Semantic colors only
4. **Typography** - `text-2xl font-semibold` for titles, `text-sm text-muted-foreground` for body
5. **Glassmorphism** - Optional for premium preview areas (not core UI)

---

## Target Architecture

### Three-Panel Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Forms          My First Form                  [Preview] [Publish]│
├───────────┬─────────────────────────────────────────────┬───────────────────┤
│           │                                             │                   │
│  STEPS    │              TIMELINE CANVAS                │  PROPERTIES       │
│  (80px)   │              (scrollable)                   │  (280px)          │
│           │                                             │                   │
│  ┌─────┐  │         ┌───────────────────────┐          │  Contextual help  │
│  │  1  │◀─│─────────│      Step Card        │          │  Tips editor      │
│  │ Welc│  │         │   (selected state)    │          │  Design settings  │
│  └─────┘  │         └───────────────────────┘          │                   │
│           │                    ┃                        │                   │
│  ┌─────┐  │                    ○                        │                   │
│  │  2  │  │                    ┃                        │                   │
│  │ Q1  │  │         ┌───────────────────────┐          │                   │
│  └─────┘  │         │      Step Card        │          │                   │
│           │         └───────────────────────┘          │                   │
│  ...      │                    ...                      │                   │
│           │                                             │                   │
│  ┌─────┐  │                                             │                   │
│  │  +  │  │                                             │                   │
│  │ Add │  │                                             │                   │
│  └─────┘  │                                             │                   │
└───────────┴─────────────────────────────────────────────┴───────────────────┘
```

### Component Hierarchy

```
FormEditorLayout.vue                  # New dedicated layout
├── FormEditorHeader.vue              # Top bar with back, title, actions
├── StepsSidebar.vue                  # Left panel
│   ├── StepThumbnail.vue             # Individual step button
│   └── InsertStepButton.vue          # Hover insert button
├── TimelineCanvas.vue                # Center panel
│   ├── TimelineConnector.vue         # Line + dot between steps
│   └── StepCard.vue                  # Individual step preview
│       ├── WelcomeStepCard.vue       # Welcome step variant
│       ├── QuestionStepCard.vue      # Question step variant
│       └── ThankYouStepCard.vue      # Thank you step variant
└── PropertiesPanel.vue               # Right panel
    ├── ContextualHelp.vue            # "What's this?" section
    ├── QuestionTips.vue              # Tips editor (for questions)
    └── DesignSettings.vue            # Theme/color settings
```

---

## Data Model Changes

### New Step-Based Model

**Principle**: Use codegen-generated types from GraphQL wherever possible. Only define custom interfaces for JSONB content (which can't be typed by Hasura).

#### Generated Types (from Hasura codegen)

After creating the `form_steps` and `contacts` tables, run `pnpm codegen:web` to generate:

```typescript
// @/shared/graphql/generated/operations (AUTO-GENERATED)

// Base row type from form_steps table
export type Form_Steps = {
  id: string;
  form_id: string;
  organization_id: string;
  step_type: string;           // DB constraint ensures valid values
  step_order: number;
  question_id?: string | null;
  content: unknown;            // JSONB - needs manual typing
  tips?: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relationships (if included in query)
  form?: Forms;
  question?: Form_Questions;
};

// Base row type from contacts table
export type Contacts = {
  id: string;
  organization_id: string;
  email: string;
  email_verified: boolean;
  name?: string | null;
  avatar_url?: string | null;
  job_title?: string | null;
  company_name?: string | null;
  company_website?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  source: string;
  first_seen_at: string;
  last_seen_at: string;
  submission_count: number;
};
```

#### Custom Types (JSONB content only)

```typescript
// features/createForm/models/stepContent.ts

// Re-export generated types for convenience
export type { Form_Steps, Contacts } from '@/shared/graphql/generated/operations';

// Step type literal union (mirrors DB constraint)
export type StepType =
  | 'welcome'
  | 'question'
  | 'rating'
  | 'consent'
  | 'contact_info'
  | 'reward'
  | 'thank_you';

// =================================================================
// JSONB Content Interfaces (can't be generated - JSONB is schemaless)
// =================================================================

export interface WelcomeContent {
  title: string;
  subtitle: string;
  buttonText: string;
}

export interface ConsentContent {
  title: string;
  description: string;
  options: {
    public: { label: string; description: string };
    private: { label: string; description: string };
  };
  defaultOption: 'public' | 'private';
  required: boolean;
}

// Simplified: Just track which fields are enabled/required
// Per-field labels/placeholders are over-engineering for MVP
export type ContactField = 'name' | 'email' | 'photo' | 'jobTitle' | 'company' | 'website' | 'linkedin' | 'twitter';

export interface ContactInfoContent {
  title: string;
  subtitle?: string;
  enabledFields: ContactField[];   // Which fields to show
  requiredFields: ContactField[];  // Subset of enabledFields that are mandatory
}

export interface RewardContent {
  title: string;
  description: string;
  rewardType: 'coupon' | 'download' | 'link' | 'custom';
  couponCode?: string;
  couponDescription?: string;
  downloadUrl?: string;
  downloadLabel?: string;
  linkUrl?: string;
  linkLabel?: string;
  customHtml?: string;
}

export interface ThankYouContent {
  title: string;
  message: string;
  showSocialShare: boolean;
  socialShareMessage?: string;
  redirectUrl?: string;
  redirectDelay?: number;
}

// Union of all content types
export type StepContent =
  | WelcomeContent
  | ConsentContent
  | ContactInfoContent
  | RewardContent
  | ThankYouContent;

// =================================================================
// Type-Safe Step Accessor (narrows JSONB content by step_type)
// =================================================================

// Typed step that extends generated type with narrowed content
export interface TypedFormStep<T extends StepType = StepType> extends Omit<Form_Steps, 'content' | 'step_type'> {
  step_type: T;
  content: T extends 'welcome' ? WelcomeContent
         : T extends 'consent' ? ConsentContent
         : T extends 'contact_info' ? ContactInfoContent
         : T extends 'reward' ? RewardContent
         : T extends 'thank_you' ? ThankYouContent
         : T extends 'question' | 'rating' ? Record<string, never>  // Empty - data in form_questions
         : never;
}

// Type guards for narrowing
export function isWelcomeStep(step: Form_Steps): step is TypedFormStep<'welcome'> {
  return step.step_type === 'welcome';
}

export function isQuestionStep(step: Form_Steps): step is TypedFormStep<'question'> {
  return step.step_type === 'question';
}

export function isRatingStep(step: Form_Steps): step is TypedFormStep<'rating'> {
  return step.step_type === 'rating';
}

export function isConsentStep(step: Form_Steps): step is TypedFormStep<'consent'> {
  return step.step_type === 'consent';
}

export function isContactInfoStep(step: Form_Steps): step is TypedFormStep<'contact_info'> {
  return step.step_type === 'contact_info';
}

export function isRewardStep(step: Form_Steps): step is TypedFormStep<'reward'> {
  return step.step_type === 'reward';
}

export function isThankYouStep(step: Form_Steps): step is TypedFormStep<'thank_you'> {
  return step.step_type === 'thank_you';
}

// =================================================================
// Local UI State (not persisted)
// =================================================================

export interface FormStepWithUIState extends Form_Steps {
  // Local editing state
  isNew?: boolean;
  isModified?: boolean;
}
```

#### Usage Example

```typescript
// In composable or component
import type { Form_Steps } from '@/shared/graphql/generated/operations';
import { isWelcomeStep, isQuestionStep, type WelcomeContent } from '../models/stepContent';

function renderStep(step: Form_Steps) {
  if (isWelcomeStep(step)) {
    // TypeScript knows step.content is WelcomeContent
    console.log(step.content.title);
    console.log(step.content.buttonText);
  }

  if (isQuestionStep(step)) {
    // TypeScript knows step.question exists
    console.log(step.question?.question_text);
  }
}
```

#### What's Generated vs Custom

| Type | Source | Reason |
|------|--------|--------|
| `Form_Steps` | Generated | Table columns are typed |
| `Contacts` | Generated | Table columns are typed |
| `Form_Questions` | Generated | Already exists |
| `StepType` | Custom | Literal union for type safety |
| `WelcomeContent` | Custom | JSONB is schemaless |
| `ConsentContent` | Custom | JSONB is schemaless |
| `ContactInfoContent` | Custom | JSONB is schemaless |
| `RewardContent` | Custom | JSONB is schemaless |
| `ThankYouContent` | Custom | JSONB is schemaless |
| `TypedFormStep<T>` | Custom | Narrows JSONB by step_type |
| Type guards | Custom | Runtime type narrowing |

### Migration Strategy

The current `QuestionData` model maps to the new `FormStep` with `type: 'question'`:

```typescript
// Adapter function for migration
function questionToStep(question: QuestionData, index: number): FormStep {
  return {
    id: question.id || generateTempId(),
    type: 'question',
    order: index + 1,  // +1 to account for Welcome step at 0
    content: {
      question_text: question.question_text,
      question_key: question.question_key,
      question_type_id: question.question_type,
      placeholder: question.placeholder,
      helper_text: question.helper_text,
      is_required: question.is_required,
      options: question.options,
      min_value: question.min_value,
      max_value: question.max_value,
      scale_min_label: question.scale_min_label,
      scale_max_label: question.scale_max_label,
    },
    isNew: question.isNew,
    isModified: question.isModified,
  };
}
```

---

## Implementation Phases

### Phase 1: Foundation (Layout + Routing)

**Goal**: Create the dedicated form editor layout that replaces AuthLayout for form editing.

**New Files**:
```
apps/web/src/layouts/
└── FormEditorLayout.vue              # Three-panel layout shell

apps/web/src/features/createForm/ui/
└── FormEditorHeader.vue              # Top bar component
```

**Changes**:
- Update `pages/[org]/forms/[urlSlug]/edit.vue` to use `FormEditorLayout`
- Add "← Back to Forms" navigation with unsaved changes warning

**Tasks**:
1. Create `FormEditorLayout.vue` with three-column grid
2. Create `FormEditorHeader.vue` with back button, editable title, save status, actions
3. Update page to use new layout
4. Implement unsaved changes navigation guard

**Component Skeleton** (`FormEditorLayout.vue`):
```vue
<template>
  <div class="flex h-screen flex-col bg-background">
    <!-- Header -->
    <FormEditorHeader />

    <!-- Three-panel body -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Left: Steps Sidebar -->
      <aside class="w-20 shrink-0 border-r border-border bg-muted/30">
        <slot name="steps-sidebar" />
      </aside>

      <!-- Center: Timeline Canvas -->
      <main class="flex-1 overflow-y-auto bg-muted/10">
        <slot name="timeline" />
      </main>

      <!-- Right: Properties Panel -->
      <aside class="w-72 shrink-0 border-l border-border">
        <slot name="properties" />
      </aside>
    </div>
  </div>
</template>
```

---

### Phase 2: Steps Sidebar

**Goal**: Create the left navigation panel with step thumbnails.

**New Files**:
```
apps/web/src/features/createForm/ui/
└── stepsSidebar/
    ├── StepsSidebar.vue              # Container component
    ├── StepThumbnail.vue             # Individual step button
    ├── InsertStepButton.vue          # Hover-reveal insert button
    └── StepTypePicker.vue            # Popover for choosing step type
```

**Tasks**:
1. Create `StepsSidebar.vue` with scrollable step list
2. Create `StepThumbnail.vue` with:
   - Step number badge
   - Abbreviated label (Welc, Q1, Q2, Thx)
   - Selected state (ring-2 ring-primary)
   - Unsaved indicator (amber dot)
3. Create `InsertStepButton.vue` that appears on hover between steps
4. Create `StepTypePicker.vue` popover with step type options
5. Implement click-to-scroll behavior

**UX Patterns**:
- Selected step: `ring-2 ring-primary bg-primary/5`
- Unsaved step: Small amber dot in corner
- Hover between: Dashed `+ Insert` button fades in

---

### Phase 3: Timeline Canvas

**Goal**: Create the center scrollable area with step cards and connectors.

**New Files**:
```
apps/web/src/features/createForm/ui/
└── timelineCanvas/
    ├── TimelineCanvas.vue            # Scrollable container
    ├── TimelineConnector.vue         # Vertical line + connection dot
    ├── StepCard.vue                  # Base step card component
    └── stepCards/
        ├── WelcomeStepCard.vue       # Welcome step preview
        ├── QuestionStepCard.vue      # Question step preview
        ├── RatingStepCard.vue        # Rating step preview
        ├── ConsentStepCard.vue       # Consent step preview
        ├── ContactInfoStepCard.vue   # Contact info step preview
        ├── RewardStepCard.vue        # Reward step preview
        └── ThankYouStepCard.vue      # Thank you step preview
```

**Tasks**:
1. Create `TimelineCanvas.vue` with vertical layout and scroll sync
2. Create `TimelineConnector.vue` (vertical line with connection dot)
3. Create base `StepCard.vue` with:
   - Selected state styling
   - "Edit Content" button
   - Live preview content
4. Create specialized step cards (7 total):
   - `WelcomeStepCard.vue`: Title, subtitle, button text preview
   - `QuestionStepCard.vue`: Question text, type icon, placeholder
   - `RatingStepCard.vue`: Star/scale preview with labels
   - `ConsentStepCard.vue`: Public/private options preview
   - `ContactInfoStepCard.vue`: Enabled fields preview
   - `RewardStepCard.vue`: Reward type and description preview
   - `ThankYouStepCard.vue`: Thank you message, social share preview
5. Implement scroll-to-step when sidebar item clicked

**Visual Design**:
```
Step Card:
┌──────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────┐  │
│  │                                            │  │
│  │         Preview Content Here               │  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  [Edit Content]                          [≡ ✕]  │
└──────────────────────────────────────────────────┘
           ┃
           ○  ← Connection dot (hover: + insert)
           ┃
```

---

### Phase 4: Properties Panel

**Goal**: Create the right panel with contextual help, tips editor, and design settings.

**New Files**:
```
apps/web/src/features/createForm/ui/
└── propertiesPanel/
    ├── PropertiesPanel.vue           # Container with sections
    ├── ContextualHelp.vue            # "What's this?" collapsible
    ├── QuestionTips.vue              # Tips list with add/edit/remove
    └── DesignSettings.vue            # Theme, color, logo settings
```

**Tasks**:
1. Create `PropertiesPanel.vue` that shows content based on selected step
2. Create `ContextualHelp.vue` with step-type-specific explanations:
   - Welcome: "Introduce your form and set expectations for the customer"
   - Question: "Collect testimonial content with guided prompts"
   - Rating: "Gauge customer satisfaction before collecting testimonial"
   - Consent: "Let customers choose how their testimonial is shared"
   - Contact Info: "Collect customer details for attribution"
   - Reward: "Incentivize customers with coupons, downloads, or links"
   - Thank You: "Thank customers and encourage social sharing"
3. Create `QuestionTips.vue` with:
   - Draggable tip items
   - Add tip button
   - Inline editing
   - Delete button
4. Create `DesignSettings.vue` (placeholder for future branding feature)

**UX Patterns**:
- Collapsible sections with smooth animations
- Tips use `text-sm text-muted-foreground`
- Add button uses ghost variant

---

### Phase 5: Step Editor Slide-In

**Goal**: Refactor the existing question editor to support all step types.

**Refactored Files**:
```
apps/web/src/features/createForm/ui/
└── stepEditor/
    ├── StepEditorSlideIn.vue         # Main slide-in panel (refactored from QuestionEditorPanel)
    ├── StepEditorHeader.vue          # Navigation + actions
    └── editors/
        ├── WelcomeStepEditor.vue     # Welcome step form fields
        ├── QuestionStepEditor.vue    # Question step form fields (existing logic)
        ├── RatingStepEditor.vue      # Rating step form fields
        ├── ConsentStepEditor.vue     # Consent step form fields
        ├── ContactInfoStepEditor.vue # Contact info step form fields
        ├── RewardStepEditor.vue      # Reward step form fields
        └── ThankYouStepEditor.vue    # Thank you step form fields
```

**Tasks**:
1. Rename `QuestionEditorPanel.vue` → `StepEditorSlideIn.vue`
2. Create step type router component
3. Extract `QuestionStepEditor.vue` from existing code
4. Create `WelcomeStepEditor.vue`:
   - Title field
   - Subtitle field (with rich text)
   - Button text field
5. Create `RatingStepEditor.vue`:
   - Question text field
   - Scale type selector (star, number, nps)
   - Min/max value fields
6. Create `ConsentStepEditor.vue`:
   - Title and description fields
   - Public/private option labels and descriptions
   - Default option selector
7. Create `ContactInfoStepEditor.vue`:
   - Title and subtitle fields
   - Field toggles (name, email, photo, jobTitle, company, website, socialUrl)
   - Per-field required toggles and custom labels
8. Create `RewardStepEditor.vue`:
   - Title and description fields
   - Reward type selector (coupon, download, link, custom)
   - Conditional fields based on reward type
9. Create `ThankYouStepEditor.vue`:
   - Title field
   - Message field
   - Social share toggle
   - Optional redirect URL and delay
10. Update composables:
   - Rename `useQuestionEditorPanel.ts` → `useStepEditorPanel.ts`
   - Add step type handling

**Existing Logic to Preserve**:
- Keyboard navigation (Arrow Up/Down, Enter, Cmd+S)
- URL-synced panel state
- Auto-focus on open
- Live preview updates

---

### Phase 6: State Management + Integration

**Goal**: Wire everything together with proper state management.

**CRITICAL**: Follow SOLID principles with strict size limits:
- **Components**: Max 250 lines
- **Composables**: Max 300 lines

---

#### Composable Architecture (Single Responsibility)

Each composable does ONE thing well. Large orchestrators compose smaller composables.

```
apps/web/src/features/createForm/composables/
│
├── timeline/                          # Timeline editor domain
│   ├── useTimelineEditor.ts           # Orchestrator (~150 lines)
│   ├── useStepState.ts                # Reactive steps array (~80 lines)
│   ├── useStepNavigation.ts           # Selection + scrolling (~100 lines)
│   ├── useStepOperations.ts           # CRUD operations (~120 lines)
│   ├── useStepReorder.ts              # Drag-drop reordering (~80 lines)
│   └── useStepUrlSync.ts              # URL param sync (~60 lines)
│
├── stepEditor/                        # Step editing domain
│   ├── useStepEditorPanel.ts          # Panel orchestrator (~150 lines)
│   ├── useStepEditorState.ts          # Local editing state (~80 lines)
│   ├── useStepEditorKeyboard.ts       # Keyboard shortcuts (~60 lines)
│   └── useStepEditorNavigation.ts     # Prev/next navigation (~50 lines)
│
├── stepContent/                       # Content type handlers
│   ├── useWelcomeContent.ts           # Welcome step defaults (~50 lines)
│   ├── useConsentContent.ts           # Consent step defaults (~60 lines)
│   ├── useContactInfoContent.ts       # Contact info defaults (~80 lines)
│   ├── useRewardContent.ts            # Reward step defaults (~70 lines)
│   └── useThankYouContent.ts          # Thank you defaults (~50 lines)
│
├── persistence/                       # Data persistence
│   ├── useStepAutoSave.ts             # Debounced auto-save (~100 lines)
│   ├── useStepMutations.ts            # GraphQL mutations (~80 lines)
│   └── useStepQueries.ts              # GraphQL queries (~60 lines)
│
└── index.ts                           # Barrel exports
```

**Composable Responsibility Matrix**:

| Composable | Responsibility | ~Lines |
|------------|---------------|--------|
| `useTimelineEditor` | Orchestrates, composes others | 150 |
| `useStepState` | Reactive `steps` ref, dirty tracking | 80 |
| `useStepNavigation` | selectedIndex, scrollToStep | 100 |
| `useStepOperations` | add, remove, update, duplicate | 120 |
| `useStepReorder` | Drag-drop with array manipulation | 80 |
| `useStepUrlSync` | URL query param sync | 60 |
| `useStepEditorPanel` | Panel open/close, mode | 150 |
| `useStepEditorState` | Local step copy, validation | 80 |
| `useStepEditorKeyboard` | ⌘S, ↑/↓, Escape handlers | 60 |
| `useStepAutoSave` | Debounced save, status | 100 |

**Composition Pattern Example**:

```typescript
// useTimelineEditor.ts (~150 lines max)
// Orchestrator that composes smaller composables

export function useTimelineEditor(formId: Ref<string | null>) {
  // Compose from single-responsibility composables
  const { steps, markDirty, clearDirty } = useStepState();
  const { selectedIndex, selectStep, scrollToStep } = useStepNavigation();
  const { addStep, removeStep, updateStep } = useStepOperations(steps);
  const { reorderSteps } = useStepReorder(steps);
  const { saveStatus, saveSteps } = useStepAutoSave(formId, steps);

  // Thin orchestration logic only
  async function handleAddStep(type: StepType, afterIndex?: number) {
    const newStep = addStep(type, afterIndex);
    selectStep(steps.value.indexOf(newStep));
    scrollToStep(selectedIndex.value);
  }

  return {
    steps: readonly(steps),
    selectedIndex,
    saveStatus,
    selectStep,
    handleAddStep,
    removeStep,
    updateStep,
    reorderSteps,
    saveSteps,
  };
}
```

---

#### Component Architecture (Max 250 lines each)

**Splitting Strategy**:

| If component grows... | Split into... |
|-----------------------|---------------|
| Multiple responsibilities | Child components by responsibility |
| Complex template logic | Computed properties or child components |
| Repeated patterns | Extracted reusable components |
| Long script setup | Extract logic to composables |

**Component Size Estimates**:

| Component | Responsibility | ~Lines |
|-----------|---------------|--------|
| `FormEditorLayout.vue` | Three-panel shell, slots | 80 |
| `FormEditorHeader.vue` | Title, save status, actions | 120 |
| `StepsSidebar.vue` | Step list container | 100 |
| `StepThumbnail.vue` | Single step button | 80 |
| `InsertStepButton.vue` | Hover insert trigger | 60 |
| `TimelineCanvas.vue` | Scroll container | 100 |
| `TimelineConnector.vue` | Line + dot | 40 |
| `StepCard.vue` | Base card with slot | 80 |
| `WelcomeStepCard.vue` | Welcome preview | 60 |
| `QuestionStepCard.vue` | Question preview | 80 |
| `PropertiesPanel.vue` | Right panel container | 120 |
| `ContextualHelp.vue` | Step-type help text | 80 |
| `QuestionTips.vue` | Tips CRUD list | 150 |
| `StepEditorSlideIn.vue` | Editor panel shell | 100 |
| `WelcomeStepEditor.vue` | Welcome form fields | 100 |
| `QuestionStepEditor.vue` | Question form fields | 200 |
| `ContactInfoStepEditor.vue` | Field config toggles | 180 |

---

#### Data Flow

```
User Action → useStepOperations → useStepState.steps → Components re-render
                                         ↓
                               useStepAutoSave → useStepMutations → GraphQL
```

---

#### Tasks

1. **Create timeline composables** (in `composables/timeline/`):
   - `useStepState.ts` - Reactive steps array
   - `useStepOperations.ts` - CRUD operations
   - `useStepNavigation.ts` - Selection + scrolling
   - `useStepReorder.ts` - Drag-drop
   - `useStepUrlSync.ts` - URL sync
   - `useTimelineEditor.ts` - Orchestrator

2. **Create stepEditor composables** (in `composables/stepEditor/`):
   - `useStepEditorState.ts` - Local editing state
   - `useStepEditorKeyboard.ts` - Shortcuts
   - `useStepEditorPanel.ts` - Panel orchestrator

3. **Create stepContent composables** (in `composables/stepContent/`):
   - Default content factories for each step type

4. **Create persistence composables** (in `composables/persistence/`):
   - `useStepQueries.ts` - Load steps
   - `useStepMutations.ts` - Save steps
   - `useStepAutoSave.ts` - Debounced save

---

## File Structure Summary

```
apps/web/src/
├── layouts/
│   ├── AuthLayout.vue                # Existing (unchanged)
│   ├── UnauthLayout.vue              # Existing (unchanged)
│   └── FormEditorLayout.vue          # NEW: Three-panel layout
│
├── pages/[org]/forms/[urlSlug]/
│   └── edit.vue                      # MODIFIED: Use FormEditorLayout
│
└── features/createForm/
    ├── CreateFormFeature.vue         # REFACTORED: Timeline orchestrator
    │
    ├── composables/
    │   ├── useTimelineEditor.ts      # NEW: Main state management
    │   ├── useStepNavigation.ts      # NEW: Selection + scrolling
    │   ├── useStepOperations.ts      # NEW: Step CRUD
    │   ├── useStepEditorPanel.ts     # RENAMED from useQuestionEditorPanel
    │   ├── useFormEditor.ts          # MODIFIED: Support steps
    │   ├── useFormAutoSave.ts        # KEEP: Still used
    │   ├── useQuestionGeneration.ts  # KEEP: AI generation
    │   └── useQuestionPanelUrl.ts    # DEPRECATED (merged into useStepNavigation)
    │
    ├── models/
    │   └── index.ts                  # MODIFIED: Add step types
    │
    └── ui/
        ├── FormEditorHeader.vue      # NEW
        │
        ├── stepsSidebar/             # NEW
        │   ├── StepsSidebar.vue
        │   ├── StepThumbnail.vue
        │   ├── InsertStepButton.vue
        │   └── StepTypePicker.vue
        │
        ├── timelineCanvas/           # NEW
        │   ├── TimelineCanvas.vue
        │   ├── TimelineConnector.vue
        │   ├── StepCard.vue
        │   └── stepCards/
        │       ├── WelcomeStepCard.vue
        │       ├── QuestionStepCard.vue
        │       └── ThankYouStepCard.vue
        │
        ├── propertiesPanel/          # NEW
        │   ├── PropertiesPanel.vue
        │   ├── ContextualHelp.vue
        │   ├── QuestionTips.vue
        │   └── DesignSettings.vue
        │
        ├── stepEditor/               # NEW (refactored from questionEditor)
        │   ├── StepEditorSlideIn.vue
        │   ├── StepEditorHeader.vue
        │   └── editors/
        │       ├── WelcomeStepEditor.vue
        │       ├── QuestionStepEditor.vue
        │       ├── RatingStepEditor.vue
        │       └── ThankYouStepEditor.vue
        │
        ├── questionEditor/           # DEPRECATED (migrated to stepEditor)
        │   └── ...
        │
        └── sections/                 # DEPRECATED (replaced by timeline)
            └── ...
```

---

## Database Schema Analysis

### Existing Tables (from GraphQL introspection)

**`forms`** - Core form entity
| Column | Type | Purpose |
|--------|------|---------|
| `id` | String! | NanoID 12-char |
| `name` | String! | Form display name |
| `slug` | String! | URL-friendly identifier |
| `product_name` | String! | Product being reviewed |
| `product_description` | String | AI context for question generation |
| `settings` | jsonb! | UI preferences (theme, branding) |
| `status` | String! | draft / published / archived |
| `organization_id` | String! | Tenant boundary |

**`form_questions`** - Question definitions
| Column | Type | Purpose |
|--------|------|---------|
| `id` | String! | NanoID 12-char |
| `form_id` | String! | Parent form |
| `question_key` | String! | Semantic identifier (problem, solution, result) |
| `question_text` | String! | Display text for customer |
| `question_type_id` | String! | FK to question_types |
| `display_order` | smallint! | Order in form |
| `is_required` | Boolean! | Mandatory answer |
| `placeholder` | String | Input placeholder hint |
| `help_text` | String | Tooltip explanation |
| `min_value/max_value` | Int | Rating bounds |
| `scale_min_label/scale_max_label` | String | Rating labels |

**`form_submissions`** - Customer submissions with contact info
| Column | Type | Purpose |
|--------|------|---------|
| `submitter_name` | String! | Customer full name |
| `submitter_email` | String! | Customer email (not public) |
| `submitter_avatar_url` | String | Profile photo |
| `submitter_company` | String | Company name |
| `submitter_title` | String | Job title |
| `submitter_linkedin_url` | String | LinkedIn profile |
| `submitter_twitter_url` | String | Twitter/X profile |

**`question_types`** - 16 seed types with validation rules
- Categories: `text`, `rating`, `choice`, `media`, `input`, `special`
- Includes `special_hidden` for non-displayed fields

---

### Database Strategy for Step Types

#### Recommended: `form_steps` Table

**Why not use `forms.settings`?**
The existing `forms.settings` JSONB is documented as "UI preferences only (theme colors, branding) - NOT business logic." Step configuration IS business logic - it determines form flow, required fields, and validation. We should keep this separation clean.

```sql
-- =================================================================
-- MIGRATION: form_steps table
-- =================================================================
CREATE TABLE form_steps (
  id TEXT NOT NULL DEFAULT generate_nanoid_12(),
  form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id),

  -- Step identification
  step_type TEXT NOT NULL CHECK (step_type IN (
    'welcome', 'question', 'rating', 'consent',
    'contact_info', 'reward', 'thank_you'
  )),
  step_order SMALLINT NOT NULL,

  -- For 'question'/'rating' types, links to detailed validation config
  question_id TEXT REFERENCES form_questions(id) ON DELETE CASCADE,

  -- For non-question types, JSONB content (typed per step_type)
  content JSONB NOT NULL DEFAULT '{}',

  -- Tips shown to customer (applicable to question/rating steps)
  tips TEXT[] DEFAULT '{}',

  -- Soft delete
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Audit columns
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT REFERENCES users(id),
  updated_by TEXT REFERENCES users(id),

  PRIMARY KEY (id),
  UNIQUE (form_id, step_order),  -- Enforce order uniqueness per form

  -- Constraint: question_id required for question/rating types
  CONSTRAINT form_steps_question_id_check CHECK (
    (step_type IN ('question', 'rating') AND question_id IS NOT NULL) OR
    (step_type NOT IN ('question', 'rating') AND question_id IS NULL)
  )
);

-- Indexes
CREATE INDEX idx_form_steps_form_id ON form_steps(form_id);
CREATE INDEX idx_form_steps_question_id ON form_steps(question_id);

-- Trigger for updated_at
CREATE TRIGGER set_form_steps_updated_at
  BEFORE UPDATE ON form_steps
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

**Data Model:**

| step_type | question_id | content (JSONB) |
|-----------|-------------|-----------------|
| `welcome` | NULL | `WelcomeContent` |
| `question` | FK to form_questions | `{}` (validation in form_questions) |
| `rating` | FK to form_questions | `{}` (min/max in form_questions) |
| `consent` | NULL | `ConsentContent` |
| `contact_info` | NULL | `ContactInfoContent` |
| `reward` | NULL | `RewardContent` |
| `thank_you` | NULL | `ThankYouContent` |

**Benefits:**
- Clean separation: `forms.settings` stays UI-only
- Single source of truth for step ordering
- Question steps link to `form_questions` for typed validation
- Non-question content is typed JSONB per `step_type`
- Supports future step types easily

---

### Contacts Table (Normalized Contact Data)

**Why not keep contact info flat on `form_submissions`?**
- Same person submitting multiple forms = duplicated data
- Can't enrich/update contact data centrally
- No identity resolution across submissions
- Future CRM features would require refactoring

```sql
-- =================================================================
-- MIGRATION: contacts table
-- =================================================================
CREATE TABLE contacts (
  id TEXT NOT NULL DEFAULT generate_nanoid_12(),
  organization_id TEXT NOT NULL REFERENCES organizations(id),

  -- Primary identifier (unique per org)
  email TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT false,

  -- Profile information
  name TEXT,
  avatar_url TEXT,
  job_title TEXT,
  company_name TEXT,
  company_website TEXT,

  -- Social profiles
  linkedin_url TEXT,
  twitter_url TEXT,

  -- Source tracking
  source TEXT NOT NULL DEFAULT 'form_submission',  -- 'form_submission', 'import', 'manual'
  source_form_id TEXT REFERENCES forms(id),        -- First form they submitted

  -- Activity tracking
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submission_count INT NOT NULL DEFAULT 1,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (id),
  UNIQUE (organization_id, email)  -- One contact per email per org
);

-- Indexes
CREATE INDEX idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX idx_contacts_email ON contacts(email);

-- Update form_submissions to reference contact
ALTER TABLE form_submissions
  ADD COLUMN contact_id TEXT REFERENCES contacts(id);

-- Index for the new FK
CREATE INDEX idx_form_submissions_contact_id ON form_submissions(contact_id);
```

**Data Flow:**

```
Customer fills Contact Info step
         ↓
┌─────────────────────────────────────────┐
│ API: UPSERT contact by (org_id, email)  │
│   - Create if new                       │
│   - Update profile if existing          │
│   - Increment submission_count          │
│   - Update last_seen_at                 │
└─────────────────────────────────────────┘
         ↓
Link form_submission.contact_id → contacts.id
```

**Contact Info Step Mapping:**

The `ContactInfoContent` in `form_steps.content` is **CONFIGURATION** (which fields to show).
The `contacts` table stores **ACTUAL DATA** submitted by customers.

| ContactField (config) | contacts Column (data) |
|-----------------------|------------------------|
| `name` | `name` |
| `email` | `email` |
| `photo` | `avatar_url` |
| `jobTitle` | `job_title` |
| `company` | `company_name` |
| `website` | `company_website` |
| `linkedin` | `linkedin_url` |
| `twitter` | `twitter_url` |

**Example Config vs Data:**

```typescript
// form_steps.content for contact_info step (CONFIGURATION)
{
  "title": "About You",
  "subtitle": "Tell us a bit about yourself",
  "enabledFields": ["name", "email", "company"],  // Only show these 3 fields
  "requiredFields": ["email"]                      // Email is mandatory
}

// contacts table row (ACTUAL DATA from customer)
{
  "id": "abc123",
  "email": "john@acme.com",      // Required - customer entered this
  "name": "John Doe",            // Optional - customer entered this
  "company_name": "Acme Inc",    // Optional - customer entered this
  "avatar_url": null,            // Not shown (not in enabledFields)
  "job_title": null,             // Not shown (not in enabledFields)
  ...
}
```

**Benefits:**
- Deduplication: Same customer across forms = one record
- Enrichment: Add Clearbit data, verify email once per contact
- Analytics: "How many unique contacts?" vs "How many submissions?"
- CRM foundation: Contacts become first-class entities
- Future: Contact merging, lead scoring, segments

---

### Consent Step Data Flow

Add consent tracking to submissions:

```sql
-- Add to form_submissions
ALTER TABLE form_submissions
  ADD COLUMN consent_public BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN consent_given_at TIMESTAMPTZ;
```

The consent step content configures the UI, the choice is stored per submission.

---

### Reward Step Data

Rewards are configuration only (no customer data stored):

```typescript
// Stored in form_steps.content for step_type='reward'
interface RewardContent {
  title: string;
  description: string;
  rewardType: 'coupon' | 'download' | 'link' | 'custom';
  couponCode?: string;        // Displayed to customer after submit
  downloadUrl?: string;       // File URL for downloads
  linkUrl?: string;           // External link
  customHtml?: string;        // Custom reward message
}
```

Future: Track reward redemptions in a separate `reward_redemptions` table.

---

### Migration Strategy

**Phase 1: Create new tables (non-breaking)**
1. Create `form_steps` table
2. Create `contacts` table
3. Add `contact_id` to `form_submissions` (nullable)
4. Add `consent_public` to `form_submissions`

**Phase 2: Migrate existing data**
1. Create `form_steps` records from existing `form_questions.display_order`
2. Create default welcome/thank_you steps for existing forms
3. Migrate `form_submissions.submitter_*` to `contacts`
4. Backfill `form_submissions.contact_id`

**Phase 3: Update application code**
1. New form editor writes to `form_steps`
2. Form submission creates/updates `contacts`
3. Public form renderer uses `form_steps` for ordering

**Phase 4: Cleanup (optional)**
1. Deprecate `form_questions.display_order` (order now in `form_steps`)
2. Consider removing `submitter_*` columns from `form_submissions` (data in `contacts`)

---

## Feature Flag Strategy

```typescript
// shared/config/featureFlags.ts
export const FEATURE_FLAGS = {
  FORM_EDITOR_V2: import.meta.env.VITE_FEATURE_FORM_EDITOR_V2 === 'true',
};
```

```vue
<!-- pages/[org]/forms/[urlSlug]/edit.vue -->
<template>
  <FormEditorLayoutV2 v-if="FEATURE_FLAGS.FORM_EDITOR_V2">
    <TimelineFormEditor :form-id="formId" />
  </FormEditorLayoutV2>
  <AuthLayout v-else>
    <CreateFormFeature :existing-form-id="formId" />
  </AuthLayout>
</template>
```

---

## Testing Strategy

### Unit Tests

| Component | Test Cases |
|-----------|------------|
| `StepThumbnail` | Renders step number, selected state, unsaved indicator |
| `TimelineConnector` | Renders line and dot, insert button on hover |
| `StepCard` | Renders correct variant based on type |
| `useStepOperations` | Add/remove/reorder correctly updates array |
| `useStepNavigation` | URL sync works, scroll functions called |

### Integration Tests

| Flow | Test Cases |
|------|------------|
| Step Selection | Click thumbnail → canvas scrolls → properties update |
| Add Step | Click insert → picker shows → step added at position |
| Edit Step | Click edit → slide-in opens → changes saved |
| Reorder Steps | Drag thumbnail → order updates → saved |

### E2E Tests (Playwright)

1. Create new form → has default Welcome + Thank You steps
2. Add question step → appears in timeline
3. Edit question → changes persist after refresh
4. Reorder steps → order preserved
5. Preview mode → sidebars hidden
6. Publish → form accessible at public URL

---

## Accessibility Considerations

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate steps in sidebar |
| `Enter` | Open selected step for editing |
| `Escape` | Close slide-in panel |
| `Cmd/Ctrl + S` | Save changes |
| `Tab` | Navigate within panel |

### Screen Reader Support

- Step thumbnails: `aria-label="Step 1: Welcome step"`
- Selected step: `aria-selected="true"`
- Timeline: `role="list"` with step items
- Properties panel: `aria-live="polite"` for updates

### Focus Management

- Opening slide-in → focus first input
- Closing slide-in → focus returns to trigger button
- Adding step → focus new step thumbnail

---

## Performance Considerations

### Virtualization

For forms with 20+ steps, consider virtualizing the timeline:
```typescript
import { useVirtualList } from '@vueuse/core';

const { containerProps, wrapperProps, list } = useVirtualList(steps, {
  itemHeight: 180, // Average step card height
});
```

### Lazy Loading

- Load step preview images on scroll
- Defer design settings panel render until opened
- Code-split step editor variants

### Debouncing

- Step card hover effects: 150ms delay
- Auto-save: 500ms debounce (existing)
- Scroll sync: 100ms throttle

---

## Rollback Plan

If issues arise post-launch:

1. **Immediate**: Disable feature flag → users see old editor
2. **Data**: Old and new editors use same GraphQL operations, no data migration needed
3. **Cleanup**: Remove feature flag code after 2 weeks stable

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Form creation time | Unknown | Measure baseline, then 20% reduction |
| Questions per form | Unknown | Increase by 15% |
| Form completion rate | Unknown | Increase by 10% |
| Support tickets about editor | Baseline | 30% reduction |

---

## Open Questions

1. **Mobile/Tablet**: How should the three-panel layout adapt?
   - Option A: Stack panels vertically
   - Option B: Hide sidebar, swipe between steps
   - Option C: Dedicated mobile editor (defer to post-MVP)

2. **Drag-and-Drop in Canvas**: Should steps be reorderable via drag in the timeline canvas, or only in sidebar?
   - Recommendation: Sidebar only for MVP (simpler interaction)

3. **Welcome/Thank You Customization**: How much should be configurable?
   - MVP: Title, subtitle, button text only
   - Future: Rich text, images, videos

4. **Step Limits**: Should there be a maximum number of steps?
   - Recommendation: Soft limit warning at 15, hard limit at 25

---

## Parallel Development Strategy

This implementation is designed for **three parallel agents** working in separate worktrees, then rebasing progress together.

### Agent Assignments

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PARALLEL DEVELOPMENT MAP                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  YELLOW AGENT                 GREEN AGENT               BLUE AGENT          │
│  (Foundation + State)         (Sidebar + Canvas)        (Properties + Editor)│
│                                                                             │
│  ┌─────────────────┐         ┌─────────────────┐       ┌─────────────────┐  │
│  │ FormEditorLayout│         │ StepsSidebar    │       │ PropertiesPanel │  │
│  │ FormEditorHeader│         │ StepThumbnail   │       │ ContextualHelp  │  │
│  │ Data Models     │         │ InsertStepButton│       │ QuestionTips    │  │
│  │ Core Composables│         │ TimelineCanvas  │       │ DesignSettings  │  │
│  │ Page Integration│         │ TimelineConnect │       │ StepEditorSlide │  │
│  └─────────────────┘         │ StepCard (all)  │       │ Step Editors    │  │
│                              └─────────────────┘       └─────────────────┘  │
│                                                                             │
│  DEPENDENCIES: Yellow provides shared types/interfaces that Green+Blue use  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Yellow Agent: Foundation + State

**Branch**: `yellow/timeline-editor-foundation`

**Responsibilities**:
1. Core layout infrastructure
2. Data models and TypeScript interfaces
3. State management composables
4. Page routing integration

**Files to Create/Modify**:
```
apps/web/src/
├── layouts/
│   └── FormEditorLayout.vue          # Three-panel shell
│
├── pages/[org]/forms/[urlSlug]/
│   └── edit.vue                      # Updated to use new layout
│
└── features/createForm/
    ├── composables/
    │   ├── useTimelineEditor.ts      # Main state orchestrator
    │   ├── useStepNavigation.ts      # Selection + scrolling
    │   └── useStepOperations.ts      # Step CRUD operations
    │
    ├── models/
    │   ├── index.ts                  # Updated with step types
    │   └── stepTypes.ts              # Step type definitions
    │
    └── ui/
        └── FormEditorHeader.vue      # Top bar component
```

**Shared Interface Contract** (Yellow exports, Green+Blue import):
```typescript
// features/createForm/models/stepTypes.ts

export type StepType = 'welcome' | 'question' | 'rating' | 'thank_you';

export interface FormStep {
  id: string;
  type: StepType;
  order: number;
  content: StepContent;
  tips?: string[];
  isNew?: boolean;
  isModified?: boolean;
}

export type StepContent = WelcomeContent | QuestionContent | RatingContent | ThankYouContent;

// Content interfaces...

// Composable return types
export interface TimelineEditorContext {
  steps: Ref<FormStep[]>;
  selectedStepIndex: Ref<number>;
  selectStep: (index: number) => void;
  addStep: (type: StepType, afterIndex?: number) => void;
  removeStep: (index: number) => void;
  updateStep: (index: number, updates: Partial<FormStep>) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;
  // ... more
}
```

**Deliverables**:
- [ ] `FormEditorLayout.vue` with slots for three panels
- [ ] `FormEditorHeader.vue` with back button, title, actions
- [ ] Complete TypeScript interfaces for all step types
- [ ] `useTimelineEditor.ts` with full CRUD operations
- [ ] `useStepNavigation.ts` with URL sync
- [ ] Updated page that uses new layout
- [ ] Mock slot content for testing layout

---

### Green Agent: Sidebar + Canvas

**Branch**: `green/timeline-editor-ui`

**Responsibilities**:
1. Steps sidebar with thumbnails
2. Timeline canvas with step cards
3. Visual connectors between steps
4. Insert step interactions

**Files to Create**:
```
apps/web/src/features/createForm/ui/
├── stepsSidebar/
│   ├── StepsSidebar.vue              # Container with step list
│   ├── StepThumbnail.vue             # Individual step button
│   ├── InsertStepButton.vue          # Hover-reveal insert
│   └── StepTypePicker.vue            # Step type selection popover
│
└── timelineCanvas/
    ├── TimelineCanvas.vue            # Scrollable canvas
    ├── TimelineConnector.vue         # Line + dot connector
    ├── StepCard.vue                  # Base card with slot
    └── stepCards/
        ├── WelcomeStepCard.vue       # Welcome preview
        ├── QuestionStepCard.vue      # Question preview
        ├── RatingStepCard.vue        # Rating preview
        └── ThankYouStepCard.vue      # Thank you preview
```

**Props Interface** (receives from Yellow's composables):
```typescript
// StepsSidebar.vue props
interface Props {
  steps: FormStep[];
  selectedIndex: number;
}

interface Emits {
  (e: 'select', index: number): void;
  (e: 'insert', afterIndex: number, type: StepType): void;
  (e: 'reorder', fromIndex: number, toIndex: number): void;
}

// TimelineCanvas.vue props
interface Props {
  steps: FormStep[];
  selectedIndex: number;
}

interface Emits {
  (e: 'select', index: number): void;
  (e: 'edit', index: number): void;
  (e: 'insert', afterIndex: number): void;
}
```

**Deliverables**:
- [ ] `StepsSidebar.vue` with step navigation
- [ ] `StepThumbnail.vue` with number, label, states
- [ ] `InsertStepButton.vue` with hover behavior
- [ ] `StepTypePicker.vue` popover
- [ ] `TimelineCanvas.vue` with scroll container
- [ ] `TimelineConnector.vue` with line and dot
- [ ] All four `StepCard` variants
- [ ] Proper keyboard navigation in sidebar

**Development Approach**:
- Create mock step data for development
- Use placeholder composable calls
- Focus on visual polish and interactions

---

### Blue Agent: Properties + Editor

**Branch**: `blue/timeline-editor-panels`

**Responsibilities**:
1. Properties panel with contextual content
2. Refactored step editor slide-in
3. Step-specific editor forms
4. Tips editing functionality

**Files to Create/Modify**:
```
apps/web/src/features/createForm/ui/
├── propertiesPanel/
│   ├── PropertiesPanel.vue           # Right panel container
│   ├── ContextualHelp.vue            # Step-type explanations
│   ├── QuestionTips.vue              # Tips list editor
│   └── DesignSettings.vue            # Theme settings
│
└── stepEditor/
    ├── StepEditorSlideIn.vue         # Refactored main panel
    ├── StepEditorHeader.vue          # Nav + actions
    └── editors/
        ├── WelcomeStepEditor.vue     # Welcome form fields
        ├── QuestionStepEditor.vue    # Question form (from existing)
        ├── RatingStepEditor.vue      # Rating form fields
        └── ThankYouStepEditor.vue    # Thank you form fields

apps/web/src/features/createForm/composables/
└── useStepEditorPanel.ts             # Refactored from useQuestionEditorPanel
```

**Props Interface** (receives from Yellow's composables):
```typescript
// PropertiesPanel.vue props
interface Props {
  selectedStep: FormStep | null;
  isEditing: boolean;
}

interface Emits {
  (e: 'update-tips', tips: string[]): void;
  (e: 'update-design', settings: DesignSettings): void;
}

// StepEditorSlideIn.vue props
interface Props {
  step: FormStep | null;
  open: boolean;
  mode: 'edit' | 'add';
}

interface Emits {
  (e: 'update:open', value: boolean): void;
  (e: 'save', step: FormStep): void;
  (e: 'delete', stepId: string): void;
  (e: 'navigate', direction: 'prev' | 'next'): void;
}
```

**Deliverables**:
- [ ] `PropertiesPanel.vue` with section rendering
- [ ] `ContextualHelp.vue` with step-type content
- [ ] `QuestionTips.vue` with CRUD functionality
- [ ] `DesignSettings.vue` (placeholder for branding)
- [ ] `StepEditorSlideIn.vue` refactored for all types
- [ ] All four step editor form components
- [ ] `useStepEditorPanel.ts` refactored composable
- [ ] Keyboard shortcuts preserved

**Development Approach**:
- Start by extracting existing `QuestionEditorPanel.vue` logic
- Create step type router component
- Build other editors following same pattern

---

### Rebase Strategy

**Order of Integration**:
```
1. Yellow (Foundation) → main
   ↓
2. Green rebases on Yellow
   ↓
3. Blue rebases on Green (or Yellow if no conflicts)
   ↓
4. Final integration: Green + Blue → main
```

**Integration Checkpoints**:

| Checkpoint | Yellow | Green | Blue |
|------------|--------|-------|------|
| Types exported | ✓ | Import | Import |
| Layout with slots | ✓ | Test in slots | Test in slots |
| Composables working | ✓ | Connect | Connect |
| UI components done | - | ✓ | ✓ |
| Full integration | Merge all | Merge all | Merge all |

**Conflict Prevention**:
- Yellow owns: `models/`, `composables/`, `layouts/`, page file
- Green owns: `ui/stepsSidebar/`, `ui/timelineCanvas/`
- Blue owns: `ui/propertiesPanel/`, `ui/stepEditor/`
- Shared: Only `ui/index.ts` barrel exports (coordinate additions)

---

### Development Timeline

```
Day 1-2: All agents work in parallel
         Yellow: Layout + types + composables
         Green: Sidebar + canvas components
         Blue: Properties + editor refactor

Day 3:   Yellow merges to main
         Green + Blue rebase on Yellow
         Test integration points

Day 4:   Green merges to main
         Blue rebases on Green
         Final integration testing

Day 5:   Blue merges to main
         Full E2E testing
         Bug fixes
```

---

### Communication Protocol

**Shared Types Updates**:
- Yellow announces type changes in shared channel
- Green/Blue pull Yellow's branch for latest types
- Use `// TODO: Yellow - need X interface` comments for pending needs

**Component Interface Changes**:
- If Green needs different props, request from Yellow
- If Blue needs new composable methods, request from Yellow
- Document interface contracts in component JSDoc

**Merge Conflicts**:
- Barrel exports (`index.ts`): Last merger adds their exports
- Shared utilities: Yellow is source of truth
- Component conflicts: Should not happen with proper ownership

---

## Next Steps

1. [ ] Review plan with stakeholders
2. [ ] Create GitHub issues for each phase
3. [ ] Set up feature flag infrastructure
4. [ ] **Yellow**: Begin foundation work immediately
5. [ ] **Green**: Begin UI components with mock data
6. [ ] **Blue**: Begin refactoring existing editor code
