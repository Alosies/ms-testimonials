---
name: agent-browser
description: Browser automation using agent-browser CLI with isolated sessions. Use for web interactions, form filling, screenshots, and testing UI flows. Replaces Playwright MCP for simpler multi-agent workflows. Triggers on "browser", "agent-browser", "web automation", "open url", "take screenshot".
allowed-tools: Bash, Read, Glob
---

# Agent Browser Automation

Use `agent-browser` CLI for browser automation with session isolation. Each agent (yellow/green/blue/parent) automatically uses its own isolated session.

## Quick Start

```bash
# 1. Source environment (REQUIRED - sets AGENT_SESSION, AGENT_PORT, AGENT_BASE_URL)
source scripts/get-agent-session.sh

# 2. Ensure authenticated (restores saved auth or logs in)
scripts/agent-browser-auth.sh ensure

# 3. You're ready to automate!
agent-browser --session $AGENT_SESSION snapshot -i
```

## Core Workflow (Recommended)

The **Snapshot + Refs** pattern is the most reliable approach:

```bash
# 1. Navigate to page
source scripts/get-agent-session.sh
agent-browser --session $AGENT_SESSION open "$AGENT_BASE_URL/some-page" --wait networkidle

# 2. Get snapshot with element refs
agent-browser --session $AGENT_SESSION snapshot -i
# Output:
# - textbox "Email" [ref=e4]
# - textbox "Password" [ref=e5]
# - button "Sign in" [ref=e6]

# 3. Interact using refs (most reliable!)
agent-browser --session $AGENT_SESSION fill @e4 "user@example.com"
agent-browser --session $AGENT_SESSION fill @e5 "password123"
agent-browser --session $AGENT_SESSION click @e6

# 4. Re-snapshot after page changes
agent-browser --session $AGENT_SESSION snapshot -i
```

## Authentication

### Ensure Authenticated (Best for Starting Work)
```bash
scripts/agent-browser-auth.sh ensure
```
This command:
- Restores saved auth state if available
- Falls back to fresh login if needed
- Works automatically for your worktree's session

### Other Auth Commands
```bash
scripts/agent-browser-auth.sh login    # Fresh login, saves state
scripts/agent-browser-auth.sh logout   # Logout, clears saved state
scripts/agent-browser-auth.sh status   # Show session info
scripts/agent-browser-auth.sh check    # Check if authenticated (exit code)
```

## Session Isolation

Each worktree automatically uses a dedicated session:

| Worktree | Session | Port | Base URL |
|----------|---------|------|----------|
| `ms-testimonials-yellow` | `yellow` | 3001 | `http://localhost:3001` |
| `ms-testimonials-green` | `green` | 3002 | `http://localhost:3002` |
| `ms-testimonials-blue` | `blue` | 3003 | `http://localhost:3003` |
| `ms-testimonials` (parent) | `parent` | 3000 | `http://localhost:3000` |

Sessions are completely isolated - each has its own:
- Browser instance
- Cookies and storage
- Authentication state

## Command Reference

### Navigation
```bash
agent-browser --session $AGENT_SESSION open <url>                    # Navigate
agent-browser --session $AGENT_SESSION open <url> --wait networkidle # Wait for network
agent-browser --session $AGENT_SESSION back                          # Go back
agent-browser --session $AGENT_SESSION forward                       # Go forward
agent-browser --session $AGENT_SESSION reload                        # Reload
agent-browser --session $AGENT_SESSION close                         # Close browser
```

### Snapshots (Use This First!)
```bash
agent-browser --session $AGENT_SESSION snapshot -i        # Interactive elements only
agent-browser --session $AGENT_SESSION snapshot -i --json # JSON format for parsing
agent-browser --session $AGENT_SESSION snapshot           # Full accessibility tree
```

### Element Interaction (Use @refs from Snapshot)
```bash
agent-browser --session $AGENT_SESSION click @e1           # Click
agent-browser --session $AGENT_SESSION fill @e2 "text"     # Clear and fill input
agent-browser --session $AGENT_SESSION type @e2 "text"     # Type without clearing
agent-browser --session $AGENT_SESSION press Enter         # Press key
agent-browser --session $AGENT_SESSION hover @e1           # Hover
agent-browser --session $AGENT_SESSION scroll down 500     # Scroll
```

