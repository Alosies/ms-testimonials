# Migration Order

Dependencies determine the order in which migrations must be applied.

---

## Migration Phases

```
Phase 1: Utility Functions (exists)
  1. nanoid__utility-function
  2. updated_at__utility-function

Phase 2: Authentication
  3. users__create_table
  4. user_identities__create_table
  5. roles__create_table

Phase 3: Multi-Tenancy
  6. plans__create_table
  7. plan_prices__create_table
  8. organizations__create_table
  9. organization_plans__create_table
  10. organization_roles__create_table

Phase 4: Business Entities
  11. forms__create_table
  12. form_questions__create_table
  13. testimonials__create_table
  14. testimonial_answers__create_table
  15. widgets__create_table
  16. widget_testimonials__create_table

Phase 5: Computed Fields & Functions
  17. organizations__computed_field_functions
  18. testimonials__auto_org_id_trigger
```

---

## Dependency Graph

```
                    ┌─────────────────┐
                    │ Utility Funcs   │
                    │ (nanoid,        │
                    │  updated_at)    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌─────────┐    ┌─────────┐    ┌─────────┐
        │  users  │    │  roles  │    │  plans  │
        └────┬────┘    └────┬────┘    └────┬────┘
             │              │              │
             ▼              │              ▼
    ┌────────────────┐      │     ┌──────────────┐
    │ user_identities│      │     │ plan_prices  │
    └────────────────┘      │     └──────────────┘
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                   ┌───────────────┐
                   │ organizations │
                   └───────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────┐ ┌─────────────┐
│organization_plans│ │org_roles     │ │ forms       │
└──────────────────┘ └──────────────┘ └──────┬──────┘
                                             │
                            ┌────────────────┼────────────────┐
                            ▼                ▼                ▼
                   ┌────────────────┐ ┌──────────────┐ ┌─────────────┐
                   │ form_questions │ │ testimonials │ │  widgets    │
                   └───────┬────────┘ └──────┬───────┘ └──────┬──────┘
                           │                 │                │
                           └────────┬────────┘                │
                                    ▼                         │
                         ┌──────────────────────┐             │
                         │ testimonial_answers  │             │
                         └──────────────────────┘             │
                                    │                         │
                                    └────────────┬────────────┘
                                                 ▼
                                    ┌───────────────────────┐
                                    │  widget_testimonials  │
                                    └───────────────────────┘
```

---

## Migration Naming Convention

```
[timestamp]_[YYYY_MM_DD_HHMM]__[table_name]__[action_description]
```

**Examples:**
- `1767004710000_2025_12_29_1608__users__create_table`
- `1767004770000_2025_12_29_1609__user_identities__create_table`
- `1767004830000_2025_12_29_1610__roles__create_table`

---

## Default Questions Seeding

When a form is created, seed default questions via trigger:

```sql
-- Function to seed default questions for a new form
CREATE OR REPLACE FUNCTION seed_default_questions()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO form_questions (form_id, question_key, question_text, placeholder, display_order, is_required)
    VALUES
        (NEW.id, 'problem', 'What problem were you trying to solve?',
         'Before using ' || NEW.product_name || ', I was struggling with...', 1, true),
        (NEW.id, 'solution', 'How did ' || NEW.product_name || ' help?',
         'It helped me by...', 2, true),
        (NEW.id, 'result', 'What specific result did you get?',
         'Now I can... / I achieved...', 3, true),
        (NEW.id, 'attribution', 'Your name, title & company',
         'John Doe, CEO at Acme Corp', 4, false);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_seed_form_questions
    AFTER INSERT ON forms
    FOR EACH ROW EXECUTE FUNCTION seed_default_questions();
```

---

## Applied Migrations Status

| Table | Status | Migration |
|-------|--------|-----------|
| nanoid | ✅ Applied | utility function |
| updated_at | ✅ Applied | utility function |
| users | ✅ Applied | `1767004710000_2025_12_29_1608__users__create_table` |
| user_identities | ✅ Applied | `1767004770000_2025_12_29_1609__user_identities__create_table` |
| roles | ✅ Applied | `1767004830000_2025_12_29_1610__roles__create_table` |
| plans | 📋 Planned | - |
| plan_prices | 📋 Planned | - |
| organizations | 📋 Planned | - |
| organization_plans | 📋 Planned | - |
| organization_roles | 📋 Planned | - |
| forms | 📋 Planned | - |
| form_questions | 📋 Planned | - |
| testimonials | 📋 Planned | - |
| testimonial_answers | 📋 Planned | - |
| widgets | 📋 Planned | - |
| widget_testimonials | 📋 Planned | - |
