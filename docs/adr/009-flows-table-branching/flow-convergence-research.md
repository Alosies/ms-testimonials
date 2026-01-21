# Flow Convergence Research

**Date:** 2026-01-18
**Status:** Research Complete
**Related:** ADR-009 Flows Table Branching Architecture

---

## Problem Statement

The current flow architecture (ADR-009) supports **divergent branching** (shared steps → conditional branches) but lacks support for **convergent paths** (branches merging back to common steps).

### Current Architecture

```
Form
├── Shared Flow (flow_type='shared', display_order=0)
│   └── Steps: welcome, rating question
├── Testimonial Flow (flow_type='branch', display_order=1)
│   └── Steps: testimonial questions
└── Improvement Flow (flow_type='branch', display_order=2)
    └── Steps: improvement questions
```

### Desired Capability

```
Shared → Rating → [Branch] → Converge → Contact Info → Consent → Thank You
                     │
        ┌────────────┴────────────┐
        ↓                         ↓
   Testimonial              Improvement
     Steps                    Steps
        └────────────┬────────────┘
                     ↓
              Common Steps (convergence)
```

Without convergence support, common closing steps (contact info, consent, thank you) must be **duplicated** in both branch flows.

---

## Industry Research

### Testimonial-Specific Tools

| Tool | Branching Support | Convergence | Architecture |
|------|-------------------|-------------|--------------|
| **Testimonial.to** | None | N/A | Linear flow only |
| **Senja** | Minimal | N/A | Focus on simplicity |
| **VideoAsk** | Simple 2-way | Implicit | Good/bad rating → different prompts |
| **Shoutout** | None | N/A | Linear |
| **Endorsal** | None | N/A | Linear |

**Key finding:** Testimonial tools keep it **extremely simple**. None offer explicit convergence or multi-level branching. The focus is on reducing friction for testimonial collection.

### Survey/Form Tools

| Tool | Branching Model | Convergence | UI Approach |
|------|-----------------|-------------|-------------|
| **Typeform** | Per-question "Logic Jumps" | Implicit (jump target) | Simple dropdown |
| **Google Forms** | Section → Section | Implicit | "Go to section X" dropdown |
| **SurveyMonkey** | Skip/Display Logic | Implicit | Rule builder |
| **Tally** | Conditional blocks | Implicit | Block-based |
| **Jotform** | Show/Hide + Page jumps | Implicit | Condition builder |

**Key finding:** Even sophisticated survey tools don't expose "convergence" as a first-class concept. It's always implicit - you set where each branch goes, and if multiple branches point to the same destination, that's convergence.

### Workflow/Automation Tools

| Tool | Model | Complexity |
|------|-------|------------|
| **Zapier** | Node + Edge graph | High |
| **n8n** | Visual DAG editor | High |
| **Pipedream** | Code-first flows | High |

These tools support full DAG structures but are targeted at developers/power users, not typical form builders.

### Why Competitors Avoid Complexity

1. **Completion rates drop** - Each branch point loses respondents
2. **Configuration overhead** - Users struggle with complex flows
3. **Support burden** - "Why didn't my customer see question X?"
4. **The 80/20 rule** - 80% of forms are linear, 15% have one branch, 5% need more

---

## Architecture Options Analysis

### Option 1: `post_branch` Flow Type (Recommended)

Extend `flow_type` enum to include a third type for steps shown after branches complete.

```sql
ALTER TABLE public.flows DROP CONSTRAINT IF EXISTS chk_flows_flow_type;
ALTER TABLE public.flows ADD CONSTRAINT chk_flows_flow_type
  CHECK (flow_type IN ('shared', 'branch', 'post_branch'));
```

**Data model:**
```
Form
├── Shared Flow (flow_type='shared', display_order=0)
├── Testimonial Flow (flow_type='branch', display_order=1)
├── Improvement Flow (flow_type='branch', display_order=2)
└── Closing Flow (flow_type='post_branch', display_order=3)  ← NEW
```

**Runtime logic:**
1. Show `shared` flow steps (ORDER BY display_order)
2. Evaluate branch conditions → show matching `branch` flow steps
3. Show `post_branch` flow steps (ORDER BY display_order)

