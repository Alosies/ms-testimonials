# ADR-025: E2E Test Data Seeding — Form Submissions & Testimonials

**Date**: 2026-02-22
**Status**: Proposed
**Parent**: ADR-025 Testimonials Display (Phase 7)

---

## Problem

The testimonials list E2E test relies on pre-existing data in the test account. If no testimonials exist, the test hits the empty state and exits early — making it fragile and non-deterministic.

E2E tests need a way to **seed form submissions** before each test run, creating deterministic testimonial data that can be asserted against and cleaned up afterward.

---

## Approach: Reuse `submitForm` Operation

The existing `submitForm()` Drizzle transaction (`api/src/features/submissions/operations/submitForm.ts`) already handles the full atomic flow:

1. Upsert contact (email deduplication)
2. Insert `form_submission`
3. Batch insert `form_question_responses`
4. Conditionally create `testimonial` (if `testimonialContent` or `rating` is provided)

The E2E endpoint calls `submitForm()` directly — no custom CRUD primitives needed.

### Two Flow Types

| Flow | Rating | Testimonial Created? | Use Case |
|------|--------|---------------------|----------|
| `testimonial` | 5 (default) | Yes (`status='pending'`) | Tests that need visible testimonials in the table |
| `improvement` | 2 (default) | No (`testimonialId=null`) | Tests that verify improvement submissions don't create testimonials |

---

## Implementation

### Step 1: API — E2E Submissions Endpoint

#### 1.1 Types

**Create:** `api/src/features/e2e-support/submissions/types.ts`

```typescript
export interface CreateSubmissionRequest {
  formId: string;
  flow: 'testimonial' | 'improvement';
  contact?: {
    email?: string;
    name?: string;
    companyName?: string;
  };
  testimonialContent?: string;
  rating?: number;
}

export interface CreateSubmissionResponse {
  submissionId: string;
  testimonialId: string | null;
  contactId: string;
  flow: 'testimonial' | 'improvement';
}
```

#### 1.2 Route Handler

**Create:** `api/src/features/e2e-support/submissions/routes.ts`

```typescript
import type { Context } from 'hono';
import { env } from '@/shared/config/env';
import { submitForm } from '@/features/submissions';
import type { CreateSubmissionRequest } from './types';

const MOCK_TESTIMONIAL_CONTENTS = [
  'This product completely transformed our workflow. Highly recommend!',
  'Outstanding customer support and an intuitive interface.',
  'Best investment we made this year. The ROI speaks for itself.',
];

export async function createFormSubmission(c: Context) {
  const body = await c.req.json() as CreateSubmissionRequest;
  const { formId, flow, contact, testimonialContent, rating } = body;

  if (!formId) return c.json({ error: 'formId is required' }, 400);
  if (!flow || !['testimonial', 'improvement'].includes(flow)) {
    return c.json({ error: 'flow must be "testimonial" or "improvement"' }, 400);
  }

  const timestamp = Date.now();
  const mockEmail = contact?.email ?? `e2e-customer-${timestamp}@test.example.com`;
  const mockName = contact?.name ?? `E2E Customer ${timestamp}`;

  const isTestimonialFlow = flow === 'testimonial';
  const effectiveRating = rating ?? (isTestimonialFlow ? 5 : 2);
  const effectiveContent = isTestimonialFlow
    ? (testimonialContent ?? MOCK_TESTIMONIAL_CONTENTS[timestamp % MOCK_TESTIMONIAL_CONTENTS.length])
    : undefined;

  const result = await submitForm({
    formId,
    organizationId: env.E2E_ORGANIZATION_ID,
    contact: {
      email: mockEmail,
      name: mockName,
      companyName: contact?.companyName ?? 'E2E Test Corp',
    },
    questionResponses: [],
    testimonialContent: effectiveContent,
    rating: effectiveRating,
  });

  return c.json({
    submissionId: result.submissionId,
    testimonialId: result.testimonialId,
    contactId: result.contactId,
    flow,
  }, 201);
}
```

#### 1.3 Barrel Export & Registration

**Create:** `api/src/features/e2e-support/submissions/index.ts`
- Export `createFormSubmission`

**Modify:** `api/src/features/e2e-support/index.ts`
- Add `export { createFormSubmission } from './submissions'`

**Modify:** `api/src/routes/e2e.ts`
- Add `app.post('/submissions', createFormSubmission)`

---

### Step 2: Web — Test Types & API Helpers

#### 2.1 Testimonial Entity Test Types

**Create:** `apps/web/tests/e2e/entities/testimonial/types.ts`

```typescript
/** Response from E2E API submission creation */
export interface CreateSubmissionResponse {
  submissionId: string;
  testimonialId: string | null;
  contactId: string;
  flow: 'testimonial' | 'improvement';
}

/** Full test data returned by fixtures */
export interface TestSubmissionData extends CreateSubmissionResponse {
  formId: string;
  contact: {
    email: string;
    name: string;
    companyName?: string;
  };
}

/** Form with seeded testimonials for E2E tests */
export interface TestFormWithTestimonialsData {
  formId: string;
  formName: string;
  orgSlug: string;
  /** Submissions created (both flows) */
  submissions: TestSubmissionData[];
  /** Only testimonial-flow submissions (have testimonialId) */
  testimonialSubmissions: TestSubmissionData[];
  /** Only improvement-flow submissions (no testimonialId) */
  improvementSubmissions: TestSubmissionData[];
}
```

