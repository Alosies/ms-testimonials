# Form Steps - GraphQL Examples

**Last Updated**: 2026-01-12-1055 (GMT+5:30)

## Basic Queries

### Get All Steps for Flow
```graphql
query GetFlowSteps($flowId: String!) {
  form_steps(
    where: { flow_id: { _eq: $flowId }, is_active: { _eq: true } }
    order_by: { step_order: asc }
  ) {
    id
    step_type
    step_order
    content
    tips
  }
}
```

### Get Step by ID
```graphql
query GetStepById($id: String!) {
  form_steps_by_pk(id: $id) {
    id
    flow_id
    step_type
    step_order
    content
    tips
    is_active
  }
}
```

### Get Steps with Questions
```graphql
query GetStepsWithQuestions($flowId: String!) {
  form_steps(
    where: { flow_id: { _eq: $flowId }, is_active: { _eq: true } }
    order_by: { step_order: asc }
  ) {
    id
    step_type
    step_order
    content
    questions {
      id
      question_text
      question_type {
        unique_name
        input_component
      }
    }
  }
}
```

## Mutations

### Insert Step
```graphql
mutation InsertStep($input: form_steps_insert_input!) {
  insert_form_steps_one(object: $input) {
    id
    step_type
    step_order
  }
}

# Variables:
# {
#   "input": {
#     "flow_id": "flow123",
#     "organization_id": "org123",
#     "step_type": "welcome",
#     "step_order": 0,
#     "content": {"title": "Welcome!", "subtitle": "Share your experience"}
#   }
# }
```

### Update Step
```graphql
mutation UpdateStep($id: String!, $changes: form_steps_set_input!) {
  update_form_steps_by_pk(pk_columns: { id: $id }, _set: $changes) {
    id
    content
    updated_at
  }
}
```

### Reorder Steps
```graphql
mutation ReorderSteps($updates: [form_steps_updates!]!) {
  update_form_steps_many(updates: $updates) {
    affected_rows
  }
}
```

### Delete Step (Soft Delete)
```graphql
mutation DeactivateStep($id: String!) {
  update_form_steps_by_pk(
    pk_columns: { id: $id }
    _set: { is_active: false }
  ) {
    id
    is_active
  }
}
```

### Delete Step (Hard Delete)
```graphql
mutation DeleteStep($id: String!) {
  delete_form_steps_by_pk(id: $id) {
    id
  }
}
```

## With Relationships

### Get Full Form Structure
```graphql
query GetFormStructure($formId: String!) {
  forms_by_pk(id: $formId) {
    id
    name
    flows(order_by: { display_order: asc }) {
      id
      name
      is_primary
      steps(order_by: { step_order: asc }) {
        id
        step_type
        step_order
        content
        questions {
          id
          question_text
          question_key
        }
      }
    }
  }
}
```