| Aspect | Assessment |
|--------|------------|
| Implementation | 1-2 days |
| Schema change | Minimal (constraint update) |
| UI complexity | Low (add section to timeline) |
| Runtime complexity | Low (three-phase state machine) |
| CRUD complexity | Low (existing patterns) |
| Limitations | Single convergence point only |

### Option 2: `converges_to_flow_id` Column

Add explicit flow-to-flow linking for more control.

```sql
ALTER TABLE flows ADD COLUMN converges_to_flow_id TEXT REFERENCES flows(id);
```

**How it works:**
- Branch flows explicitly point to their convergence target
- Multiple branches can point to the same convergence flow
- Runtime follows `converges_to_flow_id` after branch completes

```
Testimonial Flow (converges_to_flow_id = 'closing_flow')  ──┐
                                                           ├──► Closing Flow
Improvement Flow (converges_to_flow_id = 'closing_flow')  ──┘
```

| Aspect | Assessment |
|--------|------------|
| Implementation | ~1 week |
| Schema change | Medium (new column + FK) |
| UI complexity | Medium (show/edit convergence target) |
| Runtime complexity | Medium (follow explicit links) |
| CRUD complexity | Medium (validate references on delete) |
| Limitations | None for diamond pattern |

### Option 3: `parent_flow_id` (Single Parent Tree)

```sql
ALTER TABLE flows ADD COLUMN parent_flow_id TEXT REFERENCES flows(id);
```

| Aspect | Assessment |
|--------|------------|
| Implementation | ~1 week |
| Limitations | **Cannot support convergence** (tree structure only) |
| Verdict | **Not suitable for this problem** |

### Option 4: `parent_flow_ids[]` Array (Multiple Parents)

```sql
ALTER TABLE flows ADD COLUMN parent_flow_ids TEXT[];
```

| Aspect | Assessment |
|--------|------------|
| Implementation | 2-3 weeks |
| Schema change | High (no FK on arrays) |
| UI complexity | High (multi-parent selection) |
| Runtime complexity | High (graph traversal) |
| CRUD complexity | High (validate array contents) |
| Limitations | No referential integrity |

### Option 5: `flow_edges` Junction Table (Full Graph)

```sql
CREATE TABLE flow_edges (
  from_flow_id TEXT REFERENCES flows(id),
  to_flow_id TEXT REFERENCES flows(id),
  condition JSONB,
  PRIMARY KEY (from_flow_id, to_flow_id)
);
```

| Aspect | Assessment |
|--------|------------|
| Implementation | 3-6 months (includes visual editor) |
| Schema change | Major (new table, new paradigm) |
| UI complexity | Very High (visual graph editor needed) |
| Runtime complexity | High (BFS/DFS traversal, cycle detection) |
| CRUD complexity | Very High (graph integrity checks) |
| Limitations | Over-engineering for form use case |

---

## Complexity Analysis

### UI Complexity by Option

#### Option 1: `post_branch` type

```
┌─────────────────────────────────────────────────┐
│ 📋 Form Steps                                   │
├─────────────────────────────────────────────────┤
│ ┌─ Shared Steps ─────────────────────────────┐  │
│ │  1. Welcome                                │  │
│ │  2. Rating Question  ⚡ Branch Point       │  │
│ └────────────────────────────────────────────┘  │
│ ┌─ If Rating ≥ 4 ────────────────────────────┐  │
│ │  3. What problem did we solve?             │  │
│ │  4. How has it helped?                     │  │
│ └────────────────────────────────────────────┘  │
│ ┌─ If Rating < 4 ────────────────────────────┐  │
│ │  3. What went wrong?                       │  │
│ │  4. How can we improve?                    │  │
│ └────────────────────────────────────────────┘  │
│ ┌─ Closing Steps (everyone) ─────────────────┐  │
│ │  5. Contact Information                    │  │
│ │  6. Consent                                │  │
│ │  7. Thank You                              │  │
│ └────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Verdict:** Timeline with collapsible sections. Fits existing UI pattern.

#### Options 4-5: Graph-based

```
┌─────────────────────────────────────────────────────────────────┐
│                         ┌─────────┐                             │
│                         │ Welcome │                             │
│                         └────┬────┘                             │
│                              │                                  │
│                         ┌────▼────┐                             │
│                         │ Rating  │                             │
│                         └────┬────┘                             │
│                    ┌─────────┴─────────┐                        │
│               ┌────▼────┐         ┌────▼────┐                   │
│               │Testimon.│         │Improve. │                   │
│               └────┬────┘         └────┬────┘                   │
│                    └─────────┬─────────┘                        │
│                         ┌────▼────┐                             │
│                         │ Closing │                             │
│                         └─────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

