# API Feature Folder Structure

## Doc Connections
**ID**: `api-feature-structure`

2026-02-01 IST

**Parent ReadMes**:
- `api-development-guide` - API development overview

**Related ReadMes**:
- `api-endpoint-creation` - Step-by-step endpoint creation
- `graphql-code-skill` - GraphQL patterns (for .gql files)

---

This document defines the internal folder structure for API features. Following these conventions ensures consistency, testability, and maintainability.

---

## Feature Folder Structure

```
api/src/features/{feature}/
├── graphql/           # GraphQL operations (.gql files)
│   └── {operation}.gql
├── prompts/           # AI prompt templates (AI features only)
│   ├── {prompt}.ts
│   └── index.ts
├── functions/         # Pure functions ONLY
│   ├── {function}.ts
│   └── index.ts
├── handlers/          # HTTP handlers + impure operations
│   ├── {handler}.ts
│   └── index.ts
└── index.ts           # Barrel exports
```

---

## Folder Responsibilities

### `graphql/` - GraphQL Operations

**Contains**: `.gql` files for GraphQL queries and mutations.

**Rules**:
- One operation per file
- File name matches operation name (camelCase)
- Codegen generates types to `api/src/graphql/generated/operations.ts`

**Example**:
```graphql
# graphql/getFormById.gql
query GetFormByIdForAssembly($id: String!) {
  forms_by_pk(id: $id) {
    id
    name
    product_name
    is_active
    organization_id
  }
}
```

**Usage** (after running codegen):
```typescript
import {
  GetFormByIdForAssemblyDocument,
  type GetFormByIdForAssemblyQuery,
} from '@/graphql/generated/operations';

const { data } = await executeGraphQLAsAdmin<GetFormByIdForAssemblyQuery>(
  GetFormByIdForAssemblyDocument,
  { id }
);
```

---

### `prompts/` - AI Prompt Templates

**Contains**: AI system prompts and prompt-building utilities. Only for AI-powered features.

**Rules**:
- Constants should be SCREAMING_SNAKE_CASE
- Each prompt in its own file
- Include docstring explaining the prompt's purpose

**Example**:
```typescript
// prompts/systemPrompt.ts
/**
 * System prompt for testimonial assembly.
 * Instructs the AI to transform Q&A responses into testimonials.
 */
export const TESTIMONIAL_ASSEMBLY_SYSTEM_PROMPT = `You are an expert...`;
```

```typescript
// prompts/index.ts
export { TESTIMONIAL_ASSEMBLY_SYSTEM_PROMPT } from './systemPrompt';
```

---

### `functions/` - Pure Functions

**Contains**: Pure functions with NO side effects.

**Rules**:
- **PURE ONLY**: No API calls, no database access, no logging, no I/O
- Input → Output with no external dependencies
- Easy to unit test
- Function names should NOT start with "generate" (implies side effects)
- Prefer verbs like: `derive`, `compute`, `build`, `analyze`, `extract`, `transform`

**Example**:
```typescript
// functions/deriveSuggestions.ts
/**
 * Derive suggestions based on testimonial content.
 * Pure function: input → output with no side effects.
 */
export function deriveSuggestions(
  testimonial: string,
  rating?: number
): TestimonialSuggestion[] {
  // Pure computation only
  const wordCount = testimonial.split(/\s+/).length;
  // ...
  return suggestions;
}
```

```typescript
// functions/index.ts
export { buildUserMessage } from './buildUserMessage';
export { deriveSuggestions } from './deriveSuggestions';
export { analyzeTestimonial } from './analyzeTestimonial';
```

**Pure Function Checklist**:
- [ ] No `await` (unless awaiting other pure functions)
- [ ] No `console.log` or logging
- [ ] No database/GraphQL calls
- [ ] No API calls (HTTP, AI SDK, etc.)
- [ ] No file system operations
- [ ] No random values (unless seeded)
- [ ] No current time/date (pass as parameter)
- [ ] Same input always produces same output

---

### `handlers/` - HTTP Handlers & Impure Operations

**Contains**: HTTP route handlers and any impure operations.

**Rules**:
- HTTP handlers receive Hono `Context` and return responses
- Impure operations (API calls, database, AI SDK) belong here
- Can import from `functions/` for pure logic
- Export types for operation results

**HTTP Handler Example**:
```typescript
// handlers/assembleTestimonial.ts
import type { Context } from 'hono';
import { successResponse, errorResponse } from '@/shared/utils/http';
import { deriveSuggestions } from '../functions';

export async function assembleTestimonial(c: Context) {
  try {
    const body = await c.req.json();
    // ... validation, business logic
    const suggestions = deriveSuggestions(testimonial, rating);
    return successResponse(c, response);
  } catch (error) {
    return errorResponse(c, 'Failed', 500, 'ERROR');
  }
}
```

