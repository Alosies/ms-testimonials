#!/bin/bash
#
# Get the dev server port based on the current worktree/agent color.
#
# Usage:
#   source scripts/get-agent-port.sh  # Sets E2E_PORT variable
#   E2E_BASE_URL=http://localhost:$(scripts/get-agent-port.sh) pnpm test:e2e
#
# Port mapping:
#   yellow -> 3001
#   green  -> 3002
#   blue   -> 3003
#   (default/parent) -> 3000

get_agent_port() {
  local cwd="${PWD}"

  if [[ "$cwd" == *"ms-testimonials-yellow"* ]]; then
    echo "3001"
  elif [[ "$cwd" == *"ms-testimonials-green"* ]]; then
    echo "3002"
  elif [[ "$cwd" == *"ms-testimonials-blue"* ]]; then
    echo "3003"
  else
    # Default/parent worktree
    echo "3000"
  fi
}

# If script is executed directly (not sourced), print the port
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  get_agent_port
else
  # If sourced, export E2E_PORT and E2E_BASE_URL
  export E2E_PORT=$(get_agent_port)
  export E2E_BASE_URL="http://localhost:${E2E_PORT}"
fi
