# Timeline Form Editor - Implementation Plan

**ADR**: `docs/adr/006-timeline-form-editor.md`
**Status**: Planning
**Date**: 2026-01-03

---

## Overview

Transform the form editor from a collapsible-section layout to a three-panel timeline editor inspired by PowerPoint/Keynote and Senja's "form as a journey" pattern.

### Target Layout

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
└───────────┴─────────────────────────────────────────────┴───────────────────┘
```

---

## Agent Assignments

| Agent | Worktree | Branch | Responsibility |
|-------|----------|--------|----------------|
| **Yellow** | `ms-testimonials-yellow` | `yellow/timeline-foundation` | Foundation + State Management |
| **Green** | `ms-testimonials-green` | `green/timeline-ui` | Sidebar + Canvas Components |
| **Blue** | `ms-testimonials-blue` | `blue/timeline-panels` | Properties + Editor Panels |

---

## Task Reference

### Yellow Agent Tasks (Y1-Y7)
See: [yellow-agent.md](./yellow-agent.md)

| Task | Description |
|------|-------------|
| Y1 | Create data models and TypeScript interfaces |
| Y2 | Create FormEditorLayout.vue with slots |
| Y3 | Create FormEditorHeader.vue |
| Y4 | Create core composables (useStepState, useStepOperations, useStepNavigation) |
| Y5 | Create useTimelineEditor orchestrator |
| Y6 | Update page to use new layout |
| Y7 | Integration testing with mock slot content |

### Green Agent Tasks (G1-G9)
See: [green-agent.md](./green-agent.md)

| Task | Description |
|------|-------------|
| G1 | Create StepThumbnail.vue component |
| G2 | Create InsertStepButton.vue component |
| G3 | Create StepTypePicker.vue component |
| G4 | Create StepsSidebar.vue container |
| G5 | Create TimelineConnector.vue |
| G6 | Create StepCard.vue base component |
| G7 | Create all step card variants (7 types) |
| G8 | Create TimelineCanvas.vue container |
| G9 | Integration testing |

### Blue Agent Tasks (B1-B8)
See: [blue-agent.md](./blue-agent.md)

| Task | Description |
|------|-------------|
| B1 | Create ContextualHelp.vue component |
| B2 | Create QuestionTips.vue component |
| B3 | Create DesignSettings.vue component |
| B4 | Create PropertiesPanel.vue container |
| B5 | Create useStepEditorPanel.ts composable |
| B6 | Create StepEditorSlideIn.vue container |
| B7 | Create all step editor variants (7 types) |
| B8 | Integration testing |

---

## Execution Timeline

### Dependency Graph

```
Y1 ─────────────────────────────────────────────────────────────────────────────►
    │
    │   ┌─────────────────────────────────────────────────────────────────────┐
    │   │                     PARALLEL EXECUTION WAVE 1                        │
    │   │                                                                      │
    ├──►│  Y2, Y3  ║  G1, G2, G3  ║  B1, B2, B3                               │
    │   │  Layout  ║  Small       ║  Small                                     │
    │   │  shell   ║  components  ║  components                                │
    │   └─────────────────────────────────────────────────────────────────────┘
    │                              │
    ▼                              ▼
Y4, Y5 ────────────────────────────────────────────────────────────────────────►
Composables                        │
    │                              │
    │   ┌─────────────────────────────────────────────────────────────────────┐
    │   │                     PARALLEL EXECUTION WAVE 2                        │
    │   │                                                                      │
    ├──►│  Y6      ║  G4, G5, G6, G7, G8  ║  B4, B5, B6, B7                   │
    │   │  Page    ║  Sidebar + Canvas    ║  Properties + Editor              │
    │   │  update  ║  integration         ║  integration                       │
    │   └─────────────────────────────────────────────────────────────────────┘
    │                              │
    ▼                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FINAL INTEGRATION                                  │
│                                                                              │
│  Y7  +  G9  +  B8  →  Full E2E Testing  →  Merge to dev                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Timeline Table

| Phase | Tasks | Can Run In Parallel | Depends On | Notes |
|-------|-------|---------------------|------------|-------|
| **Phase 1** | Y1 | - | - | Types must be done first |
| **Phase 2** | Y2, Y3, G1, G2, G3, B1, B2, B3 | Yes (all) | Y1 | Small components, no deep deps |
| **Phase 3** | Y4, Y5 | Yes (together) | Y2 | Core composables |
| **Phase 4** | Y6, G4, G5, G6, G7, G8, B4, B5, B6, B7 | Yes (all) | Y4, Y5 | Main integration work |
| **Phase 5** | Y7, G9, B8 | Yes (all) | Phase 4 | Testing phase |
| **Phase 6** | Merge | Sequential | Phase 5 | Yellow → Green → Blue |

### Detailed Execution Order

