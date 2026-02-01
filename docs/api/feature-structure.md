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
├── schemas/           # Zod schemas for validation
│   ├── {schema}.ts
│   └── index.ts
├── functions/         # Pure functions ONLY (no side effects)
│   ├── {function}.ts
│   └── index.ts
├── operations/        # Impure operations (DB, API, I/O) - NOT HTTP handlers
│   ├── {operation}.ts
│   └── index.ts
├── handlers/          # HTTP handlers (Hono route handlers)
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

### `schemas/` - Zod Schemas

**Contains**: Zod schema definitions for request/response validation.

**Rules**:
- One schema file per logical grouping (e.g., `aiResponse.ts`, `request.ts`)
- Export both schemas and inferred types
- Use `.describe()` for OpenAPI documentation
- Schemas are pure (no side effects)

**Example**:
```typescript
// schemas/aiResponse.ts
import { z } from 'zod';

/**
 * Schema for inferred context from product analysis
 */
export const InferredContextSchema = z.object({
  industry: z.string().describe('The inferred industry/category'),
  audience: z.string().describe('The target audience'),
  tone: z.string().describe('Recommended tone'),
});

/**
 * Schema for form structure recommendations
 */
export const FormStructureSchema = z.object({
  branching_recommended: z.boolean().describe('Whether branching is recommended'),
  rating_question_index: z.number().int().describe('Position of the rating question'),
});

// Export inferred types
export type InferredContext = z.infer<typeof InferredContextSchema>;
export type FormStructure = z.infer<typeof FormStructureSchema>;
```

```typescript
// schemas/index.ts
export {
  InferredContextSchema,
  FormStructureSchema,
  type InferredContext,
  type FormStructure,
} from './aiResponse';
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

### `operations/` - Impure Operations

**Contains**: Impure operations that are NOT HTTP handlers (database calls, API calls, AI SDK calls).

**Rules**:
- **IMPURE**: Makes database calls, API calls, file I/O, or has side effects
- NOT HTTP handlers (those go in `handlers/`)
- Reusable across multiple handlers or features
- Export types for operation results

**When to use `operations/` vs `handlers/`**:
- `operations/` = Reusable impure logic (database queries, API calls, AI SDK)
- `handlers/` = HTTP request handlers (receive Hono Context, return Response)

**Example**:
```typescript
// operations/getFormById.ts
import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import { GetFormByIdForAssemblyDocument } from '@/graphql/generated/operations';

/**
 * Fetch form by ID from database.
 * Impure: makes GraphQL API call.
 */
export async function getFormById(id: string): Promise<GetFormByIdResult> {
  const { data, error } = await executeGraphQLAsAdmin(
    GetFormByIdForAssemblyDocument,
    { id }
  );
  // ...
}
```

```typescript
// operations/executeAssembly.ts
import { openai } from '@/shared/libs/openai';

/**
 * Execute AI testimonial assembly.
 * Impure: calls OpenAI API.
 */
export async function executeAssembly(
  context: AssemblyContext
): Promise<AssemblyResult> {
  const response = await openai.chat.completions.create({
    // ...
  });
  // ...
}
```

```typescript
// operations/index.ts
export { getFormById, type FormData, type GetFormByIdResult } from './getFormById';
export { executeAssembly, type AssemblyResult } from './executeAssembly';
```

---

### `handlers/` - HTTP Handlers

**Contains**: HTTP route handlers only.

**Rules**:
- HTTP handlers receive Hono `Context` and return responses
- Import from `functions/` for pure logic
- Import from `operations/` for impure operations
- Keep handlers thin - delegate to operations

**Example**:
```typescript
// handlers/assembleTestimonial.ts
import type { Context } from 'hono';
import { successResponse, errorResponse } from '@/shared/utils/http';
import { deriveSuggestions } from '../functions';
import { getFormById, executeAssembly } from '../operations';

export async function assembleTestimonial(c: Context) {
  try {
    const body = await c.req.json();

    // Use operations for impure work
    const form = await getFormById(body.formId);
    const result = await executeAssembly(form, body.responses);

    // Use functions for pure logic
    const suggestions = deriveSuggestions(result.testimonial, result.rating);

    return successResponse(c, { ...result, suggestions });
  } catch (error) {
    return errorResponse(c, 'Failed', 500, 'ERROR');
  }
}
```

```typescript
// handlers/index.ts
export { assembleTestimonial } from './assembleTestimonial';
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
// Handlers (HTTP handlers)
// =============================================================================

export { assembleTestimonial } from './handlers';

// =============================================================================
// Operations (Impure - DB, API, I/O)
// =============================================================================

export {
  getFormById,
  type FormData,
  executeAssembly,
  type AssemblyResult,
} from './operations';

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
| Zod validation schema | `schemas/` | `aiResponse.ts` |
| Request/response types | `schemas/` | `request.ts` |
| String manipulation | `functions/` | `buildUserMessage.ts` |
| Data transformation | `functions/` | `analyzeTestimonial.ts` |
| Compute derived values | `functions/` | `deriveSuggestions.ts` |
| Database/GraphQL call | `operations/` | `getFormById.ts` |
| AI SDK call | `operations/` | `executeAssembly.ts` |
| External API call | `operations/` | `sendNotification.ts` |
| HTTP request handler | `handlers/` | `assembleTestimonial.ts` |

