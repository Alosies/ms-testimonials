# Conditional Flow Branching (Rating-Based)

> Dynamic form flows that route respondents to different question paths based on their rating, enabling targeted feedback collection and service recovery.

**Status:** Draft
**Created:** January 4, 2026
**Last Updated:** January 4, 2026

---

## Problem Statement

Currently, all form respondents follow the same linear path regardless of their satisfaction level. This creates two issues:

1. **Dissatisfied customers** are asked to provide a public testimonial they may not want to give
2. **Businesses miss opportunities** to capture private feedback and recover dissatisfied customers
3. **Public testimonial quality suffers** when unhappy customers submit negative content

### User Stories

**As a business owner**, I want to route low-rating respondents to a private feedback flow so that I can address their concerns without collecting a negative public testimonial.

**As a business owner**, I want to see when someone gives negative feedback so I can follow up and potentially recover the relationship.

**As a form respondent**, I want to feel heard when I'm dissatisfied, not pressured to write a public testimonial I don't mean.

---

## Solution Overview

Implement **conditional branching** that splits the form flow based on a configurable rating threshold:

```
                    ┌─────────────────┐
                    │  Welcome Step   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  ⭐ Rating Step  │
                    │  "How was your  │
                    │   experience?"  │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
      ┌───────▼───────┐             ┌───────▼───────┐
      │   Rating ≥ 4  │             │   Rating < 4  │
      │  ───────────  │             │  ───────────  │
      │  TESTIMONIAL  │             │  IMPROVEMENT  │
      │     FLOW      │             │     FLOW      │
      └───────┬───────┘             └───────┬───────┘
              │                             │
      ┌───────▼───────┐             ┌───────▼───────┐
      │ Problem Step  │             │ "What went    │
      │ "What was     │             │  wrong?"      │
      │ challenging?" │             │               │
      └───────┬───────┘             └───────┬───────┘
              │                             │
      ┌───────▼───────┐             ┌───────▼───────┐
      │ Solution Step │             │ "How can we   │
      │ "How did we   │             │  improve?"    │
      │  help?"       │             │               │
      └───────┬───────┘             └───────┬───────┘
              │                             │
      ┌───────▼───────┐             ┌───────▼───────┐
      │ Result Step   │             │ Contact Info  │
      │ "What results │             │ "Would you    │
      │ did you get?" │             │ like us to    │
      └───────┬───────┘             │ reach out?"   │
              │                     └───────┬───────┘
      ┌───────▼───────┐                     │
      │ Attribution   │             ┌───────▼───────┐
      │ Name, photo,  │             │ 🙏 Thank You  │
      │ company       │             │ "We hear you" │
      └───────┬───────┘             │ (empathetic)  │
              │                     └───────────────┘
      ┌───────▼───────┐
      │ 🎉 Thank You  │
      │ "You're       │
      │  awesome!"    │
      └───────────────┘
```

---

## Competitor Analysis

### How Competitors Handle Negative Ratings

| Platform | Negative Flow Strategy | Recovery Features | Visual Editor |
|----------|----------------------|-------------------|---------------|
| **Typeform** | Logic jumps to different thank you | None built-in | Branching view |
| **Testimonial.to** | Rating gate (low = private feedback) | None | Linear only |
| **Senja** | No conditional logic | None | Linear only |
| **Delighted (NPS)** | Different questions for detractors | Alerts, follow-up emails | N/A |
| **Trustpilot** | All ratings public | Business response feature | N/A |
| **Hotjar** | Conditional follow-ups | Internal notifications | Linear |
| **AskNicely** | Detractor alerts | Auto-assign, close loop | Dashboard |
| **CustomerGauge** | "Close the loop" workflows | Callback scheduling, escalation | Advanced |

### Common Recovery Strategies

1. **Private Feedback Collection** (Most common)
   - Low ratings go to internal feedback, not public testimonial
   - "Your feedback helps us improve"

2. **Acknowledgment + Empathy**
   - Custom "thank you" that acknowledges dissatisfaction
   - "We're sorry to hear that. Your feedback matters."

3. **Contact Capture**
   - "Would you like someone to reach out?"
   - Optional email/phone field

