# Testimonial Widget - Build Schedule

Version: 1.0
Date: December 30, 2025
Reference: [MVP Plan](./mvp.md)

---

## Overview

5-day intensive build to launch MVP with dual AI features:
1. **AI Question Suggestions** - Form builder assistance
2. **AI Testimonial Assembly** - Customer submission polish

---

## Day 1: Setup + Auth

### Goals
- Project infrastructure ready
- Database schema deployed
- User authentication working

### Tasks

#### 1.1 Project Scaffold
- [ ] Initialize Vue 3 + Vite + TypeScript frontend
- [ ] Set up Hono.js API server
- [ ] Configure pnpm workspaces
- [ ] Set up Tailwind CSS
- [ ] Configure ESLint + Prettier

#### 1.2 Database Schema
- [ ] Set up PostgreSQL + Hasura locally (Docker)
- [ ] Create `users` table with Supabase auth integration
- [ ] Create `forms` table
- [ ] Create `testimonials` table
- [ ] Create `widgets` table
- [ ] Set up Hasura permissions (user can only see their own data)
- [ ] Configure GraphQL codegen

#### 1.3 Authentication
- [ ] Set up Supabase project
- [ ] Implement signup page (email/password)
- [ ] Implement login page
- [ ] Create JWT enhancement endpoint (add Hasura claims)
- [ ] Set up auth guards for protected routes
- [ ] Create basic dashboard layout (empty state)

### Deliverables
| Item | Verification |
|------|--------------|
| User can sign up | Email confirmation or auto-login |
| User can log in | Redirects to dashboard |
| Protected routes work | Unauthenticated users redirected to login |
| GraphQL works | Can query current user |

### Technical Notes
```
Database Tables:
- users: id, email, name, company, plan, created_at, updated_at
- forms: id, user_id, name, slug, product_name, description, industry, questions[], settings{}, created_at, updated_at
- testimonials: id, form_id, status, rating, content, answers{}, customer_name, customer_title, customer_company, customer_email, created_at, updated_at
- widgets: id, user_id, name, type, theme, testimonial_ids[], settings{}, created_at, updated_at
```

---

## Day 2: Form Builder + AI

### Goals
- Form creation with AI-powered question suggestions
- Full CRUD for forms
- Form preview functionality

### Tasks

#### 2.1 Form Creation UI
- [ ] Create "New Form" page/modal
- [ ] Form fields: name, product name, description
- [ ] Industry selector dropdown (SaaS, Course, Ecommerce, Freelancer, Community, Newsletter, Other)
- [ ] "Generate Questions" button

#### 2.2 AI Question Suggestions
- [ ] Create API endpoint: `POST /ai/suggest-questions`
- [ ] Integrate OpenAI GPT-4o-mini
- [ ] Implement prompt template for question generation
- [ ] Handle loading states in UI
- [ ] Display generated questions

#### 2.3 Question Editor
- [ ] Drag-and-drop reordering (or up/down buttons)
- [ ] Inline edit for each question
- [ ] Delete question button
- [ ] Add custom question button
- [ ] "Regenerate" button to get new suggestions

#### 2.4 Form Preview
- [ ] Preview mode showing customer-facing form
- [ ] Toggle between edit and preview modes
- [ ] Mobile preview option

#### 2.5 Form CRUD
- [ ] Save form to database
- [ ] List all forms on dashboard
- [ ] Edit existing form
- [ ] Delete form (with confirmation)
- [ ] Auto-generate unique slug
- [ ] Allow custom slug editing

### Deliverables
| Item | Verification |
|------|--------------|
| AI generates questions | Enter product info, get 5 relevant questions |
| Questions are editable | Can modify, reorder, delete, add |
| Form saves correctly | Persists to database, appears in list |
| Preview works | Can see customer view |
| Slug is unique | No duplicate slugs allowed |

### API Endpoints
```
POST /ai/suggest-questions
  Input: { product_name, description, industry }
  Output: { questions: string[] }

GraphQL Mutations:
  - createForm
  - updateForm
  - deleteForm
```

