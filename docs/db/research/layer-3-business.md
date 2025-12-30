# Layer 3: Business Entities

**Tables:** forms, question_types, form_questions, question_options, form_submissions, form_question_responses, testimonials, widgets, widget_testimonials

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
    -- Primary key
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),  -- NanoID 12-char unique identifier

    -- Ownership & multi-tenancy
    organization_id     TEXT NOT NULL,      -- FK: Tenant boundary for isolation

    -- Audit: who & when
    created_by          TEXT NOT NULL,      -- FK: User who created this form
    updated_by          TEXT,               -- FK: User who last modified (NULL until first update)

    -- Form identity
    name                TEXT NOT NULL,      -- Display name in dashboard (e.g., "Product Feedback Form")
    slug                TEXT NOT NULL,      -- URL-friendly identifier for /f/{slug}. Lowercase alphanumeric + hyphens

    -- AI context (Infer, Don't Ask philosophy)
    product_name        TEXT NOT NULL,      -- Product being reviewed - used in question templates
    product_description TEXT,               -- AI infers industry, audience, tone from this description

    -- UI preferences (JSONB appropriate - truly dynamic)
    settings            JSONB NOT NULL DEFAULT '{}'::jsonb,  -- Theme colors, branding - NOT business logic

    -- State & timestamps
    is_active           BOOLEAN NOT NULL DEFAULT true,   -- Soft delete: false = 404 on public link
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Immutable creation timestamp
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Auto-updated by trigger

    -- Constraints
    CONSTRAINT forms_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT forms_created_by_fk
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT forms_updated_by_fk
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT forms_slug_per_org_unique
        UNIQUE (organization_id, slug),
    CONSTRAINT forms_slug_format
        CHECK (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$')
);

-- Indexes
CREATE INDEX idx_forms_org ON forms(organization_id);           -- Filter by organization
CREATE INDEX idx_forms_slug ON forms(organization_id, slug);    -- Lookup by slug within org
CREATE INDEX idx_forms_active ON forms(organization_id) WHERE is_active = true;  -- Active forms only

SELECT add_updated_at_trigger('forms');

-- Table comment
COMMENT ON TABLE forms IS 'Testimonial collection forms - questions normalized to form_questions table';

-- Column comments
COMMENT ON COLUMN forms.id IS 'Primary key - NanoID 12-char unique identifier';
COMMENT ON COLUMN forms.organization_id IS 'FK to organizations - tenant boundary for multi-tenancy isolation';
COMMENT ON COLUMN forms.created_by IS 'FK to users - user who created this form';
COMMENT ON COLUMN forms.updated_by IS 'FK to users - user who last modified. NULL until first update';
COMMENT ON COLUMN forms.name IS 'Form display name shown in dashboard (e.g., "Product Feedback Form")';
COMMENT ON COLUMN forms.slug IS 'URL-friendly identifier for public form link (/f/{slug}). Lowercase alphanumeric with hyphens';
COMMENT ON COLUMN forms.product_name IS 'Name of product being reviewed - used in question templates (e.g., "How did {product} help?")';
COMMENT ON COLUMN forms.product_description IS 'AI context for question generation - enables "Infer, Don''t Ask" philosophy. AI infers industry, audience, tone from this';
COMMENT ON COLUMN forms.settings IS 'UI preferences only (theme colors, branding) - NOT business logic. JSONB appropriate here';
COMMENT ON COLUMN forms.is_active IS 'Soft delete flag. False = form disabled, public link returns 404';
COMMENT ON COLUMN forms.created_at IS 'Timestamp when form was created. Immutable after insert';
COMMENT ON COLUMN forms.updated_at IS 'Timestamp of last modification. Auto-updated by trigger';
```

### Column Reference

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | NanoID 12-char |
| `organization_id` | TEXT | FK → organizations | Parent organization (tenant) |
| `created_by` | TEXT | FK → users | Who created |
| `updated_by` | TEXT | FK → users | Who last modified |
| `name` | TEXT | NOT NULL | Form display name |
| `slug` | TEXT | NOT NULL, UNIQUE | URL identifier (/f/{slug}) |
| `product_name` | TEXT | NOT NULL | Product being reviewed |
| `product_description` | TEXT | NULL | AI context for question generation |
| `settings` | JSONB | NOT NULL | UI preferences (theme, colors) |
| `is_active` | BOOLEAN | NOT NULL | Soft delete flag |
| `created_at` | TIMESTAMPTZ | NOT NULL | When created |
| `updated_at` | TIMESTAMPTZ | NOT NULL | When last modified |

**Note:** Rating, email, and company collection settings are now controlled via `form_questions`:
- Add `rating_star` question → collect ratings
- Add `text_email` question with `is_required=true` → require email
- Add `text_short` question for company with `is_required=false` → optional company

---

## 3.2 Question Types Table (Reference Data)

Defines available question types with their validation rules and constraints. This is a seed table - rows are system-defined, not user-created.

```sql
CREATE TABLE public.question_types (
    -- Primary key
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),  -- NanoID 12-char unique identifier

    -- Type identity
    unique_name         VARCHAR(50) NOT NULL,   -- Code identifier for lookups (text_short, rating_star)
    name                VARCHAR(100) NOT NULL,  -- Display label for UI (Short Text, Star Rating)
    category            VARCHAR(30) NOT NULL,   -- Grouping: text, rating, choice, media, special
    description         TEXT,                   -- Brief explanation shown in form builder tooltip

    -- Frontend mapping
    input_component     VARCHAR(50) NOT NULL,   -- Vue component name (TextInput, StarRating, RadioGroup)
    answer_data_type    VARCHAR(20) NOT NULL,   -- Answer storage type: text, integer, boolean, json, url

    -- Validation rule applicability flags (determines which rules can be configured per type)
    supports_min_length     BOOLEAN NOT NULL DEFAULT false,  -- Text types: minimum character count
    supports_max_length     BOOLEAN NOT NULL DEFAULT false,  -- Text types: maximum character count
    supports_min_value      BOOLEAN NOT NULL DEFAULT false,  -- Rating types: minimum value (e.g., 1)
    supports_max_value      BOOLEAN NOT NULL DEFAULT false,  -- Rating types: maximum value (e.g., 5, 10)
    supports_pattern        BOOLEAN NOT NULL DEFAULT false,  -- Text types: regex validation (email, URL)
    supports_options        BOOLEAN NOT NULL DEFAULT false,  -- Choice types: has predefined options
    supports_file_types     BOOLEAN NOT NULL DEFAULT false,  -- Media types: allowed MIME types
    supports_max_file_size  BOOLEAN NOT NULL DEFAULT false,  -- Media types: file size limit

    -- Default values (pre-populated when creating question of this type)
    default_min_value   INTEGER,    -- Default min (e.g., 1 for star, 0 for NPS)
    default_max_value   INTEGER,    -- Default max (e.g., 5 for star, 10 for NPS)

    -- State & display
    is_active           BOOLEAN NOT NULL DEFAULT true,   -- False = hidden from form builder
    display_order       SMALLINT NOT NULL,               -- Order in type picker (lower = first)
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Seed timestamp (immutable)

    -- Constraints
    CONSTRAINT question_types_unique_name_unique UNIQUE (unique_name),
    CONSTRAINT question_types_category_check
        CHECK (category IN ('text', 'rating', 'choice', 'media', 'special')),
    CONSTRAINT question_types_answer_type_check
        CHECK (answer_data_type IN ('text', 'integer', 'boolean', 'decimal', 'json', 'url'))
);

