#!/bin/bash
set -e

# Parse arguments
FORCE_PUSH=false
SKIP_CONFIRM=false
while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--force-push)
      FORCE_PUSH=true
      shift
      ;;
    -y|--yes)
      SKIP_CONFIRM=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Sync all worktrees with dev using linear history (rebase)"
      echo ""
      echo "Options:"
      echo "  -f, --force-push    Force push all branches to remote after sync"
      echo "  -y, --yes           Skip confirmation prompts (for non-interactive use)"
      echo "  -h, --help          Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use -h or --help for usage information"
      exit 1
      ;;
  esac
done

# Worktrees to sync (in order - commits will stack in this sequence)
WORKTREES=(
  "/Users/alosiesgeorge/CodeRepositories/Fork/micro-saas/proj-testimonials/ms-testimonials-yellow"
  "/Users/alosiesgeorge/CodeRepositories/Fork/micro-saas/proj-testimonials/ms-testimonials-green"
  "/Users/alosiesgeorge/CodeRepositories/Fork/micro-saas/proj-testimonials/ms-testimonials-blue"
)

MAIN_WORKTREE="/Users/alosiesgeorge/CodeRepositories/Fork/micro-saas/proj-testimonials/ms-testimonials"
DEV_BRANCH="dev"

# Track dirty worktrees (space-separated list for bash 3.2 compatibility)
DIRTY_WORKTREES=""

# Track stashed worktrees (to know which ones need stash pop)
STASHED_WORKTREES=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

is_dirty() {
  local wt="$1"
  echo "$DIRTY_WORKTREES" | grep -q "$wt"
}

mark_dirty() {
  local wt="$1"
  DIRTY_WORKTREES="$DIRTY_WORKTREES $wt"
}

is_stashed() {
  local wt="$1"
  echo "$STASHED_WORKTREES" | grep -q "$wt"
}

mark_stashed() {
  local wt="$1"
  STASHED_WORKTREES="$STASHED_WORKTREES $wt"
}

# Stash changes in a worktree, returns 0 if stash was created, 1 if nothing to stash
stash_changes() {
  local wt="$1"
  local branch="$2"

  # Check if there are changes to stash (tracked changes OR untracked files)
  local has_tracked_changes=false
  local has_untracked_files=false

  if ! git -C "$wt" diff --quiet || ! git -C "$wt" diff --cached --quiet; then
    has_tracked_changes=true
  fi

  # Check for untracked files (excluding ignored files)
  if [ -n "$(git -C "$wt" ls-files --others --exclude-standard)" ]; then
    has_untracked_files=true
  fi

  if [ "$has_tracked_changes" = false ] && [ "$has_untracked_files" = false ]; then
    return 1  # Nothing to stash
  fi

  log_info "Stashing uncommitted changes in $branch..."
  if [ "$has_untracked_files" = true ]; then
    log_detail "Including untracked files in stash"
  fi

  # Use -u to include untracked files (prevents them from being lost during rebase)
  if git -C "$wt" stash push -u -m "sync-worktrees: auto-stash before rebase"; then
    mark_stashed "$wt"
    log_success "Changes stashed"
    return 0
  else
    log_error "Failed to stash changes"
    return 2
  fi
}

# Pop stashed changes, returns 0 on success, 1 if conflicts
pop_stash() {
  local wt="$1"
  local branch="$2"

  if ! is_stashed "$wt"; then
    return 0  # Nothing was stashed
  fi

  log_info "Restoring stashed changes in $branch..."
  if git -C "$wt" stash pop; then
    log_success "Stashed changes restored"
    return 0
  else
    log_warning "Stash pop had conflicts - changes are partially applied"
    log_warning "Resolve conflicts in $wt manually"
    log_detail "Your stashed changes are still in the stash list if needed: git stash list"
    return 1
  fi
}

log_header() {
  echo ""
  echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  $1${NC}"
  echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
}

log_section() {
  echo ""
  echo -e "${YELLOW}── $1 ──${NC}"
}

log_info() {
  echo -e "${CYAN}→${NC} $1"
}

