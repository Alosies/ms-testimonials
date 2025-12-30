# Documentation Connections Guide

## Doc Connections
**ID**: `guide-doc-connections`

2025-12-30-1200 IST

**Parent ReadMes**: 
- `docs-index` - Documentation root index

**Related ReadMes**:
- `guide-hasura-table-docs` - Table documentation standards

---

## Overview
This guide establishes the standards for maintaining interconnected documentation across the Testimonials platform. It ensures consistency, traceability, and automated validation of documentation relationships.

## Understanding Relationship Types

### **Parent ReadMes** - Hierarchical Ownership
- **What it means**: "This document is a **part of**, **implements**, or **builds upon** the parent document"
- **Direction**: Child → Parent (this document belongs to or derives from parent)
- **Examples**:
  - `table-users` has parent `db-layer-1-auth` (users table is part of Layer 1)
  - `table-organizations` has parent `db-layer-2-multitenancy` (organizations is part of Layer 2)

### **Related ReadMes** - Peer Relationships  
- **What it means**: "This document **works alongside**, is **similar to**, or **depends on** these peer documents"
- **Direction**: Bidirectional (both documents should reference each other when truly related)
- **Examples**:
  - `table-users` and `table-user-identities` (users has identities)
  - `table-organizations` and `table-organization-plans` (org has subscription)

### **Key Distinctions**:

| Relationship | Question It Answers | Example |
|--------------|-------------------|---------|
| **Parent** | "What larger document is this part of or derived from?" | Table → Layer, Feature → PRD |
| **Related** | "What peer documents work with this or are needed by this?" | Table ↔ Table, Entity ↔ Entity |

## Doc Connections Standard

### Required Section Format
Every docs.md file must include a "Doc Connections" section immediately after the title:

```markdown
# [Document Title]

## Doc Connections
**ID**: `[document-id]`

[YYYY-MM-DD-HHMM] IST

**Parent ReadMes**: 
- `[parent-id]` - [Brief description]

**Related ReadMes**:
- `[related-id]` - [Brief description]

---

[Rest of document content...]
```

### Important Notes
- **No Children Section**: Do not include a "Children" section. Child documents reference their parents.
- **Focus on Dependencies**: Only list what this document depends on or relates to.
- **No Parent/Child Cross-References**: Don't list parent docs in "Related ReadMes" section.

## ID Naming Conventions

### Document Type Prefixes
| Prefix | Document Type | Example | Location |
|--------|---------------|---------|----------|
| `table-` | Database table documentation | `table-users` | `/docs/db/tables/*/docs.md` |
| `db-` | Database layer/research docs | `db-layer-1-auth` | `/docs/db/research/` |
| `guide-` | Developer guides | `guide-doc-connections` | `/docs/guides/` |
| `adr-` | Architecture Decision Records | `adr-001-default-org` | `/docs/adr/` |
| `skill-` | Claude skill documentation | `skill-hasura-migrations` | `/.claude/skills/` |

### ID Format Rules
1. **Lowercase only**: All IDs must be lowercase
2. **Hyphen separated**: Use hyphens to separate words
3. **Descriptive**: ID should clearly indicate the document's purpose
4. **Unique**: Each ID must be unique across the entire project
5. **Stable**: Once assigned, IDs should not change without migration

## File Organization Standards

### Directory Structure
```
project-root/
├── docs/
│   ├── adr/                  # Architecture Decision Records
│   │   ├── README.md                # adr-index ID
│   │   └── 001-*.md                 # adr-001-* IDs
│   ├── db/
│   │   ├── tables/           # Table documentation
│   │   │   └── [table-name]/
│   │   │       ├── docs.md          # table-[name] ID
│   │   │       ├── schema.md
│   │   │       ├── graphql.md
│   │   │       └── ai_capabilities.md
│   │   └── research/         # Database design docs
│   └── guides/               # Developer guides
└── .claude/
    └── skills/               # Claude skills
```

## Best Practices

### Relationship Management
1. **Start with core relationships**: Focus on parent-child and critical dependencies first
2. **Be selective with related docs**: Only include truly related documents
3. **Keep descriptions brief**: One-line descriptions are sufficient
4. **Update relationships regularly**: Review during major changes

### Documentation Quality
1. **Keep connections current**: Regular audits of relationships
2. **Validate before merging**: Ensure consistency
3. **Review impact of changes**: Consider downstream effects
4. **Maintain bidirectional links**: Ensure relationships are acknowledged both ways

## Examples

### Table Documentation Example
```markdown
# Users Table Documentation

## Doc Connections
**ID**: `table-users`

2025-12-30-1200 IST

**Parent ReadMes**: 
- `db-layer-1-auth` - Layer 1 Authentication tables

**Related ReadMes**:
- `table-user-identities` - Federated auth identities for users
- `table-organization-roles` - User membership in organizations

---

[Rest of table documentation...]
```

### Research Documentation Example
```markdown
# Layer 1: Authentication

## Doc Connections
**ID**: `db-layer-1-auth`

2025-12-30-1200 IST

**Parent ReadMes**: 
- `db-research-index` - Database research index

**Related ReadMes**:
- `db-layer-2-multitenancy` - Layer 2 depends on Layer 1 tables

---

[Rest of research documentation...]
```