### Quick Decision Guide

```
Is it a Hono HTTP handler (receives Context, returns Response)?
  └─ Yes → handlers/

Does it have side effects (DB, API, I/O)?
  └─ Yes → operations/
  └─ No  → functions/
```

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
features/ai/suggestQuestions/
├── graphql/
│   └── getFormById.gql
├── prompts/
│   ├── systemPrompt.ts
│   └── index.ts
├── schemas/
│   ├── aiResponse.ts
│   └── index.ts
├── functions/
│   ├── buildUserMessage.ts
│   ├── buildAvailableTypesSection.ts
│   ├── buildDynamicAIResponseSchema.ts
│   └── index.ts
├── operations/
│   ├── fetchFormData.ts
│   ├── executeAIGeneration.ts
│   └── index.ts
├── handlers/
│   ├── suggestQuestions.ts
│   └── index.ts
└── index.ts
```

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| GraphQL operation | camelCase.gql | `getFormById.gql` |
| Zod schema | camelCase.ts | `aiResponse.ts` |
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
- [ ] Add `schemas/` folder for Zod validation schemas
- [ ] Add `functions/` folder for pure functions (no side effects)
- [ ] Add `operations/` folder for impure operations (DB, API, I/O)
- [ ] Add `handlers/` folder for HTTP handlers
- [ ] Create `index.ts` with organized barrel exports
- [ ] Run `pnpm codegen` if GraphQL files were added
- [ ] Run `pnpm typecheck` to verify all types

---

## Entities (`entities/`)

Entities represent domain objects and their data access operations.

### Entity Folder Structure

```
api/src/entities/{entityName}/
├── graphql/           # GraphQL operations for this entity
│   └── {operation}.gql
├── models/            # Type definitions and re-exports
│   └── index.ts
├── functions/         # Pure functions ONLY (no side effects)
│   ├── {function}.ts
│   └── index.ts
├── operations/        # Impure operations (DB queries, mutations)
│   ├── {operation}.ts
│   └── index.ts
└── index.ts           # Barrel exports
```

### Example: `entities/user`

```
entities/user/
├── graphql/
│   ├── findUserById.gql
│   ├── findUserByEmail.gql
│   └── createUser.gql
├── models/
│   └── index.ts           # Type definitions
├── functions/
│   ├── formatUserName.ts  # Pure: string manipulation
│   └── index.ts
├── operations/
│   ├── findUserById.ts    # Impure: GraphQL query
│   ├── findUserByEmail.ts # Impure: GraphQL query
│   ├── createUser.ts      # Impure: GraphQL mutation
│   └── index.ts
└── index.ts
```

### Entity Barrel Export

```typescript
/**
 * User Entity
 */

// =============================================================================
// Models (Types)
// =============================================================================

export type { User, UserRole } from './models';

// =============================================================================
// Operations (Impure - DB queries/mutations)
// =============================================================================

export { findUserById } from './operations';
export { findUserByEmail } from './operations';
export { createUser } from './operations';

// =============================================================================
// Functions (Pure)
// =============================================================================

export { formatUserName } from './functions';
```

### Migration Note

> **Legacy `utils/` folders**: Some entities may have a `utils/` folder that mixes
> pure and impure code. When modifying these entities, migrate to the standard
> structure by splitting into `functions/` (pure) and `operations/` (impure).

---

## Shared Libraries (`shared/libs/`)

Shared libraries follow similar conventions but without HTTP handlers.

### Shared Lib Structure

```
api/src/shared/libs/{libName}/
├── types/             # Type definitions (pure)
│   ├── {types}.ts
│   └── index.ts
├── errors/            # Error types and factory functions (pure)
│   ├── {errors}.ts
│   └── index.ts
├── functions/         # Pure functions ONLY (no side effects)
│   ├── {function}.ts
│   └── index.ts
├── operations/        # Impure operations (DB, API, I/O)
│   ├── {operation}.ts
│   └── index.ts
└── index.ts           # Barrel exports
```

### Example: `shared/libs/aiAccess`

```
shared/libs/aiAccess/
├── types/
│   ├── aiCapability.ts    # Type definitions
│   └── index.ts
├── errors/
│   ├── aiAccessErrors.ts  # Error types and factories
│   └── index.ts
├── operations/
│   ├── checkAIAccess.ts       # Checks capability + credits (DB calls)
│   ├── checkCapabilityAccess.ts  # Plan capability check (DB calls)
│   ├── executeWithAIAccess.ts    # HOF wrapping AI ops (orchestrates)
│   └── index.ts
└── index.ts
```

### Shared Lib Barrel Export

```typescript
/**
 * AI Access Library
 * Shared library for AI capability access control.
 */

// =============================================================================
// Operations (impure - database, API, I/O)
// =============================================================================

export { checkCapabilityAccess } from './operations';
export { checkAIAccess } from './operations';
export { executeWithAIAccess } from './operations';

// =============================================================================
// Types
// =============================================================================

export type { AICapabilityId, QualityLevelId } from './types';
export type { AIAccessResult, AICapabilityAccessResult } from './types';

// =============================================================================
// Errors
// =============================================================================

export type { AIAccessError, InsufficientCreditsError } from './errors';
export { isAIAccessError, createInsufficientCreditsError } from './errors';
```