log_detail() {
  echo -e "${GRAY}  $1${NC}"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}!${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

log_commit() {
  echo -e "  ${BLUE}•${NC} $1"
}

# Arrow-key menu selection
# Usage: menu_select "Option1" "Option2" ...
# Returns: selected index (0-based) in MENU_RESULT
menu_select() {
  local options=("$@")
  local selected=0
  local count=${#options[@]}

  # Hide cursor
  tput civis 2>/dev/null || true

  # Draw menu
  draw_menu() {
    for i in "${!options[@]}"; do
      # Move to beginning of line and clear
      echo -ne "\r\033[K"
      if [ $i -eq $selected ]; then
        echo -e "  ${GREEN}▸ ${options[$i]}${NC}"
      else
        echo -e "    ${options[$i]}"
      fi
    done
  }

  # Move cursor up to redraw
  move_up() {
    for ((i=0; i<count; i++)); do
      echo -ne "\033[1A"
    done
  }

  # Initial draw
  draw_menu

  # Read input
  while true; do
    read -rsn1 key

    # Handle arrow keys (escape sequences)
    if [ "$key" = $'\x1b' ]; then
      read -rsn2 -t 0.1 key
      case "$key" in
        '[A') # Up arrow
          ((selected--))
          [ $selected -lt 0 ] && selected=$((count - 1))
          ;;
        '[B') # Down arrow
          ((selected++))
          [ $selected -ge $count ] && selected=0
          ;;
      esac
      move_up
      draw_menu
    elif [ "$key" = "" ]; then # Enter key
      break
    fi
  done

  # Show cursor
  tput cnorm 2>/dev/null || true

  MENU_RESULT=$selected
}

log_header "Testimonials Worktree Sync Script"
echo "Syncing all worktrees with dev using linear history (rebase)"
echo ""
log_info "Main worktree: $MAIN_WORKTREE"
log_info "Target branch: $DEV_BRANCH"
log_info "Worktrees to sync: ${#WORKTREES[@]}"

# CRITICAL: Fetch from remote to ensure we have latest state
log_section "Fetching from remote"
log_info "Running: git fetch origin"
if git -C "$MAIN_WORKTREE" fetch origin; then
  log_success "Fetched latest from origin"

  # Check if local dev is behind origin/dev (someone pushed directly to remote)
  ORIGIN_AHEAD=$(git -C "$MAIN_WORKTREE" rev-list --count "$DEV_BRANCH"..origin/"$DEV_BRANCH" 2>/dev/null || echo "0")
  if [ "$ORIGIN_AHEAD" != "0" ]; then
    log_warning "origin/$DEV_BRANCH is $ORIGIN_AHEAD commit(s) ahead of local $DEV_BRANCH"
    log_info "Pulling remote changes into local $DEV_BRANCH first..."

    # Fast-forward local dev to origin/dev if possible
    if git -C "$MAIN_WORKTREE" merge origin/"$DEV_BRANCH" --ff-only 2>/dev/null; then
      log_success "Updated local $DEV_BRANCH to match origin"
    else
      log_error "Cannot fast-forward local $DEV_BRANCH to origin/$DEV_BRANCH"
      log_error "This could happen if local dev has diverged. Manual intervention required."
      log_detail "Options:"
      log_detail "  1. git merge origin/$DEV_BRANCH (merge remote changes)"
      log_detail "  2. git rebase origin/$DEV_BRANCH (rebase local onto remote)"
      log_detail "  3. Investigate the divergence manually"
      exit 1
    fi
  fi
else
  log_warning "Failed to fetch from origin - continuing with local state"
  log_warning "⚠️  Remote changes won't be considered - work may be lost on push!"
fi
if [ "$FORCE_PUSH" = true ]; then
  log_warning "Force push enabled - will push all branches to remote"
  if [ "$SKIP_CONFIRM" = true ]; then
    log_info "Skipping confirmation (--yes flag)"
  else
    echo ""
    echo -e "${YELLOW}Are you sure you want to force push all branches?${NC}"
    echo -e "${GRAY}(Use ↑/↓ arrows to select, Enter to confirm)${NC}"
    echo ""
    menu_select "Yes" "No"
    if [ "$MENU_RESULT" -eq 0 ]; then
      log_success "Confirmed - will force push after sync"
    else
      log_info "Force push cancelled - will sync without pushing"
      FORCE_PUSH=false
    fi
  fi
fi

# Check for uncommitted changes in main worktree
log_section "Checking for uncommitted changes"

if ! git -C "$MAIN_WORKTREE" diff --quiet || ! git -C "$MAIN_WORKTREE" diff --cached --quiet; then
  log_error "Main worktree has uncommitted changes - cannot proceed"
  echo ""
  git -C "$MAIN_WORKTREE" status --short
  exit 1
fi
log_success "Main worktree is clean"

