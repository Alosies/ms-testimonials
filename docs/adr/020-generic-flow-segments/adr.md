# ADR-020: Generic Flow Segments for Studio Canvas

## Doc Connections
**ID**: `adr-020-generic-flow-segments`

2026-01-19

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-009-flows-table-branching` - Flow convergence via display_order
- `adr-006-timeline-form-editor` - Timeline editor architecture

---

## Status

**Proposed** - 2026-01-19

## Context

### Problem Statement

The current Studio canvas has hardcoded rendering for a specific flow pattern:
- Intro (shared steps before branch)
- Branch columns (testimonial/improvement)

However, ADR-009 established that `display_order` can support any sequence of shared/branch flows:

```
Shared(0) → Branch(1,2) → Shared(3) → Branch(4,5) → Shared(6)
```

The canvas needs to render this generically rather than assuming a fixed intro-branch pattern.

### Current Implementation

`BranchedTimelineCanvas.vue` renders:
1. `stepsBeforeBranch` - hardcoded shared section
2. Branch indicator
3. `FlowColumn` for testimonial/improvement
4. No support for steps after branches (outro)

### Requirements

1. **Generic rendering**: Support any sequence of shared/branch segments
2. **Dynamic indicators**: Show branch/merge indicators between segments
3. **Flexible navigation**: Keyboard nav works across all segments
4. **Backward compatible**: Existing intro-branch forms work unchanged

## Decision

### Approach: Segment-Based Rendering

Compute **flow segments** from `flows` ordered by `display_order`, then render each segment appropriately.

### Data Model

```typescript
type FlowSegment =
  | { type: 'shared'; flows: Flow[]; steps: FormStep[] }
  | { type: 'branch'; flows: Flow[]; stepsByFlow: Map<string, FormStep[]> };
```

### Rendering Rules

| Segment Type | Rendering |
|--------------|-----------|
| Shared | Full-width `TimelineStepCard` components |
| Branch | Parallel `FlowColumn` components |

### Indicators

- **Before branch segment**: Divergence indicator (branch icon)
- **After branch segment** (if followed by shared): Convergence indicator (merge icon)

## Consequences

### Positive
- Supports future flow patterns (multiple branch points)
- Single rendering logic handles all cases
- Cleaner separation of concerns

### Negative
- More complex than hardcoded approach
- Need to refactor existing components

### Risks
- Navigation logic becomes more complex
- Potential performance impact with many segments

---

## Implementation Details

### Part 1: Flow Segment Computation

The `computeFlowSegments` function groups flows by type, preserving display_order:

```typescript
/**
 * Compute flow segments from flows sorted by display_order.
 * Groups consecutive shared flows and branch flows into segments.
 */
function computeFlowSegments(flows: Flow[], steps: FormStep[]): FlowSegment[] {
  const sortedFlows = [...flows].sort((a, b) => a.displayOrder - b.displayOrder);
  const segments: FlowSegment[] = [];

  let i = 0;
  while (i < sortedFlows.length) {
    const flow = sortedFlows[i];

    if (flow.flowType === 'shared') {
      // Collect consecutive shared flows
      const sharedFlows: Flow[] = [];
      while (i < sortedFlows.length && sortedFlows[i].flowType === 'shared') {
        sharedFlows.push(sortedFlows[i]);
        i++;
      }
      const sharedSteps = steps.filter(s =>
        sharedFlows.some(f => f.id === s.flowId)
      );
      segments.push({ type: 'shared', flows: sharedFlows, steps: sharedSteps });
    } else {
      // Collect consecutive branch flows
      const branchFlows: Flow[] = [];
      while (i < sortedFlows.length && sortedFlows[i].flowType === 'branch') {
        branchFlows.push(sortedFlows[i]);
        i++;
      }
      const stepsByFlow = new Map<string, FormStep[]>();
      for (const bf of branchFlows) {
        stepsByFlow.set(bf.id, steps.filter(s => s.flowId === bf.id));
      }
      segments.push({ type: 'branch', flows: branchFlows, stepsByFlow });
    }
  }

  return segments;
}
```

### Part 2: Test Changes Analysis

#### Files Requiring Updates

| File | Current Tests | Changes Needed |
|------|--------------|----------------|
| `navigation.spec.ts` | Tests intro→branch navigation | Add outro navigation tests |
| `branching.actions.ts` | `enterBranchArea()`, `switchToBranch()` | Add `enterOutroArea()`, `exitOutroArea()` |
| `studio.page.ts` | Locators for branch columns | Add locators for merge indicator, outro section |
| `studio.spec.ts` (journey) | Tests through branches | Extend to test outro navigation |

#### New Test Cases Needed

```typescript
// navigation.spec.ts additions

