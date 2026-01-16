---
name: pw-auth
description: Use isolated Playwright MCP with authentication. Use when you need browser automation that won't be affected by Chrome profile switches, or when the user asks to use "isolated" playwright. Triggers on "isolated playwright", "pw-auth", "browser auth", "login with playwright".
allowed-tools: Bash, Read
---

# Playwright Isolated with Authentication

Use the isolated Playwright MCP (`playwright-yellow-isolated`) for browser automation that runs independently of the user's Chrome profiles.

## Quick Start (Copy-Paste Ready)

**Login (1 tool call):**
```javascript
browser_run_code({ code: `async (page) => {
  await page.goto('http://localhost:3001/auth/login', { waitUntil: 'networkidle' });
  if (page.url().includes('/dashboard')) return { status: 'already_authenticated', url: page.url() };
  await page.getByTestId('auth-login-email-input').fill('testimonials-ms-e2e-tests@brownforge.com');
  await page.getByTestId('auth-login-password-input').fill('Kh5x%8-Q6-qpU+D');
  await page.getByTestId('auth-login-submit-button').click();
  await page.waitForURL('**/dashboard');
  return { status: 'logged_in', url: page.url() };
}` })
```

**Logout (1 tool call):**
```javascript
browser_run_code({ code: `async (page) => {
  await page.goto('http://localhost:3001/auth/logout');
  await page.waitForURL('**/login', { timeout: 10000 });
  return { status: 'signed_out', url: page.url() };
}` })
```

**Ensure Authenticated (for starting workflows):**
```javascript
browser_run_code({ code: `async (page) => {
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
  if (page.url().includes('/dashboard')) return { status: 'ready', url: page.url() };
  // Not logged in - do login
  await page.goto('http://localhost:3001/auth/login');
  await page.getByTestId('auth-login-email-input').fill('testimonials-ms-e2e-tests@brownforge.com');
  await page.getByTestId('auth-login-password-input').fill('Kh5x%8-Q6-qpU+D');
  await page.getByTestId('auth-login-submit-button').click();
  await page.waitForURL('**/dashboard');
  return { status: 'logged_in', url: page.url() };
}` })
```

---

## When to Use Isolated vs Extension Mode

| Mode | MCP Name | Use When |
|------|----------|----------|
| **Extension** | `playwright-yellow` | User wants to leverage existing authenticated sessions in their Chrome profile |
| **Isolated** | `playwright-yellow-isolated` | Long-running workflows, background tasks, or when user may switch Chrome profiles |

## Invoking Isolated Playwright

When the user requests isolated mode, use tools prefixed with `mcp__playwright-yellow-isolated__` instead of `mcp__playwright-yellow__`.

Example:
```
# Extension mode (default)
mcp__playwright-yellow__browser_navigate

# Isolated mode
mcp__playwright-yellow-isolated__browser_navigate
```

## Dev Server Authentication

For authenticating with the Testimonials dev server, use these E2E test credentials:

| Field | Value |
|-------|-------|
| Email | `testimonials-ms-e2e-tests@brownforge.com` |
| Password | `Kh5x%8-Q6-qpU+D` |

## Login Form Test IDs

For manual step-by-step control, these stable test IDs are available (no snapshot needed):

| Element | Test ID |
|---------|---------|
| Email input | `auth-login-email-input` |
| Password input | `auth-login-password-input` |
| Submit button | `auth-login-submit-button` |

## Key Routes

| Route | Behavior |
|-------|----------|
| `/auth/login` | Login page (redirects to dashboard if already authenticated) |
| `/auth/logout` | Logs out user and redirects to login |
| `/` | Landing page (redirects to dashboard if authenticated) |

## Dashboard URL Pattern

After login, user lands at:
```
http://localhost:3001/{workspace-slug}/dashboard
```

Example: `http://localhost:3001/testimonials-ms-e2e-tests-8q2r0w/dashboard`

## URLs Reference

| Environment | Base URL |
|-------------|----------|
| Local Dev | `http://localhost:3001` |
| API | `http://localhost:4000` |

## Troubleshooting

### Browser Not Installed
If you get an error about browser not being installed:
```
browser_install()
```

### Session Persistence
The isolated browser starts fresh each time. Auth state is not persisted between MCP restarts. Re-authenticate if needed.
