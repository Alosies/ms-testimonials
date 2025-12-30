# Testimonials URL Strategy: Hybrid Approach

## Doc Connections
**ID**: `prd-url-system-notion-inspired`

**Parent Documents**:
- `docs/mvp.md` - Main MVP requirements document

**Related Documents**:
- `docs/db/research/erd.md` - Entity relationship diagram
- `docs/db/research/layer-3-business.md` - Business entities schema

---

## Overview

Testimonials uses a hybrid URL strategy that combines Notion's ID-based uniqueness with Linear's entity type clarity. This creates URLs that are human-readable, performance-optimized, and never break when content is renamed.

## URL Pattern

### Dashboard URLs (Authenticated)

```
/{org_slug}/{entity_type}/{entity_slug}_{entity_id}
```

### Public URLs (Unauthenticated)

```
/f/{form_slug}                    # Form collection page
/w/{widget_id}                    # Widget embed/preview
```

## Entity Types

### Business Entities (Dashboard)
- `forms` - Testimonial collection forms
- `testimonials` - Customer testimonials
- `widgets` - Embeddable display widgets
- `settings` - Organization settings

### URL Entity Naming Convention: Plural Forms

Testimonials uses **plural entity names** in URLs, following REST API conventions.

#### Benefits of Plural URLs
1. **Consistency**: Same pattern for collections and individual items
2. **REST Alignment**: Matches API endpoint conventions developers expect
3. **Direct Database Mapping**: Entity types match exact database table names (`forms`, `testimonials`, `widgets`)

#### Implementation
```
✅ /acme-corp/forms/product-feedback_f7x8y9z0a1b2      (matches forms table)
✅ /acme-corp/testimonials/john-doe_t1a2b3c4d5e6       (matches testimonials table)
✅ /acme-corp/widgets/homepage-wall_w5d6e7f8g9h0       (matches widgets table)
```

---

## URL Examples

### Dashboard URLs

```typescript
// Organization dashboard
/acme-corp                                              // Redirects to /acme-corp/dashboard

// Dashboard views
/acme-corp/dashboard                                    // Overview/home
/acme-corp/testimonials                                 // Testimonials list
/acme-corp/forms                                        // Forms list
/acme-corp/widgets                                      // Widgets list

// Entity detail views with slug_id pattern
/acme-corp/forms/product-feedback_f7x8y9z0a1b2         // Form detail/builder
/acme-corp/testimonials/john-doe_t1a2b3c4d5e6          // Testimonial detail
/acme-corp/widgets/homepage-wall_w5d6e7f8g9h0          // Widget editor

// Settings
/acme-corp/settings                                     // Organization settings
/acme-corp/settings/team                                // Team management
/acme-corp/settings/billing                             // Billing & plans
/acme-corp/settings/branding                            // Brand customization
```

### Public URLs

```typescript
// Form collection (customer-facing)
/f/product-feedback                                     // Short form URL

// Widget embed preview
/w/w5d6e7f8g9h0                                        // Widget preview page

// Embed endpoints (API-like, for script loading)
/embed/w/w5d6e7f8g9h0                                  // Widget embed script
```

### Authentication URLs

```typescript
/login                                                  // Sign in page
/signup                                                 // Sign up page
/forgot-password                                        // Password reset
/reset-password                                         // Password reset completion
/verify-email                                           // Email verification
```

---

## Database Schema Integration

### Core Principles

1. **Organization-Scoped**: Every business entity has `organization_id` foreign key
2. **Slug Uniqueness**: Slugs are unique within organization scope
3. **NanoID for IDs**: 12-character alphanumeric IDs (no UUID hyphens)
4. **Single Query Resolution**: Direct lookup without URL parsing ambiguity

### Existing Fields

From the current database schema:

```sql
-- Organizations table
slug VARCHAR(100) UNIQUE NOT NULL  -- URL-friendly org identifier

-- Forms table
slug TEXT NOT NULL,                -- URL identifier (/f/{slug})
CONSTRAINT forms_slug_per_org_unique UNIQUE (organization_id, slug)

-- Testimonials & Widgets
id TEXT PRIMARY KEY DEFAULT generate_nanoid_12()  -- 12-char alphanumeric ID
```

### Adding URL Slugs

For dashboard entity URLs with the `{slug}_{id}` pattern, add computed `url_slug` fields:

```sql
-- For testimonials: derive slug from customer name
ALTER TABLE testimonials ADD COLUMN slug VARCHAR(100);
ALTER TABLE testimonials ADD COLUMN url_slug VARCHAR(120)
    GENERATED ALWAYS AS (COALESCE(slug, '') || '_' || id) STORED;

-- For widgets: derive slug from widget name
ALTER TABLE widgets ADD COLUMN slug VARCHAR(100);
ALTER TABLE widgets ADD COLUMN url_slug VARCHAR(120)
    GENERATED ALWAYS AS (COALESCE(slug, '') || '_' || id) STORED;

-- For forms: add computed url_slug (slug already exists)
ALTER TABLE forms ADD COLUMN url_slug VARCHAR(120)
    GENERATED ALWAYS AS (slug || '_' || id) STORED;
```

### Field Definitions

- **`id`** - 12-character alphanumeric identifier (e.g., "f7x8y9z0a1b2")
- **`slug`** - Human-readable identifier derived from name (e.g., "product-feedback")
- **`url_slug`** - Computed field combining slug + ID (e.g., "product-feedback_f7x8y9z0a1b2")

---

## URL Resolution Strategy

### Dashboard Entity Resolution

Resolve any entity by parsing the URL slug:

```typescript
function parseUrlSlug(urlSlug: string): { slug: string; id: string } {
  const lastUnderscoreIndex = urlSlug.lastIndexOf('_');

  return {
    slug: urlSlug.substring(0, lastUnderscoreIndex),
    id: urlSlug.substring(lastUnderscoreIndex + 1)
  };
}

// Examples:
// "product-feedback_f7x8y9z0a1b2" -> { slug: "product-feedback", id: "f7x8y9z0a1b2" }
// "john-doe_t1a2b3c4d5e6" -> { slug: "john-doe", id: "t1a2b3c4d5e6" }
```

### GraphQL Query Example

```graphql
# Resolve form by ID (primary resolution)
query GetForm($id: String!) {
  forms_by_pk(id: $id) {
    id
    name
    slug
    url_slug
    product_name
    is_active
    form_questions(order_by: { display_order: asc }) {
      id
      question_text
      question_type {
        unique_name
        input_component
      }
    }
  }
}
```

### Performance Characteristics

- **Resolution Time**: ~5ms (single query by ID)
- **Scalability**: O(1) regardless of data volume
- **Cache Friendly**: Predictable URL patterns work well with CDNs
- **No Cascading Updates**: Slugs can change without breaking URLs due to ID inclusion

---

## Public URL Strategy

### Short Form URLs

Forms use simple slug-based URLs for customer-facing links:

```
/f/{form_slug}
```

**Resolution**: Query by `slug` within the form's organization context.

```graphql
query GetPublicForm($slug: String!) {
  forms(where: { slug: { _eq: $slug }, is_active: { _eq: true } }) {
    id
    name
    product_name
    form_questions(where: { is_active: { _eq: true } }, order_by: { display_order: asc }) {
      id
      question_text
      placeholder
      is_required
      question_type {
        unique_name
        input_component
      }
    }
  }
}
```

**Why simple slugs for forms**:
- Customer-facing URLs should be short and memorable
- Shared via email, social media, QR codes
- Slug uniqueness enforced at organization level

### Widget Embed URLs

Widgets use ID-only URLs for embeds:

```
/w/{widget_id}                    # Preview page
/embed/w/{widget_id}              # Embed script endpoint
```