**Verdict:** Requires visual graph editor (like n8n, Figma). **Major feature, not a schema decision.**

### Rendering Complexity (Form Player)

#### Option 1: `post_branch` type

```typescript
type FlowPhase = 'shared' | 'branch' | 'post_branch';

function determineNextStep(
  currentStep: FormStep,
  currentFlow: Flow,
  allFlows: Flow[],
  responses: Response[]
): FormStep | null {

  const nextInFlow = getNextStepInFlow(currentStep, currentFlow);
  if (nextInFlow) return nextInFlow;

  switch (currentFlow.flow_type) {
    case 'shared':
      const matchingBranch = allFlows
        .filter(f => f.flow_type === 'branch')
        .find(f => evaluateCondition(f, responses));
      return matchingBranch ? getFirstStep(matchingBranch) : null;

    case 'branch':
      const postBranch = allFlows.find(f => f.flow_type === 'post_branch');
      return postBranch ? getFirstStep(postBranch) : null;

    case 'post_branch':
      return null; // Done
  }
}
```

**Lines of code:** ~25
**Cognitive complexity:** Low

#### Options 4-5: Graph-based

```typescript
function determineNextStep(
  currentStep: FormStep,
  currentFlow: Flow,
  allFlows: Flow[],
  responses: Response[],
  visitedFlows: Set<string>  // Cycle detection required
): FormStep | null {

  const nextInFlow = getNextStepInFlow(currentStep, currentFlow);
  if (nextInFlow) return nextInFlow;

  // Cycle detection
  if (visitedFlows.has(currentFlow.id)) {
    console.error('Cycle detected!');
    return null;
  }
  visitedFlows.add(currentFlow.id);

  // Find next flows via parent_flow_ids or edges table
  const nextFlows = allFlows.filter(f =>
    f.parent_flow_ids?.includes(currentFlow.id)
  );

  if (nextFlows.length === 0) {
    if (currentFlow.converges_to_flow_id) {
      const convergenceFlow = allFlows.find(
        f => f.id === currentFlow.converges_to_flow_id
      );
      return convergenceFlow ? getFirstStep(convergenceFlow) : null;
    }
    return null;
  }

  // Multiple next flows - evaluate conditions
  const matchingFlow = nextFlows.find(f => {
    if (!f.branch_question_id) return true;
    return evaluateCondition(f, responses);
  });

  return matchingFlow ? getFirstStep(matchingFlow) : null;
}
```

**Lines of code:** ~50
**Cognitive complexity:** High (graph traversal, cycle detection)

### CRUD Complexity Comparison

| Operation | `post_branch` | Graph-based |
|-----------|---------------|-------------|
| Delete step | Check if branch point | Check if branch point in any flow |
| Delete flow | Cascade steps | Update `converges_to` refs, check orphans |
| Add step | Insert with flow_id | Validate graph integrity |
| Add flow | Validate flow_type | Set parents/convergence, validate no cycles |
| Change condition | Update flow columns | Ensure conditions exhaustive & exclusive |
| Move step | Update flow_id | Check if breaks connectivity |

---

## Double Branching Analysis

### Hypothetical Scenario

```
Welcome
   ↓
Rating (Branch Point 1)
   ↓
┌──────┴──────┐
≥4 stars     <4 stars
   ↓            ↓
Testimonial  Improvement
   ↓            ↓
└──────┬──────┘
       ↓
Contact Info (Converge)
       ↓
Consent (Branch Point 2?)
       ↓
┌──────┴──────┐
Public       Private
   ↓            ↓
Social       Simple
Share        Thanks
└──────┬──────┘
       ↓
Thank You
```

### Analysis: Is Consent Actually a Branch Point?

