#!/bin/bash
# Auto-detect worktree and run dev with correct VITE_PORT

DIR_NAME=$(basename "$(pwd)")

case "$DIR_NAME" in
  *-yellow)
    export VITE_PORT=3001
    ;;
  *-green)
    export VITE_PORT=3002
    ;;
  *-blue)
    export VITE_PORT=3003
    ;;
  *)
    export VITE_PORT=3000
    ;;
esac

echo "Starting dev servers (VITE_PORT=$VITE_PORT)..."
pnpm -r --parallel dev
