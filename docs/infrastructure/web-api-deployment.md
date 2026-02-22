# Web & API Deployment Guide

## Architecture Overview

The application uses a split deployment model:

| Component | Platform | Purpose |
|-----------|----------|---------|
| **Frontend (SPA)** | Vercel | Vue dashboard, static assets, widget embed script |
| **API** | Koyeb | Hono.js REST API, auth, AI, data endpoints |
| **Database** | Hasura Cloud | GraphQL API over PostgreSQL |

### URLs

| Environment | Frontend (Vercel) | API (Koyeb) |
|-------------|-------------------|-------------|
| Production | `https://ms-testimonials.vercel.app` | `https://testimonials-brownforge-e31dba1f.koyeb.app` |
| Preview (dev) | `https://ms-testimonials-git-dev-alosies-projects.vercel.app` | Same API |

## Vercel (Frontend)

### Branch Strategy

Only three branches trigger deployments:

| Branch | Vercel Environment | Purpose |
|--------|-------------------|---------|
| `prod` | Production | Live site, publicly accessible |
| `qa` | Preview | QA validation |
| `dev` | Preview | Development testing |

All other branches (e.g., `yellow/*`, `green/*`, `blue/*`) are skipped via `ignoreCommand` in `vercel.json`.

### Configuration Files

- **`vercel.json`** - Build config, SPA rewrites, branch filtering
- **`.vercelignore`** - Excludes `/api/`, `/db/`, `/docs/`, etc. from deployment
- **`.nvmrc`** - Pins Node.js to v22

### Build Pipeline

The Vercel build runs these steps in order:

```
1. pnpm install                              # Install all monorepo deps
2. @testimonials/icons build (tsup)          # Build icon library
3. @testimonials/widget-embed build (vite)   # Build embed script
4. cp widgets.js → apps/web/public/embed/    # Copy to public dir
5. vite build (apps/web)                     # Build SPA (copies public/ to dist/)
```

**Note:** `vue-tsc` type checking is intentionally skipped on Vercel because:
- The API source (`/api/`) is excluded via `.vercelignore` to prevent serverless function auto-detection
- The web app imports types from `/api/` via the `@api/*` tsconfig alias
- Without those files, `vue-tsc` fails — but `vite build` works fine (transpiles without type checking)
- Type safety is enforced by the pre-push git hook locally

### Key Vercel Settings

| Setting | Value | Location |
|---------|-------|----------|
| Framework Preset | Vite | Build and Deployment |
| Node.js Version | 22.x | Build and Deployment |
| Production Branch | `prod` | Environments |

### Environment Variables (Vercel)

Set these in **Vercel Dashboard > Settings > Environment Variables**:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_HASURA_GRAPHQL_ENDPOINT` | Hasura GraphQL endpoint | Yes |
| `VITE_API_BASE_URL` | Koyeb API URL | Yes |
| `VITE_IMAGEKIT_URL_ENDPOINT` | ImageKit CDN URL | Yes |
| `VITE_IMAGEKIT_PATH_PREFIX` | ImageKit path prefix | Optional |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |

Do **NOT** add: `VITE_PORT`, `HASURA_URL`, `HASURA_ADMIN_SECRET` (local dev only).

### pnpm 10 Build Scripts

pnpm 10 blocks dependency postinstall scripts by default. The following are approved in `package.json` under `pnpm.onlyBuiltDependencies`:

- **`esbuild`** - Downloads native binary
- **`vue-demi`** - Sets up Vue 3 bindings (without this, defaults to Vue 2 and causes type errors)

## Widget Embed Script

### How It Works

The embed script (`widgets.js`) is a self-contained IIFE built from `packages/widget-embed/`. It:

1. Is served as a **static file** from Vercel at `/embed/widgets.js`
2. Runs on the **customer's website** (third-party context)
3. Calls the **Koyeb API** (`/public/widgets/:id`) to fetch testimonial data
4. Renders widgets in a Shadow DOM

### Embed Code Format

```html
<div data-testimonials-widget="carousel"
     data-widget-id="WIDGET_ID"
     data-api-url="https://testimonials-brownforge-e31dba1f.koyeb.app">
</div>
<script src="https://ms-testimonials.vercel.app/embed/widgets.js" async></script>
```

### Critical: URL Requirements

| URL | Must Be | Why |
|-----|---------|-----|
| `script src` | **Production Vercel URL** (`ms-testimonials.vercel.app`) | Preview/branch URLs have Deployment Protection (401) and are not publicly accessible |
| `data-api-url` | **Koyeb API URL** | Frontend and API are on different origins; without this attribute, the widget infers the API from the script's origin (which would be Vercel, not Koyeb) |

### Deployment Protection Gotcha

Vercel enables **Deployment Protection** on preview/branch deployments by default. This means:

- `https://ms-testimonials.vercel.app/embed/widgets.js` → **200 OK** (production, public)
- `https://ms-testimonials-git-dev-alosies-projects.vercel.app/embed/widgets.js` → **401 Unauthorized** (preview, protected)

The embed code generated in `WidgetEmbedModal.vue` uses `window.location.origin` for the script src. In production this works correctly. For testing preview deployments, either:
1. Disable Deployment Protection in Vercel Settings
2. Use the production URL for the script src

### API URL in Embed Code

The `data-api-url` attribute is set from `VITE_API_BASE_URL` in `WidgetEmbedModal.vue`. This is essential because:
- The widget script infers the API URL from the script's `src` origin by default
- Since the script is hosted on Vercel but the API is on Koyeb, the inference would be wrong
- `data-api-url` explicitly tells the widget where to fetch data

### CORS for Widget API

The Koyeb API must allow requests from any origin for the public widget endpoint (`/public/widgets/:id`), since the embed script runs on customer websites with unknown origins.

The `CORS_ALLOWED_ORIGINS` env var on Koyeb must include the Vercel production URL. Customer website origins are handled by the public endpoint's CORS policy.

## Koyeb (API)

### Environment Variables (Koyeb)

Key variables that relate to the frontend deployment:

| Variable | Description |
|----------|-------------|
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins (must include Vercel URL) |
| `FRONTEND_URL` | Vercel production URL |

### CORS Configuration

CORS is configured in `api/src/shared/config/cors.ts`. It reads `CORS_ALLOWED_ORIGINS` and also allows any `localhost` origin in development mode.

When adding a new Vercel deployment URL, update `CORS_ALLOWED_ORIGINS` on Koyeb:
```
https://ms-testimonials.vercel.app,https://ms-testimonials-git-dev-alosies-projects.vercel.app
```

## Syncing Branches

To promote changes through environments:

```bash
# Dev → QA
git push origin dev:qa

# Dev → Prod (or QA → Prod)
git push origin dev:prod
```

These fast-forward pushes trigger Vercel deployments for the target branch.
