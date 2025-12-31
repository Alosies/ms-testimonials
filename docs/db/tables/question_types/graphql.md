# Question Types - GraphQL Examples

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Basic Queries

### Get All Active Types
```graphql
query GetAllQuestionTypes {
  question_types(where: { is_active: { _eq: true } }, order_by: { display_order: asc }) {
    id
    unique_name
    name
    category
    input_component
    answer_data_type
  }
}
```

### Get by ID
```graphql
query GetQuestionTypeById($id: String!) {
  question_types_by_pk(id: $id) {
    id
    unique_name
    name
    category
    description
    input_component
    answer_data_type
    supports_min_length
    supports_max_length
    supports_min_value
    supports_max_value
    supports_pattern
    supports_options
    default_min_value
    default_max_value
  }
}
```

### Get Types by Category
```graphql
query GetQuestionTypesByCategory($category: String!) {
  question_types(where: { category: { _eq: $category }, is_active: { _eq: true } }) {
    id
    unique_name
    name
    description
    input_component
  }
}
```

### Get Type by Unique Name
```graphql
query GetQuestionTypeByUniqueName($uniqueName: String!) {
  question_types(where: { unique_name: { _eq: $uniqueName } }) {
    id
    unique_name
    name
    answer_data_type
    supports_min_length
    supports_max_length
    supports_min_value
    supports_max_value
    default_min_value
    default_max_value
  }
}
```

## Notes

- This is a **read-only seed table** - no mutations should be performed via GraphQL
- Anonymous users can only see: id, unique_name, name, category, answer_data_type
- Authenticated users can see all columns
