# Roles GraphQL Examples

**Last Updated**: `2025-12-29-1630` (GMT+5:30)

## Basic Queries

### Get All Roles
```graphql
query GetRoles {
  roles {
    id
    unique_name
    name
    description
    can_manage_forms
    can_manage_testimonials
    can_manage_widgets
    can_manage_members
    can_manage_billing
    can_delete_org
    is_viewer
    is_system_role
  }
}
```

### Get Role by ID
```graphql
query GetRole($id: String!) {
  roles_by_pk(id: $id) {
    id
    unique_name
    name
    description
    can_manage_forms
    can_manage_testimonials
    can_manage_widgets
    can_manage_members
    can_manage_billing
    can_delete_org
    is_viewer
    is_system_role
    created_at
    updated_at
  }
}
```

### Get Role by Unique Name
```graphql
query GetRoleByUniqueName($uniqueName: String!) {
  roles(where: {unique_name: {_eq: $uniqueName}}) {
    id
    unique_name
    name
    description
    can_manage_forms
    can_manage_testimonials
    can_manage_widgets
    can_manage_members
    can_manage_billing
    can_delete_org
    is_viewer
  }
}
```

## Common Filters

### Get System Roles Only
```graphql
query GetSystemRoles {
  roles(where: {is_system_role: {_eq: true}}) {
    id
    unique_name
    name
    description
  }
}
```

### Get Custom Roles Only
```graphql
query GetCustomRoles {
  roles(where: {is_system_role: {_eq: false}}) {
    id
    unique_name
    name
    description
  }
}
```

### Get Roles with Specific Permission
```graphql
query GetRolesWithBillingAccess {
  roles(where: {can_manage_billing: {_eq: true}}) {
    id
    unique_name
    name
  }
}
```

### Get Non-Viewer Roles
```graphql
query GetNonViewerRoles {
  roles(where: {is_viewer: {_eq: false}}) {
    id
    unique_name
    name
    can_manage_forms
    can_manage_testimonials
    can_manage_widgets
  }
}
```

## Permission Checks

### Check if Role Can Manage Forms
```graphql
query CanManageForms($roleId: String!) {
  roles_by_pk(id: $roleId) {
    can_manage_forms
  }
}
```

### Get All Permissions for Role
```graphql
query GetRolePermissions($uniqueName: String!) {
  roles(where: {unique_name: {_eq: $uniqueName}}) {
    unique_name
    name
    can_manage_forms
    can_manage_testimonials
    can_manage_widgets
    can_manage_members
    can_manage_billing
    can_delete_org
    is_viewer
  }
}
```

## Mutations

### Create Custom Role
```graphql
mutation CreateRole($input: roles_insert_input!) {
  insert_roles_one(object: $input) {
    id
    unique_name
    name
    created_at
  }
}
```

**Variables:**
```json
{
  "input": {
    "unique_name": "editor",
    "name": "Editor",
    "description": "Can edit content but not manage members",
    "can_manage_forms": true,
    "can_manage_testimonials": true,
    "can_manage_widgets": true,
    "can_manage_members": false,
    "can_manage_billing": false,
    "can_delete_org": false,
    "is_viewer": false,
    "is_system_role": false
  }
}
```

### Update Role Permissions
```graphql
mutation UpdateRolePermissions($id: String!, $updates: roles_set_input!) {
  update_roles_by_pk(pk_columns: {id: $id}, _set: $updates) {
    id
    unique_name
    name
    can_manage_forms
    can_manage_testimonials
    can_manage_widgets
    updated_at
  }
}
```

### Delete Custom Role
```graphql
mutation DeleteRole($id: String!) {
  delete_roles_by_pk(id: $id) {
    id
    unique_name
  }
}
```

**Note**: System roles (is_system_role = true) should not be deleted. Application logic should prevent this.

## Usage Pattern

### Lookup Role ID by Unique Name
When assigning roles, first lookup the role ID:

```graphql
query LookupRoleId($uniqueName: String!) {
  roles(where: {unique_name: {_eq: $uniqueName}}, limit: 1) {
    id
  }
}
```

Then use the ID for assignment (in organization_roles table).
