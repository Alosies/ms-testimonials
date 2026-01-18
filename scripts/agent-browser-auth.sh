#!/bin/bash
#
# Agent Browser authentication helper for multi-agent workflow.
#
# Usage:
#   scripts/agent-browser-auth.sh login     # Login and save auth state
#   scripts/agent-browser-auth.sh logout    # Logout
#   scripts/agent-browser-auth.sh restore   # Restore saved auth state
#   scripts/agent-browser-auth.sh check     # Check if authenticated
#   scripts/agent-browser-auth.sh status    # Show current session info
#
# This script automatically detects the agent color from the working directory
# and uses the appropriate session and port.

set -e

# Source session detection
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/get-agent-session.sh"

# Test credentials
TEST_EMAIL="testimonials-ms-e2e-tests@brownforge.com"
TEST_PASSWORD='Kh5x%8-Q6-qpU+D'

# State directory
STATE_DIR="$SCRIPT_DIR/../.agent-browser-states"
mkdir -p "$STATE_DIR"

AUTH_STATE_FILE="$STATE_DIR/${AGENT_SESSION}-auth.json"

cmd_status() {
  echo "Agent Browser Session Status"
  echo "=============================="
  echo "Session:    $AGENT_SESSION"
  echo "Port:       $AGENT_PORT"
  echo "Base URL:   $AGENT_BASE_URL"
  echo "Auth State: $AUTH_STATE_FILE"
  echo ""

  if [[ -f "$AUTH_STATE_FILE" ]]; then
    echo "Auth state file: EXISTS"
    echo "Last modified: $(stat -f '%Sm' "$AUTH_STATE_FILE" 2>/dev/null || stat -c '%y' "$AUTH_STATE_FILE" 2>/dev/null)"
  else
    echo "Auth state file: NOT FOUND"
  fi

  # Check active sessions
  echo ""
  echo "Active sessions:"
  agent-browser session list 2>/dev/null || echo "  (none or agent-browser not installed)"
}

cmd_login() {
  echo "Logging in with session: $AGENT_SESSION"
  echo "Target: $AGENT_BASE_URL"

  # Open login page
  agent-browser --session "$AGENT_SESSION" open "$AGENT_BASE_URL/auth/login" --wait networkidle

  # Check if already logged in (redirected to dashboard)
  CURRENT_URL=$(agent-browser --session "$AGENT_SESSION" get url)
  if [[ "$CURRENT_URL" == *"/dashboard"* ]]; then
    echo "Already authenticated! URL: $CURRENT_URL"
    cmd_save
    return 0
  fi

  # Get snapshot to find form element refs
  echo "Getting login form elements..."
  local SNAPSHOT=$(agent-browser --session "$AGENT_SESSION" snapshot -i --json)

  # Extract refs for Email, Password, and Sign in button (from data.refs object)
  local EMAIL_REF=$(echo "$SNAPSHOT" | jq -r '.data.refs | to_entries[] | select(.value.name == "Email") | .key')
  local PASSWORD_REF=$(echo "$SNAPSHOT" | jq -r '.data.refs | to_entries[] | select(.value.name == "Password") | .key')
  local SIGNIN_REF=$(echo "$SNAPSHOT" | jq -r '.data.refs | to_entries[] | select(.value.name == "Sign in") | .key')

  if [[ -z "$EMAIL_REF" || -z "$PASSWORD_REF" || -z "$SIGNIN_REF" ]]; then
    echo "Error: Could not find login form elements"
    echo "Email ref: $EMAIL_REF, Password ref: $PASSWORD_REF, Sign in ref: $SIGNIN_REF"
    exit 1
  fi

  # Fill login form using refs (most reliable method)
  echo "Filling login form..."
  agent-browser --session "$AGENT_SESSION" fill "@$EMAIL_REF" "$TEST_EMAIL"
  agent-browser --session "$AGENT_SESSION" fill "@$PASSWORD_REF" "$TEST_PASSWORD"

  # Submit
  echo "Submitting..."
  agent-browser --session "$AGENT_SESSION" click "@$SIGNIN_REF"

  # Wait for navigation
  agent-browser --session "$AGENT_SESSION" wait --url "**/dashboard" --timeout 15000

  # Verify
  CURRENT_URL=$(agent-browser --session "$AGENT_SESSION" get url)
  echo "Login complete! URL: $CURRENT_URL"

  # Save auth state
  cmd_save
}