```
DAY 1 - MORNING
├── Y1: Data models (BLOCKING - must complete first)

DAY 1 - AFTERNOON (parallel after Y1)
├── Yellow: Y2, Y3
├── Green:  G1, G2, G3
└── Blue:   B1, B2, B3

DAY 2 - MORNING
├── Yellow: Y4, Y5 (composables - needed by others)

DAY 2 - AFTERNOON (parallel after Y4, Y5)
├── Yellow: Y6
├── Green:  G4, G5, G6
└── Blue:   B4, B5

DAY 3 - ALL DAY (parallel)
├── Green:  G7, G8
└── Blue:   B6, B7

DAY 4 - TESTING (parallel)
├── Yellow: Y7
├── Green:  G9
└── Blue:   B8

DAY 4 - AFTERNOON
└── Merge: Yellow → main → Green rebase → Blue rebase → Final merge
```

---

## Critical Dependencies

### Blocking Dependencies (Must Wait)

| Task | Blocks | Reason |
|------|--------|--------|
| **Y1** | Everything | Types are imported by all agents |
| **Y4, Y5** | G4-G8, B4-B7 | Composables provide step state/operations |

### Soft Dependencies (Can Mock)

| Task | Soft Depends On | Can Mock With |
|------|-----------------|---------------|
| G4 | Y4 composables | Mock step data array |
| B4 | Y4 composables | Mock selected step |
| G8 | Y5 orchestrator | Mock callbacks |
| B6 | Y5 orchestrator | Mock callbacks |

### No Dependencies (Fully Parallel)

| Tasks | Notes |
|-------|-------|
| G1, G2, G3 | Standalone UI components |
| B1, B2, B3 | Standalone UI components |
| Y2, Y3 | Layout shell, no business logic |

---

## Merge Strategy

### Order of Merges

```
1. Yellow merges to dev first
   └── Provides: Types, layout, composables

2. Green rebases on dev, then merges
   └── Provides: Sidebar, canvas components

3. Blue rebases on dev, then merges
   └── Provides: Properties, editor components
```

### Conflict Prevention

| Agent | Owns These Paths | Must Not Touch |
|-------|------------------|----------------|
| Yellow | `models/`, `composables/timeline/`, `layouts/`, page file | `ui/stepsSidebar/`, `ui/propertiesPanel/` |
| Green | `ui/stepsSidebar/`, `ui/timelineCanvas/` | `models/`, `composables/` |
| Blue | `ui/propertiesPanel/`, `ui/stepEditor/`, `composables/stepEditor/` | `ui/stepsSidebar/`, `ui/timelineCanvas/` |

### Shared Files (Coordinate)

- `features/createForm/ui/index.ts` - Barrel exports (each agent adds their own)
- `features/createForm/composables/index.ts` - Barrel exports

---

## Checkpoints

### Checkpoint 1: Types Ready (After Y1) ✅
- [x] `StepType`, `FormStep`, content interfaces exported
- [x] Type guards working
- [x] Green and Blue can import types

### Checkpoint 2: Layout Shell (After Y2, Y3)
- [ ] Three-panel layout renders
- [ ] Header with back button works
- [ ] Slots accept content

### Checkpoint 3: Composables Ready (After Y4, Y5)
- [ ] `useTimelineEditor` returns step state
- [ ] Add/remove/reorder operations work
- [ ] Selection and navigation work
- [ ] Green and Blue can connect

### Checkpoint 4: Components Complete (After G8, B7)
- [ ] Sidebar shows step thumbnails
- [ ] Canvas shows step cards with connectors
- [ ] Properties panel shows contextual content
- [ ] Editor slide-in works for all step types

### Checkpoint 5: Integration Complete (After Y7, G9, B8)
- [ ] Full editor flow works end-to-end
- [ ] Keyboard navigation works
- [ ] Auto-save works
- [ ] No console errors

---

## Commit Convention

### Format

```
ADR-006-{TASK_ID}: {description} [{STATUS}]
```

### Components

| Component | Description | Example |
|-----------|-------------|---------|
| `ADR-006` | Reference to the ADR this work implements | `ADR-006` |
| `{TASK_ID}` | Task identifier from agent plan | `Y1`, `G4`, `B7` |
| `{description}` | Brief description of the change | `add step content types and factories` |
| `[{STATUS}]` | Work status indicator | `[done]` or `[wip]` |

### Status Indicators

| Status | Meaning | When to Use |
|--------|---------|-------------|
| `[done]` | Task is complete | All acceptance criteria met |
| `[wip]` | Work in progress | Partial implementation, needs more work |

### Examples

```bash
# Complete task
ADR-006-Y1: add step content types and factories [done]

# Work in progress
ADR-006-G7: add welcome and question step cards [wip]

# Multiple tasks in one commit (avoid if possible)
ADR-006-Y2,Y3: add layout shell and header components [done]
```

### Guidelines

1. **One task per commit** - Prefer atomic commits for each task
2. **Always include status** - Makes progress tracking clear
3. **Use imperative mood** - "add", "create", "fix" (not "added", "creates")
4. **Keep description concise** - Under 50 chars if possible

---

## Files Reference

See [reference.md](./reference.md) for:
- Complete database schema
- Detailed component specifications
- Type definitions
- Design patterns
- Testing strategy