### Get Information
```bash
agent-browser --session $AGENT_SESSION get url             # Current URL
agent-browser --session $AGENT_SESSION get title           # Page title
agent-browser --session $AGENT_SESSION get text @e1        # Element text
agent-browser --session $AGENT_SESSION get value @e1       # Input value
```

### Waiting
```bash
agent-browser --session $AGENT_SESSION wait @e1                    # Wait for element
agent-browser --session $AGENT_SESSION wait 2000                   # Wait milliseconds
agent-browser --session $AGENT_SESSION wait --url "**/dashboard"   # Wait for URL pattern
agent-browser --session $AGENT_SESSION wait --text "Success"       # Wait for text
agent-browser --session $AGENT_SESSION wait --load networkidle     # Wait for network idle
```

### Screenshots
```bash
agent-browser --session $AGENT_SESSION screenshot              # To stdout
agent-browser --session $AGENT_SESSION screenshot ./out.png    # To file
agent-browser --session $AGENT_SESSION screenshot --full       # Full page
```

## JSON Snapshot Format

When using `--json`, the structure is:
```json
{
  "success": true,
  "data": {
    "refs": {
      "e1": { "name": "Email", "role": "textbox" },
      "e2": { "name": "Password", "role": "textbox" },
      "e3": { "name": "Sign in", "role": "button" }
    },
    "snapshot": "- textbox \"Email\" [ref=e1]\n..."
  }
}
```

To extract refs in bash:
```bash
SNAPSHOT=$(agent-browser --session $AGENT_SESSION snapshot -i --json)
EMAIL_REF=$(echo "$SNAPSHOT" | jq -r '.data.refs | to_entries[] | select(.value.name == "Email") | .key')
agent-browser --session $AGENT_SESSION fill "@$EMAIL_REF" "test@example.com"
```

## Test Credentials

| Field | Value |
|-------|-------|
| Email | `testimonials-ms-e2e-tests@brownforge.com` |
| Password | `Kh5x%8-Q6-qpU+D` |

## Example: Complete Login Flow

```bash
# Setup
source scripts/get-agent-session.sh

# Navigate to login
agent-browser --session $AGENT_SESSION open "$AGENT_BASE_URL/auth/login" --wait networkidle

# Get refs
agent-browser --session $AGENT_SESSION snapshot -i
# Output shows: textbox "Email" [ref=e4], textbox "Password" [ref=e5], button "Sign in" [ref=e6]

# Fill and submit using refs
agent-browser --session $AGENT_SESSION fill @e4 "testimonials-ms-e2e-tests@brownforge.com"
agent-browser --session $AGENT_SESSION fill @e5 'Kh5x%8-Q6-qpU+D'
agent-browser --session $AGENT_SESSION click @e6

# Wait for dashboard
agent-browser --session $AGENT_SESSION wait --url "**/dashboard" --timeout 15000

# Verify
agent-browser --session $AGENT_SESSION get url
```

## Troubleshooting

### Daemon Failed to Start
Kill existing processes and retry:
```bash
pkill -f "agent-browser" 2>/dev/null
sleep 2
# Then retry your command
```

### agent-browser Not Installed
```bash
npm install -g agent-browser
agent-browser install  # Downloads Chromium
```

### Auth State Expired
```bash
scripts/agent-browser-auth.sh login  # Re-authenticate and save
```

### View Browser Window (Debug Mode)
```bash
agent-browser --session $AGENT_SESSION open "$AGENT_BASE_URL" --headed
```

### Check Active Sessions
```bash
agent-browser session list
```

## Important Notes

1. **Always source environment first**: `source scripts/get-agent-session.sh`
2. **Use refs, not CSS selectors**: Refs from snapshots are most reliable
3. **Re-snapshot after navigation**: Element refs change when page content changes
4. **Use `--wait networkidle`**: Ensures page is fully loaded before interaction
5. **Auth helper handles complexity**: Use `scripts/agent-browser-auth.sh ensure` instead of manual auth
