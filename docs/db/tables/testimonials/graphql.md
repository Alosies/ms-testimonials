# Testimonials - GraphQL Examples

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Basic Queries

### Get All Testimonials
```graphql
query GetAllTestimonials {
  testimonials(order_by: { created_at: desc }) {
    id
    status
    content
    rating
    customer_name
    customer_company
    source
    created_at
  }
}
```

### Get by ID
```graphql
query GetTestimonialById($id: String!) {
  testimonials_by_pk(id: $id) {
    id
    status
    content
    rating
    customer_name
    customer_email
    customer_title
    customer_company
    customer_avatar_url
    customer_linkedin_url
    customer_twitter_url
    source
    source_metadata
    approved_by
    approved_at
    rejected_by
    rejected_at
    rejection_reason
    created_at
    submission {
      id
      form {
        id
        name
        product_name
      }
      responses {
        question {
          question_key
        }
        answer_text
      }
    }
  }
}
```

### Get Approved Testimonials (Public)
```graphql
query GetApprovedTestimonials {
  testimonials(where: { status: { _eq: "approved" } }, order_by: { created_at: desc }) {
    id
    content
    rating
    customer_name
    customer_title
    customer_company
    customer_avatar_url
    customer_linkedin_url
    customer_twitter_url
    created_at
  }
}
```

### Get Pending Testimonials
```graphql
query GetPendingTestimonials {
  testimonials(where: { status: { _eq: "pending" } }, order_by: { created_at: desc }) {
    id
    content
    rating
    customer_name
    customer_company
    created_at
    submission {
      form {
        name
      }
    }
  }
}
```

### Get Testimonials by Status with Counts
```graphql
query GetTestimonialsByStatus {
  pending: testimonials_aggregate(where: { status: { _eq: "pending" } }) {
    aggregate { count }
  }
  approved: testimonials_aggregate(where: { status: { _eq: "approved" } }) {
    aggregate { count }
  }
  rejected: testimonials_aggregate(where: { status: { _eq: "rejected" } }) {
    aggregate { count }
  }
}
```

## Mutations

### Insert (From Form Submission)
```graphql
mutation CreateTestimonialFromSubmission($input: testimonials_insert_input!) {
  insert_testimonials_one(object: $input) {
    id
    status
  }
}
```

**Variables**:
```json
{
  "input": {
    "organization_id": "org_abc123",
    "submission_id": "sub_xyz789",
    "content": "This product transformed our workflow...",
    "rating": 5,
    "customer_name": "Jane Smith",
    "customer_email": "jane@example.com",
    "customer_title": "Product Manager",
    "customer_company": "Acme Inc",
    "source": "form"
  }
}
```

### Insert (Manual)
```graphql
mutation CreateManualTestimonial($input: testimonials_insert_input!) {
  insert_testimonials_one(object: $input) {
    id
    status
  }
}
```

**Variables**:
```json
{
  "input": {
    "organization_id": "org_abc123",
    "content": "Great product! Highly recommend.",
    "rating": 5,
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_company": "Tech Corp",
    "source": "manual"
  }
}
```

### Approve Testimonial
```graphql
mutation ApproveTestimonial($id: String!, $approvedBy: String!) {
  update_testimonials_by_pk(
    pk_columns: { id: $id }
    _set: { status: "approved", approved_by: $approvedBy, approved_at: "now()" }
  ) {
    id
    status
    approved_at
  }
}
```

### Reject Testimonial
```graphql
mutation RejectTestimonial($id: String!, $rejectedBy: String!, $reason: String) {
  update_testimonials_by_pk(
    pk_columns: { id: $id }
    _set: { status: "rejected", rejected_by: $rejectedBy, rejected_at: "now()", rejection_reason: $reason }
  ) {
    id
    status
    rejected_at
  }
}
```

### Update Content
```graphql
mutation UpdateTestimonialContent($id: String!, $content: String!) {
  update_testimonials_by_pk(pk_columns: { id: $id }, _set: { content: $content }) {
    id
    content
    updated_at
  }
}
```

### Delete
```graphql
mutation DeleteTestimonial($id: String!) {
  delete_testimonials_by_pk(id: $id) {
    id
  }
}
```