### AI Prompt Template
```
Generate 5 testimonial collection questions for this product.

Product: {product_name}
Description: {description}
Industry: {industry}

Guidelines:
- Question 1: Ask about the problem/challenge BEFORE using the product
- Question 2: Ask about HOW the product helped solve it
- Question 3: Ask about specific RESULTS or outcomes
- Question 4-5: Ask industry-specific questions that highlight unique value

Keep questions conversational and specific to the product context.
Output as JSON array of strings.
```

---

## Day 3: Collection + Assembly

### Goals
- Public testimonial submission form
- AI-powered testimonial assembly
- Customer review and edit flow

### Tasks

#### 3.1 Public Form Page
- [ ] Create route: `/f/{slug}` (no auth required)
- [ ] Fetch form data by slug
- [ ] Handle form not found (404 page)
- [ ] Welcome/intro screen with product name

#### 3.2 Smart Prompt Flow
- [ ] Multi-step wizard component
- [ ] Step 1-N: Display each question with textarea
- [ ] Progress indicator (step X of Y)
- [ ] Next/Back navigation
- [ ] Validate answers before proceeding

#### 3.3 AI Testimonial Assembly
- [ ] Create API endpoint: `POST /ai/assemble-testimonial`
- [ ] Collect all answers
- [ ] Send to OpenAI for assembly
- [ ] Display assembled testimonial

#### 3.4 Review & Edit Step
- [ ] Show AI-generated testimonial
- [ ] Editable textarea for modifications
- [ ] "Use Original Answers" option to skip AI
- [ ] Star rating input (1-5)

#### 3.5 Customer Details Step
- [ ] Name input (required)
- [ ] Title input (optional)
- [ ] Company input (optional)
- [ ] Email input (optional, for follow-up)
- [ ] Consent checkbox

#### 3.6 Form Submission
- [ ] Create API endpoint: `POST /testimonials` (public)
- [ ] Save testimonial with status: `pending`
- [ ] Store both final content and raw answers
- [ ] Thank you confirmation screen
- [ ] Optional: Social share prompt

### Deliverables
| Item | Verification |
|------|--------------|
| Public form loads | Anyone can access /f/{slug} |
| Multi-step works | Can navigate through all questions |
| AI assembles testimonial | Answers combine into coherent text |
| Customer can edit | Can modify AI output |
| Submission saves | Testimonial appears in dashboard as pending |

### API Endpoints
```
GET /forms/{slug} (public)
  Output: { form data with questions }

POST /ai/assemble-testimonial
  Input: { answers: { q1: "...", q2: "...", ... } }
  Output: { testimonial: "..." }

POST /testimonials (public)
  Input: { form_id, content, answers, rating, customer_* fields }
  Output: { id, status: "pending" }
```

### AI Prompt Template
```
Combine these customer responses into a natural, first-person testimonial.
Keep their exact words where possible. Only connect the ideas smoothly.
Do not add claims they didn't make. Keep it under 50 words.

{answers formatted as Q&A pairs}

Output only the testimonial text, in quotes.
```

---

## Day 4: Dashboard + Widgets

### Goals
- Testimonial management dashboard
- Three widget types created
- Widget configuration UI

### Tasks

#### 4.1 Testimonial List
- [ ] Display all testimonials in table/card view
- [ ] Show: customer name, content preview, rating, status, date
- [ ] Filter tabs: All / Pending / Approved / Rejected
- [ ] Search/filter by form
- [ ] Pagination or infinite scroll

#### 4.2 Testimonial Actions
- [ ] Approve button (pending → approved)
- [ ] Reject button (pending → rejected)
- [ ] Edit testimonial content (modal or inline)
- [ ] Delete testimonial (with confirmation)
- [ ] View full testimonial details

#### 4.3 Widget Creation UI
- [ ] "Create Widget" button/page
- [ ] Widget name input
- [ ] Widget type selector (Wall of Love, Carousel, Single Quote)
- [ ] Testimonial selector (multi-select from approved)
- [ ] Theme toggle (Light/Dark)

#### 4.4 Wall of Love Widget
- [ ] Masonry grid layout
- [ ] Responsive columns (1-3 based on container)
- [ ] Card design: avatar, name, title, company, rating, content
- [ ] Smooth load animation

