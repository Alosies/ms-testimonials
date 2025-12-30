# Layer 3: Business Entities

**Tables:** forms, form_questions, testimonials, testimonial_answers, widgets, widget_testimonials

---

## AI Context Philosophy: "Infer, Don't Ask"

The forms table stores minimal context (`product_name` + `product_description`) that AI uses to:
1. **Infer** industry, audience, tone, and value propositions
2. **Generate** tailored testimonial questions without user dropdowns/selections

This keeps form creation simple (2 fields) while enabling smart AI features.

| User Input | AI Infers |
|------------|-----------|
| `product_name` | - |
| `product_description` | Industry, audience, tone, value props |

See `docs/mvp.md` → "AI Context Philosophy" section for full details.

---

## 3.1 Forms Table

Collection forms - questions are normalized to separate table.

```sql
CREATE TABLE public.forms (
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    organization_id     TEXT NOT NULL,
    created_by          TEXT NOT NULL,
    name                TEXT NOT NULL,
    slug                TEXT NOT NULL,
    product_name        TEXT NOT NULL,
    product_description TEXT,  -- AI context: used for "Infer, Don't Ask" question generation
    -- Submission settings as explicit columns
    collect_rating      BOOLEAN NOT NULL DEFAULT true,
    require_email       BOOLEAN NOT NULL DEFAULT true,
    require_company     BOOLEAN NOT NULL DEFAULT false,
    -- UI preferences only
    settings            JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT forms_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT forms_created_by_fk
        FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT forms_slug_per_org_unique
        UNIQUE (organization_id, slug),
    CONSTRAINT forms_slug_format
        CHECK (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$')
);

CREATE INDEX idx_forms_org ON forms(organization_id);
CREATE INDEX idx_forms_slug ON forms(organization_id, slug);
CREATE INDEX idx_forms_active ON forms(organization_id) WHERE is_active = true;

SELECT add_updated_at_trigger('forms');

COMMENT ON TABLE forms IS 'Testimonial collection forms - questions normalized to form_questions table';
COMMENT ON COLUMN forms.product_description IS 'AI context for question generation - enables "Infer, Don''t Ask" philosophy';
COMMENT ON COLUMN forms.settings IS 'UI preferences only (theme, colors) - not business logic';
```

### Column Reference

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | NanoID 12-char |
| `organization_id` | TEXT | FK | Parent organization |
| `created_by` | TEXT | FK → users | Creator user |
| `name` | TEXT | NOT NULL | Form name |
| `slug` | TEXT | NOT NULL | URL-friendly identifier |
| `product_name` | TEXT | NOT NULL | Product being reviewed |
| `product_description` | TEXT | NULL | AI context for question generation |
| `collect_rating` | BOOLEAN | NOT NULL | Collect star rating |
| `require_email` | BOOLEAN | NOT NULL | Email required |
| `require_company` | BOOLEAN | NOT NULL | Company required |
| `settings` | JSONB | NOT NULL | UI preferences (theme, colors) |

---

## 3.2 Form Questions Table

Normalized questions with proper constraints.

```sql
CREATE TABLE public.form_questions (
    id              TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    form_id         TEXT NOT NULL,
    question_key    VARCHAR(50) NOT NULL,  -- 'problem', 'solution', 'result', 'attribution'
    question_text   TEXT NOT NULL,
    placeholder     TEXT,
    help_text       TEXT,
    display_order   SMALLINT NOT NULL,
    is_required     BOOLEAN NOT NULL DEFAULT true,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT form_questions_form_fk
        FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    CONSTRAINT form_questions_key_per_form_unique
        UNIQUE (form_id, question_key),
    CONSTRAINT form_questions_order_per_form_unique
        UNIQUE (form_id, display_order),
    CONSTRAINT form_questions_key_format
        CHECK (question_key ~ '^[a-z][a-z0-9_]*$')
);

CREATE INDEX idx_form_questions_form ON form_questions(form_id);
CREATE INDEX idx_form_questions_order ON form_questions(form_id, display_order);

SELECT add_updated_at_trigger('form_questions');

COMMENT ON TABLE form_questions IS 'Normalized form questions - enables querying, reporting, reordering';
```

### Default Question Keys

| Key | Purpose | Default Text |
|-----|---------|--------------|
| `problem` | Pain point | "What problem were you trying to solve?" |
| `solution` | How product helped | "How did [product] help?" |
| `result` | Outcome achieved | "What specific result did you get?" |
| `attribution` | Customer info | "Your name, title & company" |

---

## 3.3 Testimonials Table

Customer testimonials - answers normalized to separate table.

```sql
CREATE TABLE public.testimonials (
    id                      TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    organization_id         TEXT NOT NULL,
    form_id                 TEXT NOT NULL,
    -- Workflow
    status                  TEXT NOT NULL DEFAULT 'pending',
    -- AI-assembled content
    content                 TEXT,
    rating                  SMALLINT,
    -- Customer info (denormalized for display performance)
    customer_name           TEXT NOT NULL,
    customer_email          TEXT NOT NULL,
    customer_title          TEXT,
    customer_company        TEXT,
    customer_avatar_url     TEXT,
    -- Source tracking
    source                  TEXT NOT NULL DEFAULT 'form',
    source_metadata         JSONB,  -- Appropriate: import-specific, varies by source
    -- Approval audit
    approved_by             TEXT,
    approved_at             TIMESTAMPTZ,
    rejected_by             TEXT,
    rejected_at             TIMESTAMPTZ,
    rejection_reason        TEXT,
    -- Timestamps
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT testimonials_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT testimonials_form_fk
        FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    CONSTRAINT testimonials_approved_by_fk
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT testimonials_rejected_by_fk
        FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT testimonials_status_check
        CHECK (status IN ('pending', 'approved', 'rejected')),
    CONSTRAINT testimonials_rating_check
        CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
    CONSTRAINT testimonials_source_check
        CHECK (source IN ('form', 'import', 'manual')),
    CONSTRAINT testimonials_email_format
        CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_testimonials_org ON testimonials(organization_id);
CREATE INDEX idx_testimonials_form ON testimonials(form_id);
CREATE INDEX idx_testimonials_status ON testimonials(organization_id, status);
CREATE INDEX idx_testimonials_created ON testimonials(organization_id, created_at DESC);
-- Partial index for approved (most common query)
CREATE INDEX idx_testimonials_approved
    ON testimonials(organization_id, created_at DESC)
    WHERE status = 'approved';

SELECT add_updated_at_trigger('testimonials');

COMMENT ON TABLE testimonials IS 'Customer testimonials - answers normalized to testimonial_answers';
COMMENT ON COLUMN testimonials.source_metadata IS 'Import-specific data (tweet ID, LinkedIn URL) - JSONB appropriate';
```