cmd_logout() {
  echo "Logging out session: $AGENT_SESSION"

  agent-browser --session "$AGENT_SESSION" open "$AGENT_BASE_URL/auth/logout" --wait networkidle

  # Remove saved state
  if [[ -f "$AUTH_STATE_FILE" ]]; then
    rm "$AUTH_STATE_FILE"
    echo "Removed saved auth state"
  fi

  echo "Logged out successfully"
}

cmd_save() {
  echo "Saving auth state to: $AUTH_STATE_FILE"
  agent-browser --session "$AGENT_SESSION" state save "$AUTH_STATE_FILE"
  echo "Auth state saved"
}

cmd_restore() {
  if [[ ! -f "$AUTH_STATE_FILE" ]]; then
    echo "No saved auth state found at: $AUTH_STATE_FILE"
    echo "Run 'scripts/agent-browser-auth.sh login' first"
    exit 1
  fi

  echo "Restoring auth state from: $AUTH_STATE_FILE"

  # Open the app first (needed to set localStorage on correct origin)
  agent-browser --session "$AGENT_SESSION" open "$AGENT_BASE_URL" --wait networkidle

  # Restore localStorage using base64 encoding for safe JSON transfer
  local LS_NAME=$(jq -r '.origins[0].localStorage[0].name // empty' "$AUTH_STATE_FILE" 2>/dev/null)
  local LS_VALUE_RAW=$(jq -r '.origins[0].localStorage[0].value // empty' "$AUTH_STATE_FILE" 2>/dev/null)

  if [[ -n "$LS_NAME" && -n "$LS_VALUE_RAW" && "$LS_VALUE_RAW" != "null" ]]; then
    echo "Setting localStorage: $LS_NAME"
    local LS_VALUE_B64=$(echo -n "$LS_VALUE_RAW" | base64 | tr -d '\n')
    agent-browser --session "$AGENT_SESSION" eval "localStorage.setItem('$LS_NAME', atob('$LS_VALUE_B64'))"

    # Reload to pick up the auth state
    agent-browser --session "$AGENT_SESSION" reload --wait networkidle
    sleep 1
  else
    echo "Warning: Could not extract localStorage from state file"
  fi

  echo "Auth state restored"

  # Navigate to login page to verify (will redirect to dashboard if authenticated)
  agent-browser --session "$AGENT_SESSION" open "$AGENT_BASE_URL/auth/login" --wait networkidle
  sleep 1
  CURRENT_URL=$(agent-browser --session "$AGENT_SESSION" get url)

  if [[ "$CURRENT_URL" == *"/dashboard"* ]]; then
    echo "Verification: Authenticated! URL: $CURRENT_URL"
  else
    echo "Verification: Not authenticated (redirected to: $CURRENT_URL)"
    echo "Auth state may be expired. Run 'scripts/agent-browser-auth.sh login' to re-authenticate"
  fi
}

