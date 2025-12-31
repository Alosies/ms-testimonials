# Testimonial Question Framework Research

## Doc Connections
**ID**: `research-testimonial-questions`

2024-12-31-1830 IST

**Parent ReadMes**:
- `docs-index` - Documentation root index

**Related ReadMes**:
- `db-layer-3-business` - Form submissions table schema (persona fields)
- `form-creator-plan` - Form creator implementation plan

---

This document synthesizes established research and frameworks for collecting high-quality customer testimonials. It validates and informs our AI-generated question approach.

---

## Executive Summary

Our 5-question framework aligns well with established testimonial science:
- StoryBrand's hero transformation narrative
- Before-During-After case study best practices
- Cialdini's social proof principles
- Voice of Customer (VoC) B2B methodologies

**Minor gaps identified:** Customer context for "people like me" social proof, and "why us vs alternatives" differentiation.

---

## Established Frameworks

### 1. The Hero's Journey (Joseph Campbell)

The monomyth narrative structure, popularized in Campbell's *"The Hero with a Thousand Faces"*, has been adapted for marketing by Donald Miller's StoryBrand framework.

**Core principle:** Position the customer as the hero, and your brand as the guide (mentor).

#### StoryBrand's 7 Elements

| Element | Description | Marketing Application |
|---------|-------------|----------------------|
| **Character** | The hero (customer) | Customer is protagonist |
| **Problem** | Challenge/pain point | What triggered their search |
| **Guide** | Trusted mentor (brand) | Your product/service |
| **Plan** | Roadmap to success | How the solution works |
| **Call to Action** | Clear next step | What they did to engage |
| **Success** | Transformation achieved | Results and outcomes |
| **Failure** | What's at stake | Consequences of inaction |

**Key insight:** The most successful brands (Apple, Nike, Disney) never position themselves as the hero—they position the customer as the hero and themselves as the guide.

