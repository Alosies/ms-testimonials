# Question Types - Schema Reference

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Table Structure

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `id` | TEXT | NOT NULL | `generate_nanoid_12()` | Primary key using NanoID format |
| `unique_name` | VARCHAR(50) | NOT NULL | - | Code identifier for type lookups (text_short, rating_star) |
| `name` | VARCHAR(100) | NOT NULL | - | Display label for UI (Short Text, Star Rating) |
| `category` | VARCHAR(30) | NOT NULL | - | Type grouping: text, rating, choice, media, special |
| `description` | TEXT | NULL | - | Brief explanation shown in form builder tooltip |
| `input_component` | VARCHAR(50) | NOT NULL | - | Vue component name for rendering |
| `answer_data_type` | VARCHAR(20) | NOT NULL | - | Data type: text, integer, boolean, decimal, json, url |
| `supports_min_length` | BOOLEAN | NOT NULL | `false` | Whether min_length validation is applicable |
| `supports_max_length` | BOOLEAN | NOT NULL | `false` | Whether max_length validation is applicable |
| `supports_min_value` | BOOLEAN | NOT NULL | `false` | Whether min_value validation is applicable |
| `supports_max_value` | BOOLEAN | NOT NULL | `false` | Whether max_value validation is applicable |
| `supports_pattern` | BOOLEAN | NOT NULL | `false` | Whether regex validation is applicable |
| `supports_options` | BOOLEAN | NOT NULL | `false` | Whether predefined choices are applicable |
| `supports_file_types` | BOOLEAN | NOT NULL | `false` | Whether file type restrictions are applicable |
| `supports_max_file_size` | BOOLEAN | NOT NULL | `false` | Whether file size limit is applicable |
| `default_min_value` | INTEGER | NULL | - | Default minimum value when creating question |
| `default_max_value` | INTEGER | NULL | - | Default maximum value when creating question |
| `is_active` | BOOLEAN | NOT NULL | `true` | Whether type is available for new questions |
| `display_order` | SMALLINT | NOT NULL | - | Order in form builder type picker |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Timestamp when type was seeded |

## Primary Key
- `question_types_pkey` - PRIMARY KEY (`id`)

## Unique Constraints
- `question_types_unique_name_unique` - UNIQUE (`unique_name`)

## Check Constraints
- `question_types_category_check` - category IN ('text', 'rating', 'choice', 'media', 'special')
- `question_types_answer_type_check` - answer_data_type IN ('text', 'integer', 'boolean', 'decimal', 'json', 'url')

## Indexes
- `idx_question_types_category` - BTREE (`category`)

## Seed Data Categories

| Category | Types |
|----------|-------|
| text | text_short, text_long, text_email, text_url |
| rating | rating_star, rating_nps, rating_scale |
| choice | choice_single, choice_multiple, choice_dropdown |
| media | media_image, media_video |
| special | special_consent, special_hidden |
