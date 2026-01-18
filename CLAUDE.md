# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Multi-Agent Worktree Setup

This project uses Git worktrees for parallel development with multiple Claude agents. Each worktree has a color-coded name that determines which Playwright MCP to use.

### Worktree Structure
```
proj-testimonials/
├── ms-testimonials/         # Parent (dev branch)
├── ms-testimonials-yellow/  # Yellow agent worktree
├── ms-testimonials-green/   # Green agent worktree
└── ms-testimonials-blue/    # Blue agent worktree
```

### Playwright MCP Selection (CRITICAL)
**You MUST use the Playwright MCP that matches your worktree folder color:**

| Folder Contains | Use This MCP |
|-----------------|--------------|
| `ms-testimonials-yellow` | `playwright-yellow` |
| `ms-testimonials-green` | `playwright-green` |
| `ms-testimonials-blue` | `playwright-blue` |

Check your working directory path to determine which color you are. Each Playwright connects to a separate Chrome profile to avoid conflicts between agents.

### Branch Naming Convention
- Yellow agent: `yellow/*` (e.g., `yellow/feature-x`)
- Green agent: `green/*` (e.g., `green/feature-y`)
- Blue agent: `blue/*` (e.g., `blue/feature-z`)
- Default branches: `yellow/default`, `green/default`, `blue/default`

### Dev Server Ports
Each worktree runs on a different port to allow parallel development:

| Worktree | Web Port | API Port |
|----------|----------|----------|
| yellow | 3001 | 4001 |
| green | 3002 | 4002 |
| blue | 3003 | 4003 |
| parent | 3000 | 4000 |

**Auto-detect port:** Use `scripts/get-agent-port.sh`
```bash
source scripts/get-agent-port.sh  # Sets E2E_PORT and E2E_BASE_URL
```

## Project Overview

Testimonials is a testimonial collection and display tool with AI-powered smart prompts. It helps businesses collect high-quality testimonials from customers through guided prompts, then assembles them into coherent testimonials using AI.

**Tagline:** "Beautiful testimonials in 2 minutes. No complexity tax."

### Tech Stack
- **Frontend**: Vue 3 + Vite + TypeScript + Tailwind CSS
- **Backend**: Hono.js REST API + Hasura GraphQL
- **Database**: PostgreSQL
- **Auth**: Supabase Auth with Hasura JWT integration
- **AI**: OpenAI GPT-4o-mini for testimonial assembly
- **Package Manager**: pnpm (v10.10.0)
- **Node Version**: 22.15.0

## Reference Project: CoursePads

This project is modeled after CoursePads and shares many architectural patterns and best practices. When implementing new features or needing inspiration for how to execute something, CoursePads can be used as a reference.

**CoursePads Repository:** `/Users/alosiesgeorge/CodeRepositories/Fork/Coursepads`

### Shared Patterns from CoursePads
- **GraphQL code patterns** - Query/mutation structure, composables, type generation
- **FSD architecture** - Feature-Sliced Design folder structure and conventions
- **Apollo Client setup** - Client configuration, caching strategies, error handling
- **URL patterns** - Slug-based routing with ID encoding (e.g., `slug_id` format)
- **Entity composables** - useEntity pattern for GraphQL operations
- **Type organization** - Models folder exports, generated type re-exports

When unsure about implementation approach, consult the CoursePads codebase for proven patterns.

## Essential Commands

### Development
```bash
pnpm install              # Install all dependencies
pnpm dev                  # Start all development servers (web + api)
pnpm dev:web              # Start only frontend
pnpm dev:api              # Start only API
pnpm build                # Build all packages
pnpm lint                 # Run linting
pnpm typecheck            # Type check all packages
pnpm codegen:web          # Generate GraphQL types for web client
pnpm codegen:web:watch    # Watch mode for GraphQL codegen
```

### Database & Hasura
```bash
# Local development
cd db && docker-compose up -d    # Start PostgreSQL + Hasura locally

# Hasura management (run from db/hasura directory)
hasura console                   # Open Hasura console
hasura migrate apply --database-name default    # Apply migrations
hasura metadata apply            # Apply metadata changes

# Create new migration
hasura migrate create "migration_name" --database-name default
```

