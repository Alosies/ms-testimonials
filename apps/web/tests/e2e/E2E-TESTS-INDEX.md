# E2E Tests Index

This document maps code changes to relevant E2E tests. Used by the `code-review-e2e-runner` skill to determine which tests to run based on uncommitted changes.

## How This Index Works

Each section maps **source code patterns** to **relevant test files**. When code changes match a pattern, the corresponding tests should be run.

---

## Feature: Authentication

### Source Code Patterns
- `apps/web/src/shared/auth/**`
- `apps/web/src/features/auth/**`
- `apps/web/src/pages/auth/**`
- `apps/web/src/pages/login/**`
- `api/src/routes/auth/**`

### Relevant Tests
| Test File | Purpose | Tags |
|-----------|---------|------|
| `features/auth/login.spec.ts` | Login flow, dashboard redirect | - |

### Run Command
```bash
pnpm playwright test features/auth --config=tests/e2e/playwright.config.ts
```

---

## Feature: Forms List / Dashboard

### Source Code Patterns
- `apps/web/src/pages/forms/**`
- `apps/web/src/features/forms-list/**`
- `apps/web/src/entities/form/composables/queries/**` (list queries)

### Relevant Tests
| Test File | Purpose | Tags |
|-----------|---------|------|
| `features/forms-list/forms-list.spec.ts` | Forms list page, empty states | - |

### Run Command
```bash
pnpm playwright test features/forms-list --config=tests/e2e/playwright.config.ts
```

---

## Feature: Form Studio

The Form Studio is the main feature with extensive test coverage. It's subdivided into specific areas.

### Core Studio (Loading, Selection, Step Management)

#### Source Code Patterns
- `apps/web/src/pages/studio/**`
- `apps/web/src/features/form-studio/**`
- `apps/web/src/entities/formStep/**`
- `apps/web/src/entities/form/composables/**` (form loading)

#### Relevant Tests
| Test File | Purpose | Tags |
|-----------|---------|------|
| `features/form-studio/journey-tests/studio.spec.ts` | Comprehensive smoke test covering all studio features | `@smoke` |
| `features/form-studio/focused-tests/core.spec.ts` | Studio loading, step selection, adding steps | - |

#### Run Command
```bash
pnpm playwright test features/form-studio/focused-tests/core.spec.ts features/form-studio/journey-tests/studio.spec.ts --config=tests/e2e/playwright.config.ts
```

---

### Studio Navigation (Sidebar, Keyboard, Canvas)

#### Source Code Patterns
- `apps/web/src/features/form-studio/**/navigation**`
- `apps/web/src/features/form-studio/**/sidebar**`
- `apps/web/src/features/form-studio/**/canvas**`
- `apps/web/src/features/form-studio/**/keyboard**`
- Any component handling `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` keys

#### Relevant Tests
| Test File | Purpose | Tags |
|-----------|---------|------|
| `features/form-studio/journey-tests/studio.spec.ts` | Navigation within comprehensive test | `@smoke` |
| `features/form-studio/focused-tests/navigation.spec.ts` | Sidebar clicks, keyboard nav, branch switching | - |

#### Run Command
```bash
pnpm playwright test features/form-studio/focused-tests/navigation.spec.ts --config=tests/e2e/playwright.config.ts
```

---

### Studio Keyboard Shortcuts (E key, Mod+D)

#### Source Code Patterns
- `apps/web/src/features/form-studio/**/shortcuts**`
- `apps/web/src/features/form-studio/**/keyboard**`
- Components handling `e` key (edit) or `Mod+D` / `Ctrl+D` / `Meta+D` (delete)

#### Relevant Tests
| Test File | Purpose | Tags |
|-----------|---------|------|
| `features/form-studio/focused-tests/keyboard-shortcuts.spec.ts` | E key to edit, Mod+D to delete with confirmation | - |

#### Run Command
```bash
pnpm playwright test features/form-studio/focused-tests/keyboard-shortcuts.spec.ts --config=tests/e2e/playwright.config.ts
```

---

### Studio Properties Panel

#### Source Code Patterns
- `apps/web/src/features/form-studio/**/properties**`
- `apps/web/src/features/form-studio/**/panel**`
- `apps/web/src/features/form-studio/**/editor**`
- Step-specific editors (Welcome, Question, Rating, Consent, ThankYou)

#### Relevant Tests
| Test File | Purpose | Tags |
|-----------|---------|------|
| `features/form-studio/focused-tests/properties-panel.spec.ts` | Panel content for each step type | - |

#### Run Command
```bash
pnpm playwright test features/form-studio/focused-tests/properties-panel.spec.ts --config=tests/e2e/playwright.config.ts
```

---

### Studio Branching

#### Source Code Patterns
- `apps/web/src/features/form-studio/**/branch**`
- `apps/web/src/entities/formStep/**/branch**`
- Components handling branch flows (testimonial, improvement)

#### Relevant Tests
| Test File | Purpose | Tags |
|-----------|---------|------|
| `features/form-studio/journey-tests/studio.spec.ts` | Branch navigation in comprehensive test | `@smoke` |
| `features/form-studio/focused-tests/navigation.spec.ts` | Branch switching, all steps in branched forms | - |

#### Run Command
```bash
pnpm playwright test features/form-studio/focused-tests/navigation.spec.ts --config=tests/e2e/playwright.config.ts
```

---

### Auto-Save: Welcome Step

