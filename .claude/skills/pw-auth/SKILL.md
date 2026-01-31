---
name: pw-auth
description: Use Playwright MCP with authentication. Use when you need browser automation for testing or workflows. Triggers on "playwright", "pw-auth", "browser auth", "login with playwright".
allowed-tools: Bash, Read
---

# Playwright MCP with Authentication

Use the Playwright MCP for browser automation. Each color agent has its own isolated Playwright instance.

## Determine Your MCP and Port

Use your worktree folder name to determine which MCP to use:

| Worktree | MCP Name | Tools Prefix | Web Port |
|----------|----------|--------------|----------|
| `ms-testimonials-yellow` | `playwright-yellow` | `mcp__playwright-yellow__` | 3001 |
| `ms-testimonials-green` | `playwright-green` | `mcp__playwright-green__` | 3002 |
| `ms-testimonials-blue` | `playwright-blue` | `mcp__playwright-blue__` | 3003 |
| `ms-testimonials` (parent) | N/A | N/A | 3000 |

## Quick Start (Copy-Paste Ready)

Replace `{PORT}` with your worktree's port (3001/3002/3003).

**Login (1 tool call):**
```javascript
browser_run_code({ code: `async (page) => {
  await page.goto('http://localhost:{PORT}/auth/login', { waitUntil: 'networkidle' });
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
  await page.goto('http://localhost:{PORT}/auth/logout');
  await page.waitForURL('**/login', { timeout: 10000 });
  return { status: 'signed_out', url: page.url() };
}` })
```

**Ensure Authenticated (for starting workflows):**
```javascript
browser_run_code({ code: `async (page) => {
  await page.goto('http://localhost:{PORT}/', { waitUntil: 'networkidle' });
  if (page.url().includes('/dashboard')) return { status: 'ready', url: page.url() };
  // Not logged in - do login
  await page.goto('http://localhost:{PORT}/auth/login');
  await page.getByTestId('auth-login-email-input').fill('testimonials-ms-e2e-tests@brownforge.com');
  await page.getByTestId('auth-login-password-input').fill('Kh5x%8-Q6-qpU+D');
  await page.getByTestId('auth-login-submit-button').click();
  await page.waitForURL('**/dashboard');
  return { status: 'logged_in', url: page.url() };
}` })
```

---

## Example Tool Calls

Use the tools prefix matching your worktree:
```
mcp__playwright-{color}__browser_navigate
mcp__playwright-{color}__browser_snapshot
mcp__playwright-{color}__browser_click
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
http://localhost:{PORT}/{workspace-slug}/dashboard
```

Example: `http://localhost:3001/testimonials-ms-e2e-tests-8q2r0w/dashboard`

## URLs Reference

| Worktree | Web URL | API URL |
|----------|---------|---------|
| yellow | `http://localhost:3001` | `http://localhost:4001` |
| green | `http://localhost:3002` | `http://localhost:4002` |
| blue | `http://localhost:3003` | `http://localhost:4003` |
| parent | `http://localhost:3000` | `http://localhost:4000` |

## Troubleshooting

### Browser Not Installed
If you get an error about browser not being installed:
```
browser_install()
```

### Session Persistence
The browser starts fresh each time. Auth state is not persisted between MCP restarts. Re-authenticate if needed.