-- Indexes
CREATE INDEX idx_question_types_category ON question_types(category);  -- Filter by category in UI

-- Table comment
COMMENT ON TABLE question_types IS 'Question type definitions - seed data, system-defined, not user-modifiable';

-- Column comments
COMMENT ON COLUMN question_types.id IS 'Primary key - NanoID 12-char unique identifier';
COMMENT ON COLUMN question_types.unique_name IS 'Code identifier for type lookups (text_short, rating_star). Use in code comparisons';
COMMENT ON COLUMN question_types.name IS 'Display label for UI (Short Text, Star Rating). Human-readable';
COMMENT ON COLUMN question_types.category IS 'Type grouping: text, rating, choice, media, special. Used for UI organization';
COMMENT ON COLUMN question_types.description IS 'Brief explanation of type purpose shown in form builder tooltip';
COMMENT ON COLUMN question_types.input_component IS 'Vue component name for rendering (TextInput, StarRating). Maps to frontend';
COMMENT ON COLUMN question_types.answer_data_type IS 'Data type for storing answers: text, integer, boolean, decimal, json, url';
COMMENT ON COLUMN question_types.supports_min_length IS 'Whether min_length validation is applicable (true for text types)';
COMMENT ON COLUMN question_types.supports_max_length IS 'Whether max_length validation is applicable (true for text types)';
COMMENT ON COLUMN question_types.supports_min_value IS 'Whether min_value validation is applicable (true for rating types)';
COMMENT ON COLUMN question_types.supports_max_value IS 'Whether max_value validation is applicable (true for rating types)';
COMMENT ON COLUMN question_types.supports_pattern IS 'Whether regex validation is applicable (true for email, URL types)';
COMMENT ON COLUMN question_types.supports_options IS 'Whether predefined choices are applicable (true for choice types)';
COMMENT ON COLUMN question_types.supports_file_types IS 'Whether file type restrictions are applicable (true for media types)';
COMMENT ON COLUMN question_types.supports_max_file_size IS 'Whether file size limit is applicable (true for media types)';
COMMENT ON COLUMN question_types.default_min_value IS 'Default minimum value when creating question (e.g., 1 for star rating)';
COMMENT ON COLUMN question_types.default_max_value IS 'Default maximum value when creating question (e.g., 5 for star rating, 10 for NPS)';
COMMENT ON COLUMN question_types.is_active IS 'Whether type is available for new questions. False hides from form builder';
COMMENT ON COLUMN question_types.display_order IS 'Order in form builder type picker. Lower = appears first';
COMMENT ON COLUMN question_types.created_at IS 'Timestamp when type was seeded. Immutable';
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

**Week 1 Stretch:**
| Type | Primary Use |
|------|-------------|
| `choice_multiple` | "Which features do you value?" (multi-select) |

---

## 3.3 Form Questions Table

Questions linked to forms with typed validation rules. Each question references a type and has type-appropriate validation columns.

