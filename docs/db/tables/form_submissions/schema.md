# Form Submissions - Schema Reference

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Table Structure

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `id` | TEXT | NOT NULL | `generate_nanoid_12()` | Primary key using NanoID format |
| `organization_id` | TEXT | NOT NULL | - | FK to organizations - tenant boundary |
| `form_id` | TEXT | NOT NULL | - | FK to forms - which form was submitted |
| `submitter_name` | TEXT | NOT NULL | - | Full name of person who submitted |
| `submitter_email` | TEXT | NOT NULL | - | Email for follow-up (NOT displayed publicly) |
| `submitter_title` | TEXT | NULL | - | Job title like "Product Manager" |
| `submitter_company` | TEXT | NULL | - | Company name like "Acme Inc" |
| `submitter_avatar_url` | TEXT | NULL | - | Profile photo URL |
| `submitter_linkedin_url` | TEXT | NULL | - | LinkedIn profile URL |
| `submitter_twitter_url` | TEXT | NULL | - | Twitter/X profile URL |
| `submitted_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | When customer submitted the form |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Last modification timestamp |
| `updated_by` | TEXT | NULL | - | FK to users - who made admin edits |

## Primary Key
- `form_submissions_pkey` - PRIMARY KEY (`id`)

## Foreign Key Constraints
- `form_submissions_org_fk` - FOREIGN KEY (`organization_id`) REFERENCES `organizations(id)` ON DELETE CASCADE
- `form_submissions_form_fk` - FOREIGN KEY (`form_id`) REFERENCES `forms(id)` ON DELETE CASCADE
- `form_submissions_updated_by_fk` - FOREIGN KEY (`updated_by`) REFERENCES `users(id)` ON DELETE SET NULL

## Check Constraints
- `form_submissions_email_format` - submitter_email ~* '^.+@.+\..+$'
- `form_submissions_linkedin_url_format` - submitter_linkedin_url IS NULL OR submitter_linkedin_url ~* '^https?://(www\.)?linkedin\.com/'
- `form_submissions_twitter_url_format` - submitter_twitter_url IS NULL OR submitter_twitter_url ~* '^https?://(www\.)?(twitter\.com|x\.com)/'

## Indexes
- `idx_form_submissions_org` - BTREE (`organization_id`)
- `idx_form_submissions_form` - BTREE (`form_id`)
- `idx_form_submissions_submitted` - BTREE (`organization_id`, `submitted_at` DESC)

## Triggers
- `set_updated_at` - Automatically updates `updated_at` timestamp
