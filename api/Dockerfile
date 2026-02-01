# Multi-stage build for production optimization
# This Dockerfile builds the API from within a pnpm monorepo

FROM node:22-alpine AS base

# Install dumb-init for proper signal handling and pnpm
RUN apk add --no-cache dumb-init
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory to monorepo root
WORKDIR /app

# Copy workspace configuration files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy package.json files for all workspace packages needed by api
COPY api/package.json ./api/
COPY packages/libs/core/package.json ./packages/libs/core/

# Install all dependencies (including workspace deps)
RUN pnpm install --frozen-lockfile

# Copy source code for api and its dependencies
COPY api/ ./api/
COPY packages/libs/core/ ./packages/libs/core/

# Build the core package first (if it has a build step)
RUN cd packages/libs/core && pnpm build || true

# Build the API application
WORKDIR /app/api
RUN pnpm build

# Production stage
FROM node:22-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy package.json files
COPY api/package.json ./api/
COPY packages/libs/core/package.json ./packages/libs/core/

# Install only production dependencies (ignore scripts to skip husky)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy built application from base stage
COPY --from=base /app/api/dist ./api/dist
COPY --from=base /app/packages/libs/core ./packages/libs/core

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S hono -u 1001

# Change ownership of the app directory
RUN chown -R hono:nodejs /app
USER hono

# Set working directory to api
WORKDIR /app/api

# Expose the port (Koyeb will set PORT env var)
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 4000) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start the application with proper signal handling
CMD ["dumb-init", "node", "dist/index.js"]
