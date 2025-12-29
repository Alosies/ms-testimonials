# Testimonial Widget - MVP Plan

Version: 1.0
Date: December 28, 2025

---

## Product Vision

A simple testimonial collection and display tool that takes 2 minutes to set up. Differentiated by AI-powered smart prompts that help customers write better testimonials without sacrificing authenticity.

**Tagline:** "Beautiful testimonials in 2 minutes. No complexity tax."

---

## Market Positioning

```
                    EXPENSIVE
                        │
           Testimonial.to │  Endorsal
              ($50-70/mo) │  ($59-149/mo)
                          │
    COMPLEX ──────────────┼────────────── SIMPLE
                          │
              Senja       │   [OUR OPPORTUNITY]
           ($19-99/mo)    │   Simple + Affordable
                          │
            Famewall      │
           ($10-80/mo)    │
                          │
                    AFFORDABLE
```

### Exploitable Gaps

| Gap | Competitor Problem | Our Solution |
|-----|-------------------|--------------|
| Free Tier | Senja: 15, Famewall: 10 testimonials | 50 testimonials free |
| Setup Complexity | "Confusing to use" complaints | 2-minute setup, 3 steps max |
| Widget Performance | "Ruined my website" (slow loading) | <50kb, <500ms load time |
| Branding Removal | $20-60/mo to remove | $49 LTD includes no branding |
| Support | "Impossible to reach" | Fast email support |
| Pricing Model | Subscription-only | LTD option ($49-99) |

---

## Core MVP Features

### 1. Smart Collection Form (AI-Powered) - DIFFERENTIATOR

Instead of a blank textarea, guide customers through structured prompts:

**Smart Prompt Flow:**

| Step | Question | Purpose |
|------|----------|---------|
| 1 | "What problem were you trying to solve?" | Context/before state |
| 2 | "How did {Product} help?" | Solution/value prop |
| 3 | "What specific result did you get?" | Concrete outcome |
| 4 | "Your name, title & company (optional)" | Attribution |

**AI Assembly:** After steps 1-3, AI combines answers into a coherent testimonial that the customer can review and edit before submitting.

**Why This Works:**
- Customer provides all content (authentic)
- AI just structures and connects (no fabrication)
- Guided flow = higher completion rate
- Specific prompts = higher quality testimonials
- Editable = customer has final say

---

### 2. Dashboard

Simple management interface with:
- View all testimonials
- Filter: All / Pending / Approved
- Approve/reject pending testimonials
- Edit testimonial text
- Delete testimonials
- Select testimonials for widgets

---

### 3. Embed Widgets

Three widget types for MVP:

| Widget | Use Case |
|--------|----------|
| **Wall of Love** | Masonry grid for testimonials page |
| **Carousel Slider** | Sliding testimonials for any section |
| **Single Quote** | Featured testimonial for hero sections |

**Widget Requirements:**
- Lightweight: <50kb total
- Fast loading: <500ms
- Responsive: Mobile-friendly
- Customizable: Light/dark theme
- No branding on paid tier

**Embed Code:**
```html
<script src="https://app.{product}.com/widget.js" data-id="abc123"></script>
```

---

### 4. Shareable Form Link

Each form gets a unique public URL:
```
https://app.{product}.com/f/{form-slug}
```

- Custom slug (editable)
- Works on any device
- No login required for customer

---

## Data Model

```
User                    Form                     Testimonial
├── id                  ├── id                   ├── id
├── email               ├── user_id ◀────────    ├── form_id
├── name                ├── name                 ├── status (pending/approved/rejected)
├── company             ├── slug                 ├── rating
├── plan                ├── product_name         ├── content
├── created_at          ├── questions[]          ├── answers{} (raw prompt answers)
                        ├── settings{}           ├── customer_name
                        ├── created_at           ├── customer_title
                                                 ├── customer_company
Widget                                           ├── customer_email
├── id                                           ├── created_at
├── user_id
├── name
├── type
├── theme
├── testimonials[]
├── settings{}
├── created_at
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | Vue 3 + TypeScript | Your expertise |
| Styling | Tailwind CSS | Rapid UI development |
| API | GraphQL | Flexible queries for widgets |
| Backend | Python (FastAPI) | Your expertise, async support |
| Database | PostgreSQL | Relational, reliable |
| AI | OpenAI API (GPT-4o-mini) | Cheap (~$0.001/testimonial), fast |
| Hosting | Vercel (frontend) + Railway (backend) | Simple, scalable |
| Widget CDN | Cloudflare | Fast global delivery |

---

## AI Implementation

**Input (from customer):**
```json
{
  "problem": "I was spending hours manually collecting customer feedback",
  "solution": "The guided prompts made it easy for customers to write detailed testimonials",
  "result": "I got 15 quality testimonials in my first week"
}
```

**Prompt to GPT-4o-mini:**
```
Combine these customer responses into a natural, first-person testimonial.
Keep their exact words where possible. Only connect the ideas smoothly.
Do not add claims they didn't make. Keep it under 50 words.