**Impure Operation Example**:
```typescript
// handlers/getFormById.ts
import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import { GetFormByIdForAssemblyDocument } from '@/graphql/generated/operations';

export async function getFormById(id: string): Promise<GetFormByIdResult> {
  // Impure: makes GraphQL API call
  const { data, error } = await executeGraphQLAsAdmin(
    GetFormByIdForAssemblyDocument,
    { id }
  );
  // ...
}
```

```typescript
// handlers/index.ts
// HTTP handlers
export { assembleTestimonial } from './assembleTestimonial';

// Impure operations
export { getFormById, type FormData, type GetFormByIdResult } from './getFormById';
export { executeAssembly, type AssemblyResult } from './executeAssembly';
```

---

### `index.ts` - Barrel Exports

**Contains**: Organized exports with clear sections.

**Rules**:
- Group exports by category with section headers
- Export types alongside their functions
- Provide default export for main handler (for route registration)

**Example**:
```typescript
/**
 * Assemble Testimonial Feature
 * @see PRD-005: AI Testimonial Generation
 */

// =============================================================================
// Handlers (HTTP handlers and impure operations)
// =============================================================================

export {
  assembleTestimonial,
  getFormById,
  type FormData,
  executeAssembly,
  type AssemblyResult,
} from './handlers';

// =============================================================================
// Functions (Pure functions)
// =============================================================================

export {
  buildUserMessage,
  deriveSuggestions,
  analyzeTestimonial,
} from './functions';

// =============================================================================
// Prompts (AI prompt templates)
// =============================================================================

export { TESTIMONIAL_ASSEMBLY_SYSTEM_PROMPT } from './prompts';

// =============================================================================
// Default export (for route registration)
// =============================================================================

export { assembleTestimonial as default } from './handlers';
```

---

## When to Use Each Folder

| Need | Folder | Example |
|------|--------|---------|
| GraphQL query/mutation | `graphql/` | `getFormById.gql` |
| AI system prompt | `prompts/` | `systemPrompt.ts` |
| String manipulation | `functions/` | `buildUserMessage.ts` |
| Data transformation | `functions/` | `analyzeTestimonial.ts` |
| Compute derived values | `functions/` | `deriveSuggestions.ts` |
| HTTP request handler | `handlers/` | `assembleTestimonial.ts` |
| Database/GraphQL call | `handlers/` | `getFormById.ts` |
| AI SDK call | `handlers/` | `executeAssembly.ts` |
| External API call | `handlers/` | `sendNotification.ts` |

---

## Simple Features

Not all features need every folder. Use only what you need:

**Minimal feature** (just a handler):
```
features/auth/enhanceToken/
├── handlers/
│   ├── enhanceToken.ts
│   └── index.ts
└── index.ts
```

**Feature with GraphQL**:
```
features/dashboard/
├── graphql/
│   └── getDashboardStats.gql
├── handlers/
│   ├── getDashboard.ts
│   └── index.ts
└── index.ts
```

**AI feature** (full structure):
```
features/ai/assembleTestimonial/
├── graphql/
│   └── getFormById.gql
├── prompts/
│   ├── systemPrompt.ts
│   └── index.ts
├── functions/
│   ├── buildUserMessage.ts
│   ├── deriveSuggestions.ts
│   ├── analyzeTestimonial.ts
│   └── index.ts
├── handlers/
│   ├── assembleTestimonial.ts
│   ├── getFormById.ts
│   ├── executeAssembly.ts
│   └── index.ts
└── index.ts
```

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| GraphQL operation | camelCase.gql | `getFormById.gql` |
| Pure function | camelCase.ts | `buildUserMessage.ts` |
| HTTP handler | camelCase.ts | `assembleTestimonial.ts` |
| Prompt constant | camelCase.ts | `systemPrompt.ts` |
| Barrel export | index.ts | `index.ts` |

### Functions

| Type | Convention | Example |
|------|------------|---------|
| Pure function | `build*`, `derive*`, `analyze*`, `compute*`, `extract*` | `deriveSuggestions` |
| HTTP handler | verb + noun (action name) | `assembleTestimonial` |
| Data fetcher | `get*`, `fetch*`, `find*` | `getFormById` |
| AI executor | `execute*` | `executeAssembly` |

### Constants

| Type | Convention | Example |
|------|------------|---------|
| Prompt | SCREAMING_SNAKE_CASE | `TESTIMONIAL_ASSEMBLY_SYSTEM_PROMPT` |

---

## Checklist for New Features

- [ ] Create feature folder under `api/src/features/{domain}/{feature}/`
- [ ] Add `graphql/` folder if feature needs GraphQL operations
- [ ] Add `prompts/` folder if feature uses AI (with system prompts)
- [ ] Add `functions/` folder for pure functions (no side effects)
- [ ] Add `handlers/` folder for HTTP handlers and impure operations
- [ ] Create `index.ts` with organized barrel exports
- [ ] Run `pnpm codegen` if GraphQL files were added
- [ ] Run `pnpm typecheck` to verify all types