# Check for uncommitted changes in all worktrees (don't exit, just track)
for wt in "${WORKTREES[@]}"; do
  if [ -d "$wt" ]; then
    BRANCH=$(git -C "$wt" rev-parse --abbrev-ref HEAD)
    has_tracked_changes=false
    has_untracked_files=false

    if ! git -C "$wt" diff --quiet || ! git -C "$wt" diff --cached --quiet; then
      has_tracked_changes=true
    fi
    if [ -n "$(git -C "$wt" ls-files --others --exclude-standard)" ]; then
      has_untracked_files=true
    fi

    if [ "$has_tracked_changes" = true ] || [ "$has_untracked_files" = true ]; then
      log_warning "$BRANCH has uncommitted changes (will stash before rebase)"
      mark_dirty "$wt"
      git -C "$wt" status --short | head -5 | while read -r line; do
        log_detail "$line"
      done
    else
      log_success "$BRANCH is clean"
    fi
  fi
done

# Show current state
log_section "Current worktree state"
git worktree list

log_section "Current branch positions"
DEV_SHA=$(git -C "$MAIN_WORKTREE" rev-parse --short "$DEV_BRANCH")
log_info "$DEV_BRANCH: $DEV_SHA"
for wt in "${WORKTREES[@]}"; do
  if [ -d "$wt" ]; then
    BRANCH=$(git -C "$wt" rev-parse --abbrev-ref HEAD)
    SHA=$(git -C "$wt" rev-parse --short HEAD)
    if is_dirty "$wt"; then
      log_warning "$BRANCH: $SHA (dirty - will stash before rebase)"
    else
      log_info "$BRANCH: $SHA"
    fi
  fi
done

# Ensure we're on dev in main worktree
log_section "Preparing main worktree"
log_info "Checking out $DEV_BRANCH..."
git -C "$MAIN_WORKTREE" checkout "$DEV_BRANCH"
log_success "On branch $DEV_BRANCH"

# Process each worktree in order
for wt in "${WORKTREES[@]}"; do
  if [ ! -d "$wt" ]; then
    log_warning "Skipping $wt (directory not found)"
    continue
  fi

  BRANCH=$(git -C "$wt" rev-parse --abbrev-ref HEAD)
  BRANCH_SHA_BEFORE=$(git -C "$wt" rev-parse --short HEAD)
  DEV_SHA_BEFORE=$(git -C "$MAIN_WORKTREE" rev-parse --short "$DEV_BRANCH")

  log_header "Processing: $BRANCH"
  log_info "Branch SHA: $BRANCH_SHA_BEFORE"
  log_info "Dev SHA:    $DEV_SHA_BEFORE"

  if is_dirty "$wt"; then
    log_warning "Worktree has uncommitted changes - will stash before rebase"
  fi

  # Check if branch has commits ahead of dev
  AHEAD=$(git -C "$MAIN_WORKTREE" rev-list --count "$DEV_BRANCH".."$BRANCH" 2>/dev/null || echo "0")
  BEHIND=$(git -C "$MAIN_WORKTREE" rev-list --count "$BRANCH".."$DEV_BRANCH" 2>/dev/null || echo "0")

  log_info "Commits ahead of dev: $AHEAD"
  log_info "Commits behind dev: $BEHIND"

  if [ "$AHEAD" = "0" ]; then
    log_warning "No new commits to sync"

    # If behind, rebase to catch up (stash first if dirty)
    if [ "$BEHIND" != "0" ]; then
      # Stash if dirty
      if is_dirty "$wt"; then
        stash_changes "$wt" "$BRANCH"
      fi

      log_section "Rebasing $BRANCH to catch up with dev"
      log_info "Running: git rebase $DEV_BRANCH"
      echo ""

      if git -C "$wt" rebase "$DEV_BRANCH"; then
        BRANCH_SHA_AFTER=$(git -C "$wt" rev-parse --short HEAD)
        echo ""
        log_success "Rebase successful - branch is now up to date"
        log_detail "Before: $BRANCH_SHA_BEFORE"
        log_detail "After:  $BRANCH_SHA_AFTER"

        # Pop stash if we stashed
        pop_stash "$wt" "$BRANCH"
      else
        log_error "Rebase failed! Resolve conflicts in $wt, then re-run this script"
        if is_stashed "$wt"; then
          log_warning "Your stashed changes are still saved. After resolving:"
          log_detail "1. Complete the rebase: git rebase --continue (or --abort)"
          log_detail "2. Restore your changes: git stash pop"
        fi
        exit 1
      fi
    fi
    continue
  fi

  # Show commits that will be included
  log_section "Commits to be included in dev"
  git -C "$MAIN_WORKTREE" log --oneline "$DEV_BRANCH".."$BRANCH" | while read -r line; do
    log_commit "$line"
  done

  # Handle dirty worktrees by stashing first, then normal rebase flow
  if is_dirty "$wt"; then
    # Stash uncommitted changes before rebase
    stash_changes "$wt" "$BRANCH"
  fi

  # Rebase branch onto dev
  log_section "Rebasing $BRANCH onto $DEV_BRANCH"
  log_info "Running: git rebase $DEV_BRANCH"
  echo ""

  if git -C "$wt" rebase "$DEV_BRANCH"; then
    BRANCH_SHA_AFTER=$(git -C "$wt" rev-parse --short HEAD)
    echo ""
    log_success "Rebase successful"
    log_detail "Before: $BRANCH_SHA_BEFORE"
    log_detail "After:  $BRANCH_SHA_AFTER"
  else
    log_error "Rebase failed! Resolve conflicts in $wt, then re-run this script"
    if is_stashed "$wt"; then
      log_warning "Your stashed changes are still saved. After resolving:"
      log_detail "1. Complete the rebase: git rebase --continue (or --abort)"
      log_detail "2. Restore your changes: git stash pop"
    fi
    exit 1
  fi

  # Fast-forward dev to the rebased branch
  log_section "Fast-forwarding $DEV_BRANCH to $BRANCH"
  log_info "Running: git merge $BRANCH --ff-only"
  echo ""

  if git -C "$MAIN_WORKTREE" merge "$BRANCH" --ff-only; then
    DEV_SHA_AFTER=$(git -C "$MAIN_WORKTREE" rev-parse --short "$DEV_BRANCH")
    echo ""
    log_success "Fast-forward successful"
    log_detail "Dev before: $DEV_SHA_BEFORE"
    log_detail "Dev after:  $DEV_SHA_AFTER"
  else
    log_error "Fast-forward failed! This shouldn't happen after a successful rebase."
    exit 1
  fi

  # Pop stash if we stashed earlier
  if is_dirty "$wt"; then
    pop_stash "$wt" "$BRANCH"
  fi

  log_success "Completed processing $BRANCH"
