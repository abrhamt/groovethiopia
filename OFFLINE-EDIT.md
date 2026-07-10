# Groovethiopia Trading PLC — Monorepo

> Production-ready website + admin CMS for **Groovethiopia Trading PLC**
> Curating the New Horizon — Addis Ababa, Ethiopia

A bilingual (EN + AM/FR/ES auto-translated) marketing site with editor-driven CMS, ticket purchasing, and full admin panel.

---

## What's in this package

```
groovethiopia/
├── apps/
│   ├── frontend/          # Public marketing site (Next.js 15 · port 3000)
│   └── backend/           # Admin CMS panel + API (Next.js 15 · port 3001)
├── packages/
│   └── db/                # Shared Prisma schema + client
├── scripts/               # Seed, admin, staging helpers
├── docs/                  # Discovery + architecture docs
└── docker-compose.yml     # Prod + [staging] profile for the live preview
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 · React 19 · TypeScript · Tailwind |
| Backend | Next.js 15 (API routes) · NextAuth.js v5 |
| Database | PostgreSQL via Prisma ORM |
| Storage | Cloudflare R2 / S3 (or MinIO locally) |
| Email | Resend + React Email |
| Background jobs | Inngest |
| i18n | next-intl (4 languages) |
| Payments | Stripe (with simulated fallback) |
| Hosting | Docker + Caddy (Hetzner, self-hosted) |
| CI | GitHub Actions |

---

## Quick start (local development)

### Prerequisites
- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- PostgreSQL (or use the included docker-compose)
- Stripe account (optional — falls back to simulated mode)

### 1. Install dependencies
```bash
cd groovethiopia
pnpm install
```

### 2. Set up environment
```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
# Edit .env files with your values
```

Minimum required:
- `DATABASE_URL` — Postgres connection string
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `RESEND_API_KEY` — get from resend.com (optional)
- `STRIPE_SECRET_KEY` — get from dashboard.stripe.com (optional)

### 3. Initialize database
```bash
cd packages/db
pnpm exec prisma generate
pnpm exec prisma db push
```

### 4. Seed demo data
```bash
cd packages/db
DATABASE_URL=... npx tsx ../../scripts/seed-demo.ts
DATABASE_URL=... npx tsx ../../scripts/seed-analytics.ts
```

### 5. Create an admin user
```bash
cd apps/backend
DATABASE_URL=... pnpm exec tsx ../../scripts/create-admin.ts
```

### 6. Run dev servers
```bash
# Terminal 1 — backend
cd apps/backend && pnpm dev