cmd_check() {
  # Open the app first
  agent-browser --session "$AGENT_SESSION" open "$AGENT_BASE_URL" --wait networkidle

  # Try to restore localStorage if we have saved state
  if [[ -f "$AUTH_STATE_FILE" ]]; then
    local LS_NAME=$(jq -r '.origins[0].localStorage[0].name // empty' "$AUTH_STATE_FILE" 2>/dev/null)
    local LS_VALUE_RAW=$(jq -r '.origins[0].localStorage[0].value // empty' "$AUTH_STATE_FILE" 2>/dev/null)

    if [[ -n "$LS_NAME" && -n "$LS_VALUE_RAW" && "$LS_VALUE_RAW" != "null" ]]; then
      local LS_VALUE_B64=$(echo -n "$LS_VALUE_RAW" | base64 | tr -d '\n')
      agent-browser --session "$AGENT_SESSION" eval "localStorage.setItem('$LS_NAME', atob('$LS_VALUE_B64'))"
      agent-browser --session "$AGENT_SESSION" reload --wait networkidle
      sleep 1
    fi
  fi

  # Navigate to login page (will redirect to dashboard if authenticated)
  agent-browser --session "$AGENT_SESSION" open "$AGENT_BASE_URL/auth/login" --wait networkidle
  sleep 1
  CURRENT_URL=$(agent-browser --session "$AGENT_SESSION" get url)

  if [[ "$CURRENT_URL" == *"/dashboard"* ]]; then
    echo "authenticated"
    exit 0
  else
    echo "not_authenticated"
    exit 1
  fi
}

cmd_ensure() {
  # Check if authenticated, login if not
  echo "Ensuring authentication for session: $AGENT_SESSION"

  # Open the app first (needed to set localStorage on correct origin)
  agent-browser --session "$AGENT_SESSION" open "$AGENT_BASE_URL" --wait networkidle

  # Try to restore localStorage if we have saved state
  if [[ -f "$AUTH_STATE_FILE" ]]; then
    echo "Found saved auth state, restoring localStorage..."
    local LS_NAME=$(jq -r '.origins[0].localStorage[0].name // empty' "$AUTH_STATE_FILE" 2>/dev/null)
    local LS_VALUE_RAW=$(jq -r '.origins[0].localStorage[0].value // empty' "$AUTH_STATE_FILE" 2>/dev/null)

    if [[ -n "$LS_NAME" && -n "$LS_VALUE_RAW" && "$LS_VALUE_RAW" != "null" ]]; then
      # Base64 encode to safely pass JSON through bash/eval
      local LS_VALUE_B64=$(echo -n "$LS_VALUE_RAW" | base64 | tr -d '\n')
      agent-browser --session "$AGENT_SESSION" eval "localStorage.setItem('$LS_NAME', atob('$LS_VALUE_B64'))"
      # Reload to let Supabase client pick up the auth state
      agent-browser --session "$AGENT_SESSION" reload --wait networkidle
      sleep 1
      # Navigate to login page - if authenticated, it will redirect to dashboard
      agent-browser --session "$AGENT_SESSION" open "$AGENT_BASE_URL/auth/login" --wait networkidle
      # Wait for potential redirect to dashboard
      agent-browser --session "$AGENT_SESSION" wait --url "**/dashboard" --timeout 5000 2>/dev/null || true
    fi
  fi

  # Check current auth status
  CURRENT_URL=$(agent-browser --session "$AGENT_SESSION" get url)

  if [[ "$CURRENT_URL" == *"/dashboard"* ]]; then
    echo "Already authenticated! URL: $CURRENT_URL"
  else
    echo "Not authenticated, logging in..."
    cmd_login
  fi
}

cmd_help() {
  echo "Agent Browser Auth Helper"
  echo ""
  echo "Usage: $0 <command>"
  echo ""
  echo "Commands:"
  echo "  login    - Login and save auth state"
  echo "  logout   - Logout and clear saved state"
  echo "  save     - Save current auth state"
  echo "  restore  - Restore saved auth state"
  echo "  check    - Check if authenticated (exits 0 if yes, 1 if no)"
  echo "  ensure   - Restore or login if needed"
  echo "  status   - Show session info"
  echo "  help     - Show this help"
  echo ""
  echo "Current session: $AGENT_SESSION"
  echo "Current port:    $AGENT_PORT"
}

# Main
case "${1:-help}" in
  login)   cmd_login ;;
  logout)  cmd_logout ;;
  save)    cmd_save ;;
  restore) cmd_restore ;;
  check)   cmd_check ;;
  ensure)  cmd_ensure ;;
  status)  cmd_status ;;
  help)    cmd_help ;;
  *)
    echo "Unknown command: $1"
    cmd_help
    exit 1
    ;;
esac