4. **Internal Escalation**
   - Webhook/email to business owner
   - Create support ticket automatically

5. **Service Recovery Offers** (Premium feature)
   - Discount code displayed
   - Free trial extension
   - Priority support offer

6. **Callback Scheduling** (Enterprise)
   - Calendly-style booking embed
   - "Book a call with our team"

### Key Insights

1. **Rating gating** is the minimum—just collecting testimonials only from happy customers
2. **Feedback collection** from unhappy customers is expected but often not structured
3. **Internal notifications** are valuable but rarely offered in testimonial tools
4. **Visual branching editors** are rare in testimonial space (opportunity)
5. **Service recovery features** are premium differentiators

---

## Visual Design: Studio Editor

### Recommended Approach: Side-by-Side Branched View

When branching is enabled, the timeline editor shows two parallel columns:

```
┌──────────────────────────────────────────────────────────────────┐
│  FORM FLOW EDITOR                                    [Branching ✓] │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Welcome Step (shared)                              [Edit]  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              │                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  ⭐ Rating Step                                     [Edit]  │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │  Threshold: [4 ▼]  (≥4 = testimonial, <4 = feedback) │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              │                                     │
│              ┌───────────────┴───────────────┐                    │
│              ▼                               ▼                    │
│  ┌────────────────────────┐    ┌────────────────────────┐        │
│  │ 🟢 TESTIMONIAL FLOW    │    │ 🟠 IMPROVEMENT FLOW    │        │
│  │ Rating ≥ 4             │    │ Rating < 4             │        │
│  ├────────────────────────┤    ├────────────────────────┤        │
│  │                        │    │                        │        │
│  │ ┌────────────────────┐ │    │ ┌────────────────────┐ │        │
│  │ │ Problem Step       │ │    │ │ What Went Wrong?   │ │        │
│  │ └────────────────────┘ │    │ └────────────────────┘ │        │
│  │          ↓             │    │          ↓             │        │
│  │ ┌────────────────────┐ │    │ ┌────────────────────┐ │        │
│  │ │ Solution Step      │ │    │ │ How to Improve?    │ │        │
│  │ └────────────────────┘ │    │ └────────────────────┘ │        │
│  │          ↓             │    │          ↓             │        │
│  │ ┌────────────────────┐ │    │ ┌────────────────────┐ │        │
│  │ │ Result Step        │ │    │ │ Contact Info       │ │        │
│  │ └────────────────────┘ │    │ │ (optional)         │ │        │
│  │          ↓             │    │ └────────────────────┘ │        │
│  │ ┌────────────────────┐ │    │          ↓             │        │
│  │ │ Attribution        │ │    │ ┌────────────────────┐ │        │
│  │ └────────────────────┘ │    │ │ 🙏 Thank You       │ │        │
│  │          ↓             │    │ │ (empathetic)       │ │        │
│  │ ┌────────────────────┐ │    │ └────────────────────┘ │        │
│  │ │ 🎉 Thank You       │ │    │                        │        │
│  │ └────────────────────┘ │    │ [+ Add Step]           │        │
│  │                        │    │                        │        │
│  │ [+ Add Step]           │    └────────────────────────┘        │
│  └────────────────────────┘                                      │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Color Scheme

| Element | Color | Tailwind Class | Meaning |
|---------|-------|----------------|---------|
| Shared Steps | Slate | `border-slate-200 bg-white` | Neutral, appears in all flows |
| Branch Point | Violet | `border-violet-400 bg-violet-50` | Decision point, highlighted |
| Testimonial Flow | Emerald | `border-emerald-400 bg-emerald-50` | Positive path |
| Improvement Flow | Amber | `border-amber-400 bg-amber-50` | Needs attention (not "negative") |
| Flow Headers | — | `text-emerald-700` / `text-amber-700` | Section labels |

### Why Amber Instead of Red

- **Red** implies error, danger, or "wrong" — the customer isn't wrong
- **Amber/Orange** suggests "needs attention" without being hostile
- Maintains positive framing for both the business owner and the terminology

### Terminology

Use **"Improvement Flow"** instead of "Negative Flow":
- More professional
- Frames feedback positively
- Less stigmatizing in the UI

---

## Data Model

### Form Configuration Schema

```typescript
interface FormConfig {
  // ... existing fields ...

