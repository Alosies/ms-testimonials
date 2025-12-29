# Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA v3                                          │
│                        (Properly Normalized - 14 Tables)                                 │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                                    AUTHENTICATION
┌──────────────────┐                                      ┌───────────────────────┐
│      USERS       │                                      │    USER_IDENTITIES    │
├──────────────────┤                                      ├───────────────────────┤
│ id (PK)          │◄─────────────────────────────────────│ user_id (FK)          │
│ email (UNIQUE)   │                               1 : N  │ id (PK)               │
│ email_verified   │                                      │ provider              │
│ display_name     │                                      │ provider_user_id      │
│ avatar_url       │                                      │ provider_metadata     │ ← JSONB OK
│ is_active        │                                      │ is_primary            │
└────────┬─────────┘                                      └───────────────────────┘
         │
         │                              AUTHORIZATION
         │
         │         ┌────────────────────────┐             ┌─────────────┐
         │         │  ORGANIZATION_ROLES    │            │    ROLES    │
         │         ├────────────────────────┤            ├─────────────┤
         └────────►│ user_id (FK)           │            │ id (PK)     │
                   │ organization_id (FK)───┼──┐         │ name        │
                   │ role_id (FK)───────────┼──┼────────►│ can_*       │ ← Explicit columns
                   │ is_default_org         │  │         └─────────────┘
                   │ is_active              │  │
                   └────────────────────────┘  │
                                               │
                              MULTI-TENANCY    │
                                               │
         ┌─────────────┐    ┌───────────────┐  │         ┌───────────────────┐
         │    PLANS    │    │  PLAN_PRICES  │  │         │   ORGANIZATIONS   │
         ├─────────────┤    ├───────────────┤  │         ├───────────────────┤
         │ id (PK)     │◄───│ plan_id (FK)  │  └────────►│ id (PK)           │
         │ unique_name │    │ currency_code │            │ name              │
         │ name        │    │ price_*       │            │ slug (UNIQUE)     │
         │ max_*       │    └───────────────┘            │ settings          │ ← JSONB (UI only)
         │ show_brand  │                                 │ *_count()         │ ← Computed fields
         └──────┬──────┘                                 └─────────┬─────────┘
                │                                                  │
                │         ┌─────────────────────┐                  │
                └────────►│  ORGANIZATION_PLANS │◄─────────────────┘
                          ├─────────────────────┤
                          │ plan_id (FK)        │ ← Reference to plan
                          │ organization_id (FK)│
                          │ status, billing_*   │
                          │ max_*, show_*       │ ← Copied from plan
                          │ override_*, has_*   │ ← Audit trail
                          └─────────────────────┘
                                                                   │
                              BUSINESS ENTITIES                    │
                                                                   │
                   ┌───────────────────────────────────────────────┼──────────────────┐
                   │                                               │                  │
                   ▼                                               ▼                  ▼
         ┌───────────────────┐                           ┌──────────────┐    ┌─────────────┐
         │       FORMS       │                           │ TESTIMONIALS │    │   WIDGETS   │
         ├───────────────────┤                           ├──────────────┤    ├─────────────┤
         │ id (PK)           │                           │ id (PK)      │    │ id (PK)     │
         │ organization_id───┼───────────────────────────│ org_id (FK)──┼────│ org_id (FK) │
         │ name              │                           │ form_id (FK)─┼─┐  │ name        │
         │ slug              │◄──────────────────────────┼──────────────┼─┘  │ type        │
         │ product_name      │                      1: N │ status       │    │ theme       │
         │ collect_rating    │ ← Explicit columns        │ content      │    │ show_*      │ ← Explicit
         │ require_*         │                           │ rating       │    │ settings    │ ← JSONB (UI)
         │ settings          │ ← JSONB (UI only)         │ customer_*   │    └──────┬──────┘
         └─────────┬─────────┘                           │ source       │           │
                   │                                     │ source_meta  │ ← JSONB OK│
                   │ 1 : N                               │ approved_*   │           │
                   ▼                                     └──────┬───────┘           │
         ┌────────────────────┐                                 │                   │
         │   FORM_QUESTIONS   │                                 │                   │
         ├────────────────────┤                                 │                   │
         │ id (PK)            │                                 │                   │
         │ form_id (FK)───────┼─────────────────────────────────┤                   │
         │ question_key       │                            1: N │              N: M │
         │ question_text      │                                 │                   │
         │ placeholder        │                                 │                   │
         │ display_order      │                                 ▼                   │
         │ is_required        │                    ┌──────────────────────┐         │
         └─────────┬──────────┘                    │ TESTIMONIAL_ANSWERS  │         │
                   │                               ├──────────────────────┤         │
                   │ 1 : N                         │ id (PK)              │         │
                   │                               │ testimonial_id (FK)──┼─────────┤
                   └──────────────────────────────►│ question_id (FK)     │         │
                                                   │ answer_text          │         │
                                                   └──────────────────────┘         │
                                                                                    │
                                                                                    │
                                                   ┌───────────────────────┐        │
                                                   │  WIDGET_TESTIMONIALS  │        │
                                                   ├───────────────────────┤        │
                                                   │ id (PK)               │        │
                                                   │ widget_id (FK)────────┼────────┘
                                                   │ testimonial_id (FK)───┼────────┐
                                                   │ display_order         │        │
                                                   │ is_featured           │        │
                                                   └───────────────────────┘        │
                                                              ▲                     │
                                                              └─────────────────────┘
```

## Relationship Summary

| Relationship | Type | Description |
|--------------|------|-------------|
| users → user_identities | 1:N | One user, multiple auth providers |
| users → organization_roles | 1:N | User can be in multiple orgs |
| organizations → organization_roles | 1:N | Org has multiple members |
| roles → organization_roles | 1:N | Role assigned to user-org pairs |
| plans → plan_prices | 1:N | Plan has prices per currency |
| plans → organization_plans | 1:N | Plan referenced by subscriptions |
| organizations → organization_plans | 1:N | Org subscription history |
| organizations → forms | 1:N | Org owns forms |
| organizations → testimonials | 1:N | Org owns testimonials |
| organizations → widgets | 1:N | Org owns widgets |
| forms → form_questions | 1:N | Form has questions |
| forms → testimonials | 1:N | Testimonials belong to form |
| form_questions → testimonial_answers | 1:N | Answers linked to questions |
| testimonials → testimonial_answers | 1:N | Testimonial has answers |
| widgets ↔ testimonials | N:M | Via widget_testimonials |
