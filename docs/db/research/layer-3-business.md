# Layer 3: Business Entities

**Tables:** forms, question_types, form_questions, question_options, testimonials, testimonial_answers, widgets, widget_testimonials

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

## 3.2 Question Types Table (Reference Data)

Defines available question types with their validation rules and constraints. This is a seed table - rows are system-defined, not user-created.

```sql
CREATE TABLE public.question_types (
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    unique_name         VARCHAR(50) NOT NULL,   -- Code identifier (text_short, rating_star)
    name                VARCHAR(100) NOT NULL,  -- Display label (Short Text, Star Rating)
    category            VARCHAR(30) NOT NULL,   -- Grouping (text, rating, choice, media, special)
    description         TEXT,

    -- Input characteristics
    input_component     VARCHAR(50) NOT NULL,   -- Vue component name (TextInput, StarRating, etc.)
    answer_data_type    VARCHAR(20) NOT NULL,   -- How answer is stored (text, integer, boolean, json)

    -- Validation rule applicability (which rules can be configured)
    supports_min_length     BOOLEAN NOT NULL DEFAULT false,
    supports_max_length     BOOLEAN NOT NULL DEFAULT false,
    supports_min_value      BOOLEAN NOT NULL DEFAULT false,
    supports_max_value      BOOLEAN NOT NULL DEFAULT false,
    supports_pattern        BOOLEAN NOT NULL DEFAULT false,  -- Regex validation
    supports_options        BOOLEAN NOT NULL DEFAULT false,  -- Has predefined choices
    supports_file_types     BOOLEAN NOT NULL DEFAULT false,  -- File upload restrictions
    supports_max_file_size  BOOLEAN NOT NULL DEFAULT false,

    -- Defaults
    default_min_value   INTEGER,
    default_max_value   INTEGER,

    is_active           BOOLEAN NOT NULL DEFAULT true,
    display_order       SMALLINT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT question_types_unique_name_unique UNIQUE (unique_name),
    CONSTRAINT question_types_category_check
        CHECK (category IN ('text', 'rating', 'choice', 'media', 'special')),
    CONSTRAINT question_types_answer_type_check
        CHECK (answer_data_type IN ('text', 'integer', 'boolean', 'decimal', 'json', 'url'))
);

CREATE INDEX idx_question_types_category ON question_types(category);

COMMENT ON TABLE question_types IS 'Question type definitions - seed data, not user-modifiable';
COMMENT ON COLUMN question_types.unique_name IS 'Code identifier for type lookups';
COMMENT ON COLUMN question_types.input_component IS 'Frontend component name for rendering';
COMMENT ON COLUMN question_types.answer_data_type IS 'Data type for storing answers';
```

### Seed Data

```sql
INSERT INTO question_types (
    unique_name, name, category, description, input_component, answer_data_type,
    supports_min_length, supports_max_length, supports_min_value, supports_max_value,
    supports_pattern, supports_options, supports_file_types, supports_max_file_size,
    default_min_value, default_max_value, display_order
) VALUES
    -- Text types
    ('text_short', 'Short Text', 'text', 'Single line text input', 'TextInput', 'text',
     true, true, false, false, true, false, false, false, NULL, NULL, 1),
    ('text_long', 'Long Text', 'text', 'Multi-line textarea', 'TextArea', 'text',
     true, true, false, false, false, false, false, false, NULL, NULL, 2),
    ('text_email', 'Email', 'text', 'Email with validation', 'EmailInput', 'text',
     false, true, false, false, true, false, false, false, NULL, NULL, 3),
    ('text_url', 'URL', 'text', 'URL with validation', 'UrlInput', 'url',
     false, true, false, false, true, false, false, false, NULL, NULL, 4),

    -- Rating types
    ('rating_star', 'Star Rating', 'rating', '1-5 star rating', 'StarRating', 'integer',
     false, false, true, true, false, false, false, false, 1, 5, 10),
    ('rating_nps', 'NPS Score', 'rating', '0-10 Net Promoter Score', 'NpsRating', 'integer',
     false, false, true, true, false, false, false, false, 0, 10, 11),
    ('rating_scale', 'Scale', 'rating', 'Numeric scale with custom range', 'ScaleRating', 'integer',
     false, false, true, true, false, false, false, false, 1, 10, 12),

    -- Choice types
    ('choice_single', 'Single Choice', 'choice', 'Radio button selection', 'RadioGroup', 'text',
     false, false, false, false, false, true, false, false, NULL, NULL, 20),
    ('choice_multiple', 'Multiple Choice', 'choice', 'Checkbox selection', 'CheckboxGroup', 'json',
     false, false, true, true, false, true, false, false, NULL, NULL, 21),
    ('choice_dropdown', 'Dropdown', 'choice', 'Dropdown selection', 'SelectInput', 'text',
     false, false, false, false, false, true, false, false, NULL, NULL, 22),

    -- Media types (Post-MVP)
    ('media_image', 'Image Upload', 'media', 'Image file upload', 'ImageUpload', 'url',
     false, false, false, false, false, false, true, true, NULL, NULL, 30),
    ('media_video', 'Video Upload', 'media', 'Video file upload', 'VideoUpload', 'url',
     false, false, false, false, false, false, true, true, NULL, NULL, 31),

    -- Special types
    ('special_consent', 'Consent', 'special', 'Permission checkbox', 'ConsentCheckbox', 'boolean',
     false, false, false, false, false, false, false, false, NULL, NULL, 40),
    ('special_hidden', 'Hidden Field', 'special', 'Hidden value (tracking)', 'HiddenInput', 'text',
     false, true, false, false, false, false, false, false, NULL, NULL, 41);
```

