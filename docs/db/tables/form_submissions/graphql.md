# Form Submissions - GraphQL Examples

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Basic Queries

### Get All Submissions for Form
```graphql
query GetFormSubmissions($formId: String!) {
  form_submissions(where: { form_id: { _eq: $formId } }, order_by: { submitted_at: desc }) {
    id
    submitter_name
    submitter_email
    submitter_company
    submitted_at
  }
}
```

### Get by ID with Responses
```graphql
query GetSubmissionById($id: String!) {
  form_submissions_by_pk(id: $id) {
    id
    submitter_name
    submitter_email
    submitter_title
    submitter_company
    submitter_avatar_url
    submitter_linkedin_url
    submitter_twitter_url
    submitted_at
    form {
      id
      name
      product_name
    }
    responses {
      id
      answer_text
      answer_integer
      answer_boolean
      question {
        question_key
        question_text
        question_type {
          answer_data_type
        }
      }
    }
    testimonials {
      id
      status
      content
    }
  }
}
```

### Get Recent Submissions
```graphql
query GetRecentSubmissions($limit: Int!) {
  form_submissions(order_by: { submitted_at: desc }, limit: $limit) {
    id
    submitter_name
    submitter_company
    submitted_at
    form {
      name
    }
  }
}
```

## Mutations

### Insert (Anonymous - Public Form Submission)
```graphql
mutation SubmitForm($input: form_submissions_insert_input!) {
  insert_form_submissions_one(object: $input) {
    id
    submitted_at
  }
}
```

**Variables**:
```json
{
  "input": {
    "organization_id": "org_abc123",
    "form_id": "form_xyz789",
    "submitter_name": "Jane Smith",
    "submitter_email": "jane@example.com",
    "submitter_title": "Product Manager",
    "submitter_company": "Acme Inc",
    "submitter_linkedin_url": "https://linkedin.com/in/janesmith"
  }
}
```

### Update (Admin Edit)
```graphql
mutation UpdateSubmission($id: String!, $changes: form_submissions_set_input!) {
  update_form_submissions_by_pk(pk_columns: { id: $id }, _set: $changes) {
    id
    submitter_name
    submitter_company
    updated_at
  }
}
```

### Delete
```graphql
mutation DeleteSubmission($id: String!) {
  delete_form_submissions_by_pk(id: $id) {
    id
  }
}
```

## Notes

- Anonymous users can INSERT submissions for active forms
- Anonymous users CANNOT read submissions (privacy)
- Organization members can read/update/delete within their org
