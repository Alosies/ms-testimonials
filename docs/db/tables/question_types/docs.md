# Question Types Table Documentation

## Doc Connections
**ID**: `table-question_types`

2026-01-01-0803 IST

**Parent ReadMes**:
- `db-layer-3-business` - Layer 3 business tables

**Related ReadMes**:
- `table-form_questions` - Questions reference question types
- `table-plan_question_types` - Plan-based access control for question types

---

## Overview

System-defined reference data table that defines available question types with their validation rules, frontend component mappings, and icons. Types are aligned with Google Forms standards. This is seed data not modifiable by users.

## Migration History

| Migration | Summary |
|-----------|----------|
| `1767078072000_2025_12_30_1231__question_types__create_table` | Create table with seed data for 14 question types |
| `1767205333963_2025_12_31_2351__question_types__align_google_forms` | Add icon column, rename types to Google Forms style, add Date/Time, remove NPS/consent |
| `1767209344479_2026_01_01_0058__question_types__add_switch_checkbox` | Add Switch and Checkbox boolean types |

## Current Types (16)

| Category | Types |
|----------|-------|
| text | text_short (Short answer), text_long (Paragraph), text_email (Email), text_url (URL) |
| choice | choice_single (Multiple choice), choice_multiple (Checkboxes), choice_dropdown (Dropdown) |
| rating | rating_star (Star rating), rating_scale (Linear scale) |
| media | media_file (File upload), media_video (Video) |
| input | input_date (Date), input_time (Time), input_switch (Switch), input_checkbox (Checkbox) |
| special | special_hidden (Hidden field) |

## Relationships

### Object Relationships (Many-to-One)
None

### Array Relationships (One-to-Many)
- `questions` <- form_questions via question_type_id
- `available_in_plans` <- plan_question_types via question_type_id

## Documentation Files
- [Schema Reference](schema.md) - Table structure and relationships
- [GraphQL Examples](graphql.md) - Basic CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
