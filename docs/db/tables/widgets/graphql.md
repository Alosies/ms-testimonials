# Widgets - GraphQL Examples

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Basic Queries

### Get All Widgets
```graphql
query GetAllWidgets {
  widgets(order_by: { created_at: desc }) {
    id
    name
    type
    theme
    is_active
    created_at
    testimonial_placements_aggregate {
      aggregate {
        count
      }
    }
  }
}
```

### Get by ID
```graphql
query GetWidgetById($id: String!) {
  widgets_by_pk(id: $id) {
    id
    name
    type
    theme
    show_ratings
    show_dates
    show_company
    show_avatar
    max_display
    settings
    is_active
    created_at
    creator {
      display_name
    }
  }
}
```

### Get Widget with Testimonials (Public - for Embed)
```graphql
query GetWidgetForEmbed($id: String!) {
  widgets_by_pk(id: $id) {
    id
    name
    type
    theme
    show_ratings
    show_dates
    show_company
    show_avatar
    max_display
    settings
    testimonial_placements(order_by: { display_order: asc }) {
      display_order
      is_featured
      testimonial {
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
  }
}
```

### Get Widgets by Type
```graphql
query GetWidgetsByType($type: String!) {
  widgets(where: { type: { _eq: $type }, is_active: { _eq: true } }) {
    id
    name
    theme
    testimonial_placements_aggregate {
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
mutation CreateWidget($input: widgets_insert_input!) {
  insert_widgets_one(object: $input) {
    id
    name
    type
  }
}
```

**Variables (Wall of Love)**:
```json
{
  "input": {
    "organization_id": "org_abc123",
    "created_by": "user_xyz789",
    "name": "Homepage Wall",
    "type": "wall_of_love",
    "theme": "light",
    "show_ratings": true,
    "show_dates": false,
    "show_company": true,
    "show_avatar": true,
    "settings": { "columns": 3, "gap": 16 }
  }
}
```

**Variables (Carousel)**:
```json
{
  "input": {
    "organization_id": "org_abc123",
    "created_by": "user_xyz789",
    "name": "Footer Carousel",
    "type": "carousel",
    "theme": "dark",
    "max_display": 10,
    "settings": { "autoplay": true, "interval": 5000 }
  }
}
```

### Update
```graphql
mutation UpdateWidget($id: String!, $changes: widgets_set_input!) {
  update_widgets_by_pk(pk_columns: { id: $id }, _set: $changes) {
    id
    name
    theme
    updated_at
  }
}
```

### Update Settings
```graphql
mutation UpdateWidgetSettings($id: String!, $settings: jsonb!) {
  update_widgets_by_pk(pk_columns: { id: $id }, _set: { settings: $settings }) {
    id
    settings
  }
}
```

### Deactivate Widget
```graphql
mutation DeactivateWidget($id: String!) {
  update_widgets_by_pk(pk_columns: { id: $id }, _set: { is_active: false }) {
    id
    is_active
  }
}
```

### Delete
```graphql
mutation DeleteWidget($id: String!) {
  delete_widgets_by_pk(id: $id) {
    id
  }
}
```
