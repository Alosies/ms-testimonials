# CLAUDE.md - Database Management Instructions

This file provides guidance to Claude Code when working with database operations in this project.

## Important Database Management Rules

### Version Control
- **NEVER** execute SQL directly against the database using psql or other direct connections
- **ALL** database changes must be version controlled through Hasura migrations
- **ALWAYS** use Hasura CLI commands for database operations

### Hasura Console
- The Hasura console must be running before executing migration commands
- Start the console with: `hasura console` (from db/hasura directory)
- The console runs on `http://localhost:9695` by default

### Migration Commands
When working with migrations, ensure:
1. Navigate to the correct directory: `cd db/hasura`
2. Hasura console is running
3. Use proper migration commands:
   - Apply migrations: `hasura migrate apply --database-name default`
   - Roll back migrations: `hasura migrate apply --type down --version <version_number> --database-name default`
   - Check status: `hasura migrate status --database-name default`

### Common Issues
- If migration commands fail, check that:
  - Hasura console is running
  - You're in the correct directory (`db/hasura`)
  - The database connection is active
  - The `.env` file has correct credentials

## Database Schema (MVP)

### Architecture Overview

The schema is organized in layers to manage dependencies:
- **Layer 1: Authentication** - No foreign keys (users, user_identities, roles)
- **Layer 2: Multi-Tenancy** - Depends on Layer 1 (plans, organizations, organization_roles)
- **Layer 3: Business Entities** - Depends on Layer 2 (forms, testimonials, widgets, etc.)

### Layer 1: Authentication

#### users (Provider-agnostic)
- `id` - NanoID 12-char primary key
- `email` - Canonical email (unique)
- `email_verified` - Email verification status
- `display_name` - User's display name
- `avatar_url` - Profile picture URL
- `locale` - User's preferred language (default: 'en')
- `timezone` - User's timezone (default: 'UTC')
- `is_active` - Soft delete flag
- `last_login_at` - Last login timestamp
- `created_at`, `updated_at` - Timestamps

#### user_identities (Federated Auth)
- `id` - NanoID 16-char (security-critical)
- `user_id` - FK to users
- `provider` - Auth provider (supabase, google, github, microsoft, email)
- `provider_user_id` - Provider's user ID
- `provider_email` - Email from provider
- `provider_metadata` - JSONB (appropriate: truly dynamic)
- `is_primary` - Primary identity flag
- `verified_at` - When provider verified identity
- `created_at`, `updated_at` - Timestamps

#### roles (Permission Definitions)
- `id` - Semantic IDs for system roles (role_owner, role_admin, etc.)
- `name` - Role name (unique)
- `description` - Human-readable description
- `can_manage_forms` - Permission to create/edit/delete forms
- `can_manage_testimonials` - Permission to approve/reject/edit testimonials
- `can_manage_widgets` - Permission to create/edit/delete widgets
- `can_manage_members` - Permission to invite/remove/change roles
- `can_manage_billing` - Permission to view/manage billing
- `can_delete_org` - Permission to delete organization
- `is_viewer` - Read-only access flag
- `is_system_role` - System roles cannot be deleted
- `created_at`, `updated_at` - Timestamps

### Layer 2: Multi-Tenancy

#### plans
- `id` - Semantic IDs (plan_free, plan_pro, plan_team)
- `name` - Plan name (unique)
- `max_forms`, `max_testimonials_per_form`, `max_widgets` - Limits
- `max_members` - Team members limit
- `has_custom_branding`, `has_api_access`, `has_priority_support` - Features
- `price_monthly_cents`, `price_yearly_cents` - Pricing

#### organizations (Tenant Boundary)
- `id` - NanoID primary key
- `owner_id` - FK to users (creator)
- `plan_id` - FK to plans
- `name` - Organization name
- `slug` - URL slug (unique)
- `is_default` - Default org for user (partial unique index)
- `billing_email`, `billing_name` - Billing info
- `current_period_ends_at` - Subscription period
- `is_active` - Soft delete flag
- `created_at`, `updated_at` - Timestamps

#### organization_roles (User-Org-Role Junction)
- `id` - NanoID primary key
- `organization_id` - FK to organizations
- `user_id` - FK to users
- `role_id` - FK to roles
- `invited_by` - FK to users (who invited)
- `invited_at`, `accepted_at` - Invitation workflow
- Unique constraint: (organization_id, user_id)

### Layer 3: Business Entities

#### forms
- `id` - NanoID primary key
- `organization_id` - FK to organizations (tenant boundary)
- `created_by` - FK to users
- `name` - Form name
- `slug` - URL slug (unique per org)
- `product_name` - Product being reviewed
- `is_active` - Active/archived flag
- `created_at`, `updated_at` - Timestamps