### Status Workflow

```
┌─────────┐    approve    ┌──────────┐
│ pending │──────────────►│ approved │
└────┬────┘               └──────────┘
     │
     │ reject
     ▼
┌──────────┐
│ rejected │
└──────────┘
```

### Source Types

| Source | Description | Metadata Example |
|--------|-------------|------------------|
| `form` | Submitted via form | `null` |
| `import` | Imported from external | `{"twitter_id": "123", "url": "..."}` |
| `manual` | Manually entered | `{"notes": "From email"}` |

---

## 3.4 Testimonial Answers Table

Normalized answers linked to questions.

```sql
CREATE TABLE public.testimonial_answers (
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    testimonial_id      TEXT NOT NULL,
    question_id         TEXT NOT NULL,
    answer_text         TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT testimonial_answers_testimonial_fk
        FOREIGN KEY (testimonial_id) REFERENCES testimonials(id) ON DELETE CASCADE,
    CONSTRAINT testimonial_answers_question_fk
        FOREIGN KEY (question_id) REFERENCES form_questions(id) ON DELETE CASCADE,
    CONSTRAINT testimonial_answers_unique
        UNIQUE (testimonial_id, question_id)
);

CREATE INDEX idx_testimonial_answers_testimonial ON testimonial_answers(testimonial_id);
CREATE INDEX idx_testimonial_answers_question ON testimonial_answers(question_id);

SELECT add_updated_at_trigger('testimonial_answers');

COMMENT ON TABLE testimonial_answers IS 'Normalized answers - enables querying by question, analytics, etc.';
```

---

## 3.5 Widgets Table

Embeddable widgets - testimonial selections in junction table.

```sql
CREATE TABLE public.widgets (
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    organization_id     TEXT NOT NULL,
    created_by          TEXT NOT NULL,
    name                TEXT NOT NULL,
    type                TEXT NOT NULL,
    theme               TEXT NOT NULL DEFAULT 'light',
    -- Display settings as explicit columns
    show_ratings        BOOLEAN NOT NULL DEFAULT true,
    show_dates          BOOLEAN NOT NULL DEFAULT false,
    show_company        BOOLEAN NOT NULL DEFAULT true,
    show_avatar         BOOLEAN NOT NULL DEFAULT true,
    max_display         SMALLINT,  -- NULL = show all
    -- Type-specific settings (UI only)
    settings            JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT widgets_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT widgets_created_by_fk
        FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT widgets_type_check
        CHECK (type IN ('wall_of_love', 'carousel', 'single_quote')),
    CONSTRAINT widgets_theme_check
        CHECK (theme IN ('light', 'dark'))
);

CREATE INDEX idx_widgets_org ON widgets(organization_id);
CREATE INDEX idx_widgets_active ON widgets(organization_id) WHERE is_active = true;

SELECT add_updated_at_trigger('widgets');

COMMENT ON TABLE widgets IS 'Embeddable widgets - testimonial selections in junction table';
COMMENT ON COLUMN widgets.settings IS 'Type-specific UI settings (carousel speed, columns) - not business logic';
```

### Widget Types

| Type | Description |
|------|-------------|
| `wall_of_love` | Grid/masonry layout of testimonials |
| `carousel` | Sliding carousel |
| `single_quote` | Single featured testimonial |

---

## 3.6 Widget Testimonials Junction Table

Proper many-to-many with ordering.

```sql
CREATE TABLE public.widget_testimonials (
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    widget_id           TEXT NOT NULL,
    testimonial_id      TEXT NOT NULL,
    display_order       SMALLINT NOT NULL,
    is_featured         BOOLEAN NOT NULL DEFAULT false,  -- Highlighted in UI
    added_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    added_by            TEXT,

    CONSTRAINT widget_testimonials_widget_fk
        FOREIGN KEY (widget_id) REFERENCES widgets(id) ON DELETE CASCADE,
    CONSTRAINT widget_testimonials_testimonial_fk
        FOREIGN KEY (testimonial_id) REFERENCES testimonials(id) ON DELETE CASCADE,
    CONSTRAINT widget_testimonials_added_by_fk
        FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT widget_testimonials_unique
        UNIQUE (widget_id, testimonial_id),
    CONSTRAINT widget_testimonials_order_unique
        UNIQUE (widget_id, display_order)
);

CREATE INDEX idx_widget_testimonials_widget ON widget_testimonials(widget_id);
CREATE INDEX idx_widget_testimonials_testimonial ON widget_testimonials(testimonial_id);
CREATE INDEX idx_widget_testimonials_order ON widget_testimonials(widget_id, display_order);

COMMENT ON TABLE widget_testimonials IS 'Widget-Testimonial junction with ordering and featured flag';
```