  // === BRANCHING ===
  branching: {
    enabled: boolean
    ratingStepId: string | null  // Which step triggers the branch
    threshold: number            // e.g., 4 means >=4 is testimonial
  }
}

interface FormStep {
  id: string
  form_id: string

  // Step identification
  step_type: 'welcome' | 'rating' | 'question' | 'attribution' | 'thank_you' | 'contact_capture'

  // Flow membership
  flow_membership: 'shared' | 'testimonial' | 'improvement'

  // Order within flow (separate ordering per flow)
  display_order: number

  // Step content (varies by type)
  title: string
  subtitle?: string
  question_id?: string  // Links to form_questions for question steps

  // Thank you specific
  thank_you_config?: {
    title: string
    subtitle: string
    show_social_share: boolean
    redirect_url?: string
  }

  // Contact capture specific
  contact_capture_config?: {
    prompt: string
    fields: ('email' | 'phone' | 'name')[]
    required: boolean
  }
}
```

### Database Schema Changes

```sql
-- Add flow membership to form questions (or steps table)
ALTER TABLE form_questions
ADD COLUMN flow_membership TEXT DEFAULT 'shared'
CHECK (flow_membership IN ('shared', 'testimonial', 'improvement'));

-- Or create a new form_steps table for the complete flow
CREATE TABLE form_steps (
  id TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
  form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id),

  -- Step type
  step_type TEXT NOT NULL CHECK (step_type IN (
    'welcome', 'rating', 'question', 'attribution',
    'thank_you', 'contact_capture'
  )),

  -- Flow membership
  flow_membership TEXT NOT NULL DEFAULT 'shared'
    CHECK (flow_membership IN ('shared', 'testimonial', 'improvement')),

  -- Ordering (within flow)
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Content
  title TEXT,
  subtitle TEXT,
  question_id TEXT REFERENCES form_questions(id),

  -- Type-specific config (JSONB)
  config JSONB DEFAULT '{}',

  -- Standard fields
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Update forms table with branching config
ALTER TABLE forms
ADD COLUMN branching_config JSONB DEFAULT '{"enabled": false, "threshold": 4}';
```

### Form Settings Extension

```typescript
interface FormSettings {
  // ... existing settings ...

  // === BRANCHING SETTINGS ===
  branching: {
    enabled: boolean
    threshold: number  // Default: 4

    // Improvement flow customization
    improvementFlow: {
      collectContact: boolean        // Ask for contact info
      contactRequired: boolean       // Is contact info required
      notifyOnSubmission: boolean    // Email owner on negative feedback
      notificationEmail?: string     // Override notification email
    }
  }
}
```

---

## Runtime Flow Logic

### Step Navigation Algorithm

```typescript
interface FlowContext {
  form: Form
  currentStep: FormStep
  responses: Record<string, any>
  flowPath: 'testimonial' | 'improvement' | null  // Set after rating step
}

function getNextStep(context: FlowContext): FormStep | null {
  const { form, currentStep, responses, flowPath } = context
  const steps = form.steps.filter(s => s.is_active)

  // If current step is rating, determine flow path
  if (currentStep.step_type === 'rating' && !flowPath) {
    const rating = responses[currentStep.id]
    const threshold = form.branching_config?.threshold ?? 4

    context.flowPath = rating >= threshold ? 'testimonial' : 'improvement'
  }

  // Get eligible steps based on flow membership
  const eligibleSteps = steps.filter(s =>
    s.flow_membership === 'shared' ||
    s.flow_membership === context.flowPath
  )

  // Find current step index in eligible steps
  const currentIndex = eligibleSteps.findIndex(s => s.id === currentStep.id)

  // Return next step or null if at end
  return eligibleSteps[currentIndex + 1] ?? null
}