```sql
CREATE TABLE public.form_questions (
    -- Primary key
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),  -- NanoID 12-char unique identifier

    -- Ownership & relationships
    organization_id     TEXT NOT NULL,          -- FK: Tenant boundary for Hasura permissions
    form_id             TEXT NOT NULL,          -- FK: Parent form this question belongs to
    question_type_id    TEXT NOT NULL,          -- FK: Determines input component & validation rules

    -- Question content
    question_key        VARCHAR(50) NOT NULL,   -- Semantic identifier (problem, solution, result, name, email)
    question_text       TEXT NOT NULL,          -- Display text shown to customer
    placeholder         TEXT,                   -- Input placeholder hint (e.g., "Describe your challenge...")
    help_text           TEXT,                   -- Tooltip explaining expected answer

    -- Display
    display_order       SMALLINT NOT NULL,      -- Order on form (unique per form, starts at 1)

    -- Validation rules (use based on question_type.supports_* flags)
    is_required         BOOLEAN NOT NULL DEFAULT true,  -- Mandatory field - validation enforced on submit
    min_length          INTEGER,                -- Text types: minimum character count (NULL = no min)
    max_length          INTEGER,                -- Text types: maximum character count (NULL = no max)
    min_value           INTEGER,                -- Rating types: minimum value (e.g., 1 for stars)
    max_value           INTEGER,                -- Rating types: maximum value (e.g., 5 for stars)
    validation_pattern  TEXT,                   -- Text types: regex pattern (email, URL, custom)

    -- File upload rules (Post-MVP - media types only)
    allowed_file_types  TEXT[],                 -- MIME types array: ['image/jpeg', 'image/png']
    max_file_size_kb    INTEGER,                -- Maximum file size in kilobytes

    -- State & audit
    is_active           BOOLEAN NOT NULL DEFAULT true,   -- Soft delete: false = hidden but answers preserved
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- When created
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- When last modified (auto-trigger)
    updated_by          TEXT,               -- FK: Who last modified (NULL until first update)

    -- Constraints
    CONSTRAINT form_questions_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT form_questions_form_fk
        FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    CONSTRAINT form_questions_type_fk
        FOREIGN KEY (question_type_id) REFERENCES question_types(id) ON DELETE RESTRICT,
    CONSTRAINT form_questions_updated_by_fk
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT form_questions_key_per_form_unique
        UNIQUE (form_id, question_key),           -- Each key appears once per form
    CONSTRAINT form_questions_order_per_form_unique
        UNIQUE (form_id, display_order),          -- Each order position once per form
    CONSTRAINT form_questions_key_format
        CHECK (question_key ~ '^[a-z][a-z0-9_]*$'),  -- Lowercase alphanumeric + underscore
    CONSTRAINT form_questions_length_check
        CHECK (min_length IS NULL OR max_length IS NULL OR min_length <= max_length),
    CONSTRAINT form_questions_value_check
        CHECK (min_value IS NULL OR max_value IS NULL OR min_value <= max_value)
);

-- Indexes
CREATE INDEX idx_form_questions_org ON form_questions(organization_id);       -- Tenant isolation filter
CREATE INDEX idx_form_questions_form ON form_questions(form_id);              -- Filter by form
CREATE INDEX idx_form_questions_type ON form_questions(question_type_id);     -- Filter by type
CREATE INDEX idx_form_questions_order ON form_questions(form_id, display_order);  -- Ordered fetch

SELECT add_updated_at_trigger('form_questions');

-- Table comment
COMMENT ON TABLE form_questions IS 'Form questions with typed validation - explicit columns, not JSONB';

-- Column comments
COMMENT ON COLUMN form_questions.id IS 'Primary key - NanoID 12-char unique identifier';
COMMENT ON COLUMN form_questions.organization_id IS 'FK to organizations - tenant boundary for Hasura row-level permissions';
COMMENT ON COLUMN form_questions.form_id IS 'FK to forms - parent form this question belongs to';
COMMENT ON COLUMN form_questions.question_type_id IS 'FK to question_types - determines input component and applicable validation rules';
COMMENT ON COLUMN form_questions.question_key IS 'Semantic identifier unique per form (problem, solution, result, name, email). Used for answer lookup';
COMMENT ON COLUMN form_questions.question_text IS 'Display text shown to customer (e.g., "What problem were you trying to solve?")';
COMMENT ON COLUMN form_questions.placeholder IS 'Input placeholder hint (e.g., "Describe your challenge...")';
COMMENT ON COLUMN form_questions.help_text IS 'Tooltip help text explaining what kind of answer is expected';
COMMENT ON COLUMN form_questions.display_order IS 'Order in which question appears on form. Unique per form, starts at 1';
COMMENT ON COLUMN form_questions.is_required IS 'Whether answer is mandatory. Validation enforced on submission';
COMMENT ON COLUMN form_questions.min_length IS 'Minimum character count for text answers. NULL = no minimum. Only for text types';
COMMENT ON COLUMN form_questions.max_length IS 'Maximum character count for text answers. NULL = no maximum. Only for text types';
COMMENT ON COLUMN form_questions.min_value IS 'Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars)';
COMMENT ON COLUMN form_questions.max_value IS 'Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS)';
COMMENT ON COLUMN form_questions.validation_pattern IS 'Regex pattern for text validation. Used for email, URL, or custom format validation';
COMMENT ON COLUMN form_questions.allowed_file_types IS 'Array of allowed MIME types for file uploads (e.g., ["image/jpeg", "image/png"]). Post-MVP';
COMMENT ON COLUMN form_questions.max_file_size_kb IS 'Maximum file size in kilobytes for uploads. Post-MVP';
COMMENT ON COLUMN form_questions.is_active IS 'Soft delete flag. False = question hidden from form but answers preserved';
COMMENT ON COLUMN form_questions.created_at IS 'Timestamp when question was created. Immutable after insert';
COMMENT ON COLUMN form_questions.updated_at IS 'Timestamp of last modification. Auto-updated by trigger';
COMMENT ON COLUMN form_questions.updated_by IS 'FK to users - who last modified. NULL until first update';
```

