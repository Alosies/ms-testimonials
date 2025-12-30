# Organization Plans GraphQL Examples

**Last Updated**: `2025-12-30-1200` (GMT+5:30)

## Basic Queries

### Get Active Subscription for Organization
```graphql
query GetActiveSubscription($orgId: String!) {
  organization_plans(
    where: {
      organization_id: {_eq: $orgId},
      status: {_in: ["trial", "active"]}
    }
  ) {
    id
    status
    billing_cycle
    currency_code
    starts_at
    current_period_ends_at
    trial_ends_at
    max_forms
    max_testimonials
    max_widgets
    max_members
    show_branding
    price_in_base_unit
    has_overrides
  }
}
```

### Get Subscription by ID
```graphql
query GetSubscription($id: String!) {
  organization_plans_by_pk(id: $id) {
    id
    organization_id
    plan_id
    status
    billing_cycle
    currency_code
    starts_at
    current_period_ends_at
    trial_ends_at
    cancelled_at
    max_forms
    max_testimonials
    max_widgets
    max_members
    show_branding
    price_in_base_unit
    has_overrides
    override_reason
    overridden_by
    overridden_at
    created_at
    updated_at
  }
}
```

### Get Expiring Subscriptions
```graphql
query GetExpiringSubscriptions($beforeDate: timestamptz!) {
  organization_plans(
    where: {
      status: {_eq: "active"},
      current_period_ends_at: {_lte: $beforeDate}
    }
    order_by: {current_period_ends_at: asc}
  ) {
    id
    organization_id
    current_period_ends_at
    billing_cycle
  }
}
```

## Relationship Queries

### Subscription with Organization and Plan
```graphql
query GetSubscriptionFull($id: String!) {
  organization_plans_by_pk(id: $id) {
    id
    status
    billing_cycle
    organization {
      id
      name
      slug
    }
    plan {
      id
      unique_name
      name
    }
  }
}
```

## Mutations

### Create Subscription
```graphql
mutation CreateSubscription($input: organization_plans_insert_input!) {
  insert_organization_plans_one(object: $input) {
    id
    organization_id
    status
    created_at
  }
}
```

**Variables:**
```json
{
  "input": {
    "organization_id": "org_id_here",
    "plan_id": "plan_id_here",
    "status": "trial",
    "billing_cycle": "lifetime",
    "currency_code": "USD",
    "trial_ends_at": "2025-01-14T00:00:00Z",
    "max_forms": 1,
    "max_testimonials": 50,
    "max_widgets": 1,
    "max_members": 1,
    "show_branding": true,
    "price_in_base_unit": 0
  }
}
```

### Upgrade/Convert Trial
```graphql
mutation ActivateSubscription($id: String!, $updates: organization_plans_set_input!) {
  update_organization_plans_by_pk(pk_columns: {id: $id}, _set: $updates) {
    id
    status
    starts_at
    current_period_ends_at
    updated_at
  }
}
```

### Cancel Subscription
```graphql
mutation CancelSubscription($id: String!) {
  update_organization_plans_by_pk(
    pk_columns: {id: $id}
    _set: {
      status: "cancelled",
      cancelled_at: "now()"
    }
  ) {
    id
    status
    cancelled_at
    updated_at
  }
}
```

### Apply Override
```graphql
mutation ApplyOverride(
  $id: String!,
  $overrides: organization_plans_set_input!,
  $userId: String!,
  $reason: String!
) {
  update_organization_plans_by_pk(
    pk_columns: {id: $id}
    _set: {
      max_forms: 10,
      has_overrides: true,
      override_reason: $reason,
      overridden_by: $userId,
      overridden_at: "now()"
    }
  ) {
    id
    max_forms
    has_overrides
    override_reason
    updated_at
  }
}
```