### Question Type Categories

| Category | Types | Use Case |
|----------|-------|----------|
| `text` | text_short, text_long, text_email, text_url | Free-form text input |
| `rating` | rating_star, rating_nps, rating_scale | Numeric satisfaction scores |
| `choice` | choice_single, choice_multiple, choice_dropdown | Predefined option selection |
| `media` | media_image, media_video | File uploads (Post-MVP) |
| `special` | special_consent, special_hidden | Permission, tracking |

### MVP Question Types

For MVP, focus on these 6 types:

| Type | Primary Use |
|------|-------------|
| `text_short` | Name, company, title fields |
| `text_long` | Testimonial answers (problem, solution, result) |
| `text_email` | Customer email |
| `rating_star` | Overall satisfaction rating |
| `choice_single` | "Would you recommend?" Yes/No |
| `special_consent` | Permission to publish |

---

## 3.3 Form Questions Table

Questions linked to forms with typed validation rules. Each question references a type and has type-appropriate validation columns.

```sql
CREATE TABLE public.form_questions (
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    form_id             TEXT NOT NULL,
    question_type_id    TEXT NOT NULL,

    -- Question content
    question_key        VARCHAR(50) NOT NULL,   -- Semantic key (problem, solution, result)
    question_text       TEXT NOT NULL,          -- Display text shown to user
    placeholder         TEXT,                   -- Input placeholder
    help_text           TEXT,                   -- Help tooltip

    -- Display
    display_order       SMALLINT NOT NULL,

    -- Validation rules (applicable based on question_type)
    is_required         BOOLEAN NOT NULL DEFAULT true,
    min_length          INTEGER,                -- For text types
    max_length          INTEGER,                -- For text types
    min_value           INTEGER,                -- For rating/choice types
    max_value           INTEGER,                -- For rating/choice types
    validation_pattern  TEXT,                   -- Regex for text_short, text_email, text_url

    -- File upload rules (for media types - Post-MVP)
    allowed_file_types  TEXT[],                 -- Array: ['image/jpeg', 'image/png']
    max_file_size_kb    INTEGER,                -- Max file size in KB

    -- State
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT form_questions_form_fk
        FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    CONSTRAINT form_questions_type_fk
        FOREIGN KEY (question_type_id) REFERENCES question_types(id),
    CONSTRAINT form_questions_key_per_form_unique
        UNIQUE (form_id, question_key),
    CONSTRAINT form_questions_order_per_form_unique
        UNIQUE (form_id, display_order),
    CONSTRAINT form_questions_key_format
        CHECK (question_key ~ '^[a-z][a-z0-9_]*$'),
    CONSTRAINT form_questions_length_check
        CHECK (min_length IS NULL OR max_length IS NULL OR min_length <= max_length),
    CONSTRAINT form_questions_value_check
        CHECK (min_value IS NULL OR max_value IS NULL OR min_value <= max_value)
);

CREATE INDEX idx_form_questions_form ON form_questions(form_id);
CREATE INDEX idx_form_questions_type ON form_questions(question_type_id);
CREATE INDEX idx_form_questions_order ON form_questions(form_id, display_order);

SELECT add_updated_at_trigger('form_questions');

COMMENT ON TABLE form_questions IS 'Form questions with typed validation - explicit columns, not JSONB';
COMMENT ON COLUMN form_questions.question_key IS 'Semantic identifier (problem, solution, result, name, email)';
COMMENT ON COLUMN form_questions.question_type_id IS 'FK to question_types - determines applicable validation rules';
COMMENT ON COLUMN form_questions.validation_pattern IS 'Regex pattern for text validation (email, URL, custom)';
```

