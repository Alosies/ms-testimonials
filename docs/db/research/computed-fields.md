# Hasura Computed Fields

Usage counts are computed on-demand via SQL functions, exposed as computed fields in Hasura. No denormalization, always accurate.

---

## Why Computed Fields?

| Aspect | Computed Fields | Denormalized Columns |
|--------|-----------------|---------------------|
| Accuracy | Always correct | Can drift if triggers fail |
| Complexity | Simple functions | Triggers for each table |
| Performance | O(n) with index | O(1) read |
| Maintenance | None | Trigger debugging |
| MVP Suitability | ✅ Recommended | Premature optimization |

**Note**: If COUNT() becomes a bottleneck at scale, can add materialized views or denormalized table later.

---

## Computed Field Functions

```sql
-- Testimonial count for organization
CREATE OR REPLACE FUNCTION get_org_testimonial_count(org_row organizations)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM testimonials WHERE organization_id = org_row.id;
$$ LANGUAGE sql STABLE;

-- Form count for organization
CREATE OR REPLACE FUNCTION get_org_form_count(org_row organizations)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM forms WHERE organization_id = org_row.id;
$$ LANGUAGE sql STABLE;

-- Widget count for organization
CREATE OR REPLACE FUNCTION get_org_widget_count(org_row organizations)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM widgets WHERE organization_id = org_row.id;
$$ LANGUAGE sql STABLE;

-- Member count for organization
CREATE OR REPLACE FUNCTION get_org_member_count(org_row organizations)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM organization_roles
    WHERE organization_id = org_row.id AND is_active = true;
$$ LANGUAGE sql STABLE;
```

---

## Hasura Metadata Configuration

Add computed fields via Hasura Console or metadata:

```yaml
# In tables.yaml for organizations table
computed_fields:
  - name: testimonial_count
    definition:
      function:
        name: get_org_testimonial_count
        schema: public
    comment: "Number of testimonials in this organization"
  - name: form_count
    definition:
      function:
        name: get_org_form_count
        schema: public
  - name: widget_count
    definition:
      function:
        name: get_org_widget_count
        schema: public
  - name: member_count
    definition:
      function:
        name: get_org_member_count
        schema: public
```

---

## GraphQL Usage

```graphql
query GetOrganizationWithCounts($id: String!) {
  organizations_by_pk(id: $id) {
    id
    name
    slug
    # Computed on-demand (no storage)
    testimonial_count
    form_count
    widget_count
    member_count
  }
}
```

---

## Plan Limit Checking

### Via SQL

```sql
-- Check if org can add more testimonials (using computed count)
SELECT
    CASE
        WHEN op.max_testimonials = -1 THEN true
        WHEN get_org_testimonial_count(o) < op.max_testimonials THEN true
        ELSE false
    END AS can_add_testimonial
FROM organizations o
JOIN organization_plans op ON op.organization_id = o.id AND op.status IN ('trial', 'active')
WHERE o.id = $1;
```

### Via GraphQL

```graphql
query CanAddTestimonial($orgId: String!) {
  organizations_by_pk(id: $orgId) {
    testimonial_count  # Computed field
    active_plan: organization_plans(
      where: { status: { _in: ["trial", "active"] } }
      limit: 1
    ) {
      max_testimonials
    }
  }
}
# Application logic: testimonial_count < max_testimonials OR max_testimonials == -1
```

---

## Performance Considerations

### Current (MVP)
- COUNT() is fast with proper indexes
- Organizations table has index on `id`
- Related tables have indexes on `organization_id`

### Future Optimization (if needed)
1. **Materialized Views**: Refresh periodically
2. **Denormalized Table**: `organization_usage` with triggers
3. **Cache Layer**: Redis/Memcached for hot data

Only add complexity when proven necessary via profiling.
