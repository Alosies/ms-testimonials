# ADR-006: Timeline Form Editor Layout

## Doc Connections
**ID**: `adr-006-timeline-form-editor`

2026-01-03-0130 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-004-single-page-form-builder` - Previous single-page pattern (superseded)
- `adr-003-form-autosave` - Form auto-save pattern (still applies)
- `competitor-reviews/senja-form-editor-ux` - Senja UX analysis

---

## Status

**Accepted** - 2026-01-03

Supersedes: ADR-004 (Single-Page Form Builder)

## Context

ADR-004 introduced a single-page form builder with collapsible sections. While an improvement over the wizard, user testing and competitor analysis (particularly Senja) revealed opportunities for a more intuitive editing experience.

### Problems with Collapsible Sections Pattern

| Issue | Description |
|-------|-------------|
| **No journey visualization** | Users don't see the form as customers experience it |
| **Static preview** | All questions shown at once, not step-by-step |
| **Hidden complexity** | Collapsed sections hide the form structure |
| **Context switching** | Must expand/collapse to navigate between sections |
| **No spatial memory** | Users can't remember "where" things are |

### Competitor Analysis: Senja

See: `docs/competitor-reviews/senja-form-editor-ux/README.md`

Key insight: **Senja treats forms as a journey, not a document.** Each step gets its own live preview so users understand exactly what customers see at each moment.

### Design Inspiration: PowerPoint/Keynote

The slide deck metaphor maps perfectly to multi-step forms:
- Slides = Form steps
- Slide thumbnails = Step navigation
- Canvas = Live preview
- Properties panel = Edit controls

This is a universally understood mental model with zero learning curve.

## Decision

**Replace the collapsible sections layout with a three-panel timeline editor:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Forms          My First Testimonial Form    [Preview] [Publish ▼]│
├───────────┬─────────────────────────────────────────────┬───────────────────┤
│           │                                             │                   │
│  STEPS    │         ┌──────────────────────────┐        │  TIPS & DESIGN    │
│           │         │                          │        │                   │
│  ┌─────┐  │         │       Welcome            │        │  📕 What's this?  │
│  │  1  │  │         │       ────────────       │        │  Introduce your   │
│  │ Welc│◀─│─────────│      Share your...       │        │  form and set     │
│  └─────┘  │         │                          │        │  expectations.    │
│           │         │      [Edit Content]      │        │                   │
│  ┌─────┐  │         │                          │        │  ─────────────    │
│  │  2  │  │         └──────────────────────────┘        │                   │
│  │ Q1  │  │                    ┃                        │  Question Tips    │
│  └─────┘  │                    ○                        │  ┌─────────────┐  │
│           │                    ┃                        │  │ Ex: "What   │  │
│  ┌─────┐  │         ┌──────────────────────────┐        │  │ problem..." │  │
│  │  3  │  │         │                          │        │  └─────────────┘  │
│  │ Q2  │  │         │      Question #1         │        │  + Add tip        │
│  └─────┘  │         │      ────────────        │        │                   │
│           │         │      Before using...     │        │  ─────────────    │
│  ┌─────┐  │         │                          │        │                   │
│  │  4  │  │         │      [Edit Content]      │        │  Design           │
│  │ Q3  │  │         │                          │        │  ┌─────────────┐  │
│  └─────┘  │         └──────────────────────────┘        │  │ Theme: Light│  │
│           │                    ┃                        │  │ Color: Blue │  │
│  ┌─────┐  │                    ○                        │  └─────────────┘  │
│  │  5  │  │                    ┃                        │                   │
│  │ Thx │  │         ┌──────────────────────────┐        │                   │
│  └─────┘  │         │                          │        │                   │
│           │         │      Question #2         │        │                   │
│  ┌─────┐  │         │      ────────────        │        │                   │
│  │  +  │  │         │      Can you describe... │        │                   │
│  │ Add │  │         │                          │        │                   │
│  └─────┘  │         │      [Edit Content]      │        │                   │
│           │         │                          │        │                   │
│           │         └──────────────────────────┘        │                   │
│           │                    ┃                        │                   │
│           │                    ○                        │                   │
│           │                    ┃                        │                   │
│           │         ┌──────────────────────────┐        │                   │
│           │         │                          │        │                   │
│           │         │       Thank You          │        │                   │
│           │         │       ────────────       │        │                   │
│           │         │       Thank you for...   │        │                   │
│           │         │                          │        │                   │
│           │         └──────────────────────────┘        │                   │
│           │                                             │                   │
├───────────┴─────────────────────────────────────────────┴───────────────────┤
```

### Three-Panel Layout

