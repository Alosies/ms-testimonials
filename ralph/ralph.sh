#!/bin/bash
#
# Ralph Runner - Execute Ralph loops with custom PRDs
#
# Usage:
#   ./ralph/ralph.sh [options]
#
# Options:
#   -p, --prd PATH        Path to PRD JSON file (required)
#   -r, --progress PATH   Path to progress file (default: same dir as PRD)
#   -c, --complete TEXT   Completion signal text (default: ALL-TASKS-COMPLETE)
#   -m, --max N           Maximum iterations for AFK mode (default: 10)
#   -o, --once            Run single iteration (HITL mode)
#   -h, --help            Show this help message
#
# Environment Variables:
#   RALPH_COOLDOWN        Seconds between iterations (default: 30)
#   CLAUDE_CMD            Path to Claude CLI binary
#   RALPH_SKIP_CLEANUP    Set to 1 to skip MCP process cleanup between iterations
#
# Examples:
#   # HITL mode with workspace PRD
#   ./ralph/ralph.sh --once --prd ralph/workspaces/my-feature_2026-01-10/prd.json
#
#   # AFK mode with 20 iterations
#   ./ralph/ralph.sh --max 20 --prd ralph/workspaces/my-feature_2026-01-10/prd.json
#

set -e

# Cleanup function to kill orphaned MCP processes
cleanup_mcp_processes() {
  # Kill playwright-related processes (browsers, MCP servers)
  pkill -f "playwright" 2>/dev/null || true
  pkill -f "@playwright/mcp" 2>/dev/null || true

  # Kill context7 MCP
  pkill -f "context7-mcp" 2>/dev/null || true

  # Kill any orphaned node processes from MCP servers
  # Be careful: only kill node processes that look like MCP servers
  pkill -f "node.*mcp" 2>/dev/null || true

  # Give processes time to terminate gracefully
  sleep 2

  # Force kill any remaining
  pkill -9 -f "playwright" 2>/dev/null || true
  pkill -9 -f "@playwright/mcp" 2>/dev/null || true
}

# Trap to ensure cleanup on script exit
cleanup_on_exit() {
  echo ""
  echo "Cleaning up MCP processes..."
  cleanup_mcp_processes
  echo "Cleanup complete."
}

# Register trap for script termination (but not in ONCE mode)
TRAP_REGISTERED=false

# Check for envsubst (needed for AFK mode)
if ! command -v envsubst &> /dev/null; then
  echo "Error: 'envsubst' not found. Install gettext package."
  echo "  macOS: brew install gettext"
  exit 1
fi

# Default values
RALPH_PRD=""
RALPH_PROGRESS=""
RALPH_COMPLETE="ALL-TASKS-COMPLETE"
MAX_ITERATIONS=10
ONCE_MODE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -p|--prd)
      RALPH_PRD="$2"
      shift 2
      ;;
    -r|--progress)
      RALPH_PROGRESS="$2"
      shift 2
      ;;
    -c|--complete)
      RALPH_COMPLETE="$2"
      shift 2
      ;;
    -m|--max)
      MAX_ITERATIONS="$2"
      shift 2
      ;;
    -o|--once)
      ONCE_MODE=true
      shift
      ;;
    -h|--help)
      head -25 "$0" | tail -23
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Validate PRD is provided
if [[ -z "$RALPH_PRD" ]]; then
  echo "Error: PRD file required. Use --prd <path>"
  echo "Example: ./ralph/ralph.sh --once --prd ralph/workspaces/my-feature_2026-01-10/prd.json"
  exit 1
fi

# Validate PRD exists
if [[ ! -f "$RALPH_PRD" ]]; then
  echo "Error: PRD file not found: $RALPH_PRD"
  exit 1
fi

# Default progress file to same directory as PRD
if [[ -z "$RALPH_PROGRESS" ]]; then
  RALPH_PROGRESS="$(dirname "$RALPH_PRD")/progress.txt"
fi

# Export for ralph-once to use
export RALPH_PRD
export RALPH_PROGRESS
export RALPH_COMPLETE="${RALPH_COMPLETE:-ALL-TASKS-COMPLETE}"

