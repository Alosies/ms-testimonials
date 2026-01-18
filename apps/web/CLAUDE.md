# CLAUDE.md - Web Client Guidelines

This file provides specific guidance for Claude Code when working with the Testimonials web client.

## Project Architecture

The web client follows **Feature-Sliced Design (FSD)** architecture principles:

### Layer Hierarchy (Top to Bottom)
1. **`app/`** - Application initialization, global providers, routing
2. **`pages/`** - Routes and page components
3. **`features/`** - Business logic features and user workflows
4. **`entities/`** - Business entities (Form, Testimonial, Widget, User)
5. **`shared/`** - Reusable utilities, components, libraries

### Layer Interaction Rules
- **Higher layers can import from lower layers** (never reverse)
- **Cross-imports at same layer** are allowed only within a slice
- **No circular dependencies** between layers

## Entity Structure Standard

Each entity follows this standardized structure:

```
entities/{entityName}/
├── graphql/              # GraphQL operations (.gql files)
│   ├── fragments/        # Reusable GraphQL fragments
│   ├── queries/          # Data fetching operations
│   └── mutations/        # Data modification operations
├── models/               # Type definitions and interfaces
│   ├── index.ts          # Main types + barrel exports
│   ├── mutations.ts      # Mutation-specific interfaces
│   └── queries.ts        # Query-specific interfaces
├── schemas/              # Zod schemas for JSONB content (if applicable)
│   ├── {contentType}.schema.ts  # Individual content schemas
│   └── index.ts          # Union schema + parse/validate functions
├── composables/          # Vue composables
│   ├── queries/          # Query composables
│   ├── mutations/        # Mutation composables
│   └── index.ts          # Barrel exports
├── adapters/             # Interface adapters and wrappers
├── functions/            # Pure functions (no side effects)
├── utils/                # Utility functions
├── store/                # Pinia stores (if needed)
├── mocks/                # Mock data for testing
└── index.ts              # Public API exports
```

## Folder Type Definitions

### `adapters/` - Interface Adapters
- **Purpose**: Bridge different APIs or calling conventions
- **Use Case**: Provide domain-specific abstractions over generic functionality
- **Dependencies**: May have dependencies (composables, external APIs)

### `functions/` - Pure Functions
- **Purpose**: Mathematical operations, validations, transformations
- **Constraints**: No side effects, no external dependencies
- **Guarantee**: Always return same output for same input

### `utils/` - Utility Functions
- **Purpose**: General-purpose tools, formatting, parsing
- **Dependencies**: May have minimal dependencies

### `composables/` - Vue Composables
- **Purpose**: Reactive, stateful Vue composition functions
- **Behavior**: Handle component lifecycle and reactivity

### `schemas/` - Zod Schemas for JSONB Content
- **Purpose**: Runtime validation for PostgreSQL JSONB columns
- **Use Case**: Entities that store structured content in JSONB (e.g., `form_steps.content`)
- **Pattern**: Types inferred from Zod schemas (single source of truth)
- **Exports**: Parse functions + validate functions + inferred types

