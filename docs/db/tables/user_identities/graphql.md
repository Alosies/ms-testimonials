# User Identities GraphQL Examples

**Last Updated**: `2025-12-29-1630` (GMT+5:30)

## Basic Queries

### Get All Identities for User
```graphql
query GetUserIdentities($userId: String!) {
  user_identities(where: {user_id: {_eq: $userId}}) {
    id
    provider
    provider_email
    is_primary
    verified_at
    created_at
  }
}
```

### Get Identity by ID
```graphql
query GetIdentity($id: String!) {
  user_identities_by_pk(id: $id) {
    id
    user_id
    provider
    provider_user_id
    provider_email
    provider_metadata
    is_primary
    verified_at
    created_at
    updated_at
  }
}
```

### Find Identity by Provider
```graphql
query FindIdentityByProvider($provider: String!, $providerUserId: String!) {
  user_identities(
    where: {
      provider: {_eq: $provider}
      provider_user_id: {_eq: $providerUserId}
    }
  ) {
    id
    user_id
    provider_email
    is_primary
    user {
      id
      email
      display_name
    }
  }
}
```

## Relationships

### Identity with User Details
```graphql
query GetIdentityWithUser($id: String!) {
  user_identities_by_pk(id: $id) {
    id
    provider
    provider_email
    is_primary
    user {
      id
      email
      display_name
      is_active
    }
  }
}
```

## Common Filters

### Get Primary Identity for User
```graphql
query GetPrimaryIdentity($userId: String!) {
  user_identities(
    where: {
      user_id: {_eq: $userId}
      is_primary: {_eq: true}
    }
  ) {
    id
    provider
    provider_email
    verified_at
  }
}
```

### Get Verified Identities
```graphql
query GetVerifiedIdentities($userId: String!) {
  user_identities(
    where: {
      user_id: {_eq: $userId}
      verified_at: {_is_null: false}
    }
  ) {
    id
    provider
    provider_email
    verified_at
  }
}
```

### Get Identities by Provider Type
```graphql
query GetIdentitiesByProvider($provider: String!) {
  user_identities(where: {provider: {_eq: $provider}}) {
    id
    user_id
    provider_email
    is_primary
    created_at
  }
}
```

## Mutations

### Link New Identity
```graphql
mutation LinkIdentity($input: user_identities_insert_input!) {
  insert_user_identities_one(object: $input) {
    id
    provider
    provider_email
    is_primary
    created_at
  }
}
```

**Variables:**
```json
{
  "input": {
    "user_id": "abc123xyz789",
    "provider": "google",
    "provider_user_id": "google-oauth-id-123",
    "provider_email": "user@gmail.com",
    "provider_metadata": {"access_token": "...", "refresh_token": "..."},
    "is_primary": false
  }
}
```

### Set Primary Identity
```graphql
mutation SetPrimaryIdentity($userId: String!, $identityId: String!) {
  # First, unset all primaries for user
  update_user_identities(
    where: {user_id: {_eq: $userId}}
    _set: {is_primary: false}
  ) {
    affected_rows
  }
  # Then set the new primary
  update_user_identities_by_pk(
    pk_columns: {id: $identityId}
    _set: {is_primary: true}
  ) {
    id
    is_primary
  }
}
```

### Update Provider Metadata
```graphql
mutation UpdateProviderMetadata($id: String!, $metadata: jsonb!) {
  update_user_identities_by_pk(
    pk_columns: {id: $id}
    _set: {provider_metadata: $metadata}
  ) {
    id
    provider_metadata
    updated_at
  }
}
```

### Unlink Identity
```graphql
mutation UnlinkIdentity($id: String!) {
  delete_user_identities_by_pk(id: $id) {
    id
    provider
  }
}
```

### Mark Identity as Verified
```graphql
mutation VerifyIdentity($id: String!) {
  update_user_identities_by_pk(
    pk_columns: {id: $id}
    _set: {verified_at: "now()"}
  ) {
    id
    verified_at
  }
}
```