### Column Reference

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | NanoID 12-char |
| `form_id` | TEXT | FK | Parent form |
| `question_type_id` | TEXT | FK → question_types | Question type definition |
| `question_key` | VARCHAR(50) | NOT NULL, UNIQUE per form | Semantic identifier |
| `question_text` | TEXT | NOT NULL | Display question text |
| `placeholder` | TEXT | NULL | Input placeholder text |
| `help_text` | TEXT | NULL | Help tooltip text |
| `display_order` | SMALLINT | NOT NULL, UNIQUE per form | Order in form |
| `is_required` | BOOLEAN | NOT NULL | Mandatory field |
| `min_length` | INTEGER | NULL | Min chars (text types) |
| `max_length` | INTEGER | NULL | Max chars (text types) |
| `min_value` | INTEGER | NULL | Min value (rating types) |
| `max_value` | INTEGER | NULL | Max value (rating types) |
| `validation_pattern` | TEXT | NULL | Regex (text types) |
| `allowed_file_types` | TEXT[] | NULL | MIME types (media types) |
| `max_file_size_kb` | INTEGER | NULL | Max KB (media types) |
| `is_active` | BOOLEAN | NOT NULL | Soft delete |

### Default Question Keys

| Key | Type | Purpose | Default Text |
|-----|------|---------|--------------|
| `problem` | text_long | Pain point | "What problem were you trying to solve?" |
| `solution` | text_long | How product helped | "How did [product] help?" |
| `result` | text_long | Outcome achieved | "What specific result did you get?" |
| `rating` | rating_star | Overall satisfaction | "How would you rate your experience?" |
| `name` | text_short | Customer name | "Your name" |
| `email` | text_email | Customer email | "Your email" |
| `title` | text_short | Job title | "Your title" |
| `company` | text_short | Company name | "Your company" |
| `consent` | special_consent | Permission | "I agree to share this testimonial publicly" |

---

## 3.4 Question Options Table

Predefined choices for choice-type questions (single_choice, multiple_choice, dropdown).

```sql
CREATE TABLE public.question_options (
    id              TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    question_id     TEXT NOT NULL,
    option_value    VARCHAR(100) NOT NULL,  -- Stored value
    option_label    TEXT NOT NULL,          -- Display text
    display_order   SMALLINT NOT NULL,
    is_default      BOOLEAN NOT NULL DEFAULT false,  -- Pre-selected option
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT question_options_question_fk
        FOREIGN KEY (question_id) REFERENCES form_questions(id) ON DELETE CASCADE,
    CONSTRAINT question_options_value_per_question_unique
        UNIQUE (question_id, option_value),
    CONSTRAINT question_options_order_per_question_unique
        UNIQUE (question_id, display_order)
);

CREATE INDEX idx_question_options_question ON question_options(question_id);
CREATE INDEX idx_question_options_order ON question_options(question_id, display_order);

COMMENT ON TABLE question_options IS 'Predefined choices for choice-type questions';
COMMENT ON COLUMN question_options.option_value IS 'Stored value (yes, no, maybe) - used in answers';
COMMENT ON COLUMN question_options.option_label IS 'Display text (Yes!, No, Maybe later)';
```

### Example: "Would you recommend?" Question

```sql
-- Question
INSERT INTO form_questions (form_id, question_type_id, question_key, question_text, display_order)
SELECT 'form_abc', qt.id, 'recommend', 'Would you recommend us to a friend?', 5
FROM question_types qt WHERE qt.unique_name = 'choice_single';

-- Options
INSERT INTO question_options (question_id, option_value, option_label, display_order) VALUES
    ('question_xyz', 'yes', 'Yes, definitely!', 1),
    ('question_xyz', 'maybe', 'Maybe', 2),
    ('question_xyz', 'no', 'Not right now', 3);
```

---

## 3.5 Testimonials Table

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

## 3.6 Testimonial Answers Table

