# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

### General Practices
- Prefer explicit null/undefined checks over nullish coalescing
- Use Tailwind CSS as the primary styling method
- Follow Vue 3 Composition API patterns
- Use `defineModel()` for v-model bindings
- Use `toRefs()` when destructuring Pinia stores

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
