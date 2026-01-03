# Future Features Roadmap

> **Document Type:** Product Roadmap
> **Last Updated:** 2026-01-03

This document tracks features planned for future releases beyond MVP.

---

## Post-MVP Features

### 1. Video Testimonials

**Priority:** High
**Complexity:** High

**Description:**
Allow customers to record or upload video testimonials as an alternative to text.

**Key Components:**
- Video recording widget (WebRTC-based)
- Video file upload (MP4, MOV)
- Video hosting integration (Mux, Cloudinary, or Supabase Storage)
- Automatic transcription for text fallback
- Video player in widgets

**Database Changes:**
```sql
-- testimonials table additions
video_url TEXT,
video_thumbnail_url TEXT,
video_duration_seconds INTEGER,
video_transcript TEXT,
testimonial_type TEXT DEFAULT 'text' CHECK (testimonial_type IN ('text', 'video', 'both'))
```

**Considerations:**
- Storage costs (video hosting is expensive)
- Transcription API costs (Whisper, Assembly AI, etc.)
- Mobile browser recording compatibility
- Max video length (recommend 60-90 seconds)
- Compression and quality settings

**User Flow:**
1. Customer chooses "Record Video" or "Write Text"
2. If video: Record/upload → Preview → Approve
3. Video auto-transcribed for AI processing
4. Both video and text version available

---

### 2. Video Intro

**Priority:** Medium
**Complexity:** Medium

**Description:**
Allow form owners to record a personal video introduction that plays when customers open the form.

**Purpose:**
- Adds personal touch
- Explains what kind of feedback you're looking for
- Increases form completion rates
- Builds trust with potential testimonial givers

**Key Components:**
- Video recording in form editor
- Video upload option
- Video player on public form
- Skip button for customers
- Auto-play settings

**Database Changes:**
```typescript
// forms.settings JSONB additions
{
  "intro_video_enabled": boolean,
  "intro_video_url": string,
  "intro_video_autoplay": boolean,
  "intro_video_skippable": boolean
}
```

**Considerations:**
- Same storage concerns as video testimonials
- Keep intros short (recommend max 30 seconds)
- Accessibility: provide text alternative

---

### 3. Rewards System

**Priority:** Medium
**Complexity:** High

**Description:**
Gamified incentive system to encourage testimonial submissions. Customers can win prizes after submitting their testimonial.

**Reward Types:**

#### Spin the Wheel
- Animated spinning wheel with multiple segments
- Each segment has a prize and probability
- Visual anticipation builds excitement
- "Spin" button triggers animation

#### Scratch Card
- Virtual scratch-off reveal
- Touch/mouse to reveal prize
- Simpler UX than wheel

#### Instant Coupon
- No game element
- Immediate code reveal
- Simplest implementation

**Database Schema:**

