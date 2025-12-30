# Organization Roles GraphQL Examples

**Last Updated**: `2025-12-30-1200` (GMT+5:30)

## Basic Queries

### Get User's Organizations
```graphql
query GetUserOrganizations($userId: String!) {
  organization_roles(
    where: {user_id: {_eq: $userId}, is_active: {_eq: true}}
  ) {
    id
    organization_id
    role_id
    is_default_org
    joined_at
  }
}
```

### Get Organization Members
```graphql
query GetOrganizationMembers($orgId: String!) {
  organization_roles(
    where: {organization_id: {_eq: $orgId}, is_active: {_eq: true}}
  ) {
    id
    user_id
    role_id
    is_default_org
    invited_by
    invited_at
    joined_at
  }
}
```

### Get Role Assignment by ID
```graphql
query GetRoleAssignment($id: String!) {
  organization_roles_by_pk(id: $id) {
    id
    user_id
    organization_id
    role_id
    is_default_org
    is_active
    invited_by
    invited_at
    joined_at
    created_at
    updated_at
  }
}
```

### Get User's Default Organization
```graphql
query GetDefaultOrganization($userId: String!) {
  organization_roles(
    where: {
      user_id: {_eq: $userId},
      is_default_org: {_eq: true},
      is_active: {_eq: true}
    }
  ) {
    id
    organization_id
    role_id
  }
}
```

## Relationship Queries

### Members with User and Role Details
```graphql
query GetMembersWithDetails($orgId: String!) {
  organization_roles(
    where: {organization_id: {_eq: $orgId}, is_active: {_eq: true}}
  ) {
    id
    user {
      id
      email
      display_name
      avatar_url
    }
    role {
      id
      unique_name
      name
      can_manage_forms
      can_manage_testimonials
      can_manage_widgets
      can_manage_members
      can_manage_billing
    }
    is_default_org
    joined_at
  }
}
```

### User's Organizations with Full Details
```graphql
query GetUserOrgsWithDetails($userId: String!) {
  organization_roles(
    where: {user_id: {_eq: $userId}, is_active: {_eq: true}}
  ) {
    id
    is_default_org
    organization {
      id
      name
      slug
      logo_url
    }
    role {
      id
      unique_name
      name
    }
  }
}
```

## Mutations

### Add Member to Organization
```graphql
mutation AddMember($input: organization_roles_insert_input!) {
  insert_organization_roles_one(object: $input) {
    id
    user_id
    organization_id
    role_id
    created_at
  }
}
```

**Variables:**
```json
{
  "input": {
    "user_id": "user_id_here",
    "organization_id": "org_id_here",
    "role_id": "role_id_here",
    "invited_by": "inviter_user_id",
    "invited_at": "2025-01-01T00:00:00Z"
  }
}
```

### Change Member Role
```graphql
mutation ChangeMemberRole($id: String!, $roleId: String!) {
  update_organization_roles_by_pk(
    pk_columns: {id: $id}
    _set: {role_id: $roleId}
  ) {
    id
    role_id
    updated_at
  }
}
```

### Set Default Organization
```graphql
mutation SetDefaultOrg($id: String!) {
  update_organization_roles_by_pk(
    pk_columns: {id: $id}
    _set: {is_default_org: true}
  ) {
    id
    is_default_org
    updated_at
  }
}
```

### Remove Member (Soft Delete)
```graphql
mutation RemoveMember($id: String!) {
  update_organization_roles_by_pk(
    pk_columns: {id: $id}
    _set: {is_active: false}
  ) {
    id
    is_active
    updated_at
  }
}
```
