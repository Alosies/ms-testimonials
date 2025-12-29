# Hasura Permissions

Example permission configurations for the Testimonials schema.

---

## Member Role - Forms

```yaml
select_permissions:
  - role: member
    permission:
      columns: [id, name, slug, product_name, collect_rating, require_email, require_company, settings, is_active, created_at]
      filter:
        organization_id:
          _eq: X-Hasura-Organization-Id
      allow_aggregations: true

insert_permissions:
  - role: member
    permission:
      columns: [name, slug, product_name, collect_rating, require_email, require_company, settings]
      set:
        organization_id: X-Hasura-Organization-Id
        created_by: X-Hasura-User-Id
      check:
        organization_id:
          _eq: X-Hasura-Organization-Id
```

---

## Anonymous Role - Form Submission

```yaml
# Anonymous can only insert testimonials (submit form)
insert_permissions:
  - role: anonymous
    permission:
      columns: [form_id, customer_name, customer_email, customer_title, customer_company, rating]
      set:
        status: pending
        source: form
      check:
        form:
          is_active:
            _eq: true
```
