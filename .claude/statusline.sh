#!/bin/bash

# Read stdin JSON
input=$(cat)

# Extract data
model=$(echo "$input" | jq -r '.model.display_name // "Unknown Model"')
remaining_pct=$(echo "$input" | jq -r '.context_window.remaining_percentage // empty')
context_size=$(echo "$input" | jq -r '.context_window.context_window_size // 0')

# Get current git branch
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "no-git")

# Format total context size (e.g., 200K)
if [ "$context_size" -gt 0 ]; then
  context_total=$(echo "scale=0; $context_size / 1000" | bc)K
else
  context_total="--"
fi

# Build progress bar using Unicode blocks
# █ = filled, ░ = empty
bar_width=15
if [ -n "$remaining_pct" ]; then
  remaining_int=$(printf "%.0f" "$remaining_pct")
  used_int=$((100 - remaining_int))
  filled=$((used_int * bar_width / 100))
  empty=$((bar_width - filled))
  bar=$(printf '%0.s█' $(seq 1 $filled 2>/dev/null) ; printf '%0.s░' $(seq 1 $empty 2>/dev/null))
  context_info="${bar} ${remaining_int}% left (${context_total})"
else
  bar=$(printf '%0.s░' $(seq 1 $bar_width))
  context_info="${bar} -- (${context_total})"
fi

printf "🌿 %s | 🤖 %s | 🧠 %s" \
  "$branch" \
  "$model" \
  "$context_info"