#### 4.5 Carousel Widget
- [ ] Horizontal slider
- [ ] Auto-play option
- [ ] Navigation arrows
- [ ] Dots indicator
- [ ] Touch/swipe support

#### 4.6 Single Quote Widget
- [ ] Featured testimonial display
- [ ] Large quote styling
- [ ] Customer attribution
- [ ] Optional: rotate through multiple

### Deliverables
| Item | Verification |
|------|--------------|
| Can filter testimonials | All/Pending/Approved filters work |
| Can approve/reject | Status updates correctly |
| Can edit testimonial | Changes persist |
| Wall widget renders | Masonry grid displays correctly |
| Carousel works | Slides navigate properly |
| Single quote works | Featured testimonial displays |

### API Endpoints
```
GraphQL Mutations:
  - updateTestimonialStatus(id, status)
  - updateTestimonial(id, content)
  - deleteTestimonial(id)
  - createWidget
  - updateWidget
  - deleteWidget

GraphQL Queries:
  - testimonials(form_id, status, limit, offset)
  - widgets(user_id)
```

---

## Day 5: Polish + Deploy

### Goals
- Embeddable widget JavaScript
- Production deployment
- Bug fixes and responsive design

### Tasks

#### 5.1 Embed Code Generator
- [ ] Generate unique embed code per widget
- [ ] Copy-to-clipboard functionality
- [ ] Show preview of embed code
- [ ] Instructions for embedding

#### 5.2 Widget JavaScript
- [ ] Create lightweight widget loader script (<50kb)
- [ ] Fetch widget data via API
- [ ] Render widget in shadow DOM (style isolation)
- [ ] Handle loading states
- [ ] Handle errors gracefully

#### 5.3 Widget API
- [ ] Create endpoint: `GET /widgets/{id}` (public, cached)
- [ ] Return widget config + testimonial data
- [ ] Set appropriate CORS headers
- [ ] CDN caching strategy

#### 5.4 Mobile Responsive
- [ ] Test all pages on mobile viewport
- [ ] Fix navigation (hamburger menu if needed)
- [ ] Fix form layouts
- [ ] Fix dashboard tables/cards
- [ ] Test widget responsiveness

#### 5.5 Bug Fixes & QA
- [ ] Full user flow testing
- [ ] Fix critical bugs
- [ ] Error handling improvements
- [ ] Loading state improvements

#### 5.6 Production Deployment
- [ ] Deploy frontend to Vercel
- [ ] Deploy API to Railway
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Set up widget CDN (Cloudflare)
- [ ] SSL/domain configuration
- [ ] Smoke test production

### Deliverables
| Item | Verification |
|------|--------------|
| Embed code works | Widget renders on external site |
| Widget loads fast | <500ms load time |
| Mobile works | All screens functional on mobile |
| Production live | Can sign up and use full flow |

### Embed Code Format
```html
<script src="https://app.{product}.com/widget.js" data-id="{widget_id}"></script>
```

### Widget API
```
GET /widgets/{id} (public)
  Output: {
    type: "wall" | "carousel" | "single",
    theme: "light" | "dark",
    testimonials: [{ content, customer_name, customer_title, rating, ... }]
  }
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Day 2 AI integration issues | Have fallback static questions ready |
| Day 3 AI assembly quality | Allow skipping AI, use original answers |
| Day 4 widget complexity | Start with Wall only, add others if time |
| Day 5 deployment issues | Have Railway/Vercel accounts pre-configured |

---

## Definition of Done (MVP)

- [ ] User can sign up and log in
- [ ] User can create form with AI-generated questions
- [ ] Customer can submit testimonial via public link
- [ ] AI assembles testimonial from answers
- [ ] User can approve/reject testimonials
- [ ] User can create at least one widget type
- [ ] Widget embeds and displays on external site
- [ ] Production is live and accessible

---

## Post-MVP Backlog (for reference)

- Video testimonials
- Import from Twitter/LinkedIn
- Custom branding colors
- Multiple forms per account
- Team seats
- Custom domain
- White-label option
- Analytics dashboard
- Email notifications
