# Groovethiopia — Deployment Guide

This is a step-by-step guide for deploying the Groovethiopia monorepo to a Hetzner server (or any VPS running Docker). The setup uses Docker Compose, Caddy for TLS, and the official Docker Hub images.

## Prerequisites

- A Hetzner Cloud server (CX22 or larger, Ubuntu 22.04+)
- A domain pointed at the server's IP (A records for `groovethiopia.com`, `www.groovethiopia.com`, `admin.groovethiopia.com`)
- SSH access to the server
- Local machine with `docker` and `docker compose` installed
- GitHub repo with the Groovethiopia code (already exists)

## Server setup

```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Update + install Docker
apt update && apt upgrade -y
apt install -y curl ufw

# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker root

# Allow SSH, HTTP, HTTPS through firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Reboot (optional but recommended)
reboot
```

## DNS configuration

At your DNS provider, add A records:

```
groovethiopia.com.         A    YOUR_SERVER_IP
www.groovethiopia.com.     A    YOUR_SERVER_IP
admin.groovethiopia.com.   A    YOUR_SERVER_IP
```

Wait a few minutes for DNS to propagate.

## Configuration

### 1. Environment files

On your **local machine**, copy the env templates:

```bash
cd /workspace/groovethiopia
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Edit `apps/backend/.env` with production values:

```bash
DATABASE_URL=postgresql://USER:PASS@db:5432/groovethiopia
NEXTAUTH_URL=https://admin.groovethiopia.com
NEXTAUTH_SECRET=GENERATE_WITH_openssl_rand_-base64_32
RESEND_API_KEY=re_xxx
EMAIL_FROM=Groovethiopia <hello@groovethiopia.com>
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET=groovethiopia-media
R2_PUBLIC_URL=https://media.groovethiopia.com
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
INNGEST_EVENT_KEY=xxx
INNGEST_SIGNING_KEY=xxx
NEXT_PUBLIC_FRONTEND_URL=https://groovethiopia.com
NEXT_PUBLIC_BACKEND_URL=https://admin.groovethiopia.com
NEXT_PUBLIC_ADMIN_URL=https://admin.groovethiopia.com
SENTRY_DSN=
NODE_ENV=production
```

Edit `apps/frontend/.env`:

```bash
NEXT_PUBLIC_BACKEND_URL=https://admin.groovethiopia.com
NEXT_PUBLIC_FRONTEND_URL=https://groovethiopia.com
NEXT_PUBLIC_SITE_URL=https://groovethiopia.com
```

### 2. Generate secrets

```bash
# NextAuth secret
openssl rand -base64 32

# Database password
openssl rand -base64 24
```

### 3. Docker Compose

The `docker-compose.yml` at the repo root starts Postgres, the backend, the frontend, and Caddy. Caddy automatically provisions TLS via Let's Encrypt.

## Deploy

### Option A: One-shot deploy from local

```bash
# From your local machine
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  /workspace/groovethiopia/ root@YOUR_SERVER_IP:/opt/groovethiopia/

ssh root@YOUR_SERVER_IP "cd /opt/groovethiopia && \
  docker compose up -d --build"
```

### Option B: GitHub Actions (recommended)

The repo includes `.github/workflows/deploy.yml` which builds and pushes Docker images to GHCR, then SSHs to the server and runs `docker compose pull && up -d`.

To enable:
1. Add these secrets to your GitHub repo (`Settings → Secrets → Actions`):
   - `HETZNER_SSH_KEY` — private SSH key for the server
   - `HETZNER_HOST` — server IP
2. Edit `.github/workflows/deploy.yml` if needed (e.g., image tags)
3. Push to `main` → auto-deploy

### Option C: Pull images from registry

```bash
# On the server
git clone https://github.com/abrhamt/groovethiopia.git /opt/groovethiopia
cd /opt/groovethiopia
cp .env.production.example .env
# Edit .env with your secrets
docker compose up -d
```

## First-time setup

After the stack is up:

```bash
# Run database migrations
docker compose exec backend npx prisma db push

# Seed demo data (optional, dev only)
docker compose exec backend npx tsx scripts/seed-demo.ts

# Create an admin user
docker compose exec backend npx tsx scripts/create-admin.ts
```

## Verify

- Public site: `https://groovethiopia.com` → should redirect HTTP to HTTPS
- Admin: `https://admin.groovethiopia.com` → login form
- Caddy auto-renews Let's Encrypt certs

## Backups

Postgres:

```bash
# Daily backup script
docker compose exec db pg_dump -U groovethiopia groovethiopia | gzip > /backups/groovethiopia-$(date +%Y%m%d).sql.gz

# Restore
gunzip < backup.sql.gz | docker compose exec -T db psql -U groovethiopia groovethiopia
```

R2 has versioning enabled by default — no extra backup needed.

## Updating

```bash
# On the server
cd /opt/groovethiopia
git pull
docker compose up -d --build
```

Or push to `main` if GitHub Actions is configured.

## Monitoring

- **Logs**: `docker compose logs -f`
- **Caddy**: `docker compose logs caddy`
- **Database**: `docker compose exec db psql -U groovethiopia groovethiopia`
- **Inngest**: https://app.inngest.com/

