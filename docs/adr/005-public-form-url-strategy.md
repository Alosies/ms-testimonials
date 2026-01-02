# ADR-005: Public Form URL Strategy

## Doc Connections
**ID**: `adr-005-public-form-url`

2026-01-02-2030 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `prd-url-system-notion-inspired` - URL system design document
- `table-forms` - Forms table documentation

---

## Status

**Accepted** - 2026-01-02

## Context

Public form URLs (`/f/{identifier}`) are shared with customers to collect testimonials. The question is: **how should the `{identifier}` portion be structured?**

### The Original Design

The initial schema included a user-controlled `slug` field:

```sql
forms.slug  -- "URL-friendly identifier for public form link (/f/{slug})"
```

This would produce URLs like:
```
/f/product-feedback
/f/summer-campaign-2024
```

### The Problem: Global Uniqueness

If the URL pattern is `/f/{slug}` with no organization context, then slugs must be **globally unique across all organizations**. This creates several issues:

| Problem | Impact |
|---------|--------|
| **Land-grab dynamics** | First user to claim "feedback" owns it forever |
| **User frustration** | "Why can't I use 'product-review'? It's taken." |
| **Forced ugly slugs** | System suggests `product-feedback-7834` after collision |
| **Support burden** | Users request slug transfers, conflicts, etc. |
| **Namespace exhaustion** | Popular terms depleted quickly |

### Research Question

How do leading SaaS products handle shareable/public URLs? Specifically:
- Do they use user-controlled slugs?
- How do they ensure uniqueness?
- What's the tradeoff between readability and reliability?

---

## Industry Research

### Notion

**URL Pattern:** `{workspace}.notion.site/{page-title}-{32-char-uuid}`

```
https://acme.notion.site/Project-Roadmap-1429989fe8ac4effbc8f57f56486db54
                         └─────────────┘ └──────────────────────────────┘
                           cosmetic              32-char UUID
```

**Key Characteristics:**
- Title is auto-generated from page name
- UUID guarantees global uniqueness
- User cannot control or customize the slug
- Renaming the page doesn't break existing links (UUID is authoritative)
- Resolution uses only the UUID; title portion is ignored