### Column Reference

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | NanoID 12-char |
| `organization_id` | TEXT | FK → organizations | Tenant boundary |
| `form_id` | TEXT | FK → forms | Parent form |
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
| `created_at` | TIMESTAMPTZ | NOT NULL | When created |
| `updated_at` | TIMESTAMPTZ | NOT NULL | When last modified |
| `updated_by` | TEXT | FK → users | Who last modified |

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
    -- Primary key
    id              TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),  -- NanoID 12-char unique identifier

    -- Ownership & relationship
    organization_id TEXT NOT NULL,          -- FK: Tenant boundary for Hasura permissions
    question_id     TEXT NOT NULL,          -- FK: Parent question (must be choice type)

    -- Option content
    option_value    VARCHAR(100) NOT NULL,  -- Stored value (yes, no, maybe) - saved in answers
    option_label    TEXT NOT NULL,          -- Display text (Yes!, No, Maybe later) - shown to user

    -- Display & defaults
    display_order   SMALLINT NOT NULL,      -- Order in option list (unique per question)
    is_default      BOOLEAN NOT NULL DEFAULT false,  -- Pre-selected option when form loads

    -- State & audit
    is_active       BOOLEAN NOT NULL DEFAULT true,   -- Soft delete: false = hidden but preserved
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Immutable creation timestamp
    created_by      TEXT NOT NULL,          -- FK: User who created this option

    -- Constraints
    CONSTRAINT question_options_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT question_options_question_fk
        FOREIGN KEY (question_id) REFERENCES form_questions(id) ON DELETE CASCADE,
    CONSTRAINT question_options_created_by_fk
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT question_options_value_per_question_unique
        UNIQUE (question_id, option_value),           -- Each value once per question
    CONSTRAINT question_options_order_per_question_unique
        UNIQUE (question_id, display_order)           -- Each order position once per question
);

-- Indexes
CREATE INDEX idx_question_options_org ON question_options(organization_id);   -- Tenant isolation filter
CREATE INDEX idx_question_options_question ON question_options(question_id);  -- Filter by question
CREATE INDEX idx_question_options_order ON question_options(question_id, display_order);  -- Ordered fetch

-- Table comment
COMMENT ON TABLE question_options IS 'Predefined choices for choice-type questions (radio, checkbox, dropdown)';

-- Column comments
COMMENT ON COLUMN question_options.id IS 'Primary key - NanoID 12-char unique identifier';
COMMENT ON COLUMN question_options.organization_id IS 'FK to organizations - tenant boundary for Hasura row-level permissions';
COMMENT ON COLUMN question_options.question_id IS 'FK to form_questions - must be a choice-type question';
COMMENT ON COLUMN question_options.option_value IS 'Stored value saved in form_question_responses (e.g., "yes", "no", "maybe")';
COMMENT ON COLUMN question_options.option_label IS 'Display text shown to customer (e.g., "Yes, definitely!", "Not right now")';
COMMENT ON COLUMN question_options.display_order IS 'Order in option list. Unique per question, starts at 1';
COMMENT ON COLUMN question_options.is_default IS 'Pre-selected when form loads. Only one per question should be true';
COMMENT ON COLUMN question_options.is_active IS 'Soft delete flag. False = option hidden but existing answers preserved';
COMMENT ON COLUMN question_options.created_at IS 'Timestamp when option was created. Immutable after insert';
COMMENT ON COLUMN question_options.created_by IS 'FK to users - user who created this option';
```

### Example: "Would you recommend?" Question

```sql
-- Question
INSERT INTO form_questions (organization_id, form_id, question_type_id, question_key, question_text, display_order)
SELECT 'org_abc', 'form_abc', qt.id, 'recommend', 'Would you recommend us to a friend?', 5
FROM question_types qt WHERE qt.unique_name = 'choice_single';

-- Options
INSERT INTO question_options (organization_id, question_id, option_value, option_label, display_order, created_by) VALUES
    ('org_abc', 'question_xyz', 'yes', 'Yes, definitely!', 1, 'user_123'),
    ('org_abc', 'question_xyz', 'maybe', 'Maybe', 2, 'user_123'),
    ('org_abc', 'question_xyz', 'no', 'Not right now', 3, 'user_123');
```

---

## 3.5 Form Submissions Table

Raw form submission event capturing submitter info. This is the parent record for form_question_responses. A testimonial is created from a submission (for form source) or independently (for imports).

```sql
CREATE TABLE public.form_submissions (
    -- Primary key
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),  -- NanoID 12-char unique identifier

    -- Ownership & relationships
    organization_id     TEXT NOT NULL,      -- FK: Tenant boundary for multi-tenancy
    form_id             TEXT NOT NULL,      -- FK: Which form was submitted

    -- Submitter info (captured at submission time - source of truth)
    submitter_name      TEXT NOT NULL,      -- Full name of person submitting
    submitter_email     TEXT NOT NULL,      -- Email for follow-up (not displayed publicly)
    submitter_title     TEXT,               -- Job title (e.g., "Product Manager")
    submitter_company   TEXT,               -- Company name (e.g., "Acme Inc")
    submitter_avatar_url TEXT,              -- Profile photo URL
    submitter_linkedin_url TEXT,            -- LinkedIn profile for social proof
    submitter_twitter_url TEXT,             -- Twitter/X profile for social proof

    -- Timestamps
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- When form was submitted
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Record creation (same as submitted_at)
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Last modification
    updated_by          TEXT,               -- FK: Who last modified (admin edits)

    -- Constraints
    CONSTRAINT form_submissions_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT form_submissions_form_fk
        FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    CONSTRAINT form_submissions_updated_by_fk
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT form_submissions_email_format
        CHECK (submitter_email ~* '^.+@.+\..+$'),  -- Permissive safety net; app does real validation
    CONSTRAINT form_submissions_linkedin_url_format
        CHECK (submitter_linkedin_url IS NULL OR submitter_linkedin_url ~* '^https?://(www\.)?linkedin\.com/'),
    CONSTRAINT form_submissions_twitter_url_format
        CHECK (submitter_twitter_url IS NULL OR submitter_twitter_url ~* '^https?://(www\.)?(twitter\.com|x\.com)/')
);