**No.** The consent choice affects:
- Where the testimonial appears (public widget vs. internal only)
- What's shown on the thank-you page (social share buttons vs. plain message)

This is better handled as **conditional content within a single step**:

```typescript
// Thank you step renders differently based on consent response
const thankYouContent = computed(() => {
  if (responses.consent === 'public') {
    return {
      title: "Thank you! 🎉",
      message: "Your testimonial will appear on our website.",
      showSocialShare: true
    };
  } else {
    return {
      title: "Thank you!",
      message: "Your feedback helps us improve.",
      showSocialShare: false
    };
  }
});
```

### When Would Double Branching Actually Be Needed?

Contrived example for **market research surveys**:
```
NPS Score → [Promoter/Passive/Detractor] → Converge →
Feature Usage → [Power User/Casual/New] → Converge → End
```

This is a different product category (survey tool, not testimonial collection).

### Verdict on Double Branching

| Question | Answer |
|----------|--------|
| Do competitors support it? | **No** |
| Do users need it for testimonials? | **No** - consent is a flag, not a branch |
| Is it worth the complexity? | **No** - 10x complexity for 1% use case |

---

## Recommendation

### Primary Recommendation: `display_order`-Based Positioning (Simpler Approach)

**Decision:** Keep existing `flow_type` values (`'shared'`/`'branch'`) and use `display_order` to determine intro vs outro positioning.

**Why:**
1. **No schema change** - Existing `flow_type` constraint unchanged
2. **No data migration** - All existing flows work as-is
3. **N-way branching** - Supports 2, 3, or any number of branches
4. **Multiple intro/outro** - Could have multiple shared sections before/after branches
5. **Position-based** - `display_order` already exists and is indexed
6. **Covers real use case** - Shared → Branch → Converge → End

### How It Works

```
Form
├── Shared Flow (display_order=0)  ← Before branches (intro)
├── Branch Flow (display_order=1)  ← Conditional branch 1
├── Branch Flow (display_order=2)  ← Conditional branch 2
├── Branch Flow (display_order=3)  ← Conditional branch 3 (NPS example)
└── Shared Flow (display_order=4)  ← After branches (outro)
```

**Semantics:**
- `flow_type: 'shared'` = Always shown (unconditional)
- `flow_type: 'branch'` = Shown conditionally (only ONE branch executes)
- `display_order` determines position relative to branches

**Runtime logic:**
1. Show `shared` flows where `display_order < min(branch display_order)` → **intro**
2. Evaluate branch conditions → show the ONE matching branch
3. Show `shared` flows where `display_order > max(branch display_order)` → **outro**

### Implementation (No Database Changes Required)

The existing schema already supports this:
- `flow_type` CHECK constraint: `('shared', 'branch')` - unchanged
- `display_order` column exists on flows table
- No migration needed

### Runtime Logic (When Implementing Outro)

```typescript
function getFlowSequence(flows: Flow[]) {
  const shared = flows.filter(f => f.flow_type === 'shared');
  const branches = flows.filter(f => f.flow_type === 'branch');

  if (branches.length === 0) {
    return { intro: shared, branches: [], outro: [] };
  }

  const minBranchOrder = Math.min(...branches.map(f => f.display_order));
  const maxBranchOrder = Math.max(...branches.map(f => f.display_order));

  return {
    intro: shared.filter(f => f.display_order < minBranchOrder),
    branches: branches,
    outro: shared.filter(f => f.display_order > maxBranchOrder),
  };
}
```

### Examples

**2-Way Rating Branching (Current):**
```
Shared (order=0) → Branch: Happy (order=1) OR Unhappy (order=2) → Shared (order=3)
```

**3-Way NPS Branching:**
```
Shared (order=0) → Branch: Promoters (order=1) OR Passives (order=2) OR Detractors (order=3) → Shared (order=4)
```

**5-Way Custom Branching:**
```
Shared (order=0) → 5 branches (order=1-5) → Shared (order=6)
```

### Rejected Alternative: `post_branch` Flow Type

Adding a third `flow_type` value was considered but rejected:
- Requires schema migration (ALTER constraint)
- Data migration needed (update existing flows)
- More complex than using existing `display_order`
- `display_order` approach is more flexible (supports multiple intro/outro sections)

