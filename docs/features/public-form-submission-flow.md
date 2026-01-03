# Public Form Submission Flow

> **Document Type:** Feature Specification
> **Status:** Research Complete
> **Last Updated:** 2026-01-03

## Overview

This document defines the complete user flow for customers submitting testimonials through public collection forms. The flow guides customers from landing on the form through submitting their testimonial, with AI-assisted content assembly and proper consent collection.

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Complete Submission Flow](#complete-submission-flow)
3. [Step-by-Step Specification](#step-by-step-specification)
4. [Database Schema](#database-schema)
5. [MVP vs Future Features](#mvp-vs-future-features)
6. [Competitor Research](#competitor-research)
7. [Implementation Considerations](#implementation-considerations)

---

## Current State Analysis

### What Exists in Database Schema

The database already supports comprehensive testimonial collection:

#### `form_submissions` Table
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `submitter_name` | TEXT | Yes | Customer's full name |
| `submitter_email` | TEXT | Yes | Email (not displayed publicly) |
| `submitter_title` | TEXT | No | Job title |
| `submitter_company` | TEXT | No | Company name |
| `submitter_avatar_url` | TEXT | No | Profile photo URL |
| `submitter_linkedin_url` | TEXT | No | LinkedIn profile (URL validated) |
| `submitter_twitter_url` | TEXT | No | Twitter/X profile (URL validated) |

#### `testimonials` Table
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | TEXT | Yes | The assembled/final testimonial text |
| `rating` | INTEGER | No | Star rating (1-5) |
| `customer_*` | Various | - | Duplicated from submission for display |
| `status` | TEXT | Yes | pending / approved / rejected |

#### `form_question_responses` Table
Stores individual answers to each question with type-specific columns:
- `answer_text` - Text answers
- `answer_integer` - Numeric answers (ratings)
- `answer_boolean` - Checkbox/consent answers
- `answer_json` - Multiple choice arrays
- `answer_url` - File uploads / URLs

### What's Missing in Current UI

The form preview (at `/edit?section=preview`) only shows the **questions phase**. Missing:

1. **Customer Information Collection** - No UI to collect name, email, company, etc.
2. **AI Assembly Step** - No step where answers become a coherent testimonial
3. **Review/Edit Step** - Customer can't see or edit the assembled testimonial
4. **Consent Screen** - No explicit consent for public vs private use
5. **Thank You Screen** - No confirmation after submission

---

## Complete Submission Flow

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  STEP 1: WELCOME (Optional)                                         │
│  ─────────────────────────                                          │
│  • Product branding/logo                                            │
│  • Brief intro: "Share your experience with [Product]"              │
│  • Set expectations: "Takes about 2 minutes"                        │
│  • [Get Started] button                                             │
│                                                                     │
│  Toggleable in form settings. Skip if disabled.                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  STEP 2: QUESTIONS                                                  │
│  ─────────────────                                                  │
│  Display each question configured in the form editor:               │
│                                                                     │
│  • Problem question (text_long)                                     │
│    "Before using [Product], what was your biggest challenge?"       │
│                                                                     │
│  • Solution question (text_long)                                    │
│    "Can you describe your experience using [Product]?"              │
│                                                                     │
│  • Result question (text_long)                                      │
│    "What specific results have you seen?"                           │
│                                                                     │
│  • Rating (rating_star)                                             │
│    "Overall, how satisfied are you?" ★★★★★                          │
│                                                                     │
│  • Advice question (text_long) [Optional]                           │
│    "What advice would you give someone considering [Product]?"      │
│                                                                     │
│  Can be single page (all questions) or multi-step (one per page)    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  STEP 3: AI ASSEMBLY                                                │
│  ───────────────────                                                │
│  Loading State:                                                     │
│  • "Crafting your testimonial..." with spinner                      │
│  • Call POST /ai/assemble with question responses                   │
│                                                                     │
│  Result State:                                                      │
│  • Display assembled testimonial in editable textarea               │
│  • Character count indicator (target: 100-300 words)                │
│  • Customer can edit/refine the AI output                           │
│  • [Continue] button                                                │
│                                                                     │
│  AI Assembly Prompt Context:                                        │
│  - Product name and description                                     │
│  - All question responses                                           │
│  - Target tone: authentic, conversational, specific                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  STEP 4: YOUR INFORMATION                                           │
│  ────────────────────────                                           │
│  Collect customer attribution details:                              │
│                                                                     │
│  Required Fields:                                                   │
│  • Full Name* ─────────────────────────────                         │
│  • Email* ─────────────────────────────────                         │
│    (Note: "Your email won't be displayed publicly")                 │
│                                                                     │
│  Optional Fields:                                                   │
│  • Job Title ──────────────────────────────                         │
│  • Company ────────────────────────────────                         │
│  • Photo upload ◯ [Upload Photo]                                    │
│  • LinkedIn URL ───────────────────────────                         │
│  • Twitter/X URL ──────────────────────────                         │
│                                                                     │
│  [Continue] button                                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  STEP 5: CONSENT                                                    │
│  ──────────────                                                     │
│  "Where can we use your testimonial?"                               │
│                                                                     │
│  We want to use your testimonial in our marketing and sales.        │
│  Where can we share it?                                             │
│                                                                     │
│  ○ You can use my testimonial publicly in your                      │
│    marketing and sales.                                             │
│                                                                     │
│  ○ You can only use my testimonial privately                        │
│    in your marketing and sales.                                     │
│                                                                     │
│  [Continue] button                                                  │
│                                                                     │
│  Note: Default selection should be "publicly" (pre-selected)        │
│  Note: "Privately" means internal use only, not in widgets          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  STEP 6: REVIEW & SUBMIT                                            │
│  ───────────────────────                                            │
│  Final preview showing exactly how testimonial will appear:         │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  "Using Acme Scheduler has transformed how I manage my      │    │
│  │   day-to-day operations. Before, I was constantly juggling  │    │
│  │   multiple calendars and missing appointments..."           │    │
│  │                                                             │    │
│  │   ★★★★★                                                     │    │
│  │                                                             │    │
│  │   [Photo] Jane Smith                                        │    │
│  │           Product Manager at TechCorp                       │    │
│  │           🔗 LinkedIn  𝕏 Twitter                            │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  [Edit] link to go back and make changes                            │
│                                                                     │
│  [Submit Testimonial] button (primary CTA)                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  STEP 7: THANK YOU                                                  │
│  ────────────────                                                   │
│  Confirmation screen:                                               │
│                                                                     │
│  ✓ Thank you for your testimonial!                                  │
│                                                                     │
│  "Your feedback means the world to us. We'll review your            │
│   testimonial and may feature it on our website."                   │
│                                                                     │
│  Optional: Social share buttons                                     │
│  [Share on LinkedIn] [Share on Twitter]                             │
│                                                                     │
│  Optional: Link to rewards (future feature)                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐

   STEP 8: REWARDS (Future Feature)
   ────────────────────────────────
   Gamified incentive for submission:

   • Spin the Wheel
   • Scratch Card
   • Instant Coupon Reveal

   Prizes: Discount codes, free months, swag

   See "Future Features" section for details

└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

---

## Step-by-Step Specification

### Step 1: Welcome Screen (Optional)

**Purpose:** Set context and expectations before starting.

**Configuration:** Toggleable in form settings (`form.settings.show_welcome_screen`)

**Content:**
- Form title (from `form.name`)
- Product name (from `form.product_name`)
- Custom welcome message (from `form.settings.welcome_message`)
- Estimated time: "Takes about 2 minutes"
- Primary CTA: "Get Started" / "Share Your Experience"

**Skip Logic:** If disabled, go directly to Questions step.

---

### Step 2: Questions

**Purpose:** Collect structured feedback through guided questions.

**Display Modes:**
1. **Single Page** - All questions visible on one scrollable page
2. **Multi-Step** - One question per page with progress indicator

**Question Types Supported:**
- `text_short` - Single line input
- `text_long` - Multi-line textarea
- `rating_star` - 1-5 star rating
- `rating_nps` - 0-10 NPS scale
- `rating_scale` - Custom numeric scale
- `choice_single` - Radio buttons
- `choice_multiple` - Checkboxes
- `choice_dropdown` - Select dropdown

**Validation:**
- Required fields marked with asterisk
- Min/max length for text fields
- Real-time validation feedback

**Data Storage:**
- Each response stored in `form_question_responses`
- Linked to `form_submissions` via `submission_id`

---

### Step 3: AI Assembly

**Purpose:** Transform raw answers into a coherent, polished testimonial.

**API Endpoint:** `POST /api/ai/assemble`

**Request Payload:**
```typescript
interface AssembleRequest {
  form_id: string;
  product_name: string;
  product_description?: string;
  responses: {
    question_key: string;      // e.g., "problem", "solution", "result"
    question_text: string;     // The question that was asked
    answer: string | number;   // The customer's response
  }[];
}
```

**Response:**
```typescript
interface AssembleResponse {
  testimonial: string;         // The assembled testimonial (100-300 words)
  confidence: number;          // 0-1 confidence score
  suggestions?: string[];      // Optional editing suggestions
}
```

**AI Prompt Guidelines:**
- Maintain customer's authentic voice
- Include specific details and numbers from responses
- Create natural flow: problem → solution → result
- Target length: 100-300 words
- Avoid marketing speak or exaggeration
- Preserve any quotes or specific phrases

**UI Behavior:**
1. Show loading state with message: "Crafting your testimonial..."
2. Display result in editable textarea
3. Show character/word count
4. Allow customer to edit freely
5. "Regenerate" button to get new version (optional, may use credits)

---

### Step 4: Your Information

**Purpose:** Collect customer attribution details for display.

**Fields:**

| Field | Type | Required | Validation | Display |
|-------|------|----------|------------|---------|
| Name | text | Yes | Min 2 chars | Public |
| Email | email | Yes | Valid email format | **Private** (admin only) |
| Job Title | text | No | Max 100 chars | Public |
| Company | text | No | Max 100 chars | Public |
| Photo | file/url | No | JPG/PNG, max 5MB | Public |
| LinkedIn | url | No | Valid LinkedIn URL | Public (icon link) |
| Twitter | url | No | Valid Twitter URL | Public (icon link) |

**Photo Upload Options:**
1. Direct file upload (stored in Supabase Storage)
2. URL input (for existing hosted images)
3. Social profile import (future: pull from LinkedIn/Twitter)

**Privacy Note:**
Display helper text under email field: "Your email won't be displayed publicly. We only use it to contact you about your testimonial if needed."

---

### Step 5: Consent

**Purpose:** Obtain explicit permission for testimonial usage.

**Consent Options:**

| Option | Value | Description |
|--------|-------|-------------|
| Public | `public` | Can be displayed in public widgets, website, marketing materials |
| Private | `private` | Internal use only - sales decks, case studies (not in public widgets) |

**Legal Text (configurable per form):**
```
We want to use your testimonial in our marketing and sales.
Where can we share it?

○ You can use my testimonial publicly in your marketing and sales.
  (Website, social media, advertising, case studies)

○ You can only use my testimonial privately in your marketing and sales.
  (Internal presentations, sales conversations)
```

**Storage:** `form_submissions.consent_type` = 'public' | 'private'

**Widget Filtering:**
Testimonials with `consent_type = 'private'` are automatically excluded from public widgets.

---

### Step 6: Review & Submit

**Purpose:** Final confirmation before submission.

**Display Elements:**
1. **Testimonial Card Preview**
   - Assembled testimonial text (formatted)
   - Star rating (if collected)
   - Customer photo (or initials avatar)
   - Name, title, company
   - Social links as icons

2. **Edit Options**
   - "Edit testimonial" → back to AI Assembly step
   - "Edit information" → back to Your Information step

3. **Submit CTA**
   - Primary button: "Submit Testimonial"
   - Loading state during submission
   - Error handling with retry option

**Submission Process:**
1. Create `form_submission` record with customer info + consent
2. Create `form_question_responses` records for each answer
3. Create `testimonials` record with assembled content + status='pending'
4. Trigger notification to form owner (future)
5. Redirect to Thank You step

---

### Step 7: Thank You

**Purpose:** Confirm successful submission and provide closure.

**Content:**
- Success icon/animation
- Thank you message (configurable)
- Expectation setting: "We'll review your testimonial..."
- Optional: Social share buttons
- Optional: Link to rewards (future)

**Default Message:**
```
Thank you for your testimonial!

Your feedback means the world to us. We'll review your testimonial
and may feature it on our website and marketing materials.
```

**Configurable Elements:**
- Custom thank you message (`form.settings.thank_you_message`)
- Show/hide social sharing (`form.settings.show_social_share`)
- Redirect URL (`form.settings.redirect_url`) - redirect after X seconds

---

## Database Schema

### New/Modified Fields

#### `form_submissions` Table (Add)

```sql
-- Add consent tracking
ALTER TABLE form_submissions
ADD COLUMN consent_type TEXT NOT NULL DEFAULT 'public'
  CHECK (consent_type IN ('public', 'private'));

COMMENT ON COLUMN form_submissions.consent_type IS
  'Customer consent level: public (widgets/marketing) or private (internal only)';
```

#### `forms` Table - Settings JSONB Structure

```typescript
interface FormSettings {
  // Existing
  theme_color?: string;
  logo_url?: string;

  // New for submission flow
  show_welcome_screen: boolean;
  welcome_message?: string;

  questions_display_mode: 'single_page' | 'multi_step';

  thank_you_message?: string;
  show_social_share: boolean;
  redirect_url?: string;
  redirect_delay_seconds?: number;

  // Future: Rewards
  rewards_enabled: boolean;
  rewards_config?: RewardsConfig;
}
```

### Hasura Permission Updates

#### Anonymous Role - form_submissions

**Insert Permissions:**
```yaml
columns:
  - submitter_name
  - submitter_email
  - submitter_title
  - submitter_company
  - submitter_avatar_url
  - submitter_linkedin_url
  - submitter_twitter_url
  - consent_type          # ADD THIS
  - organization_id
  - form_id
check:
  form:
    is_active:
      _eq: true
    status:
      _eq: "published"
```

#### Anonymous Role - testimonials

**Select Permissions (Update):**
```yaml
filter:
  _and:
    - status:
        _eq: "approved"
    - submission:
        consent_type:
          _eq: "public"    # Only show publicly consented testimonials
```

---

## MVP vs Future Features

### MVP (Launch Blockers)

| Feature | Status | Notes |
|---------|--------|-------|
| Welcome Screen | MVP | Simple, toggleable |
| Questions Step | MVP | Already have question types |
| AI Assembly | MVP | Core differentiator |
| Customer Info Collection | MVP | DB schema exists |
| Consent Screen | MVP | Legal requirement |
| Review & Submit | MVP | Essential UX |
| Thank You Screen | MVP | Basic confirmation |

### Future Roadmap

#### Video Testimonials (Post-MVP)

**Description:** Allow customers to record video testimonials instead of/in addition to text.

**Components:**
- Video recording widget (WebRTC)
- Video upload option
- Video hosting (Mux, Cloudinary, or Supabase Storage)
- Video transcription (for text version)
- Video testimonial player in widgets

**Database Changes:**
```sql
-- In testimonials table
video_url TEXT,
video_thumbnail_url TEXT,
video_duration_seconds INTEGER,
video_transcript TEXT
```

**Considerations:**
- Storage costs
- Transcription API costs
- Mobile browser compatibility
- File size limits

---

#### Video Intro (Post-MVP)

**Description:** Form owner records a video introduction that plays before the form.

**Purpose:**
- Personal touch
- Explain what you're looking for
- Increase completion rates

**Components:**
- Video recording/upload in form editor
- Video player on public form
- Skip option for customers

**Database Changes:**
```sql
-- In forms.settings JSONB
{
  "intro_video_url": "https://...",
  "intro_video_enabled": true,
  "intro_video_skippable": true
}
```

---

#### Rewards System (Post-MVP)

**Description:** Gamified incentives to encourage testimonial submissions.

**Reward Types:**

1. **Spin the Wheel**
   - Visual spinning wheel animation
   - Multiple prize segments
   - Configurable probabilities

2. **Scratch Card**
   - Virtual scratch-off reveal
   - Single prize per card

3. **Instant Coupon**
   - Immediate discount code reveal
   - No game element

**Database Schema:**

```sql
-- New table: form_rewards
CREATE TABLE form_rewards (
  id TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
  form_id TEXT NOT NULL REFERENCES forms(id),
  organization_id TEXT NOT NULL REFERENCES organizations(id),

  reward_type TEXT NOT NULL CHECK (reward_type IN ('spin_wheel', 'scratch_card', 'instant_coupon')),
  is_enabled BOOLEAN NOT NULL DEFAULT false,

  config JSONB NOT NULL,
  -- Example config for spin_wheel:
  -- {
  --   "prizes": [
  --     {"label": "30% OFF", "code": "SAVE30", "probability": 0.25},
  --     {"label": "10% OFF", "code": "SAVE10", "probability": 0.50},
  --     {"label": "Free Month", "code": "FREEMONTH", "probability": 0.10},
  --     {"label": "Try Again!", "code": null, "probability": 0.15}
  --   ]
  -- }

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Track prize redemptions
CREATE TABLE reward_redemptions (
  id TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
  submission_id TEXT NOT NULL REFERENCES form_submissions(id),
  reward_id TEXT NOT NULL REFERENCES form_rewards(id),
  organization_id TEXT NOT NULL REFERENCES organizations(id),

  prize_label TEXT NOT NULL,
  prize_code TEXT,  -- null if "no prize" segment

  redeemed_at TIMESTAMPTZ,  -- null until customer uses code

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Pricing Consideration:** Rewards is a premium feature (paid plans only).

---

## Competitor Research

### Testimonial.to

- Clean multi-step form
- Video + text options
- Simple consent checkbox
- No rewards system

### Senja

- 12-step comprehensive flow
- Consent screen with public/private options
- Rewards (spin wheel) on paid plans
- Video intro option
- Customer info with social links

### Famewall

- Simple form approach
- Focus on video testimonials
- Basic consent handling

### VideoAsk

- Video-first approach
- AI transcription
- Branching logic

### Key Differentiators for Our Product

1. **AI Assembly** - Transform answers into polished testimonials (unique)
2. **Smart Prompts** - Guided questions that extract quality content
3. **Review & Edit** - Customer sees and approves AI output
4. **Simplicity** - "Beautiful testimonials in 2 minutes"

---

## Implementation Considerations

### URL Structure

Public form URL pattern (per ADR-005):
```
/f/{name}_{id}

Example:
/f/my-first-testimonial-form_fVgBDebR3SNL
```

### State Management

Use a composable to manage multi-step form state:

```typescript
// useTestimonialSubmission.ts
interface SubmissionState {
  currentStep: number;
  totalSteps: number;

  // Step data
  responses: QuestionResponse[];
  assembledTestimonial: string;
  customerInfo: CustomerInfo;
  consentType: 'public' | 'private';

  // Navigation
  canGoBack: boolean;
  canGoForward: boolean;

  // Status
  isSubmitting: boolean;
  isAssembling: boolean;
  error: string | null;
}
```

### Progress Persistence

Consider localStorage backup for form progress:
- Save state on each step completion
- Restore on page refresh
- Clear on successful submission
- Expire after 24 hours

### Error Handling

1. **Network Errors** - Retry with exponential backoff
2. **Validation Errors** - Inline field-level messages
3. **AI Assembly Failure** - Fallback to manual input
4. **Submission Failure** - Save locally, allow retry

### Analytics Events

Track for conversion optimization:
- `form_started` - Customer landed on form
- `step_completed` - Each step finished
- `ai_assembly_completed` - AI generated testimonial
- `testimonial_edited` - Customer modified AI output
- `form_submitted` - Successful submission
- `form_abandoned` - Left without completing (with last step)

---

## File Structure (Proposed)

```
apps/web/src/
├── pages/
│   └── f/
│       └── [urlSlug].vue              # Public form page
│
├── features/
│   └── testimonialSubmission/
│       ├── index.ts                   # Feature exports
│       ├── TestimonialSubmissionFeature.vue  # Main orchestrator
│       │
│       ├── ui/
│       │   ├── steps/
│       │   │   ├── WelcomeStep.vue
│       │   │   ├── QuestionsStep.vue
│       │   │   ├── AiAssemblyStep.vue
│       │   │   ├── CustomerInfoStep.vue
│       │   │   ├── ConsentStep.vue
│       │   │   ├── ReviewStep.vue
│       │   │   └── ThankYouStep.vue
│       │   │
│       │   ├── TestimonialPreviewCard.vue
│       │   ├── StepProgressIndicator.vue
│       │   └── QuestionRenderer.vue
│       │
│       ├── composables/
│       │   ├── useTestimonialSubmission.ts
│       │   ├── useAiAssembly.ts
│       │   └── useSubmissionProgress.ts
│       │
│       └── models/
│           └── index.ts               # Types for submission flow
```

---

## Open Questions

1. **Should AI Assembly be skippable?**
   - Some customers may prefer to write their own testimonial
   - Could offer "Write your own" as alternative

2. **Photo upload implementation?**
   - Supabase Storage bucket
   - Direct URL input
   - Social profile import

3. **Mobile optimization priority?**
   - Many testimonials submitted from mobile
   - Touch-friendly UI essential

4. **Form branching/conditional logic?**
   - Skip questions based on previous answers
   - Different paths for different customer types
   - Post-MVP consideration

---

## Related Documents

- [ADR-005: URL Pattern with name_id](/docs/adr/005-url-pattern.md)
- [Database Schema: form_submissions](/docs/db/tables/form_submissions/docs.md)
- [Database Schema: testimonials](/docs/db/tables/testimonials/docs.md)
- [AI Provider Decision](/docs/ai/decision.md)
- [Competitor Analysis: Senja](/docs/competitor-reviews/senja-review-analysis.md)
