# Database Documentation

## Overview

Comprehensive database documentation for the Testimonials platform, covering PostgreSQL database design, Hasura GraphQL Engine setup, and all table schemas with their relationships.

## Quick Navigation

### Architecture & Design
- **[Architecture](./architecture/)** - Database architecture decisions and patterns
- **[Guidelines](./guidelines/)** - Best practices and design standards

### Hasura GraphQL Engine
- **[Hasura Documentation](./hasura/)** - Hasura setup and operations guide

### Database Schema
- **[Tables Documentation](./tables/)** - Complete table schema reference
- **[Migration Tracking](./migration-tracking.json)** - Current migration status across all tables

## Database Architecture

### Layer Organization

The schema is organized in 3 layers to manage dependencies:

| Layer | Tables | Description |
|-------|--------|-------------|
| **Layer 1: Authentication** | `users`, `user_identities`, `roles` | No foreign keys between layers |
| **Layer 2: Multi-Tenancy** | `plans`, `organizations`, `organization_roles` | References Layer 1 |
| **Layer 3: Business Entities** | `forms`, `testimonials`, `widgets`, etc. | References Layer 2 |

### Key Design Decisions

1. **Provider-Agnostic Auth**: No Supabase lock-in via federated `user_identities`
2. **NanoID Primary Keys**: 12-char for standard, 16-char for security-critical
3. **`unique_name` + `name` Pattern**: Slug for code, display label for UI
4. **Explicit Boolean Columns**: Permissions as queryable columns, not JSONB
5. **Junction Tables**: Many-to-many relationships with ordering support

## Documentation Structure

```
/docs/db/
├── README.md                     # This file - main navigation
├── CLAUDE.md                     # AI assistant instructions
├── migration-tracking.json       # Migration status tracking
│
├── architecture/                 # Database architecture & decisions
├── guidelines/                   # Best practices & standards
├── hasura/                       # Hasura GraphQL Engine docs
│
└── tables/                       # Table-specific documentation
    └── [table_name]/
        ├── docs.md               # Table overview & migration history
        ├── schema.md             # Table structure
        ├── graphql.md            # GraphQL examples
        └── ai_capabilities.md    # AI use cases
```

## Current Tables (Layer 1)

| Table | Status | Description |
|-------|--------|-------------|
| [users](./tables/users/) | ✅ Applied | Provider-agnostic user profiles |
| [user_identities](./tables/user_identities/) | ✅ Applied | Federated auth identities |
| [roles](./tables/roles/) | ✅ Applied | Permission definitions |

## Getting Started

### For Developers
- **Understanding schema**: Browse [Tables Documentation](./tables/)
- **Working with migrations**: See Hasura CLI commands in main CLAUDE.md

### For Database Architects
- **Schema design**: Review [database-schema-research.md](../database-schema-research.md)
- **Design patterns**: Check [Guidelines](./guidelines/)

## Contributing

When updating documentation:
1. Update individual table docs after applying migrations
2. Keep migration-tracking.json in sync
3. Follow the established documentation format