## Architecture Overview

### Directory Structure
- `/apps/web/` - Vue.js web application (dashboard, form builder, widget preview)
- `/api/` - Hono.js REST API server
- `/db/hasura/` - Database migrations and Hasura metadata
- `/packages/libs/` - Shared libraries (core, ui, icons)
- `/docs/` - Research and planning documents

### Key Architectural Patterns

1. **Feature-Sliced Design (FSD)**: Frontend follows FSD architecture
2. **GraphQL-First**: Hasura provides the GraphQL API layer, auto-generated from PostgreSQL
3. **Type Safety**: GraphQL codegen ensures type safety across frontend
4. **JWT Auth**: Supabase handles auth, API enhances tokens with Hasura claims

### Core Entities

Based on MVP spec:
- **User**: Business owners who collect testimonials
- **Form**: Collection forms with smart prompt configuration
- **Testimonial**: Customer testimonials with status (pending/approved/rejected)
- **Widget**: Embeddable widgets (Wall of Love, Carousel, Single Quote)

### Database Conventions
- All tables must have: `id`, `user_id`, `created_at`, `updated_at`
- Use NanoID for primary keys (`generate_nanoid_12()`)
- Testimonials have a `status` field for approval workflow

### API Endpoints
- `POST /auth/enhance-token` - Enhance Supabase token with Hasura claims
- `POST /testimonials` - Submit testimonial (public)
- `PUT /testimonials/:id/approve` - Approve testimonial
- `PUT /testimonials/:id/reject` - Reject testimonial
- `GET /forms/:slug` - Get form by slug (public)
- `GET /widgets/:id` - Get widget data for embed (public)
- `POST /ai/assemble` - AI testimonial assembly

## Type and Interface Organization (FSD)

- **ALL types and interfaces MUST be exported from `models/` folders only**
- Composables, utilities, and other layers should NOT export types/interfaces
- Use barrel exports (`index.ts`) in models folders to provide clean public APIs

### GraphQL Type Safety (Critical)
- **ALWAYS use generated GraphQL types from `@/shared/graphql/generated/operations`**
- Import and re-export generated types in entity models for consistent APIs
- Never recreate types manually - use type aliases or extends for customization

## Code Style & Best Practices

### Component Size & Structure
- **Maximum 250 lines per Vue component** - If a component exceeds this, refactor by:
  - Breaking into child components
  - Extracting logic into composables
  - Moving reusable pieces to shared layer
- **Maximum 300 lines per composable** - If a composable exceeds this, refactor by:
  - Splitting into smaller, single-responsibility composables
  - Extracting reusable logic into shared utilities
- **Page files are thin wrappers** - Pages should only:
  - Render feature/entity components
  - Handle high-level conditional rendering (auth guards, loading states)
  - NOT contain business logic, complex state, or UI implementation details

### General Practices
- Prefer explicit null/undefined checks over nullish coalescing
- Use Tailwind CSS as the primary styling method
- Follow Vue 3 Composition API patterns
- Use `defineModel()` for v-model bindings
- Use `toRefs()` when destructuring Pinia stores
- **Composables (`useXxx`) must be called at setup root** - NEVER inside async callbacks, event handlers, or conditionals. See `/apps/web/CLAUDE.md` for details and factory pattern workaround.

## MVP Features (for reference)

### Must Have (Launch Blockers)
- User authentication (email/password via Supabase)
- Create/edit collection form
- Smart prompt flow (4 steps: problem, solution, result, attribution)
- AI testimonial assembly
- Customer testimonial submission
- Dashboard: view all testimonials
- Approve/reject testimonials
- Wall of Love widget
- Carousel widget
- Single quote widget
- Embed code generation
- Shareable form links

### Key Differentiator
AI-powered smart prompts that guide customers through structured questions, then assembles their answers into a coherent testimonial they can review and edit.