#### form_questions (Normalized - NOT JSONB)
- `id` - NanoID primary key
- `form_id` - FK to forms
- `question_order` - Display order
- `question_type` - problem | solution | result | attribution | custom
- `question_text` - The actual question
- `placeholder_text` - Input placeholder
- `is_required` - Required flag
- `created_at`, `updated_at` - Timestamps

#### testimonials
- `id` - NanoID primary key
- `form_id` - FK to forms
- `status` - pending | approved | rejected
- `rating` - 1-5 star rating (optional)
- `content` - AI-assembled testimonial text
- `content_edited` - User-edited version
- `customer_name`, `customer_email`, `customer_title`, `customer_company`
- `customer_avatar_url`, `customer_social_url`
- `approved_by`, `approved_at` - Approval workflow
- `created_at`, `updated_at` - Timestamps

#### testimonial_answers (Normalized - NOT JSONB)
- `id` - NanoID primary key
- `testimonial_id` - FK to testimonials
- `question_id` - FK to form_questions
- `answer_text` - Customer's answer
- `created_at`, `updated_at` - Timestamps
- Unique constraint: (testimonial_id, question_id)

#### widgets
- `id` - NanoID primary key
- `organization_id` - FK to organizations
- `created_by` - FK to users
- `name` - Widget name
- `type` - wall_of_love | carousel | single_quote
- `theme` - light | dark
- `is_active` - Active flag
- `created_at`, `updated_at` - Timestamps

#### widget_testimonials (Junction - NOT JSONB)
- `widget_id` - FK to widgets
- `testimonial_id` - FK to testimonials
- `display_order` - Order in widget
- Primary key: (widget_id, testimonial_id)

## Migration Naming Convention

Format: `{timestamp}_{YYYY_MM_DD_HHMM}__{table_name}__{action}`

Examples:
- `1735462800000_2025_12_29_1300__nanoid__utility-function`
- `1735462860000_2025_12_29_1301__updated_at__utility-function`
- `1735462920000_2025_12_29_1302__users__create_table`
- `1735462980000_2025_12_29_1303__forms__create_table`
- `1735463040000_2025_12_29_1304__testimonials__create_table`
- `1735463100000_2025_12_29_1305__widgets__create_table`

**Action Keywords:**
- `utility-function` - Database utility functions (nanoid, triggers)
- `create_table` - New tables
- `alter_table` - Modify structure
- `add_column` - Add fields
- `add_index` - Performance indexes
- `add_constraint` - Data constraints
- `add_foreign_key` - Relationships

## NanoID Functions

All tables use NanoID for primary keys. Two variants are available:

| Function | Length | Use Case |
|----------|--------|----------|
| `generate_nanoid_12()` | 12 chars | Standard entities (users, forms, testimonials) |
| `generate_nanoid_16()` | 16 chars | Security-critical (user_identities, API keys, tokens) |

```sql
-- 12-character NanoID for standard entities
CREATE OR REPLACE FUNCTION generate_nanoid_12()
RETURNS text AS $$
DECLARE
  alphabet text := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(alphabet, floor(random() * length(alphabet) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 16-character NanoID for security-critical entities
CREATE OR REPLACE FUNCTION generate_nanoid_16()
RETURNS text AS $$
DECLARE
  alphabet text := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..16 LOOP
    result := result || substr(alphabet, floor(random() * length(alphabet) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;
```

## Timestamp Trigger Function

```sql
CREATE OR REPLACE FUNCTION set_current_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Hasura Permissions (Roles)

### user role
- Can read/write their own forms, testimonials, widgets
- Filter by `user_id` = `X-Hasura-User-Id`

### anonymous role
- Can read public forms by slug
- Can create testimonials (submit)
- Can read widget data for embed

## Docker Commands

```bash
# Start database and Hasura
cd db && docker-compose up -d

# Stop
cd db && docker-compose down

# View logs
docker-compose logs -f hasura

# Reset database (destructive!)
docker-compose down -v && docker-compose up -d
```

## GraphQL Testing

After applying migrations, test queries in Hasura console:

```graphql
# Get all forms for a user
query GetForms {
  forms(where: { user_id: { _eq: "user-id" } }) {
    id
    name
    slug
    product_name
  }
}

# Get testimonials for a form
query GetTestimonials($formId: String!) {
  testimonials(where: { form_id: { _eq: $formId } }) {
    id
    status
    content
    customer_name
    rating
  }
}
```
