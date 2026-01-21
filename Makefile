.PHONY: install restart dev dev-web dev-api build db-up db-down hasura-console hasura-migrate hasura-metadata codegen codegen-watch e2e e2e-smoke e2e-headed e2e-ui sync sync-push ralph-afk ralph-once

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

# E2E Tests (auto-detects port based on worktree: yellow=3001, green=3002, blue=3003)
# Usage: make e2e                           - Run all tests
# Usage: make e2e-smoke                     - Run smoke tests only
# Usage: make e2e G="test name pattern"     - Run tests matching grep pattern
# Usage: make e2e-headed                    - Run with visible browser
# Usage: make e2e-headed G="pattern"        - Run matching tests with visible browser
# Usage: make e2e-ui                        - Run in interactive UI mode
# Usage: make e2e-ui G="pattern"            - Run matching tests in UI mode
e2e:
	E2E_BASE_URL=http://localhost:$$(./scripts/get-agent-port.sh) pnpm --filter @testimonials/web test:e2e $(if $(G),-- -g "$(G)",)

e2e-smoke:
	E2E_BASE_URL=http://localhost:$$(./scripts/get-agent-port.sh) pnpm --filter @testimonials/web test:e2e:smoke

e2e-headed:
	E2E_BASE_URL=http://localhost:$$(./scripts/get-agent-port.sh) pnpm --filter @testimonials/web test:e2e:headed $(if $(G),-- -g "$(G)",)

e2e-ui:
	E2E_BASE_URL=http://localhost:$$(./scripts/get-agent-port.sh) pnpm --filter @testimonials/web test:e2e:ui $(if $(G),-- -g "$(G)",)

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
