# UI Audit for E2E Test Readiness

How to audit Vue components before writing E2E tests. Identifies missing test IDs, data attributes, and component bugs.

## Audit Process

### 1. Identify Target Components

Start from the feature's page component and trace down to all interactive elements:

```bash
# Find feature components
find apps/web/src/features/{featureName} -name "*.vue" | head -20

# Find the page component
find apps/web/src/pages -name "*.vue" | grep -i {feature}
```

### 2. Check Each Component for Test IDs

For every interactive element a test might target, verify:

| Element Type | Needs `data-testid` | Needs `data-selected` | Needs `data-{entity}-id` |
|-------------|--------------------|-----------------------|--------------------------|
| Buttons (save, delete, create) | Yes | No | No |
| Navigation links | Yes | No | No |
| Toggle/option buttons | Yes | Yes | No |
| Tab triggers | Yes | No | No |
| Input fields | Yes | No | No |
| Entity cards in lists | Yes | No | Yes |
| Modals/dialogs | Yes | No | No |
| Page containers | Yes | No | No |
| Empty states | Yes | No | No |
| Settings headings | Yes | No | No |

### 3. Check Test ID Constants File

```bash
# Find existing test ID constants
find apps/web/src/shared/constants/testIds -name "*.ts"

# Check if constants exist for this feature
cat apps/web/src/shared/constants/testIds/{feature}.ts 2>/dev/null
```

Every `data-testid` value must come from a centralized constants file, never hardcoded strings.

### 4. Verify data-selected Pattern

For any element where tests need to assert selection state (toggles, options, tabs):

```vue
<!-- Required pattern -->
<button
  :data-testid="testIds.optionName"
  :data-selected="isSelected ? 'true' : undefined"
  :class="isSelected ? 'ring-2 ring-primary' : 'border-border'"
>
```

Key rules:
- Use `undefined` not `'false'` when not selected (removes attribute entirely)
- Tests assert with `toHaveAttribute('data-selected', 'true')`
- Never assert on CSS classes for selection state

### 5. Check for Component Bugs

Common bugs found during UI audits:

| Bug Type | What to Look For | Example |
|----------|-----------------|---------|
| Missing type configs | Switch/case or object map missing new types | WidgetCard missing icon for new widget types |
| Watcher race conditions | Watchers that reset state during data load | Type watcher resetting settings when widget loads |
| Missing v-model sync | Two-way binding not working correctly | Settings not saving because emit is wrong |
| Conditional rendering gaps | v-if/v-else not covering all cases | No UI shown for new entity types |

### 6. Output Audit Results

For each component, produce:

```markdown
#### `ComponentName.vue`

**Existing test IDs**: settingsHeading, saveButton
**Missing test IDs**: typeOption (line 45), themeToggle (line 62)
**Needs data-selected**: typeOption buttons (line 45-50)
**Bugs found**: None / {description}
```

## Audit Checklist Summary

- [ ] All interactive elements have `data-testid`
- [ ] Test IDs use centralized constants (not string literals)
- [ ] Selection state uses `data-selected` attribute (not CSS classes)
- [ ] Entity list items have `data-{entity}-id` for unique identification
- [ ] Page/section containers have test IDs for visibility checks
- [ ] Empty states have test IDs
- [ ] Modals have test IDs
- [ ] No component bugs that would block testing
- [ ] All new entity types are handled in switch/map configs