Problem they had: {problem}
How product helped: {solution}
Result they got: {result}

Output only the testimonial text, in quotes.
```

---

## User Flows

### Flow 1: Business Owner Setup (2 minutes)
```
Sign Up → Create Form → Copy Form Link → Share with Customers
```

### Flow 2: Customer Submits Testimonial
```
Open Form → Answer Prompts (3 steps) → AI Assembles → Review/Edit → Submit
```

### Flow 3: Embed Widget
```
Dashboard → Widgets → Create → Select Type → Choose Testimonials → Copy Embed Code
```

---

## MVP Feature Checklist

### Must Have (Launch Blockers)
- [ ] User authentication (email/password)
- [ ] Create/edit collection form
- [ ] Smart prompt flow (4 steps)
- [ ] AI testimonial assembly
- [ ] Customer testimonial submission
- [ ] Dashboard: view all testimonials
- [ ] Approve/reject testimonials
- [ ] Wall of Love widget
- [ ] Carousel widget
- [ ] Single quote widget
- [ ] Embed code generation
- [ ] Widget JavaScript (lightweight)
- [ ] Shareable form links

### Should Have (Week 1 stretch)
- [ ] Edit testimonial text
- [ ] Star ratings
- [ ] Light/dark widget themes
- [ ] Form preview
- [ ] Email notifications (new testimonial)

### Won't Have (Post-MVP)
- Video testimonials
- Import from Twitter/LinkedIn
- Custom branding colors
- Multiple forms
- Team seats
- Custom domain
- White-label
- AI polish button
- Analytics

---

## Pricing

| Tier | Price | Limits |
|------|-------|--------|
| **Free** | $0 | 50 testimonials, 1 form, 1 widget, branding |
| **Pro LTD** | $49 one-time | Unlimited, 5 forms, all widgets, no branding |
| **Team LTD** | $99 one-time | Everything + 3 seats, priority support |

**LTD Strategy:**
1. Launch on Reddit/IndieHackers with $49 Pro deal
2. Collect feedback, iterate
3. Raise to $79 after first 100 customers
4. Eventually add $19/mo subscription option

---

## Success Metrics (Month 1)

| Metric | Target |
|--------|--------|
| Sign-ups | 200 |
| Forms created | 100 |
| Testimonials collected | 500 |
| Widgets embedded | 50 |
| LTD sales | 30 ($1,470 revenue) |
| Testimonial completion rate | >60% |

---

## 5-Day Build Schedule

| Day | Focus | Deliverables |
|-----|-------|--------------|
| 1 | Setup + Auth | Project scaffold, DB schema, auth flow |
| 2 | Collection Form | Smart prompts UI, AI assembly, form submission |
| 3 | Dashboard | List testimonials, approve/reject, basic CRUD |
| 4 | Widgets | Wall, carousel, single + embed code generator |
| 5 | Polish + Deploy | Bug fixes, mobile responsive, deploy to production |

---

## Open Questions

1. **Product name?** - Need to pick and check domain availability
2. **Hosting setup?** - Vercel + Railway or different?
3. **Payment processor?** - Stripe or LemonSqueezy for LTDs?
4. **Landing page?** - Build custom or use template?

---

## Next Steps

1. [ ] Pick product name and secure domain
2. [ ] Set up repository and project scaffold
3. [ ] Design database schema
4. [ ] Start Day 1 build

---

## Reference Documents

- `TESTIMONIAL_COMPETITOR_DEEPDIVE.md` - Full competitor analysis and research