**Why schemas/ is separate from models/**:
- `models/` exports only **types** (per FSD guidelines)
- `schemas/` exports **functions** (parse, validate) + types
- Both are exported from entity `index.ts`

**Example** (formStep entity):
```typescript
// schemas/consentContent.schema.ts
export const ConsentContentSchema = z.object({
  title: z.string(),
  required: z.boolean(),
});
export type ConsentContent = z.infer<typeof ConsentContentSchema>;

// Usage in transform (read path)
content: parseStepContentWithDefaults(step.step_type, step.content),

// Usage in save (write path)
validateStepContent('consent', updatedContent);  // Throws if invalid
```

**See**: ADR-011 "JSONB Content Validation with Zod" section

## Composable Naming and Location Rules (Critical)

### **"useXxx" Naming Pattern**
- **ONLY use `useXxx` naming** if the function encapsulates Vue reactive elements
- **Any function that calls a `useXxx` function** must also be named `useXxx`
- **All `useXxx` functions MUST be located in `composables/` folders**

### **Composable Usage Rules (Critical)**
Only the following can use a composable (`useXxx`) inside them:
1. **Another composable** - `useXxx` functions
2. **A Vue component** - `.vue` files
3. **A Pinia store** - store definitions

**NEVER use composables in:**
- `utils/` functions
- `functions/` (pure functions)
- `adapters/` (unless the adapter itself is a composable)

### **Composable Call Location Rules (Critical)**

Composables (`useXxx`) **MUST be called synchronously** at the root level of:
1. **`<script setup>`** - at the top, before any async code
2. **`setup()` function** - at the root, not inside callbacks
3. **Lifecycle hooks** - `onMounted()`, `onUnmounted()`, etc.
4. **Other composables** - at the root of the composable function

**NEVER call composables inside:**
- **Async callbacks** - `setTimeout`, `Promise.then()`, `async/await` blocks
- **Event handlers** - `@click`, `@input` handlers
- **Conditionals or loops** - `if/else`, `for`, `while`
- **Regular functions** - non-composable helper functions

```typescript
// ❌ Bad: Composable called inside async callback
const saveData = async () => {
  const { updateForm } = useUpdateForm();  // WRONG! Called at runtime
  await updateForm(data);
};

// ✅ Good: Composable called at setup, function used later
const { updateForm } = useUpdateForm();  // Called during setup
const saveData = async () => {
  await updateForm(data);  // Function can be called anytime
};

// ✅ Good: Factory pattern for handlers that need composables
const createHandler = (mutationFn: MutationFn) => {
  return async (data: Data) => {
    await mutationFn(data);  // Pre-bound function is safe
  };
};

// In setup:
const { updateForm } = useUpdateForm();
const saveHandler = createHandler(updateForm);
```

**Why this matters:** Vue tracks the current component instance during setup. Composables use this to register lifecycle hooks, provide/inject dependencies, and connect to the component's reactivity system. Calling composables outside setup loses this context.

## Type Organization (Critical)

### FSD Type Rules
- **ALL types and interfaces MUST be exported from `models/` folders only**
- **Composables, adapters, functions, utils should NOT export types**
- **Use barrel exports (`index.ts`) in models folders for clean APIs**

### Models vs Functions Separation (Critical)
- **`models/` folders contain ONLY type definitions** - interfaces, types, enums
- **NO functions in `models/` folders** - move to `functions/` folder instead
- Type guards, factories, and helper functions belong in `functions/`

```typescript
// ❌ Bad: Functions in models folder
// models/stepContent.ts
export interface FormStep { ... }
export function isWelcomeStep(step: FormStep) { ... }  // Wrong location!

// ✅ Good: Types in models, functions in functions folder
// models/stepContent.ts
export interface FormStep { ... }

// functions/typeGuards.ts
import type { FormStep } from '../models/stepContent';
export function isWelcomeStep(step: FormStep) { ... }
```

### GraphQL Type Safety (Critical)
- **ALWAYS use generated GraphQL types** from `@/shared/graphql/generated/operations`
- **Import and re-export** generated types in entity models
- **Never recreate types manually** - use type aliases or extends for customization
- **Extract types from query results** instead of manually defining interfaces

```typescript
// ✅ Good: Extract item types from query results
import type { GetTestimonialsQuery } from '@/shared/graphql/generated/operations';
export type TestimonialItem = GetTestimonialsQuery['testimonials'][number];

// ❌ Bad: Manually recreating all fields from GraphQL types
export interface TestimonialItem {
  id: string;
  content: string;
  // ... recreating every field manually
}
```

## Development Workflows

### Creating New Entities
1. Create folder structure following the standard above
2. Define types in `models/` first
3. Create GraphQL operations in `graphql/`
4. Build composables in `composables/`
5. Add adapters if needed for domain-specific convenience
6. Export public API through `index.ts`

### GraphQL Query/Mutation Organization (Critical)
- **ALL database/GraphQL operations MUST be in entity composables**
- **Query composables** go in `entities/{entity}/composables/queries/`
- **Mutation composables** go in `entities/{entity}/composables/mutations/`
- **Features compose from entity composables** - never call GraphQL directly in features

## Import Patterns

```typescript
// ✅ Preferred: Direct imports from entity
import { useGetTestimonials, useCreateTestimonial } from '@/entities/testimonial';
import type { TestimonialData } from '@/entities/testimonial';

// ✅ Also good: Specific imports
import { useGetTestimonials } from '@/entities/testimonial/composables/queries';

// ❌ Avoid: Namespace imports (prevents tree-shaking)
import * as Testimonial from '@/entities/testimonial';
```

## Package Aliases

```typescript
// ✅ Use package aliases for shared libraries
import { Icon } from '@testimonials/icons';
import { Button } from '@testimonials/ui';

// ✅ Use @ alias for internal application paths
import { useAuth } from '@/shared/auth';
import { useGetTestimonials } from '@/entities/testimonial';
```

### Available Package Aliases
- `@testimonials/icons` - Icon component and icon sets
- `@testimonials/ui` - Shared UI component library
- `@testimonials/core` - Core types and utilities
- `@/` - Application root path alias

## Styling Guidelines

### Tailwind-First Approach
- **Use Tailwind classes as the primary styling method** for all components
- **Prefer utility-first approach** - compose styles using Tailwind utility classes
- **Remove `<style>` blocks** when all classes can be replaced with Tailwind utilities
- **Avoid custom CSS classes** unless absolutely necessary

### When Custom CSS is Acceptable
Only use custom CSS when Tailwind cannot achieve the desired effect:
1. CSS Features Not Available in Tailwind (e.g., `content: attr()`)
2. Third-Party Library Requirements
3. Performance-Critical Situations

## Pinia Store Reactivity Pattern (Critical)

When destructuring properties from Pinia stores, **ALWAYS use `toRefs()`** to maintain reactivity:

```typescript
// ✅ Correct: Use toRefs() to maintain reactivity
import { toRefs } from 'vue';
import { useAuthStore } from '@/shared/auth';

const { currentUser, isAuthenticated } = toRefs(useAuthStore());

// ❌ Wrong: Direct destructuring loses reactivity
const { currentUser, isAuthenticated } = useAuthStore();
```

## Two-Way Data Binding with defineModel (Critical)

When implementing two-way data binding (`v-model`) in Vue components, **ALWAYS use `defineModel()`**:

```vue
<script setup lang="ts">
// ✅ Good: Use defineModel for v-model binding
const modelValue = defineModel<string>({ default: '' });
</script>

<template>
  <input v-model="modelValue" />
</template>
```

## Core Entities for This Project

### Form Entity
- Collection form configuration
- Smart prompt questions
- Slug for public URL
- Settings (product name, styling)

### Testimonial Entity
- Customer-submitted testimonials
- Status: pending | approved | rejected
- Structured answers (problem, solution, result)
- AI-assembled content
- Rating (optional)

### Widget Entity
- Embeddable widget configurations
- Types: wall_of_love | carousel | single_quote
- Theme settings
- Selected testimonials

### User Entity
- Business owners
- Auth via Supabase
- Plan/subscription info

---

**Key Principle**: Follow FSD architecture strictly, use adapters for domain-specific convenience, and maintain type safety through generated GraphQL types.