| Panel | Purpose | Width |
|-------|---------|-------|
| **Left: Steps Sidebar** | Navigation thumbnails with step numbers | ~80px fixed |
| **Center: Timeline Canvas** | Scrollable step previews with connecting timeline | Fluid |
| **Right: Properties Panel** | Tips, design settings, contextual help | ~280px fixed |

### Dedicated Form Editor Layout

The form editor uses a **separate layout** from the main dashboard:
- Replaces the regular sidebar navigation
- Top bar has "← Back to Forms" escape hatch
- Full-width workspace for editing
- Signals "you're in creation mode" (like Figma, Notion, Canva)

### Left Sidebar: Steps Navigation

```
┌─────────┐
│  STEPS  │
│         │
│ ┌─────┐ │
│ │  1  │ │  ← Step number
│ │ Welc│ │  ← Abbreviated label
│ └─────┘ │
│    ↓    │  ← Hover: shows insert button
│ ┌─────┐ │
│ │  2  │ │
│ │ Q1  │ │
│ └─────┘ │
│   ...   │
│ ┌─────┐ │
│ │  +  │ │  ← Add step (bottom)
│ │ Add │ │
│ └─────┘ │
└─────────┘
```

**Behaviors:**
- Click step → scrolls center canvas to that step
- Selected step has active/highlighted state
- Hover between steps → shows "+ insert" button
- Bottom "+ Add" button → adds new step at end

### Center Canvas: Timeline View

The timeline runs **vertically through the horizontal center** of the canvas:

```
         ┌──────────────────────────┐
         │                          │
         │       Welcome            │
         │       ────────────       │
         │      Share your...       │
         │                          │
         │      [Edit Content]      │
         │                          │
         └──────────────────────────┘
                    ┃
                    ○  ← Connection dot
                    ┃
         ┌──────────────────────────┐
         │                          │
         │      Question #1         │
         │      ...                 │
         └──────────────────────────┘
                    ┃
                    ○
                    ┃
```

**Behaviors:**
- Scrollable container showing all steps
- Each step is a card with live preview content
- Timeline line (┃) runs through center, connecting all steps
- Connection dots (○) appear between cards
- "Edit Content" button on each card → opens slide-in panel

### Right Panel: Tips & Design

Context-sensitive panel showing:

**Top Section: Contextual Help**
```
📕 What's this?
This step introduces your form and sets
customer expectations.
```

**Middle Section: Question Tips** (for question steps)
```
Question Tips
Help customers leave better testimonials.

┌─────────────────────────────────┐
│ Ex: "Share where you found us"  │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Ex: "Include specific results"  │
└─────────────────────────────────┘
+ Add tip
```

**Bottom Section: Design Settings**
```
Design
┌─────────────────────────────────┐
│ Theme:     [Light ▼]            │
│ Color:     [● Blue]             │
│ Logo:      [Upload]             │
└─────────────────────────────────┘
```

### Edit Content: Slide-in Panel

Clicking "Edit Content" on a step opens the existing slide-in panel from the right:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Forms          My First Form                 [Preview] [Publish] │
├───────────┬─────────────────────────────────────────────┬───────────────────┤
│           │                                             │                   │
│  STEPS    │         ┌──────────────────────────┐        │  ┌─────────────┐  │
│           │         │                          │        │  │ EDIT Q1     │  │
│  ┌─────┐  │         │       Question #1        │        │  │             │  │
│  │  1  │  │         │       ────────────       │        │  │ Question:   │  │
│  │ Welc│  │         │       (editing...)       │ ◀──────│  │ [________]  │  │
│  └─────┘  │         │                          │        │  │             │  │
│           │         └──────────────────────────┘        │  │ Placeholder:│  │
│  ┌─────┐  │                    ┃                        │  │ [________]  │  │
│  │  2  │◀─│                    ○                        │  │             │  │
│  │ Q1  │  │                    ┃                        │  │ Required:   │  │
│  └─────┘  │                    ...                      │  │ [✓]         │  │
│           │                                             │  │             │  │
│   ...     │                                             │  │ [Save]      │  │
│           │                                             │  └─────────────┘  │
├───────────┴─────────────────────────────────────────────┴───────────────────┤
```

The slide-in panel overlays or pushes the Tips & Design panel.

### Preview Mode

"Preview" button hides both sidebars for focused customer experience view:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                          [✕ Exit Preview]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                                                                             │
│                    ┌──────────────────────────────┐                         │
│                    │                              │                         │
│                    │     Share your experience    │                         │
│                    │     with Acme Scheduler      │                         │
│                    │                              │                         │
│                    │     Your feedback helps      │                         │
│                    │     others make better       │                         │
│                    │     decisions.               │                         │
│                    │                              │                         │
│                    │     [Get Started]            │                         │
│                    │                              │                         │
│                    └──────────────────────────────┘                         │
│                                                                             │
│                                    ┃                                        │
│                                    ○                                        │
│                                    ┃                                        │
│                                                                             │
│                    ┌──────────────────────────────┐                         │
│                    │     Question #1...           │                         │
│                    └──────────────────────────────┘                         │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
```

