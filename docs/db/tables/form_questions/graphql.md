# Form Questions - GraphQL Examples

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Basic Queries

### Get All Questions for Form
```graphql
query GetFormQuestions($formId: String!) {
  form_questions(where: { form_id: { _eq: $formId } }, order_by: { display_order: asc }) {
    id
    question_key
    question_text
    placeholder
    help_text
    display_order
    is_required
    question_type {
      unique_name
      input_component
      answer_data_type
    }
  }
}
```

### Get by ID
```graphql
query GetFormQuestionById($id: String!) {
  form_questions_by_pk(id: $id) {
    id
    question_key
    question_text
    placeholder
    help_text
    display_order
    is_required
    min_length
    max_length
    min_value
    max_value
    validation_pattern
    question_type {
      id
      unique_name
      name
      input_component
      answer_data_type
      supports_min_length
      supports_max_length
      supports_min_value
      supports_max_value
      supports_pattern
      supports_options
    }
    options(order_by: { display_order: asc }) {
      id
      option_value
      option_label
      is_default
    }
  }
}
```

### Get Questions with Responses
```graphql
query GetQuestionsWithResponses($formId: String!) {
  form_questions(where: { form_id: { _eq: $formId } }, order_by: { display_order: asc }) {
    id
    question_key
    question_text
    responses_aggregate {
      aggregate {
        count
      }
    }
  }
}
```

## Mutations

### Insert
```graphql
mutation InsertFormQuestion($input: form_questions_insert_input!) {
  insert_form_questions_one(object: $input) {
    id
    question_key
    display_order
  }
}
```

**Variables**:
```json
{
  "input": {
    "organization_id": "org_abc123",
    "form_id": "form_xyz789",
    "question_type_id": "qt_textlong",
    "question_key": "problem",
    "question_text": "What problem were you trying to solve?",
    "placeholder": "Describe the challenge you faced...",
    "display_order": 1,
    "is_required": true,
    "min_length": 50,
    "max_length": 500
  }
}
```

### Insert Multiple Questions
```graphql
mutation InsertFormQuestions($inputs: [form_questions_insert_input!]!) {
  insert_form_questions(objects: $inputs) {
    returning {
      id
      question_key
      display_order
    }
  }
}
```

### Update
```graphql
mutation UpdateFormQuestion($id: String!, $changes: form_questions_set_input!) {
  update_form_questions_by_pk(pk_columns: { id: $id }, _set: $changes) {
    id
    question_text
    updated_at
  }
}
```

### Reorder Questions
```graphql
mutation ReorderQuestion($id: String!, $newOrder: smallint!) {
  update_form_questions_by_pk(pk_columns: { id: $id }, _set: { display_order: $newOrder }) {
    id
    display_order
  }
}
```

### Delete
```graphql
mutation DeleteFormQuestion($id: String!) {
  delete_form_questions_by_pk(id: $id) {
    id
  }
}
```