**Source:** [Notion Help Center - Public Pages](https://www.notion.com/help/public-pages-and-web-publishing), [Notion API - Working with Page Content](https://developers.notion.com/docs/working-with-page-content)

---

### Linear

**URL Pattern:** `linear.app/{workspace}/issue/{TEAM}-{number}`

```
https://linear.app/acme/issue/ENG-1234
                   └──┘       └──┘└───┘
                workspace    team  seq#
```

**Key Characteristics:**
- No UUID in URL - uses team prefix + sequential number
- Namespace is scoped by workspace (`/acme/`)
- IDs are predictable and human-readable (ENG-1, ENG-2, ...)
- User cannot control issue identifiers
- No native public link sharing (internal feature request exists)

**Source:** [Linear Docs - Creating Issues](https://linear.app/docs/creating-issues), [Linear GitHub - Public Link Request](https://github.com/linear/linear/issues/653)

---

### Google Drive

**URL Pattern:** `drive.google.com/file/d/{44-char-id}/view`

```
https://drive.google.com/file/d/0B9F7aa5Cm7ZFc3RhcnRlcl9maWxl/view
                                 └──────────────────────────────┘
                                       pure ID (no title)
```

**Key Characteristics:**
- Pure ID-based, no human-readable component
- ID is stable forever (survives renames, moves)
- No vanity URL option available
- Simplest approach - sacrifices readability for reliability

**Source:** [Google Drive URL Tricks](https://www.labnol.org/internet/direct-links-for-google-drive/28356), [Google Docs URL Parameters](https://youneedawiki.com/blog/posts/google-doc-url-parameters.html)

---

### Research Summary

| Service | Pattern | Human-readable? | User controls slug? | Uniqueness |
|---------|---------|-----------------|---------------------|------------|
| **Notion** | `title-{uuid}` | Yes (title prefix) | No | UUID |
| **Linear** | `{workspace}/issue/{TEAM}-{num}` | Yes (team + number) | No | Workspace-scoped |
| **Google Drive** | `{id}` only | No | No | ID |
| **Testimonials (original)** | `/f/{slug}` | Yes | Yes | Global slug |

**Key Insight:** None of these major products give users control over slugs. They all:
1. Include an ID that guarantees uniqueness
2. Auto-generate any human-readable portion
3. Prioritize stability over vanity

---

## Decision

**Adopt the Notion pattern for public form URLs: `name_id` with system-generated slugs.**

### New URL Pattern

```
/f/{form-name}_{id}
/f/product-feedback_xK9mP2qR4tYn
```

### Resolution Logic

```typescript
// URL: /f/product-feedback_xK9mP2qR4tYn

function resolvePublicFormUrl(urlParam: string): string {
  // Extract ID after last underscore
  const lastUnderscore = urlParam.lastIndexOf('_');

  if (lastUnderscore === -1) {
    // No underscore - treat entire param as ID (backwards compat)
    return urlParam;
  }

  // Return only the ID portion
  return urlParam.substring(lastUnderscore + 1);
}

// Query: forms_by_pk(id: "xK9mP2qR4tYn")
// The "product-feedback" portion is IGNORED
```

### URL Generation

```typescript
function generatePublicFormUrl(form: { name: string; id: string }): string {
  const slug = form.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 50);

  return `/f/${slug}_${form.id}`;
}
```

### Schema Change

**Remove the `slug` column from the `forms` table.**

The column is no longer needed because:
- URL slug is generated at runtime from `name` + `id`
- No uniqueness constraint to manage
- No user input to validate
- No stored value to keep in sync

---

## Consequences

### Positive

1. **No uniqueness conflicts** - ID guarantees global uniqueness
2. **No user decision needed** - System handles URL generation automatically
3. **Simpler schema** - Remove `slug` column and its constraints
4. **Rename-safe** - Changing form name doesn't break existing links
5. **No validation logic** - No slug format checking or collision handling
6. **Consistent with dashboard URLs** - Same `name_id` pattern throughout app
7. **Industry-aligned** - Follows Notion's proven approach

### Negative

1. **Slightly longer URLs** - `/f/product-feedback_xK9mP2qR4tYn` vs `/f/product-feedback`
2. **Less "clean" appearance** - ID suffix visible in shared links
3. **No vanity URLs** - Users cannot customize for branding/campaigns

### Neutral

1. **Migration required** - Existing forms with slugs need URL updates
2. **Documentation updates** - API docs, help articles need revision

### Tradeoffs Accepted

| We Give Up | We Gain |
|------------|---------|
| Vanity URLs (`/f/summer-promo`) | Zero uniqueness conflicts |
| User slug control | Automatic URL generation |
| "Clean" short URLs | Rename-proof permalinks |
| Slug column | Simpler schema |

---

## Alternatives Considered

### Alternative 1: Organization-Scoped Slugs

```
/f/{org_slug}/{form_slug}
/f/acme/product-feedback
```

**Rejected because:**
- Longer URLs with org prefix
- Exposes organization structure publicly
- Still requires uniqueness within org
- More complex routing

### Alternative 2: Keep Global Unique Slugs

```
/f/{slug}
/f/product-feedback
```

**Rejected because:**
- Land-grab dynamics for popular terms
- User frustration when desired slug is taken
- System-suggested alternatives are ugly (`product-feedback-7834`)
- Ongoing support burden for slug conflicts

### Alternative 3: ID-Only (Google Drive Style)

```
/f/{id}
/f/xK9mP2qR4tYn
```

**Rejected because:**
- Not human-readable at all
- Harder to identify form from URL
- Looks less professional when shared
- Loses context about what the form collects

### Alternative 4: User-Optional Slug with ID Fallback

```
/f/{slug}         → when user sets custom slug
/f/{name}_{id}    → when no custom slug
```

**Rejected because:**
- Two patterns to support and document
- Users still fight over popular slugs
- Complexity without proportional benefit
- Inconsistent URL appearance

---

## Implementation Checklist

1. [ ] Update `extractEntityIdFromSlug` to handle public form URLs
2. [ ] Create `generatePublicFormUrl` helper function
3. [ ] Update `/f/[slug].vue` page to use new resolution logic
4. [ ] Create migration to drop `slug` column from `forms` table
5. [ ] Update form creation flow to remove slug input
6. [ ] Update any API endpoints that reference form slugs
7. [ ] Add redirects for any existing slug-based URLs (if in production)

---

## References

- [Notion Help Center - Public Pages](https://www.notion.com/help/public-pages-and-web-publishing)
- [Notion API - Working with Page Content](https://developers.notion.com/docs/working-with-page-content)
- [Linear Docs - Creating Issues](https://linear.app/docs/creating-issues)
- [Linear GitHub - Public Link Sharing Request](https://github.com/linear/linear/issues/653)
- [Google Drive URL Tricks](https://www.labnol.org/internet/direct-links-for-google-drive/28356)
- Internal PRD: `docs/prd/url-system-notion-inspired.md`