**Source:** [StoryBrand Framework](https://storybrand.com/)

---

### 2. Cialdini's Social Proof Principles

Robert Cialdini's research in *"Influence: Science and Practice"* (1984) identified Social Proof as one of six key principles of persuasion.

#### Key Research Findings

**Similarity amplifies persuasion:**
> "Multiple others and similar others—those are the key amplifiers of the social proof effect. If you can get people who are similar to the person you're trying to persuade to speak on your behalf, it's a lot easier for you."
> — Robert Cialdini

**The New York wallet study (1960s):**
- City residents were highly likely to return a lost wallet when told *another New Yorker* had already attempted to do so
- When told a *foreigner* had attempted to return it, the influence disappeared
- **Implication:** "People like me" testimonials are significantly more persuasive

**Hotel towel experiment (Cialdini & Goldstein):**
- Standard environmental message: 35.1% towel reuse
- "Majority of guests reuse towels" message: 44.1% reuse
- **26% increase** from social proof framing

#### Testimonial Implications

1. **Capture customer context** (role, industry, company size) to enable "people like me" matching
2. **Use specific numbers** over vague claims ("saved 10 hours/week" > "saved time")
3. **Include authority signals** (titles, company names) for credibility

**Source:** [Cialdini's 7 Principles of Persuasion](https://www.influenceatwork.com/7-principles-of-persuasion/)

---

### 3. Voice of Customer (VoC) B2B Framework

Industry-standard methodology for capturing customer feedback in B2B contexts.

#### Standard VoC Question Categories

| Category | Purpose | Example Questions |
|----------|---------|-------------------|
| **Background & Context** | Who is this person? | Role, company, industry |
| **Problem Discovery** | What triggered the search? | Pain points, failed alternatives |
| **Solution Search** | Why did they choose you? | Evaluation criteria, competitors considered |
| **Implementation** | What was the experience? | Onboarding, learning curve, support |
| **Results & ROI** | Quantifiable outcomes | Metrics improved, time/money saved |
| **Future & Recommendations** | Would they recommend? | Who would benefit, advice for others |

#### Best Practices

- **Keep interviews under 25 minutes** (B2B professionals have limited time)
- **Front-load critical questions** (get essential info before time runs out)
- **Start broad, then narrow** (open-ended → specific probes)
- **Ask open-ended questions** to collect unbiased information

**Source:** [CustomerGauge: VoC Methodologies](https://customergauge.com/blog/voice-of-customer-methodologies)

---

### 4. Case Study Question Framework

The "Before-During-After" narrative arc is the standard structure for case studies and success stories.

```
BEFORE: Pain, frustration, failed alternatives
        → Establishes the problem and creates empathy

DURING: Discovery, implementation, "aha" moment
        → Shows the product in action, builds credibility

AFTER:  Results, transformation, recommendation
        → Provides proof and social validation
```

#### HubSpot's Recommended Question Categories

1. **Background questions** - Who are you? What do you do?
2. **Problem questions** - What challenges were you facing?
3. **Decision questions** - Why did you choose us?
4. **Implementation questions** - What was onboarding like?
5. **Results questions** - What specific outcomes did you achieve?
6. **Recommendation questions** - What would you tell someone considering us?

**Source:** [HubSpot: Testimonial Questions](https://blog.hubspot.com/service/testimonial-questions)

---

## Our Current Framework

### The 5-Question Structure

| # | Name | Key | Purpose | Type |
|---|------|-----|---------|------|
| 1 | THE STRUGGLE | `problem_before` | Before state - pain, frustration | text_long |
| 2 | THE DISCOVERY | `solution_experience` | Experience using the product | text_long |
| 3 | THE TRANSFORMATION | `specific_results` | Quantifiable outcomes | text_long |
| 4 | THE VERDICT | `rating` | Overall satisfaction metric | rating_star |
| 5 | THE ENDORSEMENT | `recommendation` | Advice for others considering | text_long |

### Framework Alignment Analysis

| Principle | Coverage | Notes |
|-----------|----------|-------|
| Before → After arc | ✅ Strong | Q1 → Q2 → Q3 covers transformation |
| Concrete results | ✅ Strong | Q3 explicitly asks for numbers |
| Emotional hook | ✅ Strong | Q1 captures frustration/pain |
| Social proof (similarity) | ⚠️ Weak | No customer context captured |
| "Why us" differentiation | ⚠️ Weak | Doesn't ask about alternatives |
| Stakes/failure avoided | ❌ Missing | Optional but powerful |
| Recommendation framing | ✅ Strong | Q5 captures peer advice |

---

## Gap Analysis & Recommendations

### Gap 1: Customer Context (High Priority)

**Issue:** No capture of role, company, or industry for "people like me" social proof matching.

**Research basis:** Cialdini's similarity principle shows testimonials from similar people are significantly more persuasive.

**Recommendation:** Add optional context question:
```
Question 0 - THE PERSONA
Key: customer_context
Type: text_short
Required: false
Ask: "What's your role and industry?"
Placeholder: "e.g., Marketing Manager at a SaaS startup"
```

**Benefit:** Enables persona-based filtering ("See what other marketers say...") which increases conversion.

---

### Gap 2: "Why Us" Differentiation (Medium Priority)

**Issue:** Current questions don't capture why customers chose this product over alternatives.

**Research basis:** Understanding the decision criteria provides powerful competitive differentiation messaging.

**Recommendation:** Modify Q2 or add:
```
"What made you choose {product} over alternatives?"
"Was there a specific moment or feature that stood out?"
```

---

### Gap 3: Stakes/Failure Avoided (Low Priority)

**Issue:** StoryBrand's "Failure" element (what's at stake) is not captured.

**Research basis:** Loss aversion is a powerful psychological motivator; highlighting avoided negative outcomes increases urgency.

**Recommendation:** Optional question:
```
Question 6 - THE STAKES
Key: failure_avoided
Type: text_long
Required: false
Ask: "What do you think would have happened if you hadn't found {product}?"
```

---

## Industry Statistics

- **78%** of marketers used case studies/testimonials in 2023 (up from 67% in 2022)
- **53%** of marketers say case studies are the most effective content type
- Video testimonials can increase website traffic by **157%**
- Customer testimonials on product pages can increase annual revenue by **62%**
- **64%** of millennial consumers will try a product if they trust the brand (Edelman Trust Barometer)

---

## Implementation Checklist

- [x] Before-During-After narrative arc
- [x] Specific results/numbers prompt
- [x] Emotional pain point capture
- [x] Recommendation/endorsement question
- [x] Rating for quantifiable social proof
- [x] Customer context for persona matching → **Collected in "About You" form step, not AI question**
- [ ] "Why us" competitive differentiation (future consideration)
- [ ] Stakes/failure avoided (optional, future consideration)

---

## References

1. Campbell, Joseph. *The Hero with a Thousand Faces* (1949)
2. Miller, Donald. *Building a StoryBrand* (2017) - [storybrand.com](https://storybrand.com/)
3. Cialdini, Robert. *Influence: Science and Practice* (1984) - [influenceatwork.com](https://www.influenceatwork.com/7-principles-of-persuasion/)
4. [HubSpot: Testimonial Questions Reps Need to Ask](https://blog.hubspot.com/service/testimonial-questions)
5. [Senja: 45 Case Study Questions](https://senja.io/blog/case-study-questions)
6. [CustomerGauge: Voice of Customer Methodologies](https://customergauge.com/blog/voice-of-customer-methodologies)
7. [NN/g: Social Proof in UX](https://www.nngroup.com/articles/social-proof-ux/)
8. [Content Marketing Institute: Case Study Effectiveness Research](https://contentmarketinginstitute.com/)

---

## Design Decision: Persona Collection Strategy

### Decision
Collect customer persona information (name, email, title, company) in a **final "About You" step** after testimonial questions, rather than as a separate AI-generated question.

### Context
Research identified a gap: no customer context captured for "people like me" social proof. Two options existed:
1. Add a `customer_context` question to AI-generated questions
2. Collect persona info in form submission fields (final step)

### Rationale

**Option 2 chosen** because:

1. **No duplication**: The `form_submissions` table already has `submitter_title` and `submitter_company` fields designed for this purpose

2. **Better UX flow**:
   - Questions first → builds investment (sunk cost effect)
   - Personal info last → feels less intrusive
   - Users more likely to complete after writing answers

3. **Cleaner separation**:
   - AI questions = testimonial content (the story)
   - Form fields = submitter identity (the persona)

4. **Data architecture alignment**: Persona data flows naturally:
   ```
   form_submissions.submitter_title → testimonials.customer_title
   form_submissions.submitter_company → testimonials.customer_company
   ```

### Recommended Form Flow

```
Step 1-5: AI-Generated Testimonial Questions
    ↓
Final Step: "Almost done! Tell us about you"
    - Name* (required)
    - Email* (required)
    - Job Title (optional but encouraged)
    - Company (optional but encouraged)
    - Consent checkbox
    ↓
Submit → form_submissions + form_question_responses created
```

### Implementation Notes
- AI prompt generates exactly 5 questions (no customer_context question)
- Public form UI must implement "About You" final step
- Title/Company fields should be encouraged but optional
- This data enables "people like me" filtering on widgets

See also: `docs/db/research/layer-3-business.md` for `form_submissions` schema.

---

## Changelog

| Date | Change |
|------|--------|
| 2024-12-31 | Initial research compilation |
| 2024-12-31 | Added persona collection strategy decision (collect in final step, not as AI question) |