#### 2.2 Submission API Helpers

**Create:** `apps/web/tests/e2e/entities/testimonial/fixtures/submission-api.ts`

```typescript
import { testApiRequest } from '@e2e/shared';
import type { CreateSubmissionResponse, TestSubmissionData } from '../types';

export async function createTestSubmission(
  formId: string,
  flow: 'testimonial' | 'improvement',
  overrides?: { name?: string; email?: string; companyName?: string }
): Promise<TestSubmissionData> {
  const timestamp = Date.now();
  const contact = {
    email: overrides?.email ?? `e2e-${flow}-${timestamp}@test.example.com`,
    name: overrides?.name ?? `E2E ${flow === 'testimonial' ? 'Happy' : 'Feedback'} Customer ${timestamp}`,
    companyName: overrides?.companyName ?? 'E2E Test Corp',
  };

  const result = await testApiRequest<CreateSubmissionResponse>('POST', '/submissions', {
    formId,
    flow,
    contact,
  });

  return { ...result, formId, contact };
}

/**
 * Create multiple submissions with mixed flows.
 * Default: 2 testimonial + 1 improvement = 3 submissions, 2 testimonials.
 */
export async function createTestSubmissions(
  formId: string,
  options?: { testimonialCount?: number; improvementCount?: number }
): Promise<TestSubmissionData[]> {
  const testimonialCount = options?.testimonialCount ?? 2;
  const improvementCount = options?.improvementCount ?? 1;
  const submissions: TestSubmissionData[] = [];

  for (let i = 0; i < testimonialCount; i++) {
    submissions.push(await createTestSubmission(formId, 'testimonial', {
      name: `Happy Customer ${i + 1}`,
    }));
  }

  for (let i = 0; i < improvementCount; i++) {
    submissions.push(await createTestSubmission(formId, 'improvement', {
      name: `Feedback Customer ${i + 1}`,
    }));
  }

  return submissions;
}
```

---

### Step 3: Web — Playwright Fixtures

#### 3.1 Testimonial Fixtures

**Create:** `apps/web/tests/e2e/entities/testimonial/fixtures/testimonial-fixtures.ts`

Extends form fixtures. Creates a simple form + seeded submissions. Teardown deletes the form (cascade cleans submissions/testimonials).

```typescript
import { test as appTest } from '@e2e/app/fixtures';
import { testApiRequest } from '@e2e/shared';
import { createTestSubmissions } from './submission-api';
import type { TestFormWithTestimonialsData, TestSubmissionData } from '../types';

// Minimal form response type (only fields we need)
interface SimpleFormResponse {
  formId: string;
  formName: string;
}

export interface TestimonialFixtures {
  /** Form with 2 testimonial + 1 improvement submissions seeded */
  formWithTestimonials: TestFormWithTestimonialsData;
}

export const test = appTest.extend<TestimonialFixtures>({
  formWithTestimonials: async ({ orgSlug }, use) => {
    // 1. Create a simple form via E2E API
    const form = await testApiRequest<SimpleFormResponse>('POST', '/forms', {
      name: `E2E Testimonials Test ${Date.now()}`,
    });

    // 2. Seed submissions (2 testimonial + 1 improvement)
    const submissions = await createTestSubmissions(form.formId);

    const testimonialSubmissions = submissions.filter(s => s.testimonialId !== null);
    const improvementSubmissions = submissions.filter(s => s.testimonialId === null);

    const data: TestFormWithTestimonialsData = {
      formId: form.formId,
      formName: form.formName,
      orgSlug,
      submissions,
      testimonialSubmissions,
      improvementSubmissions,
    };

    await use(data);

    // 3. Cleanup: delete form (cascades to submissions/testimonials)
    try {
      await testApiRequest('DELETE', `/forms/${form.formId}`);
    } catch (error) {
      console.warn(`Failed to cleanup form ${form.formId}:`, error);
    }
  },
});

export { expect } from '@playwright/test';
```

#### 3.2 Barrel Exports

**Create:** `apps/web/tests/e2e/entities/testimonial/fixtures/index.ts`
```typescript
export { test, expect } from './testimonial-fixtures';
export type { TestimonialFixtures } from './testimonial-fixtures';
```

**Create:** `apps/web/tests/e2e/entities/testimonial/index.ts`
```typescript
export { test, expect } from './fixtures';
export type { TestimonialFixtures } from './fixtures';
export type * from './types';
```

---

### Step 4: Update Journey Test

**Modify:** `apps/web/tests/e2e/features/testimonials-list/journey-tests/testimonials-list.spec.ts`