### Step Types

| Step Type | Icon | Purpose |
|-----------|------|---------|
| **Welcome** | 👋 | Introduction, set expectations |
| **Question** | ❓ | Collect testimonial content |
| **Rating** | ⭐ | NPS-style satisfaction rating |
| **Thank You** | 🎉 | Confirmation, social sharing |

Future step types (post-MVP):
- Consent (public/private choice)
- About You (name, email, photo)
- About Company (job title, company)

### Adding Steps

**Add at bottom:**
- Click "+ Add" button at bottom of steps sidebar
- Opens step type picker: Welcome | Question | Rating | Thank You

**Insert between:**
- Hover between steps → shows dashed "+ insert" button
- Click → opens step type picker
- New step inserted at that position
- Step numbers auto-renumber

```
  ┌─────┐
  │  2  │
  │ Q1  │
  └─────┘
     ↓
  ┌ ─ ─ ┐   ← Appears on hover
  │  +  │
  └ ─ ─ ┘
     ↓
  ┌─────┐
  │  3  │
  │ Q2  │
  └─────┘
```

## Consequences

### Positive

1. **Journey visualization** — Users see the form as customers experience it
2. **Spatial memory** — "Question 3 is in the middle" is easy to remember
3. **Familiar metaphor** — PowerPoint/Keynote pattern has zero learning curve
4. **Quick navigation** — Click any step to jump directly
5. **Live context** — Preview updates reflect changes immediately
6. **Reduced cognitive load** — Three focused panels vs one dense page
7. **Professional feel** — Dedicated editor mode signals serious tool

### Negative

1. **Implementation complexity** — New layout system, more components
2. **More screen real estate** — Three panels need wider screens
3. **Mobile challenges** — Will need responsive/mobile-specific design
4. **Migration effort** — Existing form editor needs significant refactor

### Neutral

1. **Learning curve** — Users familiar with current pattern need adjustment
2. **Performance** — More live previews may need optimization

## Implementation

### New Layout

Create dedicated form editor layout:
- `layouts/FormEditorLayout.vue` — Three-panel layout with header
- Replaces dashboard layout when editing forms

### New Components

```
features/createForm/
├── ui/
│   ├── FormEditorLayout.vue          # Three-panel container
│   ├── StepsSidebar/
│   │   ├── StepsSidebar.vue          # Left panel
│   │   ├── StepThumbnail.vue         # Individual step button
│   │   └── InsertStepButton.vue      # Hover insert button
│   ├── TimelineCanvas/
│   │   ├── TimelineCanvas.vue        # Center scrollable area
│   │   ├── TimelineConnector.vue     # Line + dot between steps
│   │   └── StepCard.vue              # Individual step preview
│   ├── PropertiesPanel/
│   │   ├── PropertiesPanel.vue       # Right panel
│   │   ├── ContextualHelp.vue        # "What's this?" section
│   │   ├── QuestionTips.vue          # Tips editor
│   │   └── DesignSettings.vue        # Theme/color settings
│   └── StepEditor/
│       ├── StepEditorSlideIn.vue     # Slide-in edit panel
│       ├── WelcomeStepEditor.vue     # Welcome step fields
│       ├── QuestionStepEditor.vue    # Question step fields
│       └── ThankYouStepEditor.vue    # Thank you step fields
└── composables/
    ├── useTimelineEditor.ts          # Editor state management
    ├── useStepNavigation.ts          # Step selection, scrolling
    └── useStepOperations.ts          # Add, remove, reorder steps
```

### Data Model Changes

Extend form questions to support step types:

```typescript
interface FormStep {
  id: string
  type: 'welcome' | 'question' | 'rating' | 'thank_you'
  order: number
  content: WelcomeContent | QuestionContent | RatingContent | ThankYouContent
  tips?: string[]  // For question steps
}

interface WelcomeContent {
  title: string
  subtitle: string
  buttonText: string
}

interface QuestionContent {
  question: string
  placeholder: string
  required: boolean
}

interface ThankYouContent {
  title: string
  message: string
  showSocialShare: boolean
}
```

### Migration Path

1. Create new layout and components alongside existing
2. Feature flag: `FORM_EDITOR_V2`
3. Migrate form data to new step-based model
4. Deprecate old form editor after validation
5. Remove feature flag, delete old components

## References

- Senja Form Editor UX Analysis: `docs/competitor-reviews/senja-form-editor-ux/`
- ADR-004: Single-Page Form Builder (superseded)
- ADR-003: Form Auto-Save Pattern (still applies)
- PowerPoint/Keynote UI patterns
- Figma's dedicated editor mode
