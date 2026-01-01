# Question Types - Schema Reference

**Last Updated**: 2026-01-01-0803 (GMT+5:30)

## Table Structure

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `id` | TEXT | NOT NULL | `generate_nanoid_12()` | Primary key using NanoID format |
| `unique_name` | VARCHAR(50) | NOT NULL | - | Code identifier for type lookups (text_short, rating_star) |
| `name` | VARCHAR(100) | NOT NULL | - | Display label for UI (Short answer, Star rating) |
| `category` | VARCHAR(30) | NOT NULL | - | Type grouping: text, rating, choice, media, input, special |
| `description` | TEXT | NULL | - | Brief explanation shown in form builder tooltip |
| `input_component` | VARCHAR(50) | NOT NULL | - | Vue component name for rendering |
| `answer_data_type` | VARCHAR(20) | NOT NULL | - | Data type: text, integer, boolean, decimal, json, url |
| `icon` | VARCHAR(50) | NULL | - | Heroicons icon name for form builder UI |
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
- `question_types_category_check` - category IN ('text', 'rating', 'choice', 'media', 'special', 'input')
- `question_types_answer_type_check` - answer_data_type IN ('text', 'integer', 'boolean', 'decimal', 'json', 'url')

## Indexes
- `idx_question_types_category` - BTREE (`category`)

## Seed Data (16 Types)

| unique_name | name | icon | category | answer_data_type |
|-------------|------|------|----------|------------------|
| text_short | Short answer | minus | text | text |
| text_long | Paragraph | bars-3-bottom-left | text | text |
| text_email | Email | envelope | text | text |
| text_url | URL | link | text | url |
| choice_single | Multiple choice | stop-circle | choice | text |
| choice_multiple | Checkboxes | check-circle | choice | json |
| choice_dropdown | Dropdown | chevron-up-down | choice | text |
| rating_star | Star rating | star | rating | integer |
| rating_scale | Linear scale | ellipsis-horizontal | rating | integer |
| media_file | File upload | cloud-arrow-up | media | url |
| media_video | Video | video-camera | media | url |
| input_date | Date | calendar | input | text |
| input_time | Time | clock | input | text |
| input_switch | Switch | arrow-path-rounded-square | input | boolean |
| input_checkbox | Checkbox | check-square | input | boolean |
| special_hidden | Hidden field | eye-slash | special | text |
