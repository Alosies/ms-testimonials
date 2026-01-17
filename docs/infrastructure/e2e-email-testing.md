# E2E Email Testing Infrastructure

This document describes the email infrastructure used for E2E testing, including account verification flows, password resets, and notification testing.

## Architecture Overview

```
User signs up with:                    Cloudflare              Testmail.app
testimonials-ms-e2e-tests@brownforge.com  -->  Email Routing  -->  API Inbox
                                                    |
                                              Forward to:
                                        nvg6l.testimonials@inbox.testmail.app
```

## Services Used

### Cloudflare Email Routing
- **Domain:** brownforge.com
- **Custom Address:** `testimonials-ms-e2e-tests@brownforge.com`
- **Purpose:** Provides a real-looking email domain for E2E tests

### Testmail.app
- **Namespace:** `nvg6l`
- **Destination:** `nvg6l.testimonials@inbox.testmail.app`
- **Purpose:** API-accessible inbox for programmatic email reading

## Environment Variables

Add these to your `.env.local` or CI environment:

```bash
# Testmail.app Configuration
TESTMAIL_API_KEY=your-api-key-here
TESTMAIL_NAMESPACE=nvg6l
TESTMAIL_TAG=testimonials

# E2E Test Email
E2E_TEST_EMAIL=testimonials-ms-e2e-tests@brownforge.com
```

## Usage in Playwright Tests

### Fetching Emails

```typescript
// apps/web/tests/e2e/utils/email.ts

interface TestmailEmail {
  id: string;
  subject: string;
  text: string;
  html: string;
  from: string;
  to: string;
  timestamp: number;
}

interface TestmailResponse {
  result: string;
  count: number;
  emails: TestmailEmail[];
}

const TESTMAIL_API_KEY = process.env.TESTMAIL_API_KEY!;
const TESTMAIL_NAMESPACE = process.env.TESTMAIL_NAMESPACE!;
const TESTMAIL_TAG = process.env.TESTMAIL_TAG || 'testimonials';

/**
 * Fetch the latest email from Testmail.app
 * Uses livequery to wait for new emails (up to 60s timeout)
 */
export async function getLatestEmail(tag: string = TESTMAIL_TAG): Promise<TestmailEmail | null> {
  const url = new URL('https://api.testmail.app/api/json');
  url.searchParams.set('apikey', TESTMAIL_API_KEY);
  url.searchParams.set('namespace', TESTMAIL_NAMESPACE);
  url.searchParams.set('tag', tag);
  url.searchParams.set('livequery', 'true');

  const response = await fetch(url.toString());
  const data: TestmailResponse = await response.json();

  return data.emails[0] || null;
}

/**
 * Extract verification/magic link from email content
 */
export function extractLinkFromEmail(email: TestmailEmail, pattern: RegExp): string | null {
  const match = email.text.match(pattern) || email.html.match(pattern);
  return match ? match[0] : null;
}

/**
 * Wait for and extract a verification link from incoming email
 */
export async function waitForVerificationEmail(): Promise<string | null> {
  const email = await getLatestEmail();
  if (!email) return null;

  // Adjust pattern based on your email templates
  const linkPattern = /https?:\/\/[^\s"<>]+verify[^\s"<>]*/i;
  return extractLinkFromEmail(email, linkPattern);
}
```

### Example Test: User Registration with Email Verification

```typescript
// apps/web/tests/e2e/auth/registration.spec.ts

import { test, expect } from '@playwright/test';
import { getLatestEmail, extractLinkFromEmail } from '../utils/email';

test('user can register and verify email', async ({ page }) => {
  const testEmail = process.env.E2E_TEST_EMAIL!;

  // 1. Go to registration page
  await page.goto('/register');

  // 2. Fill registration form
  await page.fill('[data-testid="email-input"]', testEmail);
  await page.fill('[data-testid="password-input"]', 'TestPassword123!');
  await page.click('[data-testid="register-button"]');

  // 3. Wait for confirmation page
  await expect(page.locator('[data-testid="check-email-message"]')).toBeVisible();

  // 4. Fetch verification email from Testmail.app
  const email = await getLatestEmail();
  expect(email).not.toBeNull();
  expect(email!.subject).toContain('Verify');

  // 5. Extract and visit verification link
  const verifyLink = extractLinkFromEmail(email!, /https?:\/\/[^\s"<>]+verify[^\s"<>]*/i);
  expect(verifyLink).not.toBeNull();

  await page.goto(verifyLink!);

  // 6. Verify user is now logged in
  await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
});
```

## Cloudflare Email Routing Setup

### DNS Records Required

These records were added to brownforge.com:

| Type | Name | Value | Priority |
|------|------|-------|----------|
| MX | brownforge.com | route1.mx.cloudflare.net | 48 |
| MX | brownforge.com | route2.mx.cloudflare.net | 99 |
| MX | brownforge.com | route3.mx.cloudflare.net | 10 |
| TXT | brownforge.com | v=spf1 include:_spf.mx.cloudflare.net ~all | - |

### Routing Rule

- **From:** `testimonials-ms-e2e-tests@brownforge.com`
- **To:** `nvg6l.testimonials@inbox.testmail.app`

## Best Practices

### 1. Use Unique Tags for Parallel Tests
When running tests in parallel, use unique tags to avoid email collision:

```typescript
const uniqueTag = `testimonials-${Date.now()}`;
const email = await getLatestEmail(uniqueTag);
```

### 2. Clean Up Between Tests
Clear the inbox or use timestamps to filter emails:

```typescript
async function getEmailsAfter(timestamp: number): Promise<TestmailEmail[]> {
  const response = await getLatestEmail();
  // Filter by timestamp
  return response.emails.filter(e => e.timestamp > timestamp);
}
```

### 3. Handle Email Delays
Use `livequery=true` parameter which waits up to 60 seconds for new emails.

### 4. Don't Commit Credentials
Store API keys in environment variables, never in code.

## Troubleshooting

### Emails Not Arriving
1. Check Cloudflare Email Routing is enabled (DNS records active)
2. Verify the destination address is confirmed in Cloudflare
3. Check Testmail.app dashboard for the correct namespace/tag

### API Rate Limits
Testmail.app free tier: 1000 messages/month. For CI, consider:
- Batching tests that need email verification
- Using a paid tier for high-volume testing

## Related Resources

- [Testmail.app Documentation](https://testmail.app/docs)
- [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/)
- [Playwright Test Documentation](https://playwright.dev/docs/test-assertions)