function getFlowSteps(form: Form, flowPath: 'testimonial' | 'improvement'): FormStep[] {
  return form.steps
    .filter(s => s.is_active)
    .filter(s => s.flow_membership === 'shared' || s.flow_membership === flowPath)
    .sort((a, b) => {
      // Shared steps first (by their order), then flow-specific steps
      if (a.flow_membership === 'shared' && b.flow_membership !== 'shared') return -1
      if (a.flow_membership !== 'shared' && b.flow_membership === 'shared') return 1
      return a.display_order - b.display_order
    })
}
```

### Progress Calculation

```typescript
function calculateProgress(context: FlowContext): number {
  const flowSteps = getFlowSteps(context.form, context.flowPath ?? 'testimonial')
  const currentIndex = flowSteps.findIndex(s => s.id === context.currentStep.id)

  return ((currentIndex + 1) / flowSteps.length) * 100
}
```

---

## Recovery Features

### Phase 1: MVP

1. **Improvement Flow Steps**
   - "What went wrong?" question
   - "How can we improve?" question
   - Empathetic thank you screen

2. **Visual Editor**
   - Side-by-side branched view
   - Color-coded flows
   - Add/edit/reorder steps per flow

3. **Threshold Configuration**
   - Configurable threshold (default: 4)
   - Preview mode to test both flows

### Phase 2: Notifications

4. **Internal Notifications**
   - Email notification when improvement flow submitted
   - Webhook support for integrations
   - Submission includes rating and feedback

### Phase 3: Contact & Recovery

5. **Contact Capture**
   - Optional contact info collection
   - "Would you like us to reach out?"
   - Phone or email field

6. **Service Recovery Offers** (Premium)
   - Display discount code after submission
   - Configurable offer per form
   - Track redemption

### Phase 4: Advanced

7. **Callback Scheduling** (Enterprise)
   - Calendly/Cal.com integration
   - "Book a call with our team"

8. **Analytics**
   - Flow distribution metrics
   - Conversion rates by flow
   - Recovery success tracking

---

## UI Components Required

### Studio Editor

```
components/
├── studio/
│   ├── FormFlowEditor.vue           # Main branching editor
│   ├── BranchingToggle.vue          # Enable/disable branching
│   ├── ThresholdSelector.vue        # Rating threshold picker
│   ├── FlowColumn.vue               # Single flow column (testimonial/improvement)
│   ├── FlowStepCard.vue             # Step card within flow
│   └── FlowConnectionLine.vue       # Visual connector lines
```

### Form Renderer (Public Form)

```
components/
├── form-renderer/
│   ├── FormFlowController.vue       # Manages flow state & navigation
│   ├── RatingStep.vue               # Rating input + branch trigger
│   ├── ContactCaptureStep.vue       # Contact info collection
│   └── ImprovementThankYou.vue      # Empathetic thank you variant
```

---

## Default Improvement Flow

When branching is enabled, provide sensible defaults:

### Default Steps

1. **What went wrong?** (text_long)
   - Title: "We're sorry to hear that"
   - Question: "What aspect of your experience didn't meet expectations?"
   - Placeholder: "Please share what went wrong..."
   - Help text: "Your honest feedback helps us improve"

2. **How can we improve?** (text_long)
   - Title: "Help us do better"
   - Question: "What could we do differently to improve your experience?"
   - Placeholder: "Share your suggestions..."

3. **Contact Info** (contact_capture) - Optional
   - Title: "Would you like us to reach out?"
   - Prompt: "Leave your email if you'd like someone to follow up"
   - Fields: email (optional)

4. **Thank You** (thank_you)
   - Title: "Thank you for your feedback"
   - Subtitle: "We take your feedback seriously and will work to improve. We appreciate you taking the time to help us get better."

### Default Improvement Flow Copy

```typescript
const defaultImprovementSteps = [
  {
    step_type: 'question',
    flow_membership: 'improvement',
    display_order: 1,
    title: "We're sorry to hear that",
    config: {
      question_text: "What aspect of your experience didn't meet expectations?",
      placeholder: "Please share what went wrong...",
      help_text: "Your honest feedback helps us improve"
    }
  },
  {
    step_type: 'question',
    flow_membership: 'improvement',
    display_order: 2,
    title: "Help us do better",
    config: {
      question_text: "What could we do differently to improve your experience?",
      placeholder: "Share your suggestions..."
    }
  },
  {
    step_type: 'thank_you',
    flow_membership: 'improvement',
    display_order: 3,
    title: "Thank you for your feedback",
    config: {
      subtitle: "We take your feedback seriously and will work to improve. We appreciate you taking the time to help us get better.",
      show_social_share: false
    }
  }
]
```

---

## Analytics & Metrics

### Key Metrics to Track

| Metric | Description | Value |
|--------|-------------|-------|
| **Flow Distribution** | % testimonial vs improvement | Indicates overall satisfaction |
| **Improvement Flow Completion** | % who finish improvement flow | Measures engagement with feedback |
| **Contact Opt-in Rate** | % who leave contact info | Measures recovery opportunity |
| **Testimonial Conversion** | % of visitors who complete testimonial | Main success metric |
| **Average Rating** | Mean rating score | Overall satisfaction benchmark |

### Dashboard Display

```
┌─────────────────────────────────────────────────────────┐
│  Flow Distribution (Last 30 days)                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ████████████████████████████░░░░░░░░░░ 72%         │ │
│  │ Testimonial Flow                                    │ │
│  │ ░░░░░░░░░░░░░░░░████████████ 28%                   │ │
│  │ Improvement Flow                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 156          │  │ 43           │  │ 12           │  │
│  │ Testimonials │  │ Feedback     │  │ Contact      │  │
│  │ collected    │  │ received     │  │ requests     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Core Branching (MVP)