# Create progress file if it doesn't exist
if [[ ! -f "$RALPH_PROGRESS" ]]; then
  echo "# Progress Log" > "$RALPH_PROGRESS"
  echo "# Started: $(date +%Y-%m-%d)" >> "$RALPH_PROGRESS"
  echo "# PRD: $RALPH_PRD" >> "$RALPH_PROGRESS"
  echo "" >> "$RALPH_PROGRESS"
  echo "## Iteration Log" >> "$RALPH_PROGRESS"
  echo "" >> "$RALPH_PROGRESS"
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Ralph Configuration ==="
echo "PRD:        $RALPH_PRD"
echo "Progress:   $RALPH_PROGRESS"
echo "Complete:   $RALPH_COMPLETE"
echo "Mode:       $([ "$ONCE_MODE" = true ] && echo "HITL (single)" || echo "AFK (max: $MAX_ITERATIONS)")"
echo "=========================="
echo ""

if [ "$ONCE_MODE" = true ]; then
  # HITL: Single iteration
  echo "Running single iteration..."
  echo ""
  echo "Paste this into Claude Code:"
  echo "----------------------------------------"
  echo "Read ralph/templates/ralph-once and execute it."
  echo "Use PRD: $RALPH_PRD"
  echo "Use Progress: $RALPH_PROGRESS"
  echo "Completion signal: $RALPH_COMPLETE"
  echo "----------------------------------------"
else
  # AFK: Loop mode
  ITERATION=0

  # Register cleanup trap for AFK mode
  trap cleanup_on_exit EXIT INT TERM
  TRAP_REGISTERED=true

  # Memory safety settings
  COOLDOWN_SECONDS=${RALPH_COOLDOWN:-30}  # Configurable via env var (increased from 15)

  # Find Claude binary once (not in loop)
  if [[ -n "$CLAUDE_CMD" ]] && command -v "$CLAUDE_CMD" &> /dev/null; then
    CLAUDE_BIN="$CLAUDE_CMD"
  elif command -v claude &> /dev/null; then
    CLAUDE_BIN="claude"
  elif [[ -x "$HOME/.claude/local/claude" ]]; then
    CLAUDE_BIN="$HOME/.claude/local/claude"
  else
    echo "Error: Claude CLI not found."
    echo "Checked: CLAUDE_CMD env var, 'claude' in PATH, ~/.claude/local/claude"
    echo "Set CLAUDE_CMD env var to specify location."
    exit 1
  fi

  while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))
    echo "=== Iteration $ITERATION of $MAX_ITERATIONS ==="
    echo "$(date): Starting iteration $ITERATION" >> "$RALPH_PROGRESS"

    # Generate prompt file
    PROMPT_FILE=$(mktemp)
    envsubst < "$SCRIPT_DIR/templates/ralph-once" > "$PROMPT_FILE"

    # Run Claude with streaming output
    "$CLAUDE_BIN" -p --dangerously-skip-permissions "$(cat "$PROMPT_FILE")"
    CLAUDE_EXIT_CODE=$?

    # Cleanup prompt file immediately
    rm -f "$PROMPT_FILE"

    # Check for completion signal in output or progress
    if grep -q "<promise>$RALPH_COMPLETE</promise>" "$RALPH_PROGRESS" 2>/dev/null; then
      echo ""
      echo "=== All tasks complete! ==="
      echo "$(date): All tasks complete" >> "$RALPH_PROGRESS"
      exit 0
    fi

    # Check if Claude exited abnormally
    if [ $CLAUDE_EXIT_CODE -ne 0 ]; then
      echo ""
      echo "Warning: Claude exited with code $CLAUDE_EXIT_CODE"
      echo "$(date): Claude exited with code $CLAUDE_EXIT_CODE" >> "$RALPH_PROGRESS"
    fi

    echo ""
    echo "Cooldown: ${COOLDOWN_SECONDS}s before next iteration..."

    # Memory cleanup: kill orphaned MCP processes between iterations
    if [[ "${RALPH_SKIP_CLEANUP:-0}" != "1" ]]; then
      echo "Cleaning up MCP processes..."
      cleanup_mcp_processes
    fi

    # Flush disk buffers
    sync 2>/dev/null || true

    # Extended cooldown to allow memory to be reclaimed
    sleep "$COOLDOWN_SECONDS"
    echo ""
  done

  echo ""
  echo "=== Max iterations ($MAX_ITERATIONS) reached ==="
  echo "$(date): Max iterations reached" >> "$RALPH_PROGRESS"
fi