-- Indexes
CREATE INDEX idx_form_submissions_org ON form_submissions(organization_id);
CREATE INDEX idx_form_submissions_form ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_submitted ON form_submissions(organization_id, submitted_at DESC);

SELECT add_updated_at_trigger('form_submissions');

-- Table comment
COMMENT ON TABLE form_submissions IS 'Raw form submission event - submitter info lives here, responses in form_question_responses';

-- Column comments
COMMENT ON COLUMN form_submissions.id IS 'Primary key - NanoID 12-char unique identifier';
COMMENT ON COLUMN form_submissions.organization_id IS 'FK to organizations - tenant boundary for isolation';
COMMENT ON COLUMN form_submissions.form_id IS 'FK to forms - which form was submitted';
COMMENT ON COLUMN form_submissions.submitter_name IS 'Full name of person who submitted. Source of truth for customer identity';
COMMENT ON COLUMN form_submissions.submitter_email IS 'Email for follow-up. NOT displayed publicly on widgets';
COMMENT ON COLUMN form_submissions.submitter_title IS 'Job title like "Product Manager". Copied to testimonial for display';
COMMENT ON COLUMN form_submissions.submitter_company IS 'Company name like "Acme Inc". Copied to testimonial for display';
COMMENT ON COLUMN form_submissions.submitter_avatar_url IS 'Profile photo URL. From Gravatar or upload';
COMMENT ON COLUMN form_submissions.submitter_linkedin_url IS 'LinkedIn profile URL for social proof verification';
COMMENT ON COLUMN form_submissions.submitter_twitter_url IS 'Twitter/X profile URL for social proof verification';
COMMENT ON COLUMN form_submissions.submitted_at IS 'When customer submitted the form. Immutable';
COMMENT ON COLUMN form_submissions.created_at IS 'Record creation timestamp. Same as submitted_at';
COMMENT ON COLUMN form_submissions.updated_at IS 'Last modification. Auto-updated by trigger';
COMMENT ON COLUMN form_submissions.updated_by IS 'FK to users - who made admin edits. NULL until first update';
```

### Relationship to Other Tables

```
form_submissions (1) ────► form_question_responses (N)
       │                   Raw answers to each question
       │
       └────────────────► testimonials (0..1)
                          The curated, displayable content
```

---

## 3.6 Form Question Responses Table

Raw form submission responses (internal data, not displayed). Each response uses typed columns based on question type - no JSONB dumps. These feed into AI assembly to create the displayable testimonial.

```sql
CREATE TABLE public.form_question_responses (
    -- Primary key
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),  -- NanoID 12-char unique identifier

    -- Ownership & relationships
    organization_id     TEXT NOT NULL,      -- FK: Tenant boundary for Hasura permissions
    submission_id       TEXT NOT NULL,      -- FK: Parent form submission
    question_id         TEXT NOT NULL,      -- FK: Which question this responds to

    -- Typed answer columns (use based on question_type.answer_data_type)
    answer_text         TEXT,               -- text_short, text_long, text_email, choice_single, choice_dropdown
    answer_integer      INTEGER,            -- rating_star (1-5), rating_nps (0-10), rating_scale
    answer_boolean      BOOLEAN,            -- special_consent (true/false)
    answer_json         JSONB,              -- choice_multiple: ["option_a", "option_c"]
    answer_url          TEXT,               -- media_image, media_video, text_url: file/page URL

    -- Audit: who & when
    answered_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- When customer answered
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Record creation
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Last modification
    updated_by          TEXT,               -- FK: User who last modified (NULL until first update)

    -- Constraints
    CONSTRAINT form_question_responses_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT form_question_responses_submission_fk
        FOREIGN KEY (submission_id) REFERENCES form_submissions(id) ON DELETE CASCADE,
    CONSTRAINT form_question_responses_question_fk
        FOREIGN KEY (question_id) REFERENCES form_questions(id) ON DELETE CASCADE,
    CONSTRAINT form_question_responses_unique
        UNIQUE (submission_id, question_id),      -- One response per question per submission
    CONSTRAINT form_question_responses_updated_by_fk
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT form_question_responses_has_value           -- At least one response column must be filled
        CHECK (
            answer_text IS NOT NULL OR
            answer_integer IS NOT NULL OR
            answer_boolean IS NOT NULL OR
            answer_json IS NOT NULL OR
            answer_url IS NOT NULL
        )
);

-- Indexes
CREATE INDEX idx_form_question_responses_org ON form_question_responses(organization_id);         -- Tenant isolation filter
CREATE INDEX idx_form_question_responses_submission ON form_question_responses(submission_id);    -- Get all responses for submission
CREATE INDEX idx_form_question_responses_question ON form_question_responses(question_id);        -- Analytics by question
CREATE INDEX idx_form_question_responses_rating                                          -- Rating analysis queries
    ON form_question_responses(question_id, answer_integer)
    WHERE answer_integer IS NOT NULL;

SELECT add_updated_at_trigger('form_question_responses');

-- Table comment
COMMENT ON TABLE form_question_responses IS 'Raw form submission responses - internal data for AI assembly, not displayed on widgets';

