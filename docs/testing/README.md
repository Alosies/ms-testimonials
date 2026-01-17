# Testing Documentation

This directory contains the single source of truth for all testing documentation in the Testimonials project.

## Documentation Index

| Document | Purpose |
|----------|---------|
| [E2E Architecture](./e2e-architecture.md) | Playwright test structure, FSD patterns, fixtures, page objects |
| [Test Organization](./test-organization.md) | Journey tests, focused tests, actions layer, DRY patterns |
| [Test IDs](./test-ids.md) | Centralized test ID system, naming conventions, selector patterns |
| [Running Tests](./running-tests.md) | Commands, environment setup, troubleshooting |

## Quick Links

### For Claude Agents

- **Adding test IDs to components**: See [Test IDs](./test-ids.md)
- **Writing new E2E tests**: See [E2E Architecture](./e2e-architecture.md)
- **Journey vs focused tests, actions**: See [Test Organization](./test-organization.md)
- **Running tests**: See [Running Tests](./running-tests.md)

### Related Skills

- `/e2e-test-ids` - Skill for managing test IDs (references this documentation)
- `/e2e-manager` - Orchestrates E2E testing operations

### Test Code Location

```
apps/web/tests/e2e/
├── app/          # Playwright fixtures
├── entities/     # Test data fixtures
├── features/     # Test specs by feature
│   └── {feature}/
│       ├── actions/        # Reusable action helpers
│       ├── focused-tests/  # Detailed debugging tests
│       └── journey-tests/  # Complete workflow tests
└── shared/       # Page objects, API clients
```