**Goal:** Basic rating-based branching with visual editor

| Task | Priority | Notes |
|------|----------|-------|
| Database schema for flow membership | P0 | form_steps table or column |
| Form settings branching config | P0 | threshold, enabled |
| Branched timeline editor UI | P0 | Side-by-side columns |
| Runtime flow navigation | P0 | getNextStep logic |
| Default improvement flow steps | P0 | Pre-populated steps |
| Flow preview mode | P1 | Test both paths |

### Phase 2: Enhanced Feedback Collection

**Goal:** Better feedback capture and notifications

| Task | Priority | Notes |
|------|----------|-------|
| Contact capture step type | P0 | Email/phone collection |
| Email notifications | P0 | On improvement submission |
| Webhook support | P1 | For integrations |
| Submission tagging | P1 | Mark as "improvement feedback" |

### Phase 3: Recovery & Analytics

**Goal:** Service recovery and metrics

| Task | Priority | Notes |
|------|----------|-------|
| Flow analytics dashboard | P1 | Distribution, conversion |
| Recovery offer display | P2 | Show discount code |
| Callback scheduling | P2 | Calendar integration |
| Close-loop tracking | P2 | Did they become happy? |

---

## Open Questions

1. **Should improvement flow submissions create testimonials?**
   - Option A: Create as "private feedback" (separate table/flag)
   - Option B: Create as testimonial with special status
   - **Recommendation:** Separate `feedback` table or `is_feedback` flag

2. **Can users switch flows mid-way?**
   - Option A: No, rating determines path permanently
   - Option B: Allow "Actually, I want to leave a testimonial" escape hatch
   - **Recommendation:** Option A for MVP, consider B later

3. **Multiple branch points?**
   - Option A: Only one branch (after rating)
   - Option B: Allow multiple conditional branches
   - **Recommendation:** Option A for simplicity, design data model for B

4. **What if form has no rating step?**
   - Branching toggle disabled if no rating question exists
   - Show helper: "Add a rating question to enable branching"

---

## Success Criteria

1. **Studio:** Business owners can enable branching in < 1 minute
2. **Visual Clarity:** Flow paths are immediately understandable
3. **Respondent UX:** Seamless transition, no visible "penalty" for low rating
4. **Feedback Quality:** Higher completion rate for improvement flow than just abandonment
5. **Recovery:** Business owners receive notifications within 5 minutes

---

## Appendix: Competitive Screenshots

*To be added: Screenshots from Typeform, Delighted, etc. showing their branching UIs*

## Appendix: User Research

*To be added: Interview findings with users about feedback collection pain points*
