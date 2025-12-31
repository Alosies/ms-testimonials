# Form Question Responses - Schema Reference

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Table Structure

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `id` | TEXT | NOT NULL | `generate_nanoid_12()` | Primary key using NanoID format |
| `organization_id` | TEXT | NOT NULL | - | FK to organizations - tenant boundary |
| `submission_id` | TEXT | NOT NULL | - | FK to form_submissions - parent submission |
| `question_id` | TEXT | NOT NULL | - | FK to form_questions - which question answered |
| `answer_text` | TEXT | NULL | - | Text responses: short/long text, email, choices |
| `answer_integer` | INTEGER | NULL | - | Numeric responses: star rating, NPS score |
| `answer_boolean` | BOOLEAN | NULL | - | Boolean responses: consent checkbox |
| `answer_json` | JSONB | NULL | - | JSON responses: multiple choice arrays |
| `answer_url` | TEXT | NULL | - | URL responses: uploaded file URL, validated URL |
| `answered_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | When customer submitted this response |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Last modification timestamp |
| `updated_by` | TEXT | NULL | - | FK to users - who last modified |

## Primary Key
- `form_question_responses_pkey` - PRIMARY KEY (`id`)

## Foreign Key Constraints
- `form_question_responses_org_fk` - FOREIGN KEY (`organization_id`) REFERENCES `organizations(id)` ON DELETE CASCADE
- `form_question_responses_submission_fk` - FOREIGN KEY (`submission_id`) REFERENCES `form_submissions(id)` ON DELETE CASCADE
- `form_question_responses_question_fk` - FOREIGN KEY (`question_id`) REFERENCES `form_questions(id)` ON DELETE CASCADE
- `form_question_responses_updated_by_fk` - FOREIGN KEY (`updated_by`) REFERENCES `users(id)` ON DELETE SET NULL

## Unique Constraints
- `form_question_responses_unique` - UNIQUE (`submission_id`, `question_id`)

## Check Constraints
- `form_question_responses_has_value` - At least one answer column must be NOT NULL

## Indexes
- `idx_form_question_responses_org` - BTREE (`organization_id`)
- `idx_form_question_responses_submission` - BTREE (`submission_id`)
- `idx_form_question_responses_question` - BTREE (`question_id`)
- `idx_form_question_responses_rating` - BTREE (`question_id`, `answer_integer`) WHERE answer_integer IS NOT NULL

## Triggers
- `set_updated_at` - Automatically updates `updated_at` timestamp

## Answer Column Usage by Question Type

| Question Type | Answer Column |
|---------------|---------------|
| text_short, text_long, text_email | `answer_text` |
| text_url | `answer_url` |
| rating_star, rating_nps, rating_scale | `answer_integer` |
| choice_single, choice_dropdown | `answer_text` |
| choice_multiple | `answer_json` |
| special_consent | `answer_boolean` |
| media_image, media_video | `answer_url` |
