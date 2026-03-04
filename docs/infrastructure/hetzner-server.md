# Hetzner Server — Self-Hosted Infrastructure

## Doc Connections
**ID**: `infra-hetzner-server`

2026-03-04-1700 IST

**Parent ReadMes**:
- `infra-index` - Infrastructure documentation index

**Related ReadMes**:
- `adr-028-auth-redundancy` - Auth provider redundancy ADR
- `impl-028-auth-redundancy` - Auth provider redundancy implementation
- `guide-auth-failover-runbook` - Auth failover runbook

---

## Server Details

| Property | Value |
|----------|-------|
| **Provider** | Hetzner Cloud |
| **Server name** | `testimonials-db` |
| **IP** | `77.42.47.81` |
| **IPv6** | `2a01:4f9:c013:dd4a::/64` |
| **Datacenter** | `hel1-dc2` (Helsinki, Finland) |
| **SSH access** | `ssh root@77.42.47.81` |
| **Deployment path** | `/root/testimonials-infra/` |
| **hcloud CLI** | `hcloud server list` (installed locally) |

## Services

All services run via Docker Compose at `/root/testimonials-infra/`.

| Service | Image/Build | Port | Domain | Status |
|---------|-------------|------|--------|--------|
| PostgreSQL 16 | `postgres:16` | 5432 | — | Always running |
| Hasura v2.43.0 | `hasura/graphql-engine:v2.43.0` | 8080 | `graphql.testimonial.brownforge.com` | Always running |
| Caddy 2.7 | `caddy:2.7` | 80, 443 | — (reverse proxy) | Always running |
| Better Auth | `./better-auth` (built) | 3100 | `auth.testimonial.brownforge.com` | Profile: `with-better-auth` |

### Docker Compose Profiles

```bash
# Standard services (postgres, hasura, caddy)
docker compose up -d

# Include Better Auth
docker compose --profile with-better-auth up -d
```

### Docker Volumes

Volumes use the legacy `testimonials-db_` prefix (from before the folder rename). They're mapped as external volumes in the compose file:

| Volume | Maps to |
|--------|---------|
| `postgres-data` | `testimonials-db_postgres-data` |
| `caddy_data` | `testimonials-db_caddy_data` |
| `caddy_config` | `testimonials-db_caddy_config` |

## DNS Records (Cloudflare)

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `graphql.testimonial` | `77.42.47.81` | DNS only (gray cloud) |
| A | `auth.testimonial` | `77.42.47.81` | DNS only (gray cloud) |

DNS only (not proxied) is required so Caddy can handle TLS via Let's Encrypt ACME HTTP-01 challenge.

## Environment Files

### `/root/testimonials-infra/.env`

Used by docker-compose for all services:

```bash
# Hasura
JWT_SECRET={"type":"HS256", "key": "..."}
ENABLE_INTROSPECTION=true
HASURA_WEBHOOK_SECRET=...
API_URL=https://testimonials-brownforge-e31dba1f.koyeb.app

# Better Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://auth.testimonial.brownforge.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
TRUSTED_ORIGINS=https://testimonials.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004
```

### `/root/testimonials-infra/better-auth/.env`

Used by Better Auth container (loaded via `env_file` in compose):

```bash
RESEND_API_KEY=...
EMAIL_FROM=Testimonials <noreply@testimonial.brownforge.com>
```

## Common Operations

### SSH into server
```bash
ssh root@77.42.47.81
```

### Check service status
```bash
ssh root@77.42.47.81 "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
```

### View logs
```bash
ssh root@77.42.47.81 "docker logs <service> --tail 50"
ssh root@77.42.47.81 "docker logs better-auth --tail 50"
ssh root@77.42.47.81 "docker logs hasura --tail 50"
```

### Restart a service
```bash
ssh root@77.42.47.81 "cd /root/testimonials-infra && docker compose restart <service>"
```

### Rebuild Better Auth after code changes
```bash
scp -r db/better-auth root@77.42.47.81:/root/testimonials-infra/better-auth
ssh root@77.42.47.81 "cd /root/testimonials-infra && docker compose --profile with-better-auth up -d --build better-auth"
```

### Apply Hasura migrations
```bash
# From local machine (db/hasura directory)
hasura migrate apply --database-name default
hasura migrate status --database-name default
```

### Check PostgreSQL
```bash
ssh root@77.42.47.81 "docker exec postgres psql -U testimonials_admin -d testimonials -c 'SELECT 1;'"
```

## Troubleshooting

### Docker Volume Rename Trap

If you rename the compose project folder, Docker creates new empty volumes instead of reusing existing data. Fix: map old volumes as external:

```yaml
volumes:
  postgres-data:
    name: testimonials-db_postgres-data
    external: true
```

### Caddy TLS Provisioning Delay

First HTTPS request to a new domain fails (~5s) while Caddy provisions the Let's Encrypt certificate. Check progress:

```bash
ssh root@77.42.47.81 "docker logs caddy --tail 20 2>&1 | grep -i cert"
```

### Better Auth 500 on Signup/Signin

1. **Column name mismatch**: Better Auth expects camelCase columns (`emailVerified`, `userId`, `createdAt`), not snake_case. Verify with:
   ```bash
   ssh root@77.42.47.81 "docker exec postgres psql -U testimonials_admin -d testimonials -c \"\d better_auth.\\\"user\\\"\""
   ```

2. **Tables don't exist**: Better Auth doesn't auto-create tables. Apply Hasura migrations:
   ```bash
   hasura migrate apply --database-name default
   ```

3. **Better Auth CLI migrate fails**: Don't use `npx @better-auth/cli migrate` inside a running container — it tries to start the server and gets EADDRINUSE. Use Hasura migrations instead.

### ESM Module Resolution Error (`ERR_MODULE_NOT_FOUND`)

Better Auth's `tsconfig.json` must use `module: "NodeNext"` and `moduleResolution: "NodeNext"`. Local imports need `.js` extensions (e.g., `import { sendEmail } from './email.js'`). The `"bundler"` moduleResolution doesn't emit extensions, which breaks Node.js ESM.

## Database Schemas

| Schema | Owner | Purpose |
|--------|-------|---------|
| `public` | App | Application tables (users, forms, testimonials, etc.) |
| `better_auth` | Better Auth | Internal tables (user, session, account, verification) |

Better Auth connects with `search_path=better_auth` to isolate its tables. These schemas share the same PostgreSQL instance but are logically separated.
