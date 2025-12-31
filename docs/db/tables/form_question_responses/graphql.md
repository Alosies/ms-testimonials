# Form Question Responses - GraphQL Examples

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Basic Queries

### Get Responses for Submission
```graphql
query GetSubmissionResponses($submissionId: String!) {
  form_question_responses(where: { submission_id: { _eq: $submissionId } }) {
    id
    answer_text
    answer_integer
    answer_boolean
    answer_json
    answer_url
    answered_at
    question {
      question_key
      question_text
      question_type {
        unique_name
        answer_data_type
      }
    }
  }
}
```

### Get by ID
```graphql
query GetResponseById($id: String!) {
  form_question_responses_by_pk(id: $id) {
    id
    answer_text
    answer_integer
    answer_boolean
    answer_json
    answer_url
    answered_at
    submission {
      id
      submitter_name
    }
    question {
      question_key
      question_text
    }
  }
}
```

### Get Rating Distribution for Question
```graphql
query GetRatingDistribution($questionId: String!) {
  form_question_responses(where: { question_id: { _eq: $questionId }, answer_integer: { _is_null: false } }) {
    answer_integer
  }
}
```

### Aggregate Ratings
```graphql
query GetAverageRating($questionId: String!) {
  form_question_responses_aggregate(where: { question_id: { _eq: $questionId }, answer_integer: { _is_null: false } }) {
    aggregate {
      avg {
        answer_integer
      }
      count
    }
  }
}
```

## Mutations

### Insert (Anonymous - Form Submission)
```graphql
mutation InsertResponse($input: form_question_responses_insert_input!) {
  insert_form_question_responses_one(object: $input) {
    id
  }
}
```

**Variables (Text Response)**:
```json
{
  "input": {
    "organization_id": "org_abc123",
    "submission_id": "sub_xyz789",
    "question_id": "q_problem",
    "answer_text": "We struggled with collecting quality customer feedback..."
  }
}
```

**Variables (Rating Response)**:
```json
{
  "input": {
    "organization_id": "org_abc123",
    "submission_id": "sub_xyz789",
    "question_id": "q_rating",
    "answer_integer": 5
  }
}
```

**Variables (Multiple Choice Response)**:
```json
{
  "input": {
    "organization_id": "org_abc123",
    "submission_id": "sub_xyz789",
    "question_id": "q_features",
    "answer_json": ["feature_a", "feature_c", "feature_d"]
  }
}
```

### Insert Multiple Responses
```graphql
mutation InsertResponses($inputs: [form_question_responses_insert_input!]!) {
  insert_form_question_responses(objects: $inputs) {
    returning {
      id
      question_id
    }
  }
}
```

### Update
```graphql
mutation UpdateResponse($id: String!, $changes: form_question_responses_set_input!) {
  update_form_question_responses_by_pk(pk_columns: { id: $id }, _set: $changes) {
    id
    answer_text
    updated_at
  }
}
```

### Delete
```graphql
mutation DeleteResponse($id: String!) {
  delete_form_question_responses_by_pk(id: $id) {
    id
  }
}
```