-- Column comments
COMMENT ON COLUMN form_question_responses.id IS 'Primary key - NanoID 12-char unique identifier';
COMMENT ON COLUMN form_question_responses.organization_id IS 'FK to organizations - tenant boundary for Hasura row-level permissions';
COMMENT ON COLUMN form_question_responses.submission_id IS 'FK to form_submissions - parent submission this response belongs to';
COMMENT ON COLUMN form_question_responses.question_id IS 'FK to form_questions - which question this responds to';
COMMENT ON COLUMN form_question_responses.answer_text IS 'Text responses: short text, long text, email, single choice value, dropdown value';
COMMENT ON COLUMN form_question_responses.answer_integer IS 'Numeric responses: star rating (1-5), NPS score (0-10), scale value';
COMMENT ON COLUMN form_question_responses.answer_boolean IS 'Boolean responses: consent checkbox (true = agreed)';
COMMENT ON COLUMN form_question_responses.answer_json IS 'JSON responses: multiple choice selected values array ["opt_a", "opt_c"]';
COMMENT ON COLUMN form_question_responses.answer_url IS 'URL responses: uploaded file URL, or validated URL input';
COMMENT ON COLUMN form_question_responses.answered_at IS 'When customer submitted this specific response';
COMMENT ON COLUMN form_question_responses.created_at IS 'Record creation timestamp. Usually same as answered_at';
COMMENT ON COLUMN form_question_responses.updated_at IS 'Last modification timestamp. Auto-updated by trigger';
COMMENT ON COLUMN form_question_responses.updated_by IS 'FK to users - who last modified. NULL until first update';
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
    AVG(fr.answer_integer) AS avg_rating,
    COUNT(*) AS total_ratings
FROM form_question_responses fr
JOIN form_questions fq ON fr.question_id = fq.id
JOIN question_types qt ON fq.question_type_id = qt.id
JOIN forms f ON fq.form_id = f.id
WHERE qt.unique_name = 'rating_star'
  AND fr.answer_integer IS NOT NULL
GROUP BY f.id, f.name;
```

---

## 3.7 Testimonials Table

The displayable testimonial entity - the curated quote, rating, and customer info shown on widgets. Can be created from a form submission (has linked form_question_responses) or independently (imports, manual entry).

```sql
CREATE TABLE public.testimonials (
    -- Primary key
    id                      TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),  -- NanoID 12-char unique identifier

    -- Ownership & relationships
    organization_id         TEXT NOT NULL,      -- FK: Tenant boundary for multi-tenancy
    submission_id           TEXT,               -- FK: Source submission (NULL for imports/manual)

    -- Workflow status
    status                  TEXT NOT NULL DEFAULT 'pending',  -- pending → approved/rejected

    -- The displayable content
    content                 TEXT,               -- AI-assembled testimonial quote (the text shown on widgets)
    rating                  SMALLINT,           -- Star rating 1-5 (denormalized for quick display)

    -- Customer info (copied from submission OR entered manually for imports)
    customer_name           TEXT NOT NULL,      -- Customer's full name (displayed on widgets)
    customer_email          TEXT NOT NULL,      -- Customer's email (for follow-up, NOT displayed)
    customer_title          TEXT,               -- Job title (e.g., "Product Manager")
    customer_company        TEXT,               -- Company name (e.g., "Acme Inc")
    customer_avatar_url     TEXT,               -- Profile photo URL
    customer_linkedin_url   TEXT,               -- LinkedIn profile for social proof
    customer_twitter_url    TEXT,               -- Twitter/X profile for social proof

    -- Source tracking
    source                  TEXT NOT NULL DEFAULT 'form',  -- How testimonial was created
    source_metadata         JSONB,              -- Import-specific data: tweet ID, LinkedIn URL, etc.

    -- Approval audit trail
    approved_by             TEXT,               -- FK: User who approved
    approved_at             TIMESTAMPTZ,        -- When approved
    rejected_by             TEXT,               -- FK: User who rejected
    rejected_at             TIMESTAMPTZ,        -- When rejected
    rejection_reason        TEXT,               -- Why rejected (internal note)

    -- Audit: who & when
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- When testimonial was created
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Last modification
    updated_by              TEXT,               -- FK: User who last modified

    -- Constraints
    CONSTRAINT testimonials_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT testimonials_submission_fk
        FOREIGN KEY (submission_id) REFERENCES form_submissions(id) ON DELETE SET NULL,
    CONSTRAINT testimonials_approved_by_fk
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT testimonials_rejected_by_fk
        FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT testimonials_updated_by_fk
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT testimonials_status_check
        CHECK (status IN ('pending', 'approved', 'rejected')),
    CONSTRAINT testimonials_rating_check
        CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
    CONSTRAINT testimonials_source_check
        CHECK (source IN ('form', 'import', 'manual')),
    CONSTRAINT testimonials_email_format
        CHECK (customer_email ~* '^.+@.+\..+$'),  -- Permissive safety net; app does real validation
    CONSTRAINT testimonials_linkedin_url_format
        CHECK (customer_linkedin_url IS NULL OR customer_linkedin_url ~* '^https?://(www\.)?linkedin\.com/'),
    CONSTRAINT testimonials_twitter_url_format
        CHECK (customer_twitter_url IS NULL OR customer_twitter_url ~* '^https?://(www\.)?(twitter\.com|x\.com)/')
);

-- Indexes
CREATE INDEX idx_testimonials_org ON testimonials(organization_id);
CREATE INDEX idx_testimonials_submission ON testimonials(submission_id) WHERE submission_id IS NOT NULL;
CREATE INDEX idx_testimonials_status ON testimonials(organization_id, status);
CREATE INDEX idx_testimonials_approved ON testimonials(organization_id, created_at DESC) WHERE status = 'approved';

SELECT add_updated_at_trigger('testimonials');

-- Table comment
COMMENT ON TABLE testimonials IS 'Displayable testimonial entity - quote, rating, customer info. Widgets display these.';

