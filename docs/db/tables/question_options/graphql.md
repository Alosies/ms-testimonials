# Question Options - GraphQL Examples

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Basic Queries

### Get Options for Question
```graphql
query GetQuestionOptions($questionId: String!) {
  question_options(where: { question_id: { _eq: $questionId }, is_active: { _eq: true } }, order_by: { display_order: asc }) {
    id
    option_value
    option_label
    display_order
    is_default
  }
}
```

### Get by ID
```graphql
query GetQuestionOptionById($id: String!) {
  question_options_by_pk(id: $id) {
    id
    option_value
    option_label
    display_order
    is_default
    is_active
    question {
      id
      question_text
      question_type {
        unique_name
      }
    }
  }
}
```

## Mutations

### Insert Single Option
```graphql
mutation InsertQuestionOption($input: question_options_insert_input!) {
  insert_question_options_one(object: $input) {
    id
    option_value
    option_label
    display_order
  }
}
```

**Variables**:
```json
{
  "input": {
    "organization_id": "org_abc123",
    "question_id": "q_xyz789",
    "option_value": "very_satisfied",
    "option_label": "Very Satisfied",
    "display_order": 1,
    "is_default": false,
    "created_by": "user_123"
  }
}
```

### Insert Multiple Options
```graphql
mutation InsertQuestionOptions($inputs: [question_options_insert_input!]!) {
  insert_question_options(objects: $inputs) {
    returning {
      id
      option_value
      option_label
      display_order
    }
  }
}
```

**Variables**:
```json
{
  "inputs": [
    { "organization_id": "org_abc", "question_id": "q_xyz", "option_value": "yes", "option_label": "Yes", "display_order": 1, "created_by": "user_123" },
    { "organization_id": "org_abc", "question_id": "q_xyz", "option_value": "no", "option_label": "No", "display_order": 2, "created_by": "user_123" },
    { "organization_id": "org_abc", "question_id": "q_xyz", "option_value": "maybe", "option_label": "Maybe", "display_order": 3, "created_by": "user_123" }
  ]
}
```

### Update
```graphql
mutation UpdateQuestionOption($id: String!, $changes: question_options_set_input!) {
  update_question_options_by_pk(pk_columns: { id: $id }, _set: $changes) {
    id
    option_label
  }
}
```

### Delete (Soft Delete)
```graphql
mutation DeactivateQuestionOption($id: String!) {
  update_question_options_by_pk(pk_columns: { id: $id }, _set: { is_active: false }) {
    id
    is_active
  }
}
```

### Delete
```graphql
mutation DeleteQuestionOption($id: String!) {
  delete_question_options_by_pk(id: $id) {
    id
  }
}
```
