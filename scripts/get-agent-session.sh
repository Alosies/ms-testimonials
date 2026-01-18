#!/bin/bash
#
# Get the agent-browser session name based on the current worktree/agent color.
#
# Usage:
#   source scripts/get-agent-session.sh  # Sets AGENT_SESSION variable
#   agent-browser --session $(scripts/get-agent-session.sh) open http://localhost:3001
#
# Session mapping:
#   yellow -> yellow
#   green  -> green
#   blue   -> blue
#   (default/parent) -> parent

get_agent_session() {
  local cwd="${PWD}"

  if [[ "$cwd" == *"ms-testimonials-yellow"* ]]; then
    echo "yellow"
  elif [[ "$cwd" == *"ms-testimonials-green"* ]]; then
    echo "green"
  elif [[ "$cwd" == *"ms-testimonials-blue"* ]]; then
    echo "blue"
  else
    # Default/parent worktree
    echo "parent"
  fi
}

get_agent_port() {
  local cwd="${PWD}"

  if [[ "$cwd" == *"ms-testimonials-yellow"* ]]; then
    echo "3001"
  elif [[ "$cwd" == *"ms-testimonials-green"* ]]; then
    echo "3002"
  elif [[ "$cwd" == *"ms-testimonials-blue"* ]]; then
    echo "3003"
  else
    echo "3000"
  fi
}

# If script is executed directly (not sourced), print the session name
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  get_agent_session
else
  # If sourced, export all relevant variables
  export AGENT_SESSION=$(get_agent_session)
  export AGENT_PORT=$(get_agent_port)
  export AGENT_BASE_URL="http://localhost:${AGENT_PORT}"
  export AGENT_AUTH_STATE="./states/${AGENT_SESSION}-auth.json"
fi
