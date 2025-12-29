# Query Examples

Common SQL and GraphQL queries for the Testimonials schema.

---

## Form Queries

### Get Form with Questions (Ordered)

```sql
SELECT
    f.id, f.name, f.slug, f.product_name,
    json_agg(
        json_build_object(
            'key', q.question_key,
            'text', q.question_text,
            'placeholder', q.placeholder,
            'required', q.is_required
        ) ORDER BY q.display_order
    ) AS questions
FROM forms f
JOIN form_questions q ON q.form_id = f.id AND q.is_active = true
WHERE f.organization_id = $1 AND f.slug = $2 AND f.is_active = true
GROUP BY f.id;
```

### GraphQL: Get Form by Slug

```graphql
query GetFormBySlug($orgId: String!, $slug: String!) {
  forms(
    where: {
      organization_id: { _eq: $orgId }
      slug: { _eq: $slug }
      is_active: { _eq: true }
    }
    limit: 1
  ) {
    id
    name
    slug
    product_name
    collect_rating
    require_email
    require_company
    form_questions(
      where: { is_active: { _eq: true } }
      order_by: { display_order: asc }
    ) {
      id
      question_key
      question_text
      placeholder
      help_text
      is_required
    }
  }
}
```

---

## Testimonial Queries

### Get Testimonial with Answers

```sql
SELECT
    t.*,
    json_agg(
        json_build_object(
            'question_key', q.question_key,
            'question', q.question_text,
            'answer', a.answer_text
        ) ORDER BY q.display_order
    ) AS answers
FROM testimonials t
JOIN testimonial_answers a ON a.testimonial_id = t.id
JOIN form_questions q ON q.id = a.question_id
WHERE t.id = $1
GROUP BY t.id;
```

### GraphQL: Get Testimonials by Status

```graphql
query GetTestimonials($orgId: String!, $status: String!) {
  testimonials(
    where: {
      organization_id: { _eq: $orgId }
      status: { _eq: $status }
    }
    order_by: { created_at: desc }
  ) {
    id
    status
    content
    rating
    customer_name
    customer_email
    customer_company
    created_at
    testimonial_answers {
      answer_text
      form_question {
        question_key
        question_text
      }
    }
  }
}
```

### Get Approved Testimonials (Optimized)

```sql
-- Uses partial index idx_testimonials_approved
SELECT * FROM testimonials
WHERE organization_id = $1 AND status = 'approved'
ORDER BY created_at DESC
LIMIT 20;
```

---

## Widget Queries

### Get Widget with Testimonials (Ordered)

```sql
SELECT
    w.*,
    json_agg(
        json_build_object(
            'id', t.id,
            'content', t.content,
            'rating', t.rating,
            'customer_name', t.customer_name,
            'customer_company', t.customer_company,
            'is_featured', wt.is_featured
        ) ORDER BY wt.display_order
    ) AS testimonials
FROM widgets w
JOIN widget_testimonials wt ON wt.widget_id = w.id
JOIN testimonials t ON t.id = wt.testimonial_id AND t.status = 'approved'
WHERE w.id = $1 AND w.is_active = true
GROUP BY w.id;
```

### GraphQL: Get Widget for Embed

```graphql
query GetWidgetForEmbed($widgetId: String!) {
  widgets_by_pk(id: $widgetId) {
    id
    type
    theme
    show_ratings
    show_dates
    show_company
    show_avatar
    max_display
    settings
    widget_testimonials(order_by: { display_order: asc }) {
      is_featured
      testimonial {
        id
        content
        rating
        customer_name
        customer_title
        customer_company
        customer_avatar_url
        created_at
      }
    }
  }
}
```

---

## Organization Queries

### Get Organization with Active Plan

```graphql
query GetOrgWithPlan($orgId: String!) {
  organizations_by_pk(id: $orgId) {
    id
    name
    slug
    testimonial_count
    form_count
    widget_count
    member_count
    organization_plans(
      where: { status: { _in: ["trial", "active"] } }
      limit: 1
    ) {
      status
      billing_cycle
      max_testimonials
      max_forms
      max_widgets
      max_members
      show_branding
      current_period_ends_at
      plan {
        unique_name
        name
      }
    }
  }
}
```

### Get User's Organizations with Roles

```graphql
query GetUserOrganizations($userId: String!) {
  organization_roles(
    where: {
      user_id: { _eq: $userId }
      is_active: { _eq: true }
    }
  ) {
    is_default_org
    organization {
      id
      name
      slug
      logo_url
    }
    role {
      unique_name
      name
      can_manage_forms
      can_manage_testimonials
      can_manage_widgets
      can_manage_members
      can_manage_billing
    }
  }
}
```

---

## Analytics Queries

### Which Question Gets Longest Answers?

```sql
SELECT q.question_key, AVG(LENGTH(a.answer_text)) as avg_length
FROM form_questions q
JOIN testimonial_answers a ON a.question_id = q.id
GROUP BY q.question_key
ORDER BY avg_length DESC;
```

### Testimonials by Source

```sql
SELECT source, COUNT(*) as count
FROM testimonials
WHERE organization_id = $1
GROUP BY source;
```

### Average Rating by Form

```sql
SELECT f.name, AVG(t.rating) as avg_rating, COUNT(*) as count
FROM forms f
JOIN testimonials t ON t.form_id = f.id AND t.rating IS NOT NULL
WHERE f.organization_id = $1
GROUP BY f.id
ORDER BY avg_rating DESC;
```

---

## Search Queries

### Find Testimonials Mentioning Keyword

```sql
SELECT t.* FROM testimonials t
JOIN testimonial_answers a ON a.testimonial_id = t.id
WHERE t.organization_id = $1
  AND a.answer_text ILIKE '%pricing%';
```

### Find Missing Required Answers

```sql
SELECT t.id, q.question_key
FROM testimonials t
CROSS JOIN form_questions q
LEFT JOIN testimonial_answers a ON a.testimonial_id = t.id AND a.question_id = q.id
WHERE t.form_id = $1
  AND q.form_id = $1
  AND q.is_required = true
  AND a.id IS NULL;
```
