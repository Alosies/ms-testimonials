.PHONY: install restart dev dev-web dev-api build db-up db-down hasura-console hasura-migrate hasura-metadata sync sync-push ralph-afk ralph-once

# Install dependencies
install:
	pnpm install

# Full restart - clear all caches and reinstall
restart:
	./scripts/restart.sh

# Development
dev:
	pnpm dev

dev-web:
	pnpm dev:web

dev-api:
	pnpm dev:api

# Build
build:
	pnpm build

# Database
db-up:
	cd db && docker-compose up -d

db-down:
	cd db && docker-compose down

db-reset:
	cd db && docker-compose down -v && docker-compose up -d

db-logs:
	cd db && docker-compose logs -f hasura

# Hasura
hasura-console:
	cd db/hasura && hasura console

hasura-migrate:
	cd db/hasura && hasura migrate apply --database-name default

hasura-metadata:
	cd db/hasura && hasura metadata apply

hasura-apply-all:
	cd db/hasura && hasura migrate apply --database-name default && hasura metadata apply

# GraphQL codegen
codegen:
	pnpm codegen:web

codegen-watch:
	pnpm codegen:web:watch

# Worktree sync
sync:
	./scripts/sync-worktrees.sh

sync-push:
	./scripts/sync-worktrees.sh -f -y

# Ralph Loop - Autonomous development
# Usage: make ralph-afk PRD=ralph/workspaces/my-feature_2026-01-10/prd.json
# Usage: make ralph-afk PRD=ralph/workspaces/my-feature_2026-01-10/prd.json MAX=20
# Usage: make ralph-afk PRD=... CLAUDE_CMD=cc (custom CLI command)
ralph-afk:
	@if [ -z "$(PRD)" ]; then \
		echo "Error: PRD required. Usage: make ralph-afk PRD=path/to/prd.json"; \
		exit 1; \
	fi
	CLAUDE_CMD="$(or $(CLAUDE_CMD),claude)" ./ralph/ralph.sh --max $(or $(MAX),5) --prd $(PRD)

# Usage: make ralph-once PRD=ralph/workspaces/my-feature_2026-01-10/prd.json
ralph-once:
	@if [ -z "$(PRD)" ]; then \
		echo "Error: PRD required. Usage: make ralph-once PRD=path/to/prd.json"; \
		exit 1; \
	fi
	CLAUDE_CMD="$(or $(CLAUDE_CMD),claude)" ./ralph/ralph.sh --once --prd $(PRD)
