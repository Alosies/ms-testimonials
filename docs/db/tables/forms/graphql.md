# Forms - GraphQL Examples

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Basic Queries

### Get All Forms
```graphql
query GetAllForms {
  forms(order_by: { created_at: desc }) {
    id
    name
    slug
    product_name
    is_active
    created_at
  }
}
```

### Get by ID
```graphql
query GetFormById($id: String!) {
  forms_by_pk(id: $id) {
    id
    name
    slug
    product_name
    product_description
    settings
    is_active
    created_at
    updated_at
    creator {
      id
      display_name
    }
    questions(order_by: { display_order: asc }) {
      id
      question_text
      question_type {
        unique_name
      }
    }
  }
}
```

### Get Form by Slug (Public)
```graphql
query GetFormBySlug($orgId: String!, $slug: String!) {
  forms(where: { organization_id: { _eq: $orgId }, slug: { _eq: $slug }, is_active: { _eq: true } }) {
    id
    name
    slug
    product_name
    product_description
    settings
    questions(where: { is_active: { _eq: true } }, order_by: { display_order: asc }) {
      id
      question_key
      question_text
      placeholder
      help_text
      is_required
      min_length
      max_length
      min_value
      max_value
      question_type {
        unique_name
        input_component
        answer_data_type
      }
      options(order_by: { display_order: asc }) {
        id
        option_value
        option_label
        is_default
      }
    }
  }
}
```

## Mutations

### Insert
```graphql
mutation InsertForm($input: forms_insert_input!) {
  insert_forms_one(object: $input) {
    id
    slug
  }
}
```

**Variables**:
```json
{
  "input": {
    "organization_id": "org_abc123",
    "created_by": "user_xyz789",
    "name": "Product Feedback",
    "slug": "product-feedback",
    "product_name": "Acme Widget",
    "product_description": "A productivity tool for teams"
  }
}
```

### Update
```graphql
mutation UpdateForm($id: String!, $changes: forms_set_input!) {
  update_forms_by_pk(pk_columns: { id: $id }, _set: $changes) {
    id
    name
    updated_at
  }
}
```

### Delete (Soft Delete)
```graphql
mutation DeactivateForm($id: String!) {
  update_forms_by_pk(pk_columns: { id: $id }, _set: { is_active: false }) {
    id
    is_active
  }
}
```

### Hard Delete
```graphql
mutation DeleteForm($id: String!) {
  delete_forms_by_pk(id: $id) {
    id
  }
}
```
