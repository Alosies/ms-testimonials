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

### Core Tables

#### users
- `id` - NanoID primary key
- `email` - User email (from Supabase)
- `name` - Display name
- `company` - Company name (optional)
- `plan` - Subscription plan (free | pro | team)
- `supabase_id` - Supabase auth user ID
- `created_at`, `updated_at` - Timestamps

#### forms
- `id` - NanoID primary key
- `user_id` - FK to users
- `name` - Form name
- `slug` - URL slug (unique)
- `product_name` - Product being reviewed
- `questions` - JSONB array of smart prompt questions
- `settings` - JSONB form settings
- `created_at`, `updated_at` - Timestamps

#### testimonials
- `id` - NanoID primary key
- `form_id` - FK to forms
- `status` - pending | approved | rejected
- `rating` - 1-5 star rating (optional)
- `content` - AI-assembled testimonial text
- `answers` - JSONB raw prompt answers
- `customer_name` - Customer name
- `customer_title` - Customer title (optional)
- `customer_company` - Customer company (optional)
- `customer_email` - Customer email
- `created_at`, `updated_at` - Timestamps

#### widgets
- `id` - NanoID primary key
- `user_id` - FK to users
- `name` - Widget name
- `type` - wall_of_love | carousel | single_quote
- `theme` - light | dark
- `testimonials` - JSONB array of selected testimonial IDs
- `settings` - JSONB widget settings
- `created_at`, `updated_at` - Timestamps

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

## NanoID Function

All tables use NanoID for primary keys. Create this function first:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
