# Flows - GraphQL Examples

**Last Updated**: 2026-01-12-1050 (GMT+5:30)

## Basic Queries

### Get All Flows for Form
```graphql
query GetFormFlows($formId: String!) {
  flows(
    where: { form_id: { _eq: $formId } }
    order_by: { display_order: asc }
  ) {
    id
    name
    flow_type
    is_primary
    display_order
  }
}
```

### Get Flow by ID
```graphql
query GetFlowById($id: String!) {
  flows_by_pk(id: $id) {
    id
    name
    flow_type
    is_primary
    branch_question_id
    branch_operator
    branch_value
  }
}
```

### Get Primary Flow for Form
```graphql
query GetPrimaryFlow($formId: String!) {
  flows(
    where: { form_id: { _eq: $formId }, is_primary: { _eq: true } }
    limit: 1
  ) {
    id
    name
    steps(order_by: { step_order: asc }) {
      id
      step_type
      step_order
    }
  }
}
```

## Mutations

### Insert Primary Flow
```graphql
mutation InsertPrimaryFlow($input: flows_insert_input!) {
  insert_flows_one(object: $input) {
    id
    name
    is_primary
  }
}

# Variables:
# {
#   "input": {
#     "form_id": "form123",
#     "organization_id": "org123",
#     "name": "Main Flow",
#     "flow_type": "shared",
#     "is_primary": true,
#     "display_order": 0
#   }
# }
```

### Insert Branch Flow
```graphql
mutation InsertBranchFlow($input: flows_insert_input!) {
  insert_flows_one(object: $input) {
    id
    name
    branch_question_id
    branch_operator
  }
}

# Variables:
# {
#   "input": {
#     "form_id": "form123",
#     "organization_id": "org123",
#     "name": "Testimonial Flow",
#     "flow_type": "branch",
#     "is_primary": false,
#     "branch_question_id": "question_rating",
#     "branch_field": "answer_integer",
#     "branch_operator": "greater_than_or_equal_to",
#     "branch_value": {"type": "number", "value": 4},
#     "display_order": 1
#   }
# }
```

### Update Flow
```graphql
mutation UpdateFlow($id: String!, $changes: flows_set_input!) {
  update_flows_by_pk(pk_columns: { id: $id }, _set: $changes) {
    id
    name
    updated_at
  }
}
```

### Delete Flow
```graphql
mutation DeleteFlow($id: String!) {
  delete_flows_by_pk(id: $id) {
    id
  }
}
```

## With Relationships

### Get Flows with Steps
```graphql
query GetFlowsWithSteps($formId: String!) {
  flows(
    where: { form_id: { _eq: $formId } }
    order_by: { display_order: asc }
  ) {
    id
    name
    is_primary
    steps(order_by: { step_order: asc }) {
      id
      step_type
      step_order
      questions {
        id
        question_text
      }
    }
  }
}
```
