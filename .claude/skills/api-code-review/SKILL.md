---
name: api-code-review
description: Review API code for architecture and conventions compliance. Checks feature structure, pure/impure separation, GraphQL patterns, and naming conventions. Use when reviewing API changes or before committing API code. Triggers on "review api", "api code review", "check api".
allowed-tools: Bash, Read, Glob, Grep
---

# API Code Review

Review API code for compliance with Testimonials API conventions and architecture standards.

**Standards Reference**: [docs/api/feature-structure.md](../../../docs/api/feature-structure.md)

---

## Review Checklist

### 1. Feature Folder Structure

Check that features follow the standard structure:

```
api/src/features/{feature}/
├── graphql/           # .gql files only
├── prompts/           # AI prompts (if AI feature)
├── functions/         # Pure functions ONLY
├── handlers/          # HTTP handlers + impure operations
└── index.ts           # Barrel exports
```

**Check for violations**:
```bash
# Find .gql files outside graphql/ folders
find api/src/features -name "*.gql" | grep -v "/graphql/"

# Find inline GraphQL queries (should be in .gql files)
grep -r "query \|mutation " api/src/features --include="*.ts" | grep -v "import"
```

---

### 2. Pure Functions (functions/ folder)

**CRITICAL**: `functions/` must contain ONLY pure functions.

**Impurity Indicators** (should NOT be in functions/):
- `await` with external calls
- `console.log`, `console.error`
- `executeGraphQL*`, database calls
- `fetch`, HTTP calls
- AI SDK calls (`generateText`, `generateObject`)
- File system operations
- `new Date()`, `Date.now()` (pass as parameter instead)
- `Math.random()` without seed

**Check for violations**:
```bash
# Find potential impure code in functions/
grep -rn "await " api/src/features/*/functions/ --include="*.ts" | head -20
grep -rn "console\." api/src/features/*/functions/ --include="*.ts"
grep -rn "executeGraphQL" api/src/features/*/functions/ --include="*.ts"
grep -rn "fetch(" api/src/features/*/functions/ --include="*.ts"
```

---

### 3. Function Naming

**Pure functions** should use descriptive verbs:
- `derive*` - Derive values from input
- `build*` - Build/construct data structures
- `analyze*` - Analyze and extract info
- `compute*` - Compute calculated values
- `extract*` - Extract subset of data
- `transform*` - Transform data format

**Avoid** for pure functions:
- `generate*` - Implies creation/side effects
- `create*` - Implies persistence
- `fetch*` - Implies I/O
- `get*` - Ambiguous (use for impure data fetching)

**Check for violations**:
```bash
# Find functions named 'generate*' in functions/ folder
grep -rn "export function generate" api/src/features/*/functions/ --include="*.ts"
grep -rn "export const generate" api/src/features/*/functions/ --include="*.ts"
```

---

### 4. GraphQL Operations

**Rules**:
- GraphQL queries/mutations in `.gql` files only
- Located in `{feature}/graphql/` folder
- One operation per file
- File name matches operation name (camelCase)

**Check for violations**:
```bash
# Find inline GraphQL (should be in .gql files)
grep -rn "gql\`" api/src/features --include="*.ts"
grep -rn "query {" api/src/features --include="*.ts"
grep -rn "mutation {" api/src/features --include="*.ts"

# Verify .gql files are in graphql/ folders
find api/src/features -name "*.gql" -exec dirname {} \; | sort -u
```

---

### 5. Barrel Exports (index.ts)

**Rules**:
- Organized with section headers
- Types exported alongside functions
- Default export for main handler

**Check for violations**:
```bash
# Check if index.ts files exist
find api/src/features -type d -mindepth 2 -maxdepth 3 | while read dir; do
  if [ ! -f "$dir/index.ts" ]; then
    echo "Missing index.ts: $dir"
  fi
done
```

---

### 6. Prompts Folder (AI Features)

**Rules**:
- Constants in SCREAMING_SNAKE_CASE
- Each prompt in its own file
- Barrel export via index.ts

**Check for violations**:
```bash
# Find prompts not using SCREAMING_SNAKE_CASE
grep -rn "export const [a-z]" api/src/features/*/prompts/ --include="*.ts" | grep -v "index.ts"
```

---

### 7. Handler Patterns

**Rules**:
- HTTP handlers receive Hono `Context`
- Use `successResponse` and `errorResponse` utilities
- Include proper error handling

**Check for violations**:
```bash
# Find handlers not using response utilities
grep -rn "return c.json" api/src/features/*/handlers/ --include="*.ts"
```

---

## Review Procedure

1. **Identify changed files**:
   ```bash
   git diff --name-only HEAD~1 | grep "^api/src/features"
   ```

2. **For each feature, check**:
   - [ ] Folder structure matches standard
   - [ ] GraphQL in `.gql` files in `graphql/` folder
   - [ ] Pure functions in `functions/` have no side effects
   - [ ] Function names follow conventions
   - [ ] Impure operations in `handlers/` folder
   - [ ] Proper barrel exports in `index.ts`
   - [ ] AI prompts in `prompts/` (if applicable)

3. **Run automated checks**:
   ```bash
   # Type check
   cd api && pnpm typecheck

   # If GraphQL files changed, run codegen
   pnpm codegen
   ```

4. **Report findings** with:
   - File path and line number
   - Violation type
   - Suggested fix

---

## Common Issues & Fixes

### Issue: Impure function in functions/ folder

**Problem**: Function makes API call but is in `functions/`
```typescript
// functions/getFormData.ts - WRONG LOCATION
export async function getFormData(id: string) {
  const data = await executeGraphQL(...);  // Impure!
  return data;
}
```

**Fix**: Move to `handlers/`
```typescript
// handlers/getFormData.ts - CORRECT LOCATION
export async function getFormData(id: string) {
  const data = await executeGraphQL(...);
  return data;
}
```

---

### Issue: Inline GraphQL query

**Problem**: GraphQL query defined inline
```typescript
// handlers/getData.ts - WRONG
const QUERY = `query GetData { ... }`;
```

**Fix**: Move to `.gql` file
```graphql
# graphql/getData.gql - CORRECT
query GetData {
  ...
}
```

```typescript
// handlers/getData.ts - CORRECT
import { GetDataDocument } from '@/graphql/generated/operations';
```

---

### Issue: Function named 'generate*' in pure folder

**Problem**: Pure function uses 'generate' naming
```typescript
// functions/generateSuggestions.ts - MISLEADING NAME
export function generateSuggestions(...) { ... }
```

**Fix**: Rename to reflect pure nature
```typescript
// functions/deriveSuggestions.ts - CORRECT
export function deriveSuggestions(...) { ... }
```

---

## Output Format

```markdown
## API Code Review Results

### Summary
- Files reviewed: X
- Issues found: Y
- Severity: [Critical/Warning/Info]

### Issues

#### 1. [Issue Title]
- **File**: `path/to/file.ts:123`
- **Type**: [Structure/Purity/Naming/GraphQL]
- **Severity**: [Critical/Warning/Info]
- **Description**: ...
- **Fix**: ...

### Recommendations
- ...
```
