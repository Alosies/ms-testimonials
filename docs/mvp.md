# Testimonial Widget - MVP Plan

Version: 1.2
Date: December 30, 2025

---

## Product Vision

A simple testimonial collection and display tool that takes 2 minutes to set up. Differentiated by **dual AI features**:
1. **AI Question Suggestions** - Generate industry-specific form questions from product description
2. **AI Testimonial Assembly** - Combine customer answers into polished, authentic testimonials

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
                          │                + AI-First
            Famewall      │
           ($10-80/mo)    │
                          │
                    AFFORDABLE
```

### AI-Focused Competitor

| Competitor | What They Do | Our Advantage |
|------------|--------------|---------------|
| **Makeform** | AI form builder that generates testimonial forms from product descriptions | We combine AI form generation + AI testimonial assembly in one flow. They generate forms; we generate forms AND polish testimonials. |

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

### 2. AI Question Suggestions (Form Builder) - DIFFERENTIATOR

When creating a form, AI generates tailored questions based on product/industry context.

**How It Works (Infer, Don't Ask):**

| Step | Action |
|------|--------|
| 1 | User enters product name and brief description |
| 2 | AI infers industry, tone, and audience from description |
| 3 | AI generates 5-8 suggested questions tailored to their context |
| 4 | User can accept, edit, reorder, or remove questions |

**Example:**

```
Input (2 fields only):
  Product: "TaskFlow"
  Description: "Project management tool for remote teams"

AI Infers:
  Industry: SaaS/B2B
  Audience: Remote teams, project managers
  Value Props: Collaboration, time management

AI Generates:
  1. "What was your biggest project management headache before TaskFlow?"
  2. "How has TaskFlow improved your team's remote collaboration?"
  3. "What feature saves you the most time each week?"
  4. "Can you share a specific result (hours saved, projects completed, etc.)?"
```

**Why This Adds LTD Value:**
- Saves users from writing questions from scratch
- Industry-specific questions = higher quality testimonials
- Differentiates from competitors who offer static templates
- Combines with AI Assembly for end-to-end AI experience

---

### 3. Dashboard

Simple management interface with:
- View all testimonials
- Filter: All / Pending / Approved
- Approve/reject pending testimonials
- Edit testimonial text
- Delete testimonials
- Select testimonials for widgets

---

### 4. Embed Widgets

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

### 5. Shareable Form Link

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
├── created_at          ├── product_description  ├── answers{} (raw prompt answers)
                        ├── questions[]          ├── customer_name
                        ├── settings{}           ├── customer_title
                        ├── created_at
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

### AI #1: Question Suggestions (Form Builder)

**Input (from business owner) - Just 2 fields:**
```json
{
  "product_name": "TaskFlow",
  "description": "Project management tool for remote teams"
}
```

**Prompt to GPT-4o-mini:**
```
Generate 5 testimonial collection questions for this product.

Product: {product_name}
Description: {description}

First, infer from the description:
- Industry/category (SaaS, course, ecommerce, service, etc.)
- Target audience (who uses this product)
- Key value propositions (what problems it solves)

Then generate questions following these guidelines:
- Question 1: Ask about the problem/challenge BEFORE using the product
- Question 2: Ask about HOW the product helped solve it
- Question 3: Ask about specific RESULTS or outcomes
- Question 4-5: Ask industry-specific questions that highlight unique value

Keep questions conversational, specific to the product context.
Output as JSON array of strings.
```

**Output:**
```json
[
  "What was your biggest project management headache before TaskFlow?",
  "How has TaskFlow improved your team's remote collaboration?",
  "What feature saves you the most time each week?",
  "Can you share a specific result (hours saved, projects completed)?",
  "Would you recommend TaskFlow to other remote teams? Why?"
]
```

---

### AI #2: Testimonial Assembly (Customer Submission)

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

## AI Context Philosophy: "Infer, Don't Ask"

**Principle:** Minimize user inputs, maximize AI inference. Show the "magic" quickly.

### Why This Approach

| Approach | Problem |
|----------|---------|
| Rich context forms | Users abandon complex setups |
| Industry dropdowns | Adds friction, often wrong selection |
| Multiple configuration steps | Delays time-to-value |

**Our Solution:** 2 inputs → AI infers the rest → User sees tailored questions instantly.

### User Inputs (Minimal)

| Input | Example | Required |
|-------|---------|----------|
| Product Name | "TaskFlow" | Yes |
| Product Description | "Project management tool for remote teams" | Yes |

That's it. Two fields.

### AI Inferences (Automatic)

From the product description, AI automatically infers:

| Inference | Example | How It's Used |
|-----------|---------|---------------|
| Industry | SaaS / B2B | Question vocabulary, specificity |
| Audience | Remote teams, managers | Question framing |
| Tone | Professional, technical | Language style |
| Value Props | Collaboration, time-saving | Question focus areas |

### Context Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    FORM CREATION                            │
│  User Input: product_name + product_description             │
│                          ↓                                  │
│  AI Inference: industry, tone, audience, value_props        │
│                          ↓                                  │
│  Output: 5 tailored questions                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                 TESTIMONIAL SUBMISSION                       │
│  Context Available: product_name, product_description,      │
│                     questions, customer answers              │
│                          ↓                                  │
│  AI Assembly: Natural, first-person testimonial             │
└─────────────────────────────────────────────────────────────┘
```

### Context Storage (MVP)

| Context Type | Storage | Lifespan |
|--------------|---------|----------|
| Form Context | `product_name`, `product_description` in forms table | Permanent |
| Question Context | `questions[]` JSONB in forms table | Permanent |
| Answer Context | `answers{}` JSONB in testimonials table | Permanent |

### Future Context Enhancements (Post-MVP)

Reserved for later iterations:
- Organization-level context (shared across forms)
- Industry-specific prompt libraries
- Testimonial pattern learning
- Customer voice analysis

**MVP Focus:** Ship simple, validate the "magic" works, then layer sophistication.

---

## User Flows

### Flow 1: Business Owner Setup (2 minutes)
```
Sign Up → Create Form → AI Suggests Questions → Customize → Copy Form Link → Share
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
- [ ] AI question suggestions (form builder)
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
| 2 | Form Builder + AI | Form creation UI, AI question suggestions, form preview |
| 3 | Collection + Assembly | Smart prompts UI, AI testimonial assembly, form submission |
| 4 | Dashboard + Widgets | List testimonials, approve/reject, wall/carousel/single widgets |
| 5 | Polish + Deploy | Embed code generator, bug fixes, mobile responsive, deploy |

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

- `build-schedule.md` - Detailed 5-day implementation plan with daily tasks
- `testimonial-competitor-deepdive.md` - Full competitor analysis and research
- [Makeform AI Testimonial Form Generator](https://www.makeform.ai/tools/ai-testimonial-form-generator) - AI form builder competitor
- [Senja Testimonial Questions](https://senja.io/testimonial-questions) - Industry-specific question examples
