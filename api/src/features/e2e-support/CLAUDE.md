# E2E Support Feature

This feature provides API endpoints for E2E testing infrastructure.

## Folder Structure

Each resource gets its own folder with a consistent internal structure:

```
e2e-support/
├── {resource}/
│   ├── routes.ts       # HTTP route handlers
│   ├── crud.ts         # Database CRUD operations (if needed)
│   ├── types.ts        # TypeScript interfaces and types
│   ├── constants.ts    # Constants and configuration values
│   └── index.ts        # Barrel export
├── middleware/
│   └── e2e.ts          # E2E middleware (auth, etc.)
└── index.ts            # Feature-level exports
```

## File Responsibilities

| File | Purpose |
|------|---------|
| `routes.ts` | HTTP request/response handling. Imports from `crud.ts` for data operations. |
| `crud.ts` | Database operations (create, read, update, delete). Pure data logic, no HTTP concerns. |
| `types.ts` | All TypeScript interfaces and type definitions for the resource. |
| `constants.ts` | Static values, IDs, configuration. No logic. |
| `index.ts` | Barrel file that re-exports public API from other files. |

## Rules

1. **Types and interfaces** must be defined in `types.ts`, not in `crud.ts` or `routes.ts`
2. **Constants** must be defined in `constants.ts`, not scattered in other files
3. **Route handlers** in `routes.ts` should be thin - delegate to `crud.ts` for data operations
4. **CRUD functions** should be pure data operations with no HTTP context (no `Context` type)
5. **Each resource folder** must have an `index.ts` that exports its public API

## Adding a New Resource

When adding a new resource (e.g., `testimonials`):

1. Create the folder: `e2e-support/testimonials/`
2. Create files following the structure above
3. Export route handlers from `e2e-support/index.ts`
4. Register routes in the main API router

## Current Resources

- `forms/` - Test form creation, deletion, cleanup
- `organizations/` - Organization lookup by slug
- `cleanup/` - Cross-cutting cleanup operations (uses `forms/crud.ts`)