done

# Second pass: catch up any worktrees that fell behind
log_header "Second Pass: Catching Up"
DEV_SHA_CURRENT=$(git -C "$MAIN_WORKTREE" rev-parse --short "$DEV_BRANCH")

for wt in "${WORKTREES[@]}"; do
  if [ ! -d "$wt" ]; then
    continue
  fi

  BRANCH=$(git -C "$wt" rev-parse --abbrev-ref HEAD)
  BRANCH_SHA=$(git -C "$wt" rev-parse --short HEAD)

  # Skip if already synced
  if [ "$BRANCH_SHA" = "$DEV_SHA_CURRENT" ]; then
    log_success "$BRANCH is already synced"
    continue
  fi

  # Rebase worktrees that are behind (stash first if dirty)
  BEHIND=$(git -C "$MAIN_WORKTREE" rev-list --count "$BRANCH".."$DEV_BRANCH" 2>/dev/null || echo "0")
  if [ "$BEHIND" != "0" ]; then
    # Stash if dirty
    if is_dirty "$wt"; then
      stash_changes "$wt" "$BRANCH"
    fi

    log_section "Rebasing $BRANCH to catch up ($BEHIND commits behind)"
    log_info "Running: git rebase $DEV_BRANCH"
    echo ""

    if git -C "$wt" rebase "$DEV_BRANCH"; then
      BRANCH_SHA_AFTER=$(git -C "$wt" rev-parse --short HEAD)
      echo ""
      log_success "Rebase successful"
      log_detail "Before: $BRANCH_SHA"
      log_detail "After:  $BRANCH_SHA_AFTER"

      # Pop stash if we stashed
      if is_dirty "$wt"; then
        pop_stash "$wt" "$BRANCH"
      fi
    else
      log_error "Rebase failed! Resolve conflicts in $wt, then re-run this script"
      if is_stashed "$wt"; then
        log_warning "Your stashed changes are still saved. After resolving:"
        log_detail "1. Complete the rebase: git rebase --continue (or --abort)"
        log_detail "2. Restore your changes: git stash pop"
      fi
      exit 1
    fi
  fi
done

# Final state
log_header "Sync Complete"

log_section "Final worktree state"
git worktree list

