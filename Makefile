.PHONY: install dev dev-web dev-api build db-up db-down hasura-console hasura-migrate hasura-metadata sync sync-push

# Install dependencies
install:
	pnpm install

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
	./scripts/sync-worktrees.sh -f