describe('Outro Navigation', () => {
  test('Arrow down from last branch step goes to first outro step', async () => {
    // Navigate to last step in testimonial branch
    // Press down arrow
    // Verify first outro step is selected
  });

  test('Arrow up from first outro step goes to last branch step', async () => {
    // Navigate to first outro step
    // Press up arrow
    // Verify last branch step is selected
  });

  test('Left/right arrows have no effect in outro section', async () => {
    // Navigate to outro step
    // Press left/right arrows
    // Verify same step remains selected
  });
});

describe('Segment Indicators', () => {
  test('Merge indicator shown between branches and outro', async () => {
    // Load form with outro steps
    // Verify merge indicator is visible
  });

  test('No merge indicator when no outro steps exist', async () => {
    // Load form without outro steps
    // Verify no merge indicator
  });
});
```

#### Test Actions to Add

```typescript
// branching.actions.ts additions

export function createBranchingActions(studio: StudioPage) {
  return {
    // Existing...
    switchToTestimonial: () => { ... },
    switchToImprovement: () => { ... },

    // NEW: Outro navigation
    navigateToOutro: async () => {
      // Navigate down until reaching outro section
    },
    exitOutroToTestimonial: async () => {
      // Navigate up from outro to testimonial branch
    },
    exitOutroToImprovement: async () => {
      // Navigate up from outro to improvement branch
    },
    expectInOutro: async (stepId: string) => {
      // Assert step is in outro section
    },
  };
}
```

#### Test Fixtures to Add

```typescript
// fixtures/branchedFormWithOutro.ts

export interface BranchedFormWithOutroData extends TestBranchedFormData {
  outroFlow: {
    id: string;
    steps: TestStepData[];
  };
}

// Example fixture:
{
  sharedFlow: { steps: [welcome, q1, q2, rating] },
  testimonialFlow: { steps: [endorsement] },
  improvementFlow: { steps: [feedback] },
  outroFlow: { steps: [contact_info, consent, thank_you] },  // NEW
}
```

### Part 3: AI Generation Changes

#### Current Flow Structure (buildDynamicPrompt.ts)

```
SHARED FLOW:
- Welcome (system)
- Q1: problem_before
- Q2: solution_experience
- Q3: specific_results
- Q4: rating (BRANCH POINT)

TESTIMONIAL FLOW:
- Q5: recommendation
- Consent (system)
- Contact Info (system)
- Thank You (system)

IMPROVEMENT FLOW:
- Q6: improvement_feedback
- Thank You (system)
```

#### Target Flow Structure (with outro)

```
INTRO FLOW (shared, display_order=0):
- Welcome (system)
- Q1: problem_before
- Q2: solution_experience
- Q3: specific_results
- Q4: rating (BRANCH POINT)

TESTIMONIAL FLOW (branch, display_order=1):
- Q5: recommendation
- Consent (system) ← STAYS IN TESTIMONIAL (privacy)

IMPROVEMENT FLOW (branch, display_order=2):
- Q6: improvement_feedback
  (No consent - feedback always private)

