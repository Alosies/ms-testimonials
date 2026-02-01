# API Deployment

This document describes how to deploy the Testimonials API to Koyeb.

## Overview

The Testimonials API runs on [Koyeb](https://www.koyeb.com/), a serverless platform that deploys directly from GitHub. The API is built as a Docker container optimized for a pnpm monorepo.

**Production URL:** https://testimonials-brownforge-e31dba1f.koyeb.app

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   GitHub Repo   │────▶│   Koyeb Build    │────▶│  Koyeb Service  │
│  (push to dev)  │     │  (Dockerfile)    │     │  (container)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                                                 ┌─────────────────┐
                                                 │  Hasura Cloud   │
                                                 │  (GraphQL API)  │
                                                 └─────────────────┘
```

## Dockerfile Design

The API uses a single-stage Docker build with tsx runtime. This is required because `@testimonials/core` exports TypeScript source directly.

### Key Design Decisions

1. **tsx Runtime**: Uses `npx tsx src/index.ts` instead of compiling to JavaScript
   - Reason: The `@testimonials/core` package has `"main": "./src/index.ts"` (TypeScript source)
   - This avoids ESM module resolution issues with compiled output

2. **Full Dependencies**: Installs all dependencies (including dev) for tsx to work
   - Uses `--ignore-scripts` to skip husky which isn't available in container

3. **pnpm Workspaces**: Copies only needed workspace packages
   - `api/` - The API service
   - `packages/libs/core/` - Shared TypeScript library

### Dockerfile

```dockerfile
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

# Install all dependencies (including dev deps for tsx)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code for api and its dependencies
COPY api/ ./api/
COPY packages/libs/core/ ./packages/libs/core/

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

# Start the application with tsx (handles TypeScript directly)
CMD ["dumb-init", "npx", "tsx", "src/index.ts"]
```

### .dockerignore

The `.dockerignore` file excludes unnecessary files to reduce build context:

- `**/node_modules` - Installed fresh in container
- `apps/` - Web app not needed for API
- `**/docs/` - Documentation
- Test files (`*.test.ts`, `*.spec.ts`)
- IDE/editor files

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port (set by Koyeb) | `4000` |
| `NODE_ENV` | Environment | `production` |
| `HASURA_GRAPHQL_URL` | Hasura GraphQL endpoint | `https://graphql.testimonial.brownforge.com/v1/graphql` |
| `HASURA_ADMIN_SECRET` | Hasura admin secret | `<secret>` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `<key>` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `<secret>` |
| `AWS_REGION` | AWS region | `ap-south-1` |
| `S3_BUCKET_NAME` | S3 bucket for media | `testimonials-media` |
| `HASURA_WEBHOOK_SECRET` | Webhook auth for scheduled jobs | `<secret>` |

### Setting Variables

Using Koyeb CLI:

```bash
koyeb service update testimonials \
  --env "HASURA_GRAPHQL_URL=https://graphql.testimonial.brownforge.com/v1/graphql" \
  --env "HASURA_ADMIN_SECRET=your-secret" \
  # ... more variables
```

Or via Koyeb dashboard: **App** → **Settings** → **Environment variables**

## Deployment

### Initial Deployment

```bash
# Create the app and service
koyeb app init testimonials \
  --docker "ghcr.io/your-org/testimonials-api" \
  --docker-command "dumb-init npx tsx src/index.ts" \
  --ports 4000:http \
  --routes /:4000 \
  --instance-type free \
  --regions fra \
  --env "NODE_ENV=production" \
  --env "PORT=4000" \
  # ... additional env vars
```

### Using GitHub Integration (Recommended)

1. Connect GitHub repository in Koyeb dashboard
2. Configure build settings:
   - **Build type**: Dockerfile
   - **Dockerfile path**: `api/Dockerfile`
   - **Build context**: `.` (root)
3. Set environment variables in dashboard
4. Deploy triggers automatically on push to configured branch

### Manual Redeployment

```bash
# Trigger a new deployment
koyeb service redeploy testimonials

# Watch deployment status
koyeb service logs testimonials -f
```

## Health Checks

The API exposes health endpoints:

### Main Health Check

```bash
curl https://testimonials-brownforge-e31dba1f.koyeb.app/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-01T08:50:52.113Z",
  "uptime": 153.11,
  "memory": {
    "rss": 120291328,
    "heapTotal": 38330368,
    "heapUsed": 36309512
  },
  "environment": "production"
}
```

### Jobs Health Check

```bash
curl https://testimonials-brownforge-e31dba1f.koyeb.app/jobs/health
```

Response:
```json
{
  "status": "healthy",
  "webhookSecretConfigured": true,
  "availableJobs": ["cleanup-reservations", "reset-credits"],
  "timestamp": "2026-02-01T12:00:00.000Z"
}
```

## Monitoring

### Viewing Logs

```bash
# Stream live logs
koyeb service logs testimonials -f

# View recent logs
koyeb service logs testimonials --since 1h
```

### Key Log Patterns

**Successful startup:**
```
Server running on port 4000
```

**Health check:**
```
GET /health 200
```

**Scheduled job execution:**
```json
{"level":"info","job":"cleanup-reservations","phase":"start",...}
{"level":"info","job":"cleanup-reservations","phase":"complete","result":{"expiredCount":0},...}
```

## Troubleshooting

### Build Failures

**Error: `sh: husky: not found`**
- The Dockerfile uses `--ignore-scripts` flag to skip prepare script

**Error: `Cannot find module`**
- Ensure all workspace packages are copied in Dockerfile
- Check that path mappings in tsconfig are correct

### Runtime Failures

**Error: `Cannot find module '.../env'` (ESM resolution)**
- Solution: Use tsx runtime instead of compiled node
- The issue occurs because `moduleResolution: "bundler"` doesn't work with Node.js ESM

**Error: Health check failing**
- Check that `PORT` environment variable is set
- Verify the health endpoint returns 200

### Connection Issues

**Cannot connect to Hasura:**
- Verify `HASURA_GRAPHQL_URL` is correct
- Check `HASURA_ADMIN_SECRET` is set
- Ensure Hasura allows connections from Koyeb IPs

**Cannot connect to Supabase:**
- Verify Supabase environment variables
- Check that service role key has necessary permissions

## Scaling

### Current Setup

- **Instance type**: `free` (hobby tier)
- **Replicas**: 1
- **Region**: Frankfurt (fra)

### Upgrading

```bash
# Upgrade to nano instance
koyeb service update testimonials --instance-type nano

# Scale to multiple replicas
koyeb service update testimonials --min-scale 2 --max-scale 5
```

## CI/CD Pipeline (Future)

For automated deployments, add GitHub Actions:

```yaml
# .github/workflows/deploy-api.yml
name: Deploy API

on:
  push:
    branches: [main]
    paths:
      - 'api/**'
      - 'packages/libs/core/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Koyeb
        run: |
          koyeb service redeploy testimonials
        env:
          KOYEB_TOKEN: ${{ secrets.KOYEB_TOKEN }}
```

## Related Documentation

- [Scheduled Jobs](./scheduled-jobs.md) - Background job execution with Hasura cron triggers
- [Feature Structure](./feature-structure.md) - API code organization
- [Endpoint Creation](./endpoint-creation.md) - Adding new API endpoints
