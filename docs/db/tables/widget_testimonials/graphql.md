# Widget Testimonials - GraphQL Examples

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Basic Queries

### Get Testimonials for Widget
```graphql
query GetWidgetTestimonials($widgetId: String!) {
  widget_testimonials(where: { widget_id: { _eq: $widgetId } }, order_by: { display_order: asc }) {
    id
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
    }
  }
}
```

### Get by ID
```graphql
query GetWidgetTestimonialById($id: String!) {
  widget_testimonials_by_pk(id: $id) {
    id
    display_order
    is_featured
    added_at
    widget {
      id
      name
      type
    }
    testimonial {
      id
      content
      customer_name
    }
    added_by_user {
      display_name
    }
  }
}
```

### Get Widgets Containing Testimonial
```graphql
query GetWidgetsForTestimonial($testimonialId: String!) {
  widget_testimonials(where: { testimonial_id: { _eq: $testimonialId } }) {
    id
    display_order
    is_featured
    widget {
      id
      name
      type
      is_active
    }
  }
}
```

### Get Featured Testimonials for Widget
```graphql
query GetFeaturedTestimonials($widgetId: String!) {
  widget_testimonials(where: { widget_id: { _eq: $widgetId }, is_featured: { _eq: true } }, order_by: { display_order: asc }) {
    id
    testimonial {
      id
      content
      rating
      customer_name
      customer_company
    }
  }
}
```

## Mutations

### Add Testimonial to Widget
```graphql
mutation AddTestimonialToWidget($input: widget_testimonials_insert_input!) {
  insert_widget_testimonials_one(object: $input) {
    id
    display_order
  }
}
```

**Variables**:
```json
{
  "input": {
    "organization_id": "org_abc123",
    "widget_id": "widget_xyz789",
    "testimonial_id": "test_abc123",
    "display_order": 1,
    "is_featured": false,
    "added_by": "user_123"
  }
}
```

### Add Multiple Testimonials
```graphql
mutation AddTestimonialsToWidget($inputs: [widget_testimonials_insert_input!]!) {
  insert_widget_testimonials(objects: $inputs) {
    returning {
      id
      testimonial_id
      display_order
    }
  }
}
```

### Update Order
```graphql
mutation UpdateTestimonialOrder($id: String!, $newOrder: smallint!) {
  update_widget_testimonials_by_pk(pk_columns: { id: $id }, _set: { display_order: $newOrder }) {
    id
    display_order
  }
}
```

### Toggle Featured
```graphql
mutation ToggleFeatured($id: String!, $isFeatured: Boolean!) {
  update_widget_testimonials_by_pk(pk_columns: { id: $id }, _set: { is_featured: $isFeatured }) {
    id
    is_featured
  }
}
```

### Remove Testimonial from Widget
```graphql
mutation RemoveFromWidget($id: String!) {
  delete_widget_testimonials_by_pk(id: $id) {
    id
  }
}
```

### Remove All Testimonials from Widget
```graphql
mutation ClearWidget($widgetId: String!) {
  delete_widget_testimonials(where: { widget_id: { _eq: $widgetId } }) {
    affected_rows
  }
}
```

### Replace Widget Testimonials
```graphql
mutation ReplaceWidgetTestimonials($widgetId: String!, $newPlacements: [widget_testimonials_insert_input!]!) {
  delete_widget_testimonials(where: { widget_id: { _eq: $widgetId } }) {
    affected_rows
  }
  insert_widget_testimonials(objects: $newPlacements) {
    returning {
      id
      testimonial_id
      display_order
    }
  }
}
```