# Terminal 2 — frontend
cd apps/frontend && pnpm dev
```

- Public site: http://localhost:3000
- Admin panel: http://localhost:3001
- Email previews: http://localhost:3001/api/preview/emails

 ---

## Preview / Staging

A staging environment runs alongside production on the same Hetzner VPS, serving **https://groovethiopia.livejamgames.com** with an isolated database and env.

```bash
# On the server, after one-time DNS + .env.staging setup
bash scripts/deploy-staging.sh         # bring up the preview
bash scripts/deploy-staging.sh reseed  # rebuild the staging DB
bash scripts/deploy-staging.sh logs    # tail logs
```

Every push to `main` automatically rebuilds both prod and the preview via GitHub Actions. Full setup, DNS instructions, and the architecture diagram live in [`docs/DEPLOY.md`](./docs/DEPLOY.md#preview--staging-environment).

---

## Production deployment

### Build
```bash
pnpm --filter @groovethiopia/backend build
pnpm --filter @groovethiopia/frontend build
```

### Docker (recommended for Hetzner)
```bash
docker compose up -d
```

The stack includes:
- `postgres` — database
- `minio` — S3-compatible storage (dev) / use R2 in prod
- `backend` — admin API
- `frontend` — public site
- `caddy` — reverse proxy with auto-TLS

### Environment variables (production)

Required:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (e.g. https://admin.groovethiopia.com)
- `NEXT_PUBLIC_FRONTEND_URL` (e.g. https://groovethiopia.com)
- `NEXT_PUBLIC_BACKEND_URL` (e.g. https://admin.groovethiopia.com)
- `RESEND_API_KEY`
- `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` / `R2_PUBLIC_URL`
- `SENTRY_DSN` (optional)

---

## 12 admin modules

1. **Dashboard** — overview, recent activity, weekly digest
2. **Pending Review** — moderation queue
3. **Events** — flagship events (Horizon Festival, etc.)
4. **Shukshuta Series** — recurring underground events
5. **Vehicles** — collector car marketplace
6. **Real Estate** — luxury property listings
7. **Gallery** — media library management
8. **Partners** — strategic/cultural/media partner directory
9. **Pages** — CMS pages (Home, About, etc.)
10. **Inquiries** — contact form submissions
11. **Users** — admin & editor accounts
12. **Media Library** — R2/S3 upload manager
13. **Analytics** — time-series, top content, funnel
14. **Settings** — site configuration
15. **Audit Log** — all admin actions

---

## 4-language support

- **English (en)** — primary, hand-written
- **Amharic (am)** — auto-translated
- **French (fr)** — auto-translated
- **Spanish (es)** — auto-translated

Translation flow:
1. Editor creates content in EN
2. Clicks "Translate" → server calls Google Translate API
3. Other locales stored as separate Content rows (linked by `contentGroupId`)
4. UI lets editor edit machine translations, mark as human-reviewed

Configuration in `packages/db/src/i18n.ts` and `app/api/admin/translate/route.ts`.

---

## Built features (this session)

| # | Feature | Status |
|---|---------|--------|
| 1 | Booking flow UI (events → Google sign-in → reserve) | ✅ |
| 2 | Email templates designer (9 React Email templates) | ✅ |
| 3 | Admin bulk actions (7 actions, multi-select) | ✅ |
| 4 | Demo content (team, partners, events, vehicles) | ✅ |
| 5 | Stripe integration for ticket purchasing | ✅ |
| 6 | Weekly email digests (Inngest cron) | ✅ |
| 7 | Analytics dashboard (time-series, funnel, top content) | ✅ |

---

## Project structure

### Backend (`apps/backend`)
```
src/
├── app/
│   ├── (admin)/             # Admin panel pages
│   │   ├── dashboard/
│   │   ├── analytics/
│   │   ├── review/
│   │   ├── events/
│   │   ├── shukshuta/
│   │   ├── vehicles/
│   │   ├── real-estate/
│   │   ├── gallery/
│   │   ├── partners/
│   │   ├── pages/
│   │   ├── inquiries/
│   │   ├── users/
│   │   ├── media/
│   │   ├── settings/
│   │   └── audit/
│   ├── api/
│   │   ├── auth/            # NextAuth routes
│   │   ├── admin/           # Admin-only API (content, users, analytics, etc.)
│   │   ├── public/          # Public API (content, tickets, team, etc.)
│   │   ├── upload/          # Media upload to R2
│   │   ├── inngest/         # Inngest webhook
│   │   └── preview/         # Email + page previews
│   ├── login/
│   └── register/
├── components/
│   ├── admin/               # Admin-specific components
│   └── auth/                # Auth forms
├── emails/                  # React Email templates (9)
├── inngest/                 # Background functions (7)
└── lib/                     # Shared utilities
```

### Frontend (`apps/frontend`)
```
src/
├── app/
│   └── [locale]/            # Locale-prefixed routes
│       ├── page.tsx         # Home
│       ├── about/
│       ├── events/
│       │   ├── page.tsx     # Events index
│       │   └── [slug]/      # Event detail
│       ├── shukshuta/
│       ├── collection/      # Vehicles
│       ├── gallery/
│       ├── partners/
│       ├── contact/
│       ├── tickets/
│       │   └── success/     # Stripe success page
│       └── ...
├── components/
│   ├── booking/             # Booking modal + Google auth
│   ├── events/              # Event cards, hero, etc.
│   ├── about/               # About page (with TeamGrid)
│   ├── auth/                # Google OAuth
│   └── ...
├── lib/                     # API client, utils
└── i18n/                    # Translations
```

---

## Scripts

- `scripts/seed-demo.ts` — Seeds 4 events, 6 vehicles, 3 projects, 8 team, 12 partners
- `scripts/seed-analytics.ts` — Seeds 30 days of sample analytics data
- `scripts/create-admin.ts` — Creates an admin user
- `scripts/preview.js` — Captures preview screenshots
- `scripts/preview-admin.js` — Captures admin panel screenshots

---

## Useful URLs (development)

- **Homepage**: http://localhost:3000
- **Events**: http://localhost:3000/events
- **Event detail**: http://localhost:3000/events/horizon-festival-2026
- **Admin login**: http://localhost:3001/login
- **Admin dashboard**: http://localhost:3001/dashboard
- **Analytics**: http://localhost:3001/analytics
- **Email previews**: http://localhost:3001/api/preview/emails

---

## Brand

- **Colors**: deep black (#0a0a0a) + warm gold (#d49520) + amber highlights
- **Typography**: Söhne (sans) · JetBrains Mono (mono) · Cormorant Garamond (serif/headings)
- **Tone**: Curated. Warm. Restraint as luxury. "Curating the New Horizon."

---

## License

Proprietary — © Groovethiopia Trading PLC. All rights reserved.

---

## Contact

- **Email**: hello@groovethiopia.com
- **Domain**: https://groovethiopia.com
- **Admin**: https://admin.groovethiopia.com

---

## More documentation

- **[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)** — System architecture, data flow, auth, security
- **[`docs/DEPLOY.md`](./docs/DEPLOY.md)** — Hetzner deployment guide with Docker
- **[`docs/DISCOVERY.md`](./docs/DISCOVERY.md)** — Original discovery document with all decisions

---
## Live preview (GitHub Pages)

Static GitHub Pages preview has been retired. The full dynamic site requires the full Next.js stack to be deployed (see DEPLOY.md).
