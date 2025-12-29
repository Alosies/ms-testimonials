# Users GraphQL Examples

**Last Updated**: `2025-12-29-1630` (GMT+5:30)

## Basic Queries

### Get All Users
```graphql
query GetUsers {
  users {
    id
    email
    display_name
    avatar_url
    locale
    timezone
    is_active
    created_at
  }
}
```

### Get User by ID
```graphql
query GetUser($id: String!) {
  users_by_pk(id: $id) {
    id
    email
    email_verified
    display_name
    avatar_url
    locale
    timezone
    is_active
    last_login_at
    created_at
    updated_at
  }
}
```

### Get User by Email
```graphql
query GetUserByEmail($email: String!) {
  users(where: {email: {_eq: $email}}) {
    id
    email
    display_name
    is_active
  }
}
```

## Relationships

### User with Identities
```graphql
query GetUserWithIdentities($id: String!) {
  users_by_pk(id: $id) {
    id
    email
    display_name
    identities {
      id
      provider
      provider_email
      is_primary
      verified_at
    }
  }
}
```

## Common Filters

### Get Active Users
```graphql
query GetActiveUsers {
  users(where: {is_active: {_eq: true}}) {
    id
    email
    display_name
  }
}
```

### Get Users by Locale
```graphql
query GetUsersByLocale($locale: String!) {
  users(where: {locale: {_eq: $locale}}) {
    id
    email
    display_name
    locale
  }
}
```

### Get Recently Active Users
```graphql
query GetRecentlyActiveUsers($since: timestamptz!) {
  users(
    where: {last_login_at: {_gte: $since}}
    order_by: {last_login_at: desc}
  ) {
    id
    email
    display_name
    last_login_at
  }
}
```

## Mutations

### Create User
```graphql
mutation CreateUser($input: users_insert_input!) {
  insert_users_one(object: $input) {
    id
    email
    display_name
    created_at
  }
}
```

**Variables:**
```json
{
  "input": {
    "email": "user@example.com",
    "display_name": "John Doe",
    "locale": "en-US",
    "timezone": "America/New_York"
  }
}
```

### Update User
```graphql
mutation UpdateUser($id: String!, $updates: users_set_input!) {
  update_users_by_pk(pk_columns: {id: $id}, _set: $updates) {
    id
    email
    display_name
    updated_at
  }
}
```

### Soft Delete User
```graphql
mutation DeactivateUser($id: String!) {
  update_users_by_pk(
    pk_columns: {id: $id}
    _set: {is_active: false}
  ) {
    id
    is_active
    updated_at
  }
}
```

### Update Last Login
```graphql
mutation UpdateLastLogin($id: String!) {
  update_users_by_pk(
    pk_columns: {id: $id}
    _set: {last_login_at: "now()"}
  ) {
    id
    last_login_at
  }
}
```
