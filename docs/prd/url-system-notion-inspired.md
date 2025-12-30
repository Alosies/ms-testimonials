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

Testimonials uses a hybrid URL strategy that combines Notion's ID-based uniqueness with Linear's entity type clarity. URLs contain human-readable slugs for readability, but **resolution happens exclusively via the ID**.

**Key Principle**: The slug is cosmetic. Only the ID matters for data fetching.

## URL Pattern

### Dashboard URLs (Authenticated)

```
/{org_slug}/{entity_type}/{readable_slug}_{entity_id}
```

The `readable_slug` is derived from entity names at URL generation time but **completely ignored** during resolution. Only the `entity_id` after the final underscore is used.

### Public URLs (Unauthenticated)

```
/f/{form_slug}                    # Form collection page
/w/{widget_id}                    # Widget embed/preview
```

---

## URL Resolution: ID-Only Approach

### Core Extraction Function

```typescript
interface EntityUrlInfo {
  slug: string;
  entityId: string;
  isValid: boolean;
}

export function extractEntityIdFromSlug(urlSlug: string): EntityUrlInfo | null {
  if (!urlSlug || typeof urlSlug !== 'string') {
    return null;
  }

  // Find the last underscore in the slug
  const lastUnderscoreIndex = urlSlug.lastIndexOf('_');

  if (lastUnderscoreIndex === -1 || lastUnderscoreIndex === urlSlug.length - 1) {
    return {
      slug: urlSlug,
      entityId: '',
      isValid: false,
    };
  }

  const slug = urlSlug.substring(0, lastUnderscoreIndex);
  const entityId = urlSlug.substring(lastUnderscoreIndex + 1);

  // Validate: entityId should be alphanumeric (NanoID format)
  const isValidEntityId = entityId.length > 0 && /^[a-zA-Z0-9]+$/.test(entityId);

  return {
    slug,
    entityId,
    isValid: isValidEntityId,
  };
}
```

### Resolution Flow

```
URL: /acme-corp/forms/product-feedback_f7x8y9z0a1b2

1. Extract: "product-feedback_f7x8y9z0a1b2"
2. Parse: { slug: "product-feedback", entityId: "f7x8y9z0a1b2" }
3. Query: forms_by_pk(id: "f7x8y9z0a1b2")  ← ONLY ID USED
4. Slug "product-feedback" is IGNORED
```

### GraphQL Query

```graphql
# Resolution uses ONLY the ID - slug is never queried
query GetForm($id: String!) {
  forms_by_pk(id: $id) {
    id
    name
    slug
    product_name
    is_active
    form_questions(order_by: { display_order: asc }) {
      id
      question_text
    }
  }
}
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

// Entity detail views - slug is cosmetic, ID is what matters
/acme-corp/forms/product-feedback_f7x8y9z0a1b2         // Form detail
/acme-corp/forms/xyz_f7x8y9z0a1b2                      // SAME form (slug ignored)
/acme-corp/testimonials/john-doe_t1a2b3c4d5e6          // Testimonial detail
/acme-corp/widgets/homepage-wall_w5d6e7f8g9h0          // Widget editor

// Settings
/acme-corp/settings                                     // Organization settings
/acme-corp/settings/team                                // Team management
/acme-corp/settings/billing                             // Billing & plans
```

### Public URLs

```typescript
// Form collection (customer-facing) - uses existing slug field
/f/product-feedback                                     // Short form URL

// Widget embed preview - ID only
/w/w5d6e7f8g9h0                                        // Widget preview
```

### Authentication URLs

```typescript
/login                                                  // Sign in
/signup                                                 // Sign up
/forgot-password                                        // Password reset
```

---

## URL Generation

### Creating Slugs from Names

```typescript
export function createSlugFromString(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // Remove special chars
    .replace(/\s+/g, '-')          // Spaces to hyphens
    .replace(/-+/g, '-')           // Multiple hyphens to single
    .trim()
    .substring(0, 50);             // Max length
}
```

### Creating Entity URLs

```typescript
export function createEntityUrlSlug(title: string, entityId: string): string {
  const slug = createSlugFromString(title);
  return `${slug}_${entityId}`;
}

// Convenience functions
export function createFormUrl(name: string, formId: string): string {
  return `/forms/${createEntityUrlSlug(name, formId)}`;
}

export function createTestimonialUrl(customerName: string, testimonialId: string): string {
  return `/testimonials/${createEntityUrlSlug(customerName, testimonialId)}`;
}

export function createWidgetUrl(name: string, widgetId: string): string {
  return `/widgets/${createEntityUrlSlug(name, widgetId)}`;
}
```