Replace fragile pre-existing data test with deterministic seeded data:

```typescript
import { test, expect } from '@e2e/entities/testimonial';
import { createTestimonialsPage } from '@e2e/shared';

test.describe('Testimonials List', () => {
  test('user can view seeded testimonials, select rows, and filter', async ({
    authedPage,
    formWithTestimonials,
  }) => {
    const page = createTestimonialsPage(authedPage);
    await page.goto();

    // Table should be visible with seeded data
    await page.expectTableVisible();

    // Should have at least the seeded testimonial count
    // (2 testimonial-flow submissions = 2 testimonials visible)
    await page.expectRowCountGreaterThan(0);

    // Filter tabs should be visible
    await expect(page.filterTabs).toBeVisible();

    // Click a row — detail panel should update
    await page.clickRow(0);
    const detailVisible = await page.detailCustomerName.isVisible().catch(() => false);
    if (detailVisible) {
      // Detail panel shows a customer name
      await expect(page.detailCustomerName).not.toBeEmpty();
    }

    // Search for a seeded customer name
    const seededName = formWithTestimonials.testimonialSubmissions[0].contact.name;
    await page.searchInput.fill(seededName);
    await authedPage.waitForTimeout(300);
    const searchCount = await page.tableRows.count();
    expect(searchCount).toBeGreaterThanOrEqual(1);

    // Clear search
    await page.searchInput.fill('');
    await authedPage.waitForTimeout(300);

    // Non-matching search returns zero rows
    await page.searchInput.fill('zzz_nonexistent_zzz');
    await authedPage.waitForTimeout(300);
    expect(await page.tableRows.count()).toBe(0);
  });
});
```

---

## Cleanup Strategy

- **Form deletion cascades**: Deleting the form via `DELETE /e2e/forms/:id` soft-deletes it. Testimonials and submissions remain in the DB but are filtered out by `is_active` checks.
- **Fixture teardown**: The `formWithTestimonials` fixture automatically cleans up after each test.
- **Bulk cleanup**: The existing `POST /e2e/cleanup` endpoint cleans forms older than N hours.
- **Contact deduplication**: Each test uses unique timestamped emails, so contacts don't collide between parallel runs.

---

## Files Summary

| Action | File |
|--------|------|
| Create | `api/src/features/e2e-support/submissions/types.ts` |
| Create | `api/src/features/e2e-support/submissions/routes.ts` |
| Create | `api/src/features/e2e-support/submissions/index.ts` |
| Modify | `api/src/features/e2e-support/index.ts` |
| Modify | `api/src/routes/e2e.ts` |
| Create | `apps/web/tests/e2e/entities/testimonial/types.ts` |
| Create | `apps/web/tests/e2e/entities/testimonial/fixtures/submission-api.ts` |
| Create | `apps/web/tests/e2e/entities/testimonial/fixtures/testimonial-fixtures.ts` |
| Create | `apps/web/tests/e2e/entities/testimonial/fixtures/index.ts` |
| Create | `apps/web/tests/e2e/entities/testimonial/index.ts` |
| Modify | `apps/web/tests/e2e/features/testimonials-list/journey-tests/testimonials-list.spec.ts` |

---

## Verification

1. `pnpm typecheck` — zero errors
2. API manual test:
   ```bash
   curl -X POST http://localhost:4002/e2e/submissions \
     -H "Content-Type: application/json" \
     -H "X-E2E-Token: $E2E_API_SECRET" \
     -d '{"formId":"<test-form-id>","flow":"testimonial"}'
   # Returns: { submissionId, testimonialId, contactId, flow: "testimonial" }

   curl -X POST http://localhost:4002/e2e/submissions \
     -H "Content-Type: application/json" \
     -H "X-E2E-Token: $E2E_API_SECRET" \
     -d '{"formId":"<test-form-id>","flow":"improvement"}'
   # Returns: { submissionId, testimonialId: null, contactId, flow: "improvement" }
   ```
3. E2E test passes with seeded data:
   ```bash
   pnpm exec playwright test --config=tests/e2e/playwright.config.ts tests/e2e/features/testimonials-list/
   ```
4. Seeded testimonials appear in the table with correct customer names
5. Form cleanup cascades and removes submissions/testimonials

---

## Reference Files

| File | Pattern |
|------|---------|
| `api/src/features/submissions/operations/submitForm.ts` | Drizzle transaction to reuse |
| `api/src/features/submissions/schemas.ts` | `SubmitFormRequestSchema` shape |
| `api/src/features/e2e-support/form-responses/routes.ts` | E2E route handler pattern |
| `api/src/features/e2e-support/index.ts` | Feature barrel export |
| `api/src/routes/e2e.ts` | Route registration |
| `apps/web/tests/e2e/entities/form/fixtures/form-api.ts` | Web-side API helper pattern |
| `apps/web/tests/e2e/entities/form/fixtures/form-fixtures.ts` | Playwright fixture extension |
| `apps/web/tests/e2e/entities/form/types.ts` | Web-side test type definitions |
