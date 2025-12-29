# Design Decisions

Key architectural decisions for the Testimonials database schema.

---

## JSONB Policy

| Use Case | JSONB? | Rationale |
|----------|--------|-----------|
| Provider metadata | **Yes** | Truly dynamic, varies per provider, dump/read |
| UI preferences/settings | **Yes** | Not queried, schema-less by nature |
| Structured business data | **No** | Needs constraints, queried, reported |

---

## JSONB Usage Summary

| Table | JSONB Column | Purpose | Why OK |
|-------|--------------|---------|--------|
| user_identities | provider_metadata | OAuth tokens, provider claims | Varies per provider, not queried |
| organizations | settings | UI theme, locale | User preferences, not business logic |
| forms | settings | Form theme, colors | UI customization, not queried |
| testimonials | source_metadata | Import source details | Varies per source (Twitter, LinkedIn) |
| widgets | settings | Carousel speed, columns | Type-specific UI, not queried |

**All business-critical data is in proper columns with constraints.**

---

## Benefits of Normalized Design

### 1. Queryable & Reportable

```sql
-- Which question gets the longest answers?
SELECT q.question_key, AVG(LENGTH(a.answer_text)) as avg_length
FROM form_questions q
JOIN testimonial_answers a ON a.question_id = q.id
GROUP BY q.question_key
ORDER BY avg_length DESC;

-- Not possible with JSONB without complex extraction
```

### 2. Referential Integrity

```sql
-- Can't delete a question that has answers
-- Can't add answer to non-existent question
-- Can't add testimonial to non-existent widget
-- All enforced by database, not application
```

### 3. Schema Evolution via Migrations

```sql
-- Add new question type? Simple migration
ALTER TABLE form_questions ADD COLUMN question_type TEXT DEFAULT 'text';

-- With JSONB, this change is hidden in application code
```

### 4. Efficient Queries

```sql
-- Find all testimonials mentioning "pricing"
SELECT t.* FROM testimonials t
JOIN testimonial_answers a ON a.testimonial_id = t.id
WHERE a.answer_text ILIKE '%pricing%';

-- With JSONB: jsonb_each_text() + ILIKE = slow
```

### 5. Proper Constraints

```sql
-- Unique order per form (no duplicates)
UNIQUE (form_id, display_order)

-- Required answer for required question (app logic, but queryable)
SELECT * FROM form_questions q
LEFT JOIN testimonial_answers a ON a.question_id = q.id AND a.testimonial_id = $1
WHERE q.form_id = $2 AND q.is_required = true AND a.id IS NULL;
```

---

## Key Patterns

### unique_name + name Pattern

Tables with system/seed data use two columns:
- `unique_name`: Lowercase slug for code comparisons
- `name`: Display-ready label for UI

```typescript
// Code comparisons use unique_name
if (role.unique_name === 'owner') { ... }

// UI display uses name
<span>{{ role.name }}</span>
```

### NanoID Primary Keys

- `generate_nanoid_12()`: Standard entities
- `generate_nanoid_16()`: Security-critical (user_identities)

### No Semantic ID Defaults

FK columns should NOT have semantic ID defaults. App must lookup by unique_name.
