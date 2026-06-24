# Groovethiopia — Deployment Runbook

## Prerequisites

### Domain
- `groovethiopia.com` and `admin.groovethiopia.com` registered
- DNS A records pointing to your Hetzner server IP:
  ```
  groovethiopia.com       A    <HETZNER_IP>
  www.groovethiopia.com   A    <HETZNER_IP>
  admin.groovethiopia.com A    <HETZNER_IP>
  ```

### Services to provision (one-time)
1. **Neon Postgres** (https://neon.tech)
   - Create project → copy connection string
   - → `apps/backend/.env` `DATABASE_URL`

2. **Cloudflare R2** (https://cloudflare.com)
   - Create bucket `groovethiopia-media`
   - Generate API token with R2 read/write
   - Set custom domain: `media.groovethiopia.com`
   - → `apps/backend/.env` `R2_*` vars

3. **Resend** (https://resend.com)
   - Verify domain `groovethiopia.com`
   - Create API key
   - → `apps/backend/.env` `RESEND_API_KEY`

4. **Inngest** (https://inngest.com)
   - Create account + project
   - → `apps/backend/.env` `INNGEST_*` keys

5. **Sentry** (https://sentry.io)
   - Create project for backend
   - → `apps/backend/.env` `SENTRY_DSN`

6. **Google Cloud Console**
   - OAuth consent screen (External)
   - Create OAuth Client (Web application)
   - Authorized redirect: `https://groovethiopia.com`, `https://admin.groovethiopia.com`
   - → `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (frontend) + `GOOGLE_CLIENT_ID/SECRET` (backend)
   - Also create reCAPTCHA v3 key
   - → `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (frontend) + `RECAPTCHA_SECRET_KEY` (backend)

7. **Google Cloud Translation**
   - Enable API, create API key
   - → `GOOGLE_TRANSLATE_API_KEY` (backend)

### Hetzner Server
- CX22 or larger (Ubuntu 22.04)
- SSH access configured
- Docker installed (`curl -fsSL https://get.docker.com | sh`)

## Initial Setup

### 1. Clone the repo on the server

```bash
ssh root@<HETZNER_IP>
mkdir -p /opt/groovethiopia && cd /opt/groovethiopia
git clone https://github.com/abrhamt/groovethiopia.git .
```

### 2. Configure environment

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Edit both with your real credentials
nano apps/backend/.env
nano apps/frontend/.env
```

### 3. Generate AUTH_SECRET

```bash
openssl rand -base64 32
# Paste into both .env files as AUTH_SECRET
```

### 4. Bootstrap database (run migrations + seed)

```bash
docker run --rm \
  -v $(pwd)/packages/db:/app \
  -w /app \
  node:20-alpine sh -c "
    corepack enable && corepack prepare pnpm@9.0.0 --activate &&
    npm install -g pnpm@9 &&
    pnpm install --frozen-lockfile &&
    pnpm exec prisma migrate deploy &&
    pnpm exec tsx prisma/seed.ts
  "
```

Or simply:
```bash
DATABASE_URL="<your-neon-url>" pnpm --filter @groovethiopia/db migrate
DATABASE_URL="<your-neon-url>" pnpm --filter @groovethiopia/db seed
```

### 5. Create the first admin user (CLI)

```bash
DATABASE_URL="<your-neon-url>" \
ADMIN_EMAIL="admin@groovethiopia.com" \
ADMIN_PASSWORD="YourSecurePasswordHere!" \
pnpm tsx scripts/create-admin.ts
```

(Will write the script next)

### 6. Set up GitHub Actions secrets

In your GitHub repo → Settings → Secrets → Actions:
- `HETZNER_HOST` — server IP
- `HETZNER_USER` — SSH username (e.g. `root`)
- `HETZNER_SSH_KEY` — private SSH key

### 7. Deploy

```bash
docker compose up -d --build
```

Or push to `main` → GitHub Actions handles it.

## Verification

```bash
# Check containers
docker compose ps

# Check logs
docker compose logs -f frontend
docker compose logs -f backend

# Test
curl -I https://groovethiopia.com
curl -I https://admin.groovethiopia.com
```

## Daily Operations

### View logs
```bash
docker compose logs -f [service]
```

### Restart a service
```bash
docker compose restart [service]
```

### Run a one-off command in backend
```bash
docker compose exec backend npx prisma studio
```

### Pull latest and redeploy
```bash
cd /opt/groovethiopia
git pull
docker compose pull
docker compose up -d --remove-orphans
```

## Backups

- Neon: automatic daily backups (free tier), 7-day point-in-time recovery on paid tier
- Cloudflare R2: optional bucket replication can be enabled
- For additional safety, run nightly `pg_dump` and store in R2:

```bash
0 3 * * * /opt/groovethiopia/scripts/backup.sh
```

## Monitoring

- **Sentry**: https://sentry.io — all errors land here
- **Inngest**: https://app.inngest.com — view cron job runs
- **Neon**: https://console.neon.tech — DB metrics
- **Cloudflare**: https://dash.cloudflare.com — R2 + CDN metrics

## Troubleshooting

### "ECONNREFUSED" between services
```bash
docker network ls
docker compose restart
```

### Caddy won't start (port 80/443 already in use)
```bash
sudo lsof -i :80
sudo lsof -i :443
# Stop conflicting services or change ports in docker-compose.yml
```

### Prisma migrations out of sync
```bash
DATABASE_URL="<url>" pnpm --filter @groovethiopia/db migrate dev
```