-- Column comments
COMMENT ON COLUMN testimonials.id IS 'Primary key - NanoID 12-char unique identifier';
COMMENT ON COLUMN testimonials.organization_id IS 'FK to organizations - tenant boundary for isolation';
COMMENT ON COLUMN testimonials.submission_id IS 'FK to form_submissions - NULL for imports/manual. Access form via submission.form_id';
COMMENT ON COLUMN testimonials.status IS 'Workflow: pending (new), approved (shown on widgets), rejected (hidden)';
COMMENT ON COLUMN testimonials.content IS 'The testimonial quote - AI-assembled from form responses or imported text';
COMMENT ON COLUMN testimonials.rating IS 'Star rating 1-5. Copied from form response or entered manually';
COMMENT ON COLUMN testimonials.customer_name IS 'Full name displayed on widgets. Copied from submission or entered for imports';
COMMENT ON COLUMN testimonials.customer_email IS 'Email for follow-up. NOT displayed on widgets';
COMMENT ON COLUMN testimonials.customer_title IS 'Job title displayed on widgets (e.g., "Product Manager")';
COMMENT ON COLUMN testimonials.customer_company IS 'Company name displayed on widgets (e.g., "Acme Inc")';
COMMENT ON COLUMN testimonials.customer_avatar_url IS 'Profile photo URL displayed on widgets';
COMMENT ON COLUMN testimonials.customer_linkedin_url IS 'LinkedIn profile URL - clickable social proof link';
COMMENT ON COLUMN testimonials.customer_twitter_url IS 'Twitter/X profile URL - clickable social proof link';
COMMENT ON COLUMN testimonials.source IS 'Origin: form (via submission), import (Twitter/LinkedIn), manual (typed by owner)';
COMMENT ON COLUMN testimonials.source_metadata IS 'Import metadata (tweet_id, original_url, etc.). JSONB appropriate here';
COMMENT ON COLUMN testimonials.approved_by IS 'FK to users - who approved. NULL if pending/rejected';
COMMENT ON COLUMN testimonials.approved_at IS 'When approved. NULL if pending/rejected';
COMMENT ON COLUMN testimonials.rejected_by IS 'FK to users - who rejected. NULL if pending/approved';
COMMENT ON COLUMN testimonials.rejected_at IS 'When rejected. NULL if pending/approved';
COMMENT ON COLUMN testimonials.rejection_reason IS 'Internal note. Not shown to customer';
COMMENT ON COLUMN testimonials.created_at IS 'When created. Immutable';
COMMENT ON COLUMN testimonials.updated_at IS 'Last modification. Auto-updated by trigger';
COMMENT ON COLUMN testimonials.updated_by IS 'FK to users - who last modified. NULL until first update';
```

### Status Workflow

```
┌─────────┐    approve    ┌──────────┐
│ pending │──────────────►│ approved │  ← Shown on widgets
└────┬────┘               └──────────┘
     │
     │ reject
     ▼
┌──────────┐
│ rejected │  ← Hidden, with reason
└──────────┘
```

### Source Types

| Source | Has Submission? | Description |
|--------|-----------------|-------------|
| `form` | Yes | Created from form_submissions, has form_question_responses |
| `import` | No | Imported from Twitter/LinkedIn, no submission |
| `manual` | No | Manually entered by owner, no submission |

### Data Flow by Source

```
SOURCE = 'form':
  form_submissions ──► testimonials (submission_id set)
         │
         └──► form_question_responses

SOURCE = 'import' or 'manual':
  testimonials (submission_id = NULL, customer_* entered directly)
```

---

## 3.8 Widgets Table

Embeddable widgets - testimonial selections in junction table.

```sql
CREATE TABLE public.widgets (
    -- Primary key
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),  -- NanoID 12-char unique identifier

    -- Ownership
    organization_id     TEXT NOT NULL,      -- FK: Tenant boundary for multi-tenancy
    created_by          TEXT NOT NULL,      -- FK: User who created this widget

    -- Widget identity
    name                TEXT NOT NULL,      -- Display name in dashboard (e.g., "Homepage Carousel")
    type                TEXT NOT NULL,      -- Widget layout type: wall_of_love, carousel, single_quote
    theme               TEXT NOT NULL DEFAULT 'light',  -- Color scheme: light or dark

    -- Display settings (explicit columns, not JSONB)
    show_ratings        BOOLEAN NOT NULL DEFAULT true,   -- Show star ratings on cards
    show_dates          BOOLEAN NOT NULL DEFAULT false,  -- Show submission dates
    show_company        BOOLEAN NOT NULL DEFAULT true,   -- Show customer company name
    show_avatar         BOOLEAN NOT NULL DEFAULT true,   -- Show customer avatar/photo
    max_display         SMALLINT,           -- Max testimonials to show. NULL = show all selected

    -- Type-specific settings (JSONB appropriate - truly varies by type)
    settings            JSONB NOT NULL DEFAULT '{}'::jsonb,  -- carousel_speed, columns, animation, etc.

    -- State & audit
    is_active           BOOLEAN NOT NULL DEFAULT true,   -- Soft delete: false = embed returns empty
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Immutable creation timestamp
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Auto-updated by trigger
    updated_by          TEXT,               -- FK: User who last modified (NULL until first update)

    -- Constraints
    CONSTRAINT widgets_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT widgets_created_by_fk
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT widgets_updated_by_fk
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT widgets_type_check
        CHECK (type IN ('wall_of_love', 'carousel', 'single_quote')),
    CONSTRAINT widgets_theme_check
        CHECK (theme IN ('light', 'dark'))
);

