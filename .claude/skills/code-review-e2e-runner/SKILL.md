---
name: code-review-e2e-runner
description: Analyze code changes and run relevant E2E tests. Maps uncommitted changes to test files using the E2E tests index. Use standalone or chained after /code-review.
allowed-tools: Bash, Read, Glob, Grep, Skill
---

# Code Review E2E Runner

Analyzes uncommitted code changes and determines which E2E tests are relevant to run, avoiding the need to run the entire test suite.

## Workflow

### Step 1: Get Uncommitted Changes

```bash
git diff --name-only  # Unstaged changes
git diff --staged --name-only  # Staged changes
```

Combine both lists to get all uncommitted changes.

### Step 2: Read the E2E Tests Index

Read the index document to understand the mapping:

```
apps/web/tests/e2e/E2E-TESTS-INDEX.md
```

### Step 3: Analyze and Map Changes

For each changed file, determine which section(s) of the index it matches:

1. **Exact path match**: File path matches a listed pattern
2. **Directory match**: File is within a listed directory pattern
3. **Keyword match**: File name contains relevant keywords (e.g., "welcome", "rating", "auth")

### Step 4: Determine Tests to Run

Based on the mapping, build a list of relevant test files. Apply these rules:

1. **Specific match found** → Run only the mapped tests
2. **Multiple features affected** → Combine all relevant tests
3. **Shared/core code changed** → Include smoke tests as baseline
4. **Test infrastructure changed** → Run all tests
5. **No clear match** → Run smoke tests and inform user

### Step 5: Execute Tests

Use the `e2e-tests-runner` skill to run the determined tests:

```
/e2e-tests-runner
```

Or run directly:

```bash
cd apps/web
source ../../scripts/get-agent-port.sh
E2E_BASE_URL=$E2E_BASE_URL pnpm playwright test <test-files> --config=tests/e2e/playwright.config.ts
```

### Step 6: Report Results

Output a summary including:
- Changed files analyzed
- Tests selected and why
- Test execution results (pass/fail)
- Duration

---

## Output Format

```markdown
## E2E Test Selection Report

### Code Changes Analyzed
- `path/to/changed/file.ts` → Matched: {section name}
- `path/to/another/file.vue` → Matched: {section name}
- `path/to/shared/util.ts` → No specific match (smoke tests)

### Selected Tests
| Test File | Reason |
|-----------|--------|
| `features/form-studio/focused-tests/navigation.spec.ts` | Changes to navigation components |
| `features/auth/login.spec.ts` | Changes to auth module |

### Execution Command
```bash
E2E_BASE_URL=http://localhost:300X pnpm playwright test features/form-studio/focused-tests/navigation.spec.ts features/auth/login.spec.ts --config=tests/e2e/playwright.config.ts
```

### Results
- **Status**: PASSED / FAILED
- **Duration**: X minutes
- **Tests Run**: X
- **Failures**: X (if any)

{If failures, show failure details}
```

---

## Mapping Logic

### Priority Order

1. **Test infrastructure changes** → Run ALL tests (highest priority)
2. **Database/API changes** → Run smoke tests + affected feature tests
3. **Feature-specific changes** → Run mapped feature tests
4. **Shared UI/utility changes** → Run smoke tests
5. **Documentation only** → Skip tests (inform user)

### Pattern Matching Examples

| Changed File | Matched Section | Tests |
|--------------|-----------------|-------|
| `src/features/form-studio/ui/WelcomeEditor.vue` | Auto-Save: Welcome Step | `autosave/welcome.spec.ts` |
| `src/features/form-studio/composables/useNavigation.ts` | Studio Navigation | `navigation.spec.ts` |
| `src/entities/formStep/models/content.ts` | Core Studio | `core.spec.ts`, `studio.spec.ts` |
| `src/shared/graphql/client.ts` | Shared / Cross-Cutting | Smoke tests |
| `tests/e2e/shared/pages/studio.page.ts` | Test Infrastructure | ALL tests |

---

## Edge Cases

### No Tests Needed
If changes are:
- Documentation only (`.md` files outside `tests/`)
- Config files that don't affect runtime (`.prettierrc`, etc.)
- Type-only changes with no runtime impact

→ Report "No E2E tests needed" and explain why.

### Ambiguous Changes
If changes affect multiple areas or mapping is unclear:

1. List the ambiguity
2. Default to smoke tests
3. Suggest specific tests user might want to run

### Large Change Sets
If more than 10 files changed across multiple features:

1. Consider running full smoke suite first
2. List all matched test sections
3. Ask user if they want targeted or comprehensive testing

---

## References

- **E2E Tests Index**: `apps/web/tests/e2e/E2E-TESTS-INDEX.md`
- **E2E Tests Runner Skill**: `/e2e-tests-runner`
- **Test Documentation**: `docs/testing/`
