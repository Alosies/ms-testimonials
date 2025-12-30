# Organizations GraphQL Examples

**Last Updated**: `2025-12-30-1200` (GMT+5:30)

## Basic Queries

### Get All Active Organizations
```graphql
query GetActiveOrganizations {
  organizations(where: {is_active: {_eq: true}}) {
    id
    name
    slug
    logo_url
    created_at
  }
}
```

### Get Organization by ID
```graphql
query GetOrganization($id: String!) {
  organizations_by_pk(id: $id) {
    id
    name
    slug
    logo_url
    settings
    is_active
    created_by
    created_at
    updated_at
  }
}
```

### Get Organization by Slug
```graphql
query GetOrganizationBySlug($slug: String!) {
  organizations(where: {slug: {_eq: $slug}}) {
    id
    name
    slug
    logo_url
    is_active
  }
}
```

## Relationship Queries

### Organization with Active Plan
```graphql
query GetOrganizationWithPlan($id: String!) {
  organizations_by_pk(id: $id) {
    id
    name
    slug
    organization_plans(where: {status: {_in: ["trial", "active"]}}) {
      id
      status
      billing_cycle
      max_forms
      max_testimonials
      max_widgets
      max_members
      current_period_ends_at
    }
  }
}
```

### Organization with Members
```graphql
query GetOrganizationWithMembers($id: String!) {
  organizations_by_pk(id: $id) {
    id
    name
    organization_roles(where: {is_active: {_eq: true}}) {
      id
      user_id
      role_id
      is_default_org
      joined_at
    }
  }
}
```

## Mutations

### Create Organization
```graphql
mutation CreateOrganization($input: organizations_insert_input!) {
  insert_organizations_one(object: $input) {
    id
    name
    slug
    created_at
  }
}
```

**Variables:**
```json
{
  "input": {
    "name": "Acme Corp",
    "slug": "acme-corp",
    "created_by": "user_id_here"
  }
}
```

### Update Organization
```graphql
mutation UpdateOrganization($id: String!, $updates: organizations_set_input!) {
  update_organizations_by_pk(pk_columns: {id: $id}, _set: $updates) {
    id
    name
    slug
    logo_url
    updated_at
  }
}
```

### Deactivate Organization
```graphql
mutation DeactivateOrganization($id: String!) {
  update_organizations_by_pk(
    pk_columns: {id: $id}
    _set: {is_active: false}
  ) {
    id
    is_active
    updated_at
  }
}
```
