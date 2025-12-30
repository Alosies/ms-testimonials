# Plan Prices GraphQL Examples

**Last Updated**: `2025-12-30-1200` (GMT+5:30)

## Basic Queries

### Get All Prices for a Currency
```graphql
query GetPricesByCurrency($currency: String!) {
  plan_prices(where: {currency_code: {_eq: $currency}, is_active: {_eq: true}}) {
    id
    plan_id
    currency_code
    price_monthly_in_base_unit
    price_yearly_in_base_unit
    price_lifetime_in_base_unit
  }
}
```

### Get Price by ID
```graphql
query GetPrice($id: String!) {
  plan_prices_by_pk(id: $id) {
    id
    plan_id
    currency_code
    price_monthly_in_base_unit
    price_yearly_in_base_unit
    price_lifetime_in_base_unit
    is_active
    created_at
    updated_at
  }
}
```

### Get Prices for a Plan
```graphql
query GetPricesForPlan($planId: String!) {
  plan_prices(where: {plan_id: {_eq: $planId}}) {
    id
    currency_code
    price_monthly_in_base_unit
    price_yearly_in_base_unit
    price_lifetime_in_base_unit
    is_active
  }
}
```

## Relationship Queries

### Price with Plan Details
```graphql
query GetPriceWithPlan($id: String!) {
  plan_prices_by_pk(id: $id) {
    id
    currency_code
    price_monthly_in_base_unit
    price_yearly_in_base_unit
    price_lifetime_in_base_unit
    plan {
      id
      unique_name
      name
      description
    }
  }
}
```

## Mutations

### Create Price
```graphql
mutation CreatePrice($input: plan_prices_insert_input!) {
  insert_plan_prices_one(object: $input) {
    id
    plan_id
    currency_code
    created_at
  }
}
```

**Variables:**
```json
{
  "input": {
    "plan_id": "plan_id_here",
    "currency_code": "EUR",
    "price_monthly_in_base_unit": 0,
    "price_yearly_in_base_unit": 0,
    "price_lifetime_in_base_unit": 4500
  }
}
```

### Update Price
```graphql
mutation UpdatePrice($id: String!, $updates: plan_prices_set_input!) {
  update_plan_prices_by_pk(pk_columns: {id: $id}, _set: $updates) {
    id
    price_monthly_in_base_unit
    price_yearly_in_base_unit
    price_lifetime_in_base_unit
    updated_at
  }
}
```

### Deactivate Price
```graphql
mutation DeactivatePrice($id: String!) {
  update_plan_prices_by_pk(
    pk_columns: {id: $id}
    _set: {is_active: false}
  ) {
    id
    is_active
    updated_at
  }
}
```