Normalized answers with typed columns based on question type. Each answer uses the appropriate column for its data type - no JSONB dumps.

```sql
CREATE TABLE public.testimonial_answers (
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    testimonial_id      TEXT NOT NULL,
    question_id         TEXT NOT NULL,

    -- Typed answer columns (use based on question_type.answer_data_type)
    answer_text         TEXT,           -- For text_short, text_long, text_email, text_url, choice_single, choice_dropdown
    answer_integer      INTEGER,        -- For rating_star, rating_nps, rating_scale
    answer_boolean      BOOLEAN,        -- For special_consent
    answer_json         JSONB,          -- For choice_multiple (array of selected values)
    answer_url          TEXT,           -- For media_image, media_video (file URL)

    -- Metadata
    answered_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT testimonial_answers_testimonial_fk
        FOREIGN KEY (testimonial_id) REFERENCES testimonials(id) ON DELETE CASCADE,
    CONSTRAINT testimonial_answers_question_fk
        FOREIGN KEY (question_id) REFERENCES form_questions(id) ON DELETE CASCADE,
    CONSTRAINT testimonial_answers_unique
        UNIQUE (testimonial_id, question_id),
    -- At least one answer column must be filled
    CONSTRAINT testimonial_answers_has_value
        CHECK (
            answer_text IS NOT NULL OR
            answer_integer IS NOT NULL OR
            answer_boolean IS NOT NULL OR
            answer_json IS NOT NULL OR
            answer_url IS NOT NULL
        )
);

CREATE INDEX idx_testimonial_answers_testimonial ON testimonial_answers(testimonial_id);
CREATE INDEX idx_testimonial_answers_question ON testimonial_answers(question_id);
-- Index for rating analysis
CREATE INDEX idx_testimonial_answers_rating ON testimonial_answers(question_id, answer_integer)
    WHERE answer_integer IS NOT NULL;

SELECT add_updated_at_trigger('testimonial_answers');

COMMENT ON TABLE testimonial_answers IS 'Typed answers - explicit columns based on question_type.answer_data_type';
COMMENT ON COLUMN testimonial_answers.answer_text IS 'Text answers (short, long, email, url, single choice value)';
COMMENT ON COLUMN testimonial_answers.answer_integer IS 'Numeric answers (star rating 1-5, NPS 0-10, scale)';
COMMENT ON COLUMN testimonial_answers.answer_boolean IS 'Boolean answers (consent checkbox)';
COMMENT ON COLUMN testimonial_answers.answer_json IS 'JSON answers (multiple choice selected values array)';
COMMENT ON COLUMN testimonial_answers.answer_url IS 'URL answers (uploaded file URLs)';
```

### Answer Column Usage by Question Type

| Question Type | answer_data_type | Column Used | Example Value |
|---------------|------------------|-------------|---------------|
| `text_short` | text | `answer_text` | "John Doe" |
| `text_long` | text | `answer_text` | "This product saved me hours..." |
| `text_email` | text | `answer_text` | "john@example.com" |
| `text_url` | url | `answer_url` | "https://example.com" |
| `rating_star` | integer | `answer_integer` | 5 |
| `rating_nps` | integer | `answer_integer` | 9 |
| `rating_scale` | integer | `answer_integer` | 8 |
| `choice_single` | text | `answer_text` | "yes" (option_value) |
| `choice_multiple` | json | `answer_json` | `["feature_a", "feature_c"]` |
| `choice_dropdown` | text | `answer_text` | "enterprise" |
| `media_image` | url | `answer_url` | "https://cdn.../image.jpg" |
| `media_video` | url | `answer_url` | "https://cdn.../video.mp4" |
| `special_consent` | boolean | `answer_boolean` | true |
| `special_hidden` | text | `answer_text` | "utm_source=google" |

### Rating Analysis Query Example

```sql
-- Average star rating per form
SELECT
    f.name AS form_name,
    AVG(ta.answer_integer) AS avg_rating,
    COUNT(*) AS total_ratings
FROM testimonial_answers ta
JOIN form_questions fq ON ta.question_id = fq.id
JOIN question_types qt ON fq.question_type_id = qt.id
JOIN forms f ON fq.form_id = f.id
WHERE qt.unique_name = 'rating_star'
  AND ta.answer_integer IS NOT NULL
GROUP BY f.id, f.name;
```

---

## 3.7 Widgets Table

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

## 3.8 Widget Testimonials Junction Table

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
