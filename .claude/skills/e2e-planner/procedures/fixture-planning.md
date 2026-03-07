# Fixture Planning for E2E Tests

How to plan API fixtures and test data for E2E tests.

## Fixture Types

### 1. API Fixtures (Server-Side)

Entities created/deleted via E2E support endpoints in the API server.

**When needed**: Tests require pre-existing data (edit flows, list views, delete flows).

**Structure**:
```
api/src/features/e2e-support/{entity}/
├── crud.ts        # Create/delete functions using Drizzle
├── routes.ts      # POST /e2e/{entity} and DELETE /e2e/{entity}/:id
├── types.ts       # Zod schemas for request/response
├── constants.ts   # Default values for test data
├── index.ts       # Route exports
└── graphql/       # .gql files for queries if needed
```

**Playwright fixture**:
```
apps/web/tests/e2e/entities/{entity}/
├── types.ts                    # TypeScript types for test data
├── fixtures/
│   ├── {entity}-api.ts         # API client (create/delete calls)
│   ├── {entity}-fixtures.ts    # Playwright fixture with auto-cleanup
│   └── index.ts                # Barrel exports
└── index.ts
```

### 2. UI-Created Data

Entities created through the UI during journey tests.

**When needed**: Testing the create flow itself. No API fixture required.

### 3. Seeded Data

Pre-existing data in the database (e.g., test user account).

**When needed**: Auth fixtures, organization context.

## Planning Checklist

### Does the Feature Need API Fixtures?

| Test Type | Needs API Fixture? | Why |
|-----------|-------------------|-----|
| Create flow (journey) | No | Test creates the entity via UI |
| Edit flow (focused) | Yes | Need pre-existing entity to edit |
| Delete flow (focused) | Yes | Need pre-existing entity to delete |
| List view (focused) | Yes | Need entities to populate list |
| Settings persistence | Yes | Need entity to save/reload settings |

### Check Existing Fixtures

```bash
# API support endpoints
ls api/src/features/e2e-support/

# Playwright fixtures
ls apps/web/tests/e2e/entities/
```

### API Fixture Design

When creating a new API fixture:

1. **Identify required fields**: What must be set to create a valid entity?
2. **Define sensible defaults**: Constants file with default values for test data
3. **Plan cleanup**: DELETE endpoint for auto-cleanup in afterAll
4. **Consider dependencies**: Does the entity need a parent (e.g., form needs organization)?

```typescript
// Example: Widget fixture with auto-cleanup
export const widgetFixtures = base.extend<{ widgetViaApi: TestWidget }>({
  widgetViaApi: async ({ authedPage, orgSlug }, use) => {
    const api = createWidgetApi(authedPage, orgSlug);
    const widget = await api.create({ type: 'wall_of_love', name: 'Test Widget' });

    await use(widget);

    // Auto-cleanup
    await api.delete(widget.id);
  },
});
```

### Fixture Composition

Fixtures can extend other fixtures for dependencies:

```typescript
// Widget fixture extends form fixture (widget needs a form's testimonials)
import { formFixtures } from '@e2e/entities/form/fixtures';

export const widgetFixtures = formFixtures.extend<{ widgetViaApi: TestWidget }>({
  widgetViaApi: async ({ authedPage, orgSlug, formViaApi }, use) => {
    // formViaApi is available from parent fixture
    const api = createWidgetApi(authedPage, orgSlug);
    const widget = await api.create({ type: 'wall_of_love' });
    await use(widget);
    await api.delete(widget.id);
  },
});
```

## Output Format

```markdown
### Fixtures Needed

| Entity | API Endpoint | Playwright Fixture | Status |
|--------|-------------|-------------------|--------|
| Widget | POST/DELETE /e2e/widgets | widgetViaApi | Exists |
| Form | POST/DELETE /e2e/forms | formViaApi | Exists |
| Testimonial | POST/DELETE /e2e/testimonials | testimonialViaApi | Needs creation |

### Fixture Dependencies
- Widget fixture depends on: auth, orgSlug
- No cross-entity dependencies needed

### Default Test Data
- Widget: `{ type: 'wall_of_love', name: 'E2E Test Widget', theme: 'light' }`
```