log_section "Final branch positions"
DEV_SHA=$(git -C "$MAIN_WORKTREE" rev-parse --short "$DEV_BRANCH")
log_info "$DEV_BRANCH: $DEV_SHA"
for wt in "${WORKTREES[@]}"; do
  if [ -d "$wt" ]; then
    BRANCH=$(git -C "$wt" rev-parse --abbrev-ref HEAD)
    SHA=$(git -C "$wt" rev-parse --short HEAD)

    if [ "$SHA" = "$DEV_SHA" ]; then
      if is_dirty "$wt"; then
        log_success "$BRANCH: $SHA (synced with dev, uncommitted changes restored)"
      else
        log_success "$BRANCH: $SHA (synced with dev)"
      fi
    else
      BEHIND_NOW=$(git -C "$MAIN_WORKTREE" rev-list --count "$BRANCH".."$DEV_BRANCH" 2>/dev/null || echo "0")
      if [ "$BEHIND_NOW" != "0" ]; then
        log_warning "$BRANCH: $SHA ($BEHIND_NOW commits behind dev)"
      else
        log_info "$BRANCH: $SHA"
      fi
    fi
  fi
done

log_section "Recent commits on dev"
git --no-pager -C "$MAIN_WORKTREE" log --oneline -10

echo ""
if [ -n "$DIRTY_WORKTREES" ]; then
  log_info "Some worktrees had uncommitted changes (stashed and restored)"
fi
log_success "All worktrees synchronized successfully!"

# Force push if requested
if [ "$FORCE_PUSH" = true ]; then
  log_header "Force Pushing to Remote"

  # Push dev branch first (with hooks - validates the shared codebase)
  log_section "Pushing $DEV_BRANCH (with pre-push hooks)"
  log_info "Running: git push origin $DEV_BRANCH --force-with-lease"
  if git -C "$MAIN_WORKTREE" push origin "$DEV_BRANCH" --force-with-lease; then
    log_success "Pushed $DEV_BRANCH"
  else
    log_error "Failed to push $DEV_BRANCH - aborting remaining pushes"
    exit 1
  fi

  # Push each worktree branch (skip hooks - dev already validated the codebase)
  log_info "Remaining branches will skip hooks (dev validated codebase)"
  for wt in "${WORKTREES[@]}"; do
    if [ ! -d "$wt" ]; then
      continue
    fi

    BRANCH=$(git -C "$wt" rev-parse --abbrev-ref HEAD)

    log_section "Pushing $BRANCH (--no-verify)"
    log_info "Running: git push origin $BRANCH --force-with-lease --no-verify"

    if git -C "$wt" push origin "$BRANCH" --force-with-lease --no-verify; then
      log_success "Pushed $BRANCH"
    else
      log_error "Failed to push $BRANCH"
      exit 1
    fi
  done

  log_header "Push Complete"
  log_success "All branches pushed to remote!"
fi

# Final summary
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Summary${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""

# Get dev branch last update time in IST
DEV_LAST_UPDATE=$(TZ='Asia/Kolkata' git -C "$MAIN_WORKTREE" log -1 --format="%cd" --date=format:"%d %b %Y, %I:%M %p IST" "$DEV_BRANCH")
log_info "Dev branch: $DEV_BRANCH @ $(git -C "$MAIN_WORKTREE" rev-parse --short "$DEV_BRANCH")"
log_detail "Up to date till: $DEV_LAST_UPDATE"

echo ""
log_section "Branch Update Status"
for wt in "${WORKTREES[@]}"; do
  if [ -d "$wt" ]; then
    BRANCH=$(git -C "$wt" rev-parse --abbrev-ref HEAD)
    SHA=$(git -C "$wt" rev-parse --short HEAD)
    LAST_UPDATE=$(TZ='Asia/Kolkata' git -C "$wt" log -1 --format="%cd" --date=format:"%d %b %Y, %I:%M %p IST")

    if [ "$SHA" = "$DEV_SHA" ]; then
      if is_dirty "$wt"; then
        log_success "$BRANCH: $SHA (had uncommitted changes)"
      else
        log_success "$BRANCH: $SHA"
      fi
      log_detail "Up to date till: $LAST_UPDATE"
    else
      BEHIND_NOW=$(git -C "$MAIN_WORKTREE" rev-list --count "$BRANCH".."$DEV_BRANCH" 2>/dev/null || echo "0")
      if [ "$BEHIND_NOW" != "0" ]; then
        log_warning "$BRANCH: $SHA ($BEHIND_NOW commits behind)"
      else
        log_info "$BRANCH: $SHA"
      fi
      log_detail "Up to date till: $LAST_UPDATE"
    fi
  fi
done

echo ""
log_info "Worktrees synced: ${#WORKTREES[@]}"
if [ "$FORCE_PUSH" = true ]; then
  log_info "Remote: All branches force pushed"
else
  log_info "Remote: No changes pushed (use -f to force push)"
fi
if [ -n "$DIRTY_WORKTREES" ]; then
  log_info "Uncommitted changes: Stashed and restored automatically"
fi
echo ""
log_success "Done!"
echo ""