## Troubleshooting

**Build fails with "Cannot connect to database"**
- Make sure `db` service is up: `docker compose ps`
- Check `DATABASE_URL` matches in `apps/backend/.env` and `docker-compose.yml`

**TLS not provisioning**
- Verify DNS A records point to the server IP: `dig groovethiopia.com`
- Check Caddy logs: `docker compose logs caddy`
- Make sure ports 80 and 443 are open

**Images not loading**
- Verify R2 credentials in `apps/backend/.env`
- Check `R2_PUBLIC_URL` is set and the bucket has a public domain configured

**Stripe webhook failing**
- Webhook URL should be: `https://admin.groovethiopia.com/api/public/tickets/webhook`
- Copy the signing secret from Stripe dashboard to `STRIPE_WEBHOOK_SECRET`

**Resend emails not sending**
- Verify the `from` address domain is verified in Resend dashboard
- Check `RESEND_API_KEY` is valid

## Cost

Hetzner CX22: ~€4.50/month
Cloudflare R2: ~$0.015/GB/month
Neon (Postgres): free tier or $19/month for production
Resend: free tier (3K emails/month) or $20/month
Inngest: free tier or $20/month
Stripe: 2.9% + 30¢ per transaction

Total estimate for low traffic: **€5-10/month** + transaction fees.

## Going to scale

When traffic grows:
- Move Postgres to Neon (managed, scales automatically)
- Move R2 to S3 (or stay on R2, no difference)
- Add Cloudflare in front of Caddy for global CDN
- Use Hetzner Load Balancer for multiple backend instances
- Add Redis for sessions (instead of DB)
- Move Inngest to a dedicated worker

---

## Preview / Staging Environment

Want to see a change before it lands on `groovethiopia.com`? Spin up the staging profile. It runs alongside production on the same server, serving **`https://groovethiopia.livejamgames.com`** with its own database, env, and container names.

### Architecture

```
                         ┌──────────────────────────────┐
    groovethiopia.com    │       Hetzner VPS             │   staging host
       ──────────────►   │   ┌──────────┐  ┌────────┐    │ ─────────────►
                         │   │ frontend │  │ backend│    │   groovethiopia
    admin.<...>          │   │ :3000    │  │ :3001  │    │     .livejamgames
       ──────────────►   │   └────┬─────┘  └───┬────┘    │        .com
                         │        │             │         │
                         │   ┌────▼─────────────▼────┐    │
                         │   │   Caddy (single)      │    │
                         │   │   ┌─ prod vhost ─────┤    │
                         │   │   └─ staging vhost ─┤    │
                         │   └────────┬─────────────┘    │
                         │            │                  │
                         │   ┌────────▼────────┐         │
                         │   │ staging-frontend │         │
                         │   │ staging-backend  │         │
                         │   │ staging-mysql    │         │
                         │   └─────────────────┘         │
                         └──────────────────────────────┘
```

### One-time DNS setup

In your `livejamgames.com` DNS provider, add an A record:

```
groovethiopia.livejamgames.com    A    <HETZNER_IP>
```

Caddy will issue a Let's Encrypt certificate on first request.

### One-time environment setup (run on the server)

```bash
cd /opt/groovethiopia

# Seed env files from the templates (DO NOT commit the real files).
cp apps/backend/.env.staging.example apps/backend/.env.staging
cp apps/frontend/.env.staging.example apps/frontend/.env.staging
$EDITOR apps/backend/.env.staging       # fill in real AUTH_SECRET, R2, etc.
$EDITOR apps/frontend/.env.staging
```

Required changes from the example:
- `AUTH_SECRET` — generate with `openssl rand -base64 32`
- Same `DATABASE_URL` as the example (`mysql://root:staging@staging-mysql:3306/groovethiopia_staging`)
- Either real R2 staging bucket + keys, or leave empty to skip uploads

### Deploy staging

The GitHub Actions `deploy.yml` automatically deploys to staging every time `main` updates, mirroring the production flow:

```bash
# Manual control (run on the server)
bash scripts/deploy-staging.sh         # bring up the preview
bash scripts/deploy-staging.sh reseed  # rebuild the staging DB from scratch
bash scripts/deploy-staging.sh logs    # tail the logs
bash scripts/deploy-staging.sh down    # stop the preview (keeps the DB)
```

### Behavior

- **Same code, separate data**: staging uses the latest container image but a fresh MySQL database that you control.
- **Auto-deploy on `main`**: every merged PR that hits main also rebuilds the preview at `groovethiopia.livejamgames.com`.
- **No HSTS** on staging — keeps the preview recoverable if cert provisioning flubs.
- **`/robots.txt` returns `Disallow: /`** for any crawler that wanders in.
- **Independent secrets**: any secret (Stripe, Resend, Google OAuth, R2) loaded into staging can be a test/empty value without touching prod.

### Custom domain

If you ever want to point staging at a different host, edit the vhost block at the bottom of `Caddyfile` and the `NEXT_PUBLIC_*` URLs in `apps/{frontend,backend}/.env.staging`. No rebuild needed — Caddy picks up the new vhost on `docker compose --profile staging restart caddy`.
