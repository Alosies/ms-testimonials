#!/bin/bash

# Full restart script - removes all caches and reinstalls dependencies
# Stop any running dev servers first (Ctrl+C or kill them manually)

echo "🧹 Cleaning up caches and dependencies..."

# Remove node_modules in all workspaces
rm -rf node_modules
rm -rf apps/web/node_modules
rm -rf api/node_modules
rm -rf packages/libs/*/node_modules
rm -rf packages/**/node_modules

# Clear Vite cache
rm -rf apps/web/node_modules/.vite
rm -rf node_modules/.vite

# Clear TypeScript cache
rm -rf apps/web/.tsbuildinfo
rm -rf apps/web/tsconfig.tsbuildinfo
rm -rf api/tsconfig.tsbuildinfo
rm -rf packages/libs/*/tsconfig.tsbuildinfo
rm -rf tsconfig.tsbuildinfo

# Clear pnpm cache
pnpm store prune

# Clear dist folders
rm -rf dist
rm -rf apps/web/dist
rm -rf api/dist
rm -rf packages/libs/*/dist

# Clear any temp files
rm -rf .temp

echo "📦 Reinstalling dependencies..."
pnpm install

echo "🔧 Regenerating GraphQL types..."
pnpm codegen:web

echo "✅ Done! You can now run 'pnpm dev' to start the development server."