```sql
-- Form rewards configuration
CREATE TABLE form_rewards (
  id TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
  form_id TEXT NOT NULL REFERENCES forms(id),
  organization_id TEXT NOT NULL REFERENCES organizations(id),

  reward_type TEXT NOT NULL
    CHECK (reward_type IN ('spin_wheel', 'scratch_card', 'instant_coupon')),
  is_enabled BOOLEAN NOT NULL DEFAULT false,

  config JSONB NOT NULL,
  -- Spin wheel config example:
  -- {
  --   "prizes": [
  --     {"label": "30% OFF", "code": "SAVE30", "probability": 0.25, "color": "#FF6B6B"},
  --     {"label": "10% OFF", "code": "SAVE10", "probability": 0.50, "color": "#4ECDC4"},
  --     {"label": "Free Month", "code": "FREEMONTH", "probability": 0.10, "color": "#45B7D1"},
  --     {"label": "Better luck!", "code": null, "probability": 0.15, "color": "#96CEB4"}
  --   ],
  --   "wheel_style": "default",
  --   "spin_duration_ms": 5000
  -- }

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Track individual redemptions
CREATE TABLE reward_redemptions (
  id TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
  submission_id TEXT NOT NULL REFERENCES form_submissions(id),
  reward_id TEXT NOT NULL REFERENCES form_rewards(id),
  organization_id TEXT NOT NULL REFERENCES organizations(id),

  prize_label TEXT NOT NULL,
  prize_code TEXT,  -- null if "no prize" segment

  delivered_via TEXT CHECK (delivered_via IN ('screen', 'email', 'both')),
  redeemed_at TIMESTAMPTZ,  -- null until customer actually uses code

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Pricing:**
Premium/paid plans only. Free tier shows "Upgrade to enable rewards" prompt.

**Considerations:**
- Fraud prevention (one spin per submission)
- Code uniqueness (single-use vs multi-use codes)
- Expiration dates on prizes
- Integration with discount platforms (Stripe coupons, etc.)
- Analytics: track redemption rates

---

### 4. Form Branching/Conditional Logic

**Priority:** Low
**Complexity:** High

**Description:**
Show different questions based on previous answers. Create personalized testimonial collection flows.

**Use Cases:**
- Skip "results" question if rating is low
- Ask different questions for different products
- B2B vs B2C specific questions

**Database Changes:**
```sql
-- form_questions additions
display_conditions JSONB
-- Example:
-- {
--   "show_if": {
--     "question_key": "rating",
--     "operator": ">=",
--     "value": 4
--   }
-- }
```

---

### 5. Social Import

**Priority:** Medium
**Complexity:** Medium

**Description:**
Import testimonials from social media mentions and reviews.

**Sources:**
- Twitter/X mentions
- LinkedIn recommendations
- Google Reviews
- G2/Capterra reviews
- Facebook recommendations

**Components:**
- OAuth connections for each platform
- Periodic polling for new mentions
- AI to identify positive testimonials
- One-click import to dashboard
- Permission request workflow

---

### 6. Email/SMS Request Campaigns

**Priority:** High
**Complexity:** Medium

**Description:**
Send automated testimonial requests to customers via email or SMS.

**Features:**
- Email template builder
- Scheduled send times
- Follow-up sequences (if no response)
- Personalization tokens
- Click tracking
- A/B testing

**Integrations:**
- Email: Resend, SendGrid, Postmark
- SMS: Twilio, MessageBird

---

### 7. Advanced Widgets

**Priority:** Medium
**Complexity:** Medium

**Additional Widget Types:**
- **Masonry Grid** - Pinterest-style layout
- **Marquee/Ticker** - Scrolling testimonials bar
- **Pop-up** - Triggered testimonial overlay
- **Sidebar** - Floating testimonial panel
- **Badge** - Trust badge with rating

**Widget Enhancements:**
- Rich customization (fonts, colors, spacing)
- Responsive breakpoints
- Animation options
- Load more / pagination
- Filtering by tag/product

---

### 8. Multi-language Support

**Priority:** Low
**Complexity:** High

**Description:**
Collect and display testimonials in multiple languages.

**Components:**
- Form translation interface
- AI translation of testimonials
- Language-specific widgets
- Auto-detect customer language

---

## Feature Prioritization Matrix

| Feature | Business Value | User Demand | Complexity | Priority |
|---------|----------------|-------------|------------|----------|
| Video Testimonials | High | High | High | Post-MVP Phase 1 |
| Email Campaigns | High | High | Medium | Post-MVP Phase 1 |
| Rewards System | Medium | Medium | High | Post-MVP Phase 2 |
| Video Intro | Medium | Medium | Medium | Post-MVP Phase 2 |
| Social Import | Medium | High | Medium | Post-MVP Phase 2 |
| Advanced Widgets | Medium | Medium | Medium | Post-MVP Phase 2 |
| Branching Logic | Low | Low | High | Post-MVP Phase 3 |
| Multi-language | Low | Medium | High | Post-MVP Phase 3 |

---

## Related Documents

- [Public Form Submission Flow](/docs/features/public-form-submission-flow.md)
- [Credits and Plans](/docs/credits-and-plans.md)
- [Competitor Reviews](/docs/competitor-reviews/)
