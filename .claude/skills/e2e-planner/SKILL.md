---
name: e2e-planner
description: Plan E2E test implementation before writing code. Use when starting E2E work for a new feature, expanding test coverage, or preparing a test implementation plan. Triggers on "plan e2e", "e2e plan", "test plan", "plan tests".
allowed-tools: Bash, Read, Glob, Grep, Write
---

# E2E Planner

Plan E2E test implementation by auditing UI components, identifying gaps, and producing an actionable implementation plan.

## Workflow

### Step 1: Understand the Feature Scope
Read the ADR, PRD, or user description to understand what needs testing.

```bash
# Check for relevant ADR
ls docs/adr/ | grep -i "{feature}"

# Check existing test coverage
ls apps/web/tests/e2e/features/{feature}/ 2>/dev/null
```

### Step 2: UI Audit (see `procedures/ui-audit.md`)
Audit Vue components for test readiness:
- Identify all interactive elements that tests will target
- Check for existing `data-testid` attributes
- Identify elements needing `data-selected` attributes
- List missing test IDs that need to be added

### Step 3: API Fixture Planning (see `procedures/fixture-planning.md`)
Determine what test data fixtures are needed:
- What entities need to be created via API for tests?
- Do E2E support endpoints exist, or do they need to be created?
- What cleanup is needed?

### Step 4: Page Object Planning
Identify page object additions needed:
- New page objects or extensions to existing ones
- Locators needed (from test ID audit)
- Helper methods (actions that tests will reuse)

### Step 5: Test Structure Planning
Decide test organization:
- Journey tests (full user flows, tagged `@smoke`)
- Focused tests (specific behaviors, edge cases)
- What assertions each test should make

### Step 6: Produce Implementation Plan
Output a structured plan using the format below.

---

## Output Format

```markdown
## E2E Test Plan: {Feature}

### 1. UI Audit Results

#### Test IDs to Add
| Component | Element | Test ID | Notes |
|-----------|---------|---------|-------|
| `ComponentName.vue` | Save button | `feature-save-button` | Missing |
| `ComponentName.vue` | Type selector | `feature-type-option` | Needs data-selected too |

#### Component Bugs Found
- {any rendering issues, missing type configs, etc.}

### 2. API Fixtures Needed

| Entity | Endpoint | Status |
|--------|----------|--------|
| Widget | POST /e2e/widgets | Exists |
| Form | POST /e2e/forms | Needs creation |

### 3. Page Object Changes

**File**: `tests/e2e/shared/pages/{feature}.page.ts`
- New locators: {list}
- New helpers: {list}

### 4. Test Plan

#### Journey Test: {flow name}
**File**: `journey-tests/{feature}.spec.ts`
**Tags**: `@smoke`
**Flow**: {step-by-step}

#### Focused Test: {behavior name}
**File**: `focused-tests/{behavior}.spec.ts`
**Tags**: {tags}
**Covers**: {what it tests}

### 5. Implementation Order
1. {first thing to implement}
2. {second thing}
3. ...
```

---

## References

- `procedures/ui-audit.md` - How to audit Vue components for test readiness
- `procedures/fixture-planning.md` - How to plan API fixtures and test data
- `.claude/skills/e2e-tests-creator/SKILL.md` - Test creation patterns
- `.claude/skills/e2e-code-review/SKILL.md` - Review checklist (what the plan should satisfy)
