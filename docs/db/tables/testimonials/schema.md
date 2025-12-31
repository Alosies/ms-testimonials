# Testimonials - Schema Reference

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Table Structure

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `id` | TEXT | NOT NULL | `generate_nanoid_12()` | Primary key using NanoID format |
| `organization_id` | TEXT | NOT NULL | - | FK to organizations - tenant boundary |
| `submission_id` | TEXT | NULL | - | FK to form_submissions - NULL for imports/manual |
| `status` | TEXT | NOT NULL | `'pending'` | Workflow: pending, approved, rejected |
| `content` | TEXT | NULL | - | The testimonial quote - AI-assembled or imported |
| `rating` | SMALLINT | NULL | - | Star rating 1-5 |
| `customer_name` | TEXT | NOT NULL | - | Full name displayed on widgets |
| `customer_email` | TEXT | NOT NULL | - | Email for follow-up (NOT displayed) |
| `customer_title` | TEXT | NULL | - | Job title displayed on widgets |
| `customer_company` | TEXT | NULL | - | Company name displayed on widgets |
| `customer_avatar_url` | TEXT | NULL | - | Profile photo URL for widgets |
| `customer_linkedin_url` | TEXT | NULL | - | LinkedIn profile URL - clickable |
| `customer_twitter_url` | TEXT | NULL | - | Twitter/X profile URL - clickable |
| `source` | TEXT | NOT NULL | `'form'` | Origin: form, import, manual |
| `source_metadata` | JSONB | NULL | - | Import metadata (tweet_id, original_url) |
| `approved_by` | TEXT | NULL | - | FK to users - who approved |
| `approved_at` | TIMESTAMPTZ | NULL | - | When approved |
| `rejected_by` | TEXT | NULL | - | FK to users - who rejected |
| `rejected_at` | TIMESTAMPTZ | NULL | - | When rejected |
| `rejection_reason` | TEXT | NULL | - | Internal note for rejection |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | When created |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Last modification timestamp |
| `updated_by` | TEXT | NULL | - | FK to users - who last modified |

## Primary Key
- `testimonials_pkey` - PRIMARY KEY (`id`)

## Foreign Key Constraints
- `testimonials_org_fk` - FOREIGN KEY (`organization_id`) REFERENCES `organizations(id)` ON DELETE CASCADE
- `testimonials_submission_fk` - FOREIGN KEY (`submission_id`) REFERENCES `form_submissions(id)` ON DELETE SET NULL
- `testimonials_approved_by_fk` - FOREIGN KEY (`approved_by`) REFERENCES `users(id)` ON DELETE SET NULL
- `testimonials_rejected_by_fk` - FOREIGN KEY (`rejected_by`) REFERENCES `users(id)` ON DELETE SET NULL
- `testimonials_updated_by_fk` - FOREIGN KEY (`updated_by`) REFERENCES `users(id)` ON DELETE SET NULL

## Check Constraints
- `testimonials_status_check` - status IN ('pending', 'approved', 'rejected')
- `testimonials_rating_check` - rating IS NULL OR (rating >= 1 AND rating <= 5)
- `testimonials_source_check` - source IN ('form', 'import', 'manual')
- `testimonials_email_format` - customer_email ~* '^.+@.+\..+$'
- `testimonials_linkedin_url_format` - customer_linkedin_url IS NULL OR valid LinkedIn URL
- `testimonials_twitter_url_format` - customer_twitter_url IS NULL OR valid Twitter/X URL

## Indexes
- `idx_testimonials_org` - BTREE (`organization_id`)
- `idx_testimonials_submission` - BTREE (`submission_id`) WHERE submission_id IS NOT NULL
- `idx_testimonials_status` - BTREE (`organization_id`, `status`)
- `idx_testimonials_approved` - BTREE (`organization_id`, `created_at` DESC) WHERE status = 'approved'

## Triggers
- `set_updated_at` - Automatically updates `updated_at` timestamp
