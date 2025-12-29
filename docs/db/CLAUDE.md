# Database Documentation - Claude Instructions

This file provides specific guidance for Claude Code when working with database documentation and migration tracking in this repository.

## Migration Tracking System

### Overview
The `migration-tracking.json` file consolidates migration status for all database tables. It tracks:
- Last migration applied to each table
- Documentation sync status (Current/Behind/Critical)
- Last updated timestamps
- Migration history for tables with multiple changes

### Updating migration-tracking.json

**IMPORTANT**: This file is NOT automatically updated when migrations are applied. It only gets updated when:
1. Applied migrations have been documented in individual table `docs.md` files
2. Explicit instruction is given to update `migration-tracking.json`

**Update process** (only when explicitly requested):

1. **Read updated table documentation:**
   - Check individual table `docs.md` files for new migration data
   - Extract "Last Migration" and "Last Updated" information from docs

2. **Update migration-tracking.json:**
   - Find the table entry in `migration-tracking.json`
   - Update `lastMigration` with new migration identifier from docs
   - Update `lastUpdated` timestamp from docs (format: `YYYY-MM-DD-HHMM`)
   - Add entry to `migrationHistory` array if migration history exists in docs
   - Update `metadata.lastGlobalUpdate` and `totalTables` count
   - Update `statusCounts` based on current table statuses

3. **Migration naming convention** (for reference):
   ```
   [timestamp]_[YYYY_MM_DD_HHMM]__[table_name]__[action_description]
   ```

### JSON Structure

```json
{
  "metadata": {
    "generated": "ISO timestamp",
    "totalTables": "number",
    "statusCounts": { "current": X, "behind": Y, "critical": Z },
    "lastGlobalUpdate": "YYYY-MM-DD-HHMM"
  },
  "tables": {
    "table_name": {
      "lastMigration": "migration_identifier",
      "status": "current|behind|critical",
      "lastUpdated": "YYYY-MM-DD-HHMM",
      "timezone": "GMT+5:30",
      "migrationHistory": [
        {
          "migration": "migration_identifier",
          "date": "YYYY-MM-DD",
          "summary": "Brief description"
        }
      ]
    }
  }
}
```

### Status Definitions
- **current**: Documentation is up-to-date with latest migration
- **behind**: 1-3 migrations behind (warning state)
- **critical**: 4+ migrations behind (requires immediate attention)

## Table Documentation Structure

Each table should have 4 documentation files:

### docs.md
- Table overview and purpose
- Migration sync status
- Migration history table
- Relationships overview
- Links to other doc files

### schema.md
- CREATE TABLE SQL
- Column definitions table
- Constraints (check, foreign key, unique)
- Indexes
- Triggers

### graphql.md
- Basic queries (get all, get by pk, get by unique field)
- Relationship queries
- Common filters
- Mutations (create, update, delete)

### ai_capabilities.md
- Overview of AI use cases
- Pseudo-code examples for AI features
- Integration points

## Key Design Patterns

### unique_name + name Pattern
Tables with system/seed data use two columns:
- `unique_name`: Lowercase slug for code comparisons (`owner`, `admin`)
- `name`: Display-ready label for UI (`Owner`, `Admin`)

```typescript
// Code comparisons use unique_name
if (role.unique_name === 'owner') { ... }

// UI display uses name
<span>{{ role.name }}</span>
```

### NanoID Variants
- `generate_nanoid_12()`: Standard entities (users, forms, testimonials)
- `generate_nanoid_16()`: Security-critical (user_identities, API keys)

### No Semantic ID Defaults
FK columns should NOT have semantic ID defaults. App must lookup by unique_name:
```sql
-- Wrong: role_id TEXT NOT NULL DEFAULT 'role_member'
-- Correct: role_id TEXT NOT NULL  -- App lookups role by unique_name
```

## Related Files
- `/docs/db/tables/*/docs.md` - Individual table documentation
- `/db/hasura/migrations/` - Actual migration files
- `/docs/database-schema-research.md` - Complete schema design document
