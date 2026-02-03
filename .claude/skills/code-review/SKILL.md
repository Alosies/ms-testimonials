---
name: code-review
description: Review staged code before commit. Senior engineer review for Vue 3, TypeScript, GraphQL, Tailwind, FSD architecture. Use when running /code-review, before committing, or when user asks for code review.
allowed-tools: Bash, Read, Glob, Grep, Skill
---

# Code Review Skill

Senior software engineer review for Vue 3 + TypeScript + GraphQL + Tailwind projects following FSD architecture.

## Workflow

### Step 1: Get Staged Changes
```bash
git diff --staged --name-only  # List changed files
git diff --staged              # Full diff for review
```

### Step 2: Route E2E Test Files
If staged changes include E2E test files (`*.spec.ts` in `tests/e2e/`), delegate to `/e2e-code-review` for those files. It will:
- Review test code against Playwright best practices
- Run the tests and report pass/fail status
- Report duration

### Step 3: Route API Files
If staged changes include any files in `api/` folder, invoke `/api-code-review`. It will check:
- Feature folder structure (`graphql/`, `functions/`, `handlers/`, `prompts/`)
- Pure function purity (no side effects in `functions/` folder)
- Function naming conventions (`derive*` not `generate*` for pure functions)
- GraphQL operations in `.gql` files
- Barrel exports and type safety

### Step 4: Review Page Files
If changes include files in `src/pages/`, check that they are thin wrappers:
- Count lines in `<script setup>` - flag if >50 lines
- Check for data fetching composables (`useGet*`, `useQuery`) - should be in feature components
- Check for business logic (computed with rules, event handlers with logic)
- Verify page only imports layouts and feature/entity components

### Step 5: Analyze by Category
Review remaining files (not E2E or API) against the checklist below.

### Step 6: Report Issues
Use the output format below. Include file:line references and severity levels.

### Step 7: Chain to E2E Test Runner (Optional)
After completing the code review, offer to run relevant E2E tests:

```
Would you like me to run relevant E2E tests for these changes? (/code-review-e2e-runner)
```

If the user agrees or if running as part of a comprehensive review, invoke:
```
/code-review-e2e-runner
```

This will analyze the changes and run only the E2E tests relevant to the modified code.

---

## Quick Checklist

### Vue 3
- [ ] `defineModel()` for v-model (not props+emit pattern)
- [ ] **`toRefs()` when destructuring Pinia stores** - direct destructuring breaks reactivity
- [ ] **No getter functions for store properties in watch** - use `toRefs()` refs instead of `() => store.prop`
- [ ] Composition API used (not Options API)
- [ ] `computed()` for derived state
- [ ] Refs unwrapped with `.value` correctly
- [ ] **Composables called at setup root** - NOT inside async callbacks, event handlers, or conditionals

### TypeScript
- [ ] Generated GraphQL types from `@/shared/graphql/generated/operations`
- [ ] Types extracted from queries: `Query['field'][number]`
- [ ] No `any` or unjustified type assertions
- [ ] Return types on exported functions
- [ ] **Functions with >2 args use object params** - use named interface for clarity

### GraphQL
- [ ] Generated composables used (not raw .gql imports)
- [ ] Features use entity composables (not direct GraphQL)
- [ ] `enabled` ref for conditional queries
- [ ] Safe extraction: `?? []` or `?? null`

### FSD Architecture
- [ ] Layer imports: pages → features → entities → shared
- [ ] Types exported only from `models/` folders
- [ ] **No functions in `models/` folders** - move to `functions/` folder
- [ ] Composables in `composables/` folders with `useXxx` naming
- [ ] No cross-feature imports

### Component Size & Structure
- [ ] **Max 250 lines per Vue component** - refactor if exceeded (child components or composables)
- [ ] **Max 300 lines per composable** - refactor if exceeded (smaller composables or shared utilities)
- [ ] **Page files are thin wrappers** - see Pages section below

### Pages (`src/pages/`)
Page files should be **thin wrappers** that only:
- [ ] Render feature/entity components
- [ ] Handle high-level conditional rendering (auth guards, loading states, error boundaries)
- [ ] Define route metadata via `definePage()`

Page files should **NOT** contain:
- [ ] Business logic or complex state management
- [ ] Data fetching (composables like `useGetX`) - move to feature components
- [ ] Event handlers with logic - move to feature components
- [ ] Computed properties with business rules - move to features
- [ ] More than ~50 lines of `<script setup>` code

```vue
<!-- ✅ Good: Thin page wrapper -->
<script setup lang="ts">
import { definePage } from 'unplugin-vue-router/runtime';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { CreditsSettingsView } from '@/features/credits';

definePage({ meta: { requiresAuth: true } });
</script>

<template>
  <AuthLayout>
    <CreditsSettingsView />
  </AuthLayout>
</template>
```

```vue
<!-- ❌ Bad: Page with business logic -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useGetCredits } from '@/entities/credits';

const { credits, loading } = useGetCredits();
const filter = ref('all');
const filteredCredits = computed(() =>
  credits.value?.filter(c => filter.value === 'all' || c.type === filter.value)
);
const handleRefresh = async () => { /* logic */ };
// ... more logic that belongs in a feature component
</script>
```

### Tailwind
- [ ] Tailwind classes used (not custom CSS)
- [ ] Custom CSS only for: `content: attr()`, CSS variables, animations

### Security
- [ ] No hardcoded secrets or API keys
- [ ] No `console.log` with sensitive data
- [ ] No `v-html` with user input
- [ ] Input validation present

---

## Output Format

```markdown
## Code Review Results

### Summary
- **Files Reviewed**: {count}
- **Issues**: {critical} Critical, {warning} Warnings, {info} Info

### Critical Issues (Must Fix)

#### [CRITICAL] {Category}: {Title}
**File**: `{path}`:{line}
**Issue**: {description}
**Fix**: {how to fix}

### Warnings (Should Fix)

#### [WARNING] {Category}: {Title}
**File**: `{path}`:{line}
**Issue**: {description}

### Passed Checks
- {what was verified}
```

---

## References

Project documentation:
- `/apps/web/CLAUDE.md` - FSD architecture, composables, GraphQL patterns
- `/docs/api/feature-structure.md` - API feature folder structure standards

Related skills:
- `/api-code-review` - Specialized review for API code (auto-delegated for `api/` files)
- `/e2e-code-review` - Specialized review for E2E test files (auto-delegated)
- `/code-review-e2e-runner` - Run relevant E2E tests based on code changes (chained after review)
