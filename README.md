# Groovethiopia Trading PLC

> **Curating the New Horizon.**

A premium online presence for Groovethiopia — a curated ecosystem of culture, trade, and living.

---

## Repo Structure

This is a **monorepo** containing two Next.js applications:

```
groovethiopia/
├── apps/
│   ├── backend/      # Admin panel + REST API  (admin.groovethiopia.com)
│   └── frontend/     # Public marketing site     (groovethiopia.com)
├── packages/
│   └── db/           # Shared Prisma schema + generated client
├── docker-compose.yml
├── Caddyfile
└── .github/workflows/   # CI/CD
```

| App | URL | Purpose |
|---|---|---|
| **Frontend** | `groovethiopia.com` | 10 marketing pages, 4 languages, public forms |
| **Backend** | `admin.groovethiopia.com` | Admin panel (12 modules) + REST API for frontend |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS + custom design tokens |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Admin auth | Auth.js (NextAuth v5) |
| Public auth | Google OAuth |
| Storage | Cloudflare R2 (S3-compatible) |
| Image processing | Sharp (on upload) |
| Email | Resend |
| Background jobs | Inngest |
| Error tracking | Sentry |
| Hosting | Hetzner (Yegar) via Docker |
| Reverse proxy + SSL | Caddy |
| CI/CD | GitHub Actions |
| Translations | Google Translate API + manual override |
| Anti-spam | Google reCAPTCHA v3 |

---

## Brand

- **Personality:** Curated
- **Voice:** Warm-Luxury (Soho House / Aman)
- **Tagline:** Curating the New Horizon
- **Colors:** Deep black + warm gold
- **Type:** Söhne (sans) + JetBrains Mono (mono accent)

---

## Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
# Edit both .env files with your local/dev credentials

# 3. Run database migrations
pnpm --filter @groovethiopia/db migrate

# 4. Start dev servers
pnpm dev
```

Frontend → http://localhost:3000
Backend → http://localhost:3001

---

## Deployment

Push to `main` → GitHub Actions builds images → pushes to GitHub Container Registry → SSHes into Hetzner → pulls + restarts containers. Caddy handles SSL automatically.

See `docs/DEPLOYMENT.md` for the full deployment runbook.

---

## License

Proprietary — © 2026 Groovethiopia Trading PLC. All rights reserved.