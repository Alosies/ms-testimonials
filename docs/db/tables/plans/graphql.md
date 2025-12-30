# Plans GraphQL Examples

**Last Updated**: `2025-12-30-1200` (GMT+5:30)

## Basic Queries

### Get All Active Plans
```graphql
query GetActivePlans {
  plans(where: {is_active: {_eq: true}}) {
    id
    unique_name
    name
    description
    max_testimonials
    max_forms
    max_widgets
    max_members
    show_branding
  }
}
```

### Get Plan by ID
```graphql
query GetPlan($id: String!) {
  plans_by_pk(id: $id) {
    id
    unique_name
    name
    description
    max_testimonials
    max_forms
    max_widgets
    max_members
    show_branding
    is_active
    created_at
    updated_at
  }
}
```

### Get Plan by unique_name
```graphql
query GetPlanByUniqueName($uniqueName: String!) {
  plans(where: {unique_name: {_eq: $uniqueName}}) {
    id
    unique_name
    name
    description
    max_testimonials
    max_forms
    max_widgets
    max_members
    show_branding
  }
}
```

## Relationship Queries

### Plan with Prices
```graphql
query GetPlanWithPrices($id: String!) {
  plans_by_pk(id: $id) {
    id
    unique_name
    name
    plan_prices {
      id
      currency_code
      price_monthly_in_base_unit
      price_yearly_in_base_unit
      price_lifetime_in_base_unit
    }
  }
}
```

## Mutations

### Create Plan
```graphql
mutation CreatePlan($input: plans_insert_input!) {
  insert_plans_one(object: $input) {
    id
    unique_name
    name
    created_at
  }
}
```

**Variables:**
```json
{
  "input": {
    "unique_name": "enterprise",
    "name": "Enterprise",
    "description": "For large organizations",
    "max_testimonials": -1,
    "max_forms": -1,
    "max_widgets": -1,
    "max_members": -1,
    "show_branding": false
  }
}
```

### Update Plan
```graphql
mutation UpdatePlan($id: String!, $updates: plans_set_input!) {
  update_plans_by_pk(pk_columns: {id: $id}, _set: $updates) {
    id
    name
    updated_at
  }
}
```

### Deactivate Plan
```graphql
mutation DeactivatePlan($id: String!) {
  update_plans_by_pk(
    pk_columns: {id: $id}
    _set: {is_active: false}
  ) {
    id
    is_active
    updated_at
  }
}
```