#### Source Code Patterns
- `apps/web/src/features/form-studio/**/welcome**`
- `apps/web/src/entities/formStep/**/welcome**`
- Welcome step content: title, subtitle, button text

#### Relevant Tests
| Test File | Purpose | Tags |
|-----------|---------|------|
| `features/form-studio/focused-tests/autosave/welcome.spec.ts` | Welcome step field persistence | `@autosave`, `@smoke` |

#### Run Command
```bash
pnpm playwright test features/form-studio/focused-tests/autosave/welcome.spec.ts --config=tests/e2e/playwright.config.ts
```

---

### Auto-Save: Question Step

#### Source Code Patterns
- `apps/web/src/features/form-studio/**/question**`
- `apps/web/src/entities/formStep/**/question**`
- Question step content: question text, required, placeholder, help text

#### Relevant Tests
| Test File | Purpose | Tags |
|-----------|---------|------|
| `features/form-studio/focused-tests/autosave/question.spec.ts` | Question step field persistence | `@autosave`, `@smoke` |

#### Run Command
```bash
pnpm playwright test features/form-studio/focused-tests/autosave/question.spec.ts --config=tests/e2e/playwright.config.ts
```

---

### Auto-Save: Rating Step

#### Source Code Patterns
- `apps/web/src/features/form-studio/**/rating**`
- `apps/web/src/entities/formStep/**/rating**`
- Rating step content: question, labels, help text, required

#### Relevant Tests
| Test File | Purpose | Tags |
|-----------|---------|------|
| `features/form-studio/focused-tests/autosave/rating.spec.ts` | Rating step field persistence | `@autosave`, `@smoke` |

#### Run Command
```bash
pnpm playwright test features/form-studio/focused-tests/autosave/rating.spec.ts --config=tests/e2e/playwright.config.ts
```

---

### Auto-Save: Consent Step

#### Source Code Patterns
- `apps/web/src/features/form-studio/**/consent**`
- `apps/web/src/entities/formStep/**/consent**`
- Consent step content: title, description, public/private options

#### Relevant Tests
| Test File | Purpose | Tags |
|-----------|---------|------|
| `features/form-studio/focused-tests/autosave/consent.spec.ts` | Consent step field persistence | `@autosave` |

#### Run Command
```bash
pnpm playwright test features/form-studio/focused-tests/autosave/consent.spec.ts --config=tests/e2e/playwright.config.ts
```

---

### Auto-Save: Thank You Step

#### Source Code Patterns
- `apps/web/src/features/form-studio/**/thankyou**`
- `apps/web/src/features/form-studio/**/thank-you**`
- `apps/web/src/entities/formStep/**/thankyou**`
- Thank You step content: title, message, redirect URL

#### Relevant Tests
| Test File | Purpose | Tags |
|-----------|---------|------|
| `features/form-studio/focused-tests/autosave/thankyou.spec.ts` | Thank You step field persistence | `@autosave` |

#### Run Command
```bash
pnpm playwright test features/form-studio/focused-tests/autosave/thankyou.spec.ts --config=tests/e2e/playwright.config.ts
```

---

## Shared / Cross-Cutting Concerns

### GraphQL Client & API

#### Source Code Patterns
- `apps/web/src/shared/graphql/**`
- `apps/web/src/shared/api/**`
- `api/src/**` (API server changes)

#### Recommended Tests
Run smoke tests as a baseline validation:

```bash
pnpm test:e2e:smoke
```

---

### UI Components (Shared)

#### Source Code Patterns
- `packages/libs/ui/**`
- `apps/web/src/shared/ui/**`

#### Recommended Tests
Run smoke tests to validate UI doesn't break core flows:

```bash
pnpm test:e2e:smoke
```

---

### Test Infrastructure

#### Source Code Patterns
- `apps/web/tests/e2e/app/**` (fixtures)
- `apps/web/tests/e2e/entities/**` (test data factories)
- `apps/web/tests/e2e/shared/**` (page objects)
- `apps/web/tests/e2e/playwright.config.ts`

#### Recommended Tests
Run ALL tests to validate infrastructure changes don't break anything:

```bash
pnpm test:e2e
```

---

## Quick Reference: Test Commands

| Scope | Command |
|-------|---------|
| All tests | `pnpm test:e2e` |
| Smoke tests only | `pnpm test:e2e:smoke` |
| By tag | `pnpm playwright test --grep @autosave --config=tests/e2e/playwright.config.ts` |
| Specific feature | `pnpm playwright test features/form-studio --config=tests/e2e/playwright.config.ts` |
| Specific file | `pnpm playwright test features/auth/login.spec.ts --config=tests/e2e/playwright.config.ts` |

**Note**: Always prefix with `E2E_BASE_URL=http://localhost:300X` where X matches your worktree port.

---

## Test Tags Reference

| Tag | Purpose | Test Count |
|-----|---------|------------|
| `@smoke` | Critical path validation, quick feedback | ~6 tests |
| `@autosave` | Auto-save functionality | ~5 test suites |

---

## Ambiguous Changes

When code changes don't clearly map to a specific feature, use these heuristics:

1. **Multiple features affected** → Run smoke tests first, then specific tests
2. **Core entity changes** (`entities/form/**`, `entities/formStep/**`) → Run all studio tests
3. **Shared utilities** → Run smoke tests
4. **Database/migration changes** → Run all tests
5. **Unknown/unclear** → Ask user or run smoke tests as baseline