**Why ID-only for widgets**:
- Not human-shared (embedded via code)
- Maximum brevity for embed scripts
- No SEO benefit needed

---

## Slug Generation Rules

### Slug Creation

```typescript
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')         // Spaces to hyphens
    .replace(/-+/g, '-')          // Multiple hyphens to single
    .trim()
    .substring(0, 50);            // Max length
}

// Examples:
// "Product Feedback Form" -> "product-feedback-form"
// "John Doe - CEO" -> "john-doe-ceo"
// "Homepage Wall of Love" -> "homepage-wall-of-love"
```

### Slug Uniqueness

| Entity | Slug Scope | Collision Handling |
|--------|------------|-------------------|
| Organizations | Global | Append random suffix |
| Forms | Per organization | Append random suffix |
| Testimonials | Per organization | Optional, ID is primary |
| Widgets | Per organization | Optional, ID is primary |

---

## Route Structure

### Vue Router Configuration

```typescript
// File-based routing structure (FSD)
// apps/web/src/pages/

pages/
├── login.vue                           // /login
├── signup.vue                          // /signup
├── forgot-password.vue                 // /forgot-password
├── f/
│   └── [slug].vue                      // /f/:slug (public form)
├── w/
│   └── [id].vue                        // /w/:id (widget preview)
├── embed/
│   └── w/
│       └── [id].vue                    // /embed/w/:id
└── [org]/
    ├── index.vue                       // /:org (redirect to dashboard)
    ├── dashboard.vue                   // /:org/dashboard
    ├── testimonials/
    │   ├── index.vue                   // /:org/testimonials
    │   └── [urlSlug].vue               // /:org/testimonials/:urlSlug
    ├── forms/
    │   ├── index.vue                   // /:org/forms
    │   └── [urlSlug].vue               // /:org/forms/:urlSlug
    ├── widgets/
    │   ├── index.vue                   // /:org/widgets
    │   └── [urlSlug].vue               // /:org/widgets/:urlSlug
    └── settings/
        ├── index.vue                   // /:org/settings
        ├── team.vue                    // /:org/settings/team
        ├── billing.vue                 // /:org/settings/billing
        └── branding.vue                // /:org/settings/branding
```

---

## Benefits of This Approach

### 1. Performance
- **Single Query Resolution**: Direct ID lookup, no slug-to-ID mapping needed
- **Predictable Performance**: O(1) lookup regardless of data volume
- **Cache Friendly**: Static URL patterns work well with CDNs

### 2. Maintainability
- **No Cascading Updates**: Renaming forms/widgets doesn't break bookmarks
- **Simple Debugging**: Entity type and ID clearly visible in URL
- **Direct Database Mapping**: URL entity types match table names

### 3. User Experience
- **Bookmarkable URLs**: Never break due to ID-based resolution
- **Readable**: Human-friendly slugs for better UX
- **Short Public URLs**: Clean `/f/product-feedback` for sharing

### 4. SEO Considerations
- **Keyword Rich**: Entity slugs contain meaningful words
- **Stable URLs**: Search engines can rely on permanent links
- **Logical Structure**: Clear hierarchy for crawlers

---

## Implementation Steps

1. **Add slug/url_slug fields** to testimonials and widgets tables
2. **Create database indexes** on url_slug fields for fast resolution
3. **Update GraphQL schema** to expose slug fields
4. **Implement URL parsing utility** in frontend shared utilities
5. **Configure Vue Router** with file-based routing structure
6. **Add slug generation** on entity creation (API layer)
7. **Build navigation helpers** for generating entity URLs

---

## Conclusion

This hybrid approach provides:
- **Notion's reliability**: ID-based URLs that never break
- **Linear's clarity**: Entity types visible in URL structure
- **Performance**: Single-query resolution
- **Flexibility**: Easy reorganization without URL changes
- **Clean public URLs**: Short, shareable form links

The result is a URL system optimized for a testimonial collection SaaS, balancing dashboard usability with customer-facing simplicity.
