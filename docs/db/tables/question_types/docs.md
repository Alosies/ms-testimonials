# Question Types Table Documentation

## Doc Connections
**ID**: `table-question_types`

2025-12-31-1651 IST

**Parent ReadMes**:
- `db-layer-3-business` - Layer 3 business tables

**Related ReadMes**:
- `table-form_questions` - Questions reference question types

---

## Overview

System-defined reference data table that defines available question types with their validation rules and frontend component mappings. This is seed data not modifiable by users.

## Migration History

| Migration | Summary |
|-----------|----------|
| `1767078072000_2025_12_30_1231__question_types__create_table` | Create table with seed data for 14 question types |

## Relationships

### Object Relationships (Many-to-One)
None

### Array Relationships (One-to-Many)
- `questions` <- form_questions via question_type_id

## Documentation Files
- [Schema Reference](schema.md) - Table structure and relationships
- [GraphQL Examples](graphql.md) - Basic CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