### Usage Example

```typescript
// In a Vue component
import { createFormUrl } from '@/shared/urls';

const formUrl = computed(() =>
  createFormUrl(props.form.name, props.form.id)
);
// Result: "/forms/product-feedback_f7x8y9z0a1b2"
```

---

## Database Schema: No Changes Needed

The existing schema already supports this URL pattern:

```sql
-- Forms: already has slug for public /f/{slug} URLs
forms.id       -- NanoID used for dashboard URLs
forms.slug     -- Used only for public /f/{slug} URLs

-- Testimonials & Widgets: ID is sufficient
testimonials.id   -- NanoID, customer_name used for URL generation
widgets.id        -- NanoID, name used for URL generation
```

**No `url_slug` computed columns needed** - slugs are generated at URL creation time from entity names, not stored.

---

## Route Structure

### Vue Router Configuration

```typescript
// File-based routing structure
// apps/web/src/pages/

pages/
├── login.vue                           // /login
├── signup.vue                          // /signup
├── f/
│   └── [slug].vue                      // /f/:slug (public form)
├── w/
│   └── [id].vue                        // /w/:id (widget preview)
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
        └── billing.vue                 // /:org/settings/billing
```

### Route Resolution in Pages

```typescript
// apps/web/src/pages/[org]/forms/[urlSlug].vue
<script setup lang="ts">
import { useRoute } from 'vue-router';
import { extractEntityIdFromSlug } from '@/shared/urls';

const route = useRoute();

// Extract ID from URL slug - slug text is ignored
const urlSlug = route.params.urlSlug as string;
const { entityId, isValid } = extractEntityIdFromSlug(urlSlug);

if (!isValid) {
  // Handle invalid URL
  navigateTo('/404');
}

// Fetch using ONLY the ID
const { data: form } = useGetFormByPkQuery({ id: entityId });
</script>
```

---

## Utility Module Structure

```
apps/web/src/shared/urls/
├── index.ts                    # Barrel export
├── models/
│   └── index.ts                # Type definitions
├── functions/
│   ├── extractors/
│   │   ├── extractEntityIdFromSlug.ts
│   │   └── getRouteType.ts
│   ├── generators/
│   │   ├── createSlugFromString.ts
│   │   ├── createEntityUrlSlug.ts
│   │   └── createEntityUrls.ts   # createFormUrl, createTestimonialUrl, etc.
│   └── validators/
│       └── isValidEntityUrl.ts
└── utils/
    └── routeAnalysis.ts        # analyzeRoute, extractEntityIds
```

---

## Benefits

### 1. Simplicity
- **No database changes**: Slugs generated at runtime from names
- **No sync issues**: Slug in URL doesn't need to match anything
- **Single query**: Always fetch by primary key (ID)

### 2. Performance
- **O(1) lookup**: Direct ID-based query
- **No slug lookups**: Skip slug-to-ID resolution
- **Cache friendly**: ID-based URLs are permanently cacheable

### 3. Flexibility
- **Rename freely**: Changing entity names doesn't break URLs
- **Bookmarks never break**: ID is immutable
- **SEO friendly**: Readable slugs in URL without complexity

### 4. User Experience
- **Readable URLs**: `/forms/product-feedback_abc123` vs `/forms/abc123`
- **Shareable**: URLs make sense when shared
- **Forgiving**: Even wrong slugs work if ID is correct

---

## Implementation Checklist

1. **Create URL utility module** at `apps/web/src/shared/urls/`
2. **Implement extractors**: `extractEntityIdFromSlug`, `getRouteType`
3. **Implement generators**: `createSlugFromString`, `createEntityUrlSlug`, entity URL functions
4. **Configure Vue Router** with `[urlSlug]` dynamic segments
5. **Use in components**: Generate URLs with entity name + ID
6. **Resolve in pages**: Extract ID from URL, fetch by primary key

---

## Conclusion

This approach provides:
- **Notion's reliability**: ID-based resolution that never breaks
- **Linear's clarity**: Entity types visible in URL structure
- **Zero database overhead**: No stored slugs, no computed columns
- **Maximum flexibility**: Slugs are cosmetic, IDs are authoritative

The slug exists purely for human readability. The system works identically whether the URL is `/forms/product-feedback_abc123` or `/forms/x_abc123`.