OUTRO FLOW (shared, display_order=3):  ← NEW
- Contact Info (system) - everyone
- Thank You (system) - everyone
```

#### Key Decisions

1. **Consent stays in testimonial branch**: Only testimonial users need consent (improvement feedback is always private)
2. **No migration**: Existing forms work unchanged, only new forms get outro
3. **Backward compatible**: Canvas renders whatever segments exist

### Part 4: New Database Flow Required

#### Current Form Creation

```
Form
├── Shared Flow (display_order=0, flow_type='shared', is_primary=true)
├── Testimonial Flow (display_order=1, flow_type='branch')
└── Improvement Flow (display_order=2, flow_type='branch')
```

#### Target Form Creation

```
Form
├── Intro Flow (display_order=0, flow_type='shared', is_primary=true)
├── Testimonial Flow (display_order=1, flow_type='branch')
├── Improvement Flow (display_order=2, flow_type='branch')
└── Outro Flow (display_order=3, flow_type='shared')  ← NEW
```

#### Migration Considerations

**Existing forms**: No migration needed - they continue working without outro
**New forms**: AI generation creates 4 flows instead of 3
**Backward compatibility**: Canvas renders whatever segments exist

### Part 5: Step Changes Summary

#### Steps Moving to Outro

| Step Type | Current Location | New Location |
|-----------|-----------------|--------------|
| `contact_info` | Testimonial only | Outro (shared) |
| `thank_you` | Both (duplicated) | Outro (shared, single) |

#### Steps Staying in Branch

| Step Type | Location | Reason |
|-----------|----------|--------|
| `consent` | Testimonial only | Privacy - improvement feedback always private |

#### Implications

1. **Contact info from everyone**: Improvement flow users now provide contact info
2. **Consent only for testimonials**: Improvement feedback remains private (no consent needed)
3. **Single thank you**: Consistent ending for all users

---

## Implementation Status

### Phase 1: Complete (This PR)

| Category | File | Status | Changes |
|----------|------|--------|---------|
| **ADR** | `docs/adr/020-generic-flow-segments/adr.md` | ✅ | ADR document |
| **Utility** | `computeFlowSegments.ts` | ✅ | Segment computation function |
| **Canvas** | `BranchedTimelineCanvas.vue` | ✅ | Segment-based rendering with merge indicator |
| **Composables** | `useTimelineBranching.ts` | ✅ | Add `flowSegments`, `hasOutroSegment`, `outroSteps` |
| **AI Prompt** | `buildDynamicPrompt.ts` | ✅ | Update flow architecture docs |
| **API Schema** | `shared/schemas/ai.ts` | ✅ | Add `thank_you` to StepContentSchema |

### Phase 2: Future Implementation

| Category | File | Status | Changes Needed |
|----------|------|--------|----------------|
| **Step Build** | `buildStepsFromQuestions.ts` | 📋 TODO | Create outro flow + steps, add 'outro' flow membership |
| **Flow Creation** | `useCreateFlows.ts` | 📋 TODO | Support 4-flow creation (intro, testimonial, improvement, outro) |
| **Navigation** | `useFlowNavigation.ts` | 📋 TODO | Full segment-aware navigation |
| **Tests** | `navigation.spec.ts` | 📋 TODO | Outro navigation tests |
| **Tests** | `branching.actions.ts` | 📋 TODO | Outro action helpers |

## Files to Create/Modify

### New Files (Phase 1)
- `docs/adr/018-generic-flow-segments/adr.md` - ADR document (this file)
- `apps/web/src/features/createForm/functions/computeFlowSegments.ts` - Segment computation

### Modified Files (Phase 1)

| Category | File | Changes |
|----------|------|---------|
| **Canvas** | `BranchedTimelineCanvas.vue` | Segment-based rendering with outro support |
| **Composables** | `useTimelineBranching.ts` | Add `flowSegments` computed properties |
| **AI Prompt** | `buildDynamicPrompt.ts` | Update flow architecture documentation |
| **API Schema** | `api/src/shared/schemas/ai.ts` | Add ThankYouSchema for shared outro |

### Files for Phase 2
- `buildStepsFromQuestions.ts` - Create outro flow + steps
- `useFlowNavigation.ts` - Segment-aware keyboard navigation
- E2E tests for outro navigation

---

## Verification

1. **Existing forms**: Load form without outro, verify no regression
2. **New forms**: Create form, verify outro flow created with steps
3. **Canvas**: Verify segment rendering with merge indicator
4. **Navigation**: Verify ↑↓ flows through all segments
5. **E2E tests**: All existing + new outro tests pass