### Future Escape Hatch

If more complex flows are ever needed:
1. Add `converges_to_flow_id` column for explicit linking
2. Still avoid full graph model unless building a visual workflow editor

### Handling "I Need Another Branch" Requests

When users ask for a second branch point, the solution is usually **conditional content within steps**, not additional flow branching.

#### Example Scenario

User request: *"After consent, I want to show a social share screen for public testimonials, but just a simple thank you for private ones."*

**What they think they need** (double branching):

```
                    Consent
                       ↓
           ┌──────────┴──────────┐
        Public                Private
           ↓                     ↓
    Social Share Step      Simple Thank You
           ↓                     ↓
      Thank You               (end)
```

This would require graph-based architecture with all its complexity.

**What they actually need** (conditional content):

```
Consent → Thank You Step (content varies based on consent answer)
```

One step that renders differently based on earlier responses.

#### Implementation: Database Schema

Store conditional display rules in the step's `content` JSONB:

```json
{
  "step_type": "thank_you",
  "content": {
    "title": "Thank you!",
    "variants": {
      "public": {
        "message": "Your testimonial will appear on our website. Share it with your network!",
        "show_social_share": true
      },
      "private": {
        "message": "Your feedback helps us improve. We appreciate your time!",
        "show_social_share": false
      }
    },
    "variant_key": "consent"
  }
}
```

#### Implementation: Frontend Component

```vue
<template>
  <div class="thank-you-step">
    <h1>{{ content.title }}</h1>

    <!-- Conditional message based on consent response -->
    <p>{{ activeVariant.message }}</p>

    <!-- Conditional social share buttons -->
    <SocialShareButtons
      v-if="activeVariant.show_social_share"
      :testimonial="assembledTestimonial"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  content: ThankYouStepContent;
  responses: FormQuestionResponse[];
}>();

// Get the response that determines which variant to show
const consentResponse = computed(() =>
  props.responses.find(r => r.question_key === 'consent')?.answer_text
);

// Select the appropriate content variant
const activeVariant = computed(() => {
  const variantKey = consentResponse.value || 'private'; // Default to private
  return props.content.variants[variantKey] || props.content.variants.private;
});
</script>
```

#### When to Use Each Approach

| Scenario | Solution | Why |
|----------|----------|-----|
| Show/hide social share buttons based on consent | **Conditional content** | Same step, minor variation |
| Different thank you message for public vs private | **Conditional content** | Same step, different text |
| Completely different questions for promoters vs detractors | **Flow branching** | Different step sequences |
| 3 questions for happy customers, 5 for unhappy | **Flow branching** | Different path lengths |
| Show confetti animation for 5-star ratings | **Conditional content** | Cosmetic variation |

#### Key Insight

**Not every variation needs a branch.** Ask:
- Are the paths structurally different (different questions, different lengths)?
- Or are they cosmetically different (different messages, show/hide elements)?

If cosmetic → conditional content.
If structural → flow branching.

This handles 99% of "I need another branch" requests without schema changes.

---

## Summary

| Approach | Build Time | Maintenance | User Complexity | Recommendation |
|----------|------------|-------------|-----------------|----------------|
| `display_order` positioning | 0 days | Low | Low | **Do this** |
| `post_branch` type | 1-2 days | Low | Low | Rejected (unnecessary) |
| `converges_to_flow_id` | 1 week | Medium | Medium | Maybe later |
| `parent_flow_ids[]` | 2-3 weeks | High | High | Skip |
| Full graph editor | 3-6 months | Very High | Very High | Different product |

**Principle: Start simple. Validate with users. Add complexity only when proven necessary.**

**Selected approach:** Use `display_order` to determine flow positioning. Shared flows before branches = intro, shared flows after branches = outro. No schema changes required.

---

## References

- ADR-009: Flows Table Branching Architecture
- [Typeform Logic Jumps](https://www.typeform.com/help/a/add-logic-to-your-typeforms-360052749251/)
- [Google Forms Section Logic](https://support.google.com/docs/answer/7322334)
- [SurveyMonkey Skip Logic](https://help.surveymonkey.com/en/create/skip-logic/)