-- Indexes
CREATE INDEX idx_widgets_org ON widgets(organization_id);  -- Filter by org
CREATE INDEX idx_widgets_active ON widgets(organization_id) WHERE is_active = true;  -- Active widgets only

SELECT add_updated_at_trigger('widgets');

-- Table comment
COMMENT ON TABLE widgets IS 'Embeddable widgets - testimonial selections in junction table';

-- Column comments
COMMENT ON COLUMN widgets.id IS 'Primary key - NanoID 12-char unique identifier. Used in embed code';
COMMENT ON COLUMN widgets.organization_id IS 'FK to organizations - tenant boundary for isolation';
COMMENT ON COLUMN widgets.created_by IS 'FK to users - user who created this widget';
COMMENT ON COLUMN widgets.name IS 'Display name in dashboard (e.g., "Homepage Carousel", "Footer Wall")';
COMMENT ON COLUMN widgets.type IS 'Layout type: wall_of_love (grid), carousel (slider), single_quote (featured)';
COMMENT ON COLUMN widgets.theme IS 'Color scheme: light (white bg) or dark (dark bg)';
COMMENT ON COLUMN widgets.show_ratings IS 'Whether to display star ratings on testimonial cards';
COMMENT ON COLUMN widgets.show_dates IS 'Whether to display submission dates. Usually false for evergreen feel';
COMMENT ON COLUMN widgets.show_company IS 'Whether to display customer company name below name';
COMMENT ON COLUMN widgets.show_avatar IS 'Whether to display customer avatar/photo';
COMMENT ON COLUMN widgets.max_display IS 'Maximum testimonials to display. NULL = show all selected';
COMMENT ON COLUMN widgets.settings IS 'Type-specific UI settings - JSONB appropriate. E.g., carousel_speed, columns';
COMMENT ON COLUMN widgets.is_active IS 'Soft delete flag. False = embed script returns empty widget';
COMMENT ON COLUMN widgets.created_at IS 'Timestamp when widget was created. Immutable';
COMMENT ON COLUMN widgets.updated_at IS 'Last modification timestamp. Auto-updated by trigger';
COMMENT ON COLUMN widgets.updated_by IS 'FK to users - who last modified. NULL until first update';
```

### Widget Types

| Type | Description |
|------|-------------|
| `wall_of_love` | Grid/masonry layout of testimonials |
| `carousel` | Sliding carousel |
| `single_quote` | Single featured testimonial |

---

## 3.9 Widget Testimonials Junction Table

Proper many-to-many with ordering.

```sql
CREATE TABLE public.widget_testimonials (
    -- Primary key
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),  -- NanoID 12-char unique identifier

    -- Ownership & relationships (many-to-many junction)
    organization_id     TEXT NOT NULL,          -- FK: Tenant boundary for Hasura permissions
    widget_id           TEXT NOT NULL,          -- FK: Widget containing this testimonial
    testimonial_id      TEXT NOT NULL,          -- FK: Testimonial displayed in widget

    -- Display settings
    display_order       SMALLINT NOT NULL,      -- Order in widget (unique per widget)
    is_featured         BOOLEAN NOT NULL DEFAULT false,  -- Highlighted/pinned in UI

    -- Audit trail
    added_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- When added to widget
    added_by            TEXT,                   -- FK: User who added (NULL if auto-added)

    -- Constraints
    CONSTRAINT widget_testimonials_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT widget_testimonials_widget_fk
        FOREIGN KEY (widget_id) REFERENCES widgets(id) ON DELETE CASCADE,
    CONSTRAINT widget_testimonials_testimonial_fk
        FOREIGN KEY (testimonial_id) REFERENCES testimonials(id) ON DELETE CASCADE,
    CONSTRAINT widget_testimonials_added_by_fk
        FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT widget_testimonials_unique
        UNIQUE (widget_id, testimonial_id),       -- Each testimonial once per widget
    CONSTRAINT widget_testimonials_order_unique
        UNIQUE (widget_id, display_order)         -- Each position once per widget
);

-- Indexes
CREATE INDEX idx_widget_testimonials_org ON widget_testimonials(organization_id);            -- Tenant isolation filter
CREATE INDEX idx_widget_testimonials_widget ON widget_testimonials(widget_id);  -- Get testimonials for widget
CREATE INDEX idx_widget_testimonials_testimonial ON widget_testimonials(testimonial_id);  -- Find widgets containing testimonial
CREATE INDEX idx_widget_testimonials_order ON widget_testimonials(widget_id, display_order);  -- Ordered fetch

-- Table comment
COMMENT ON TABLE widget_testimonials IS 'Widget-Testimonial many-to-many junction with ordering and featured flag';

-- Column comments
COMMENT ON COLUMN widget_testimonials.id IS 'Primary key - NanoID 12-char unique identifier';
COMMENT ON COLUMN widget_testimonials.organization_id IS 'FK to organizations - tenant boundary for Hasura row-level permissions';
COMMENT ON COLUMN widget_testimonials.widget_id IS 'FK to widgets - which widget contains this testimonial';
COMMENT ON COLUMN widget_testimonials.testimonial_id IS 'FK to testimonials - which testimonial is displayed';
COMMENT ON COLUMN widget_testimonials.display_order IS 'Order in widget display. Unique per widget, starts at 1';
COMMENT ON COLUMN widget_testimonials.is_featured IS 'Highlighted/pinned testimonial. Shows differently in UI (e.g., larger card)';
COMMENT ON COLUMN widget_testimonials.added_at IS 'When testimonial was added to widget';
COMMENT ON COLUMN widget_testimonials.added_by IS 'FK to users - who added this. NULL if auto-added on approval';
```
