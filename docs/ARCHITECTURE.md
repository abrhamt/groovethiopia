# Groovethiopia — Architecture

Production-ready monorepo for the **Groovethiopia Trading PLC** website + admin CMS.

## High-level overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Cloudflare (DNS + CDN)                 │
│                    groovethiopia.com                         │
│                    admin.groovethiopia.com                  │
└────────────┬──────────────────────────────────┬─────────────┘
             │                                  │
             ▼                                  ▼
    ┌─────────────────┐                ┌─────────────────┐
    │   Caddy proxy   │                │   Caddy proxy   │
    │  (TLS + HTTP/2) │                │  (TLS + HTTP/2) │
    └────────┬────────┘                └────────┬────────┘
             │                                  │
             ▼                                  ▼
    ┌─────────────────┐                ┌─────────────────┐
    │  Next.js 15     │                │  Next.js 15     │
    │  Frontend       │                │  Backend        │
    │  Port 3000      │                │  Port 3001      │
    │                 │                │                 │
    │  Public site    │                │  Admin panel    │
    │  4 languages    │                │  REST API       │
    │  SSR + ISR      │                │  Auth.js        │
    └────────┬────────┘                └────────┬────────┘
             │                                  │
             │           ┌──────────────────────┤
             │           │                      │
             ▼           ▼                      ▼
      ┌──────────┐  ┌──────────┐         ┌──────────┐
      │ Postgres │  │ Inngest  │         │  R2/S3   │
      │  (Neon)  │  │ (cron +  │         │  media   │
      │          │  │  events) │         │ storage  │
      └──────────┘  └──────────┘         └──────────┘
                          │
                          ▼
                   ┌──────────┐
                   │  Resend  │
                   │  email   │
                   └──────────┘
                          │
                          ▼
                   ┌──────────┐
                   │  Stripe  │
                   │ payments │
                   └──────────┘
```

## Monorepo layout

```
groovethiopia/
├── apps/
│   ├── frontend/          # Public marketing site (Next.js)
│   └── backend/           # Admin panel + API (Next.js)
├── packages/
│   └── db/                # Shared Prisma schema + client
├── scripts/               # Seed, admin setup
├── docs/                  # You are here
├── docker-compose.yml     # Local full-stack
├── Caddyfile              # Reverse proxy config
├── .github/workflows/     # CI/CD
│   └── deploy.yml         # Hetzner Docker deploy
└── OFFLINE-EDIT.md        # Local dev guide
```

## Database schema (Prisma)

18 models:

| Model | Purpose |
|---|---|
| `User` | Admin/editor accounts (Auth.js) |
| `Session` | Auth.js sessions |
| `OtpCode` | Email verification codes |
| `PublicUser` | Google OAuth users (public site) |
| `Content` | Polymorphic content (events, vehicles, real estate, etc.) |
| `ShukshutaSubEvent` | Sub-events of Shukshuta series |
| `ApprovalAction` | Submission/approval audit trail |
| `Revision` | Content edit history |
| `Media` | R2/S3 media library |
| `Partner` | Strategic/cultural/media partners |
| `Inquiry` | Contact form submissions |
| `EventBooking` | Free/comp event reservations |
| `TicketPurchase` | Paid ticket purchases (Stripe) |
| `OnDemandRequest` | On-demand content requests |
| `Setting` | Site configuration |
| `AuditLog` | Admin actions |
| `TeamMember` | About page team |
| `GlossaryTerm` | i18n glossary for protected terms |

## Authentication

Two parallel auth systems:

1. **Admin auth** (email + password + OTP)
   - Used for `/login` (admin panel)
   - Hashes with bcrypt
   - Sessions via NextAuth.js
   - Roles: `ADMIN`, `EDITOR`
   - OTP for password reset / email change

2. **Public user auth** (Google OAuth)
   - Used for booking + ticket flow on the public site
   - Creates `PublicUser` records
   - No password — Google-only
   - Demo mode: `demo-user-{timestamp}` for sandbox testing

## API design

REST conventions:

- `GET /api/public/*` — public read-only, rate-limited (200 req/min)
- `POST /api/public/*` — public write, rate-limited (20 req/min), reCAPTCHA
- `GET /api/admin/*` — admin only (auth required)
- `POST /api/admin/*` — admin only, audit-logged
- `/api/inngest` — Inngest webhook
- `/api/preview/*` — development preview (no auth in dev)

All admin endpoints check `session?.user.role === "ADMIN"`.

## Background jobs (Inngest)

Scheduled:
- `auto-publish-scheduled` — every minute, publishes content where `scheduledFor <= now`
- `auto-unpublish-expired` — every 5 minutes, archives expired content
- `auto-end-events` — every 15 minutes, marks past events as ENDED
- `weekly-digest` — Mondays 9 AM UTC, emails admins the weekly summary

Event-driven:
- `on-submission` — sends admin notification when content submitted
- `on-user-registered` — notifies admins of new admin request
- `on-inquiry` — notifies admins of contact form submission

## Email (Resend + React Email)

9 React Email templates in `apps/backend/src/emails/`:

1. `otp.tsx` — Registration + password reset codes
2. `inquiry.tsx` — Admin notification of new inquiry
3. `approval.tsx` — Submitted, approved, rejected
4. `booking.tsx` — Event booking confirmation
5. `user.tsx` — New admin request + admin approved
6. `weekly-digest.tsx` — Weekly summary email

Preview all templates at `http://localhost:3001/api/preview/emails`.

## Payment flow (Stripe)

Two paths per event:
- **Free / comp** → `EventBooking` (just reserves a spot)
- **Paid (ticketPrice > 0)** → `TicketPurchase` via Stripe Checkout

Fallback to **simulated mode** when `STRIPE_SECRET_KEY` is empty (sandbox/dev):
- Returns a fake `sim_{timestamp}` reference
- Creates a real `TicketPurchase` record anyway
- No real money moves

Webhook handler at `POST /api/public/tickets/webhook` verifies signature and creates the purchase record on `checkout.session.completed`.

## Multi-language

Stack: `next-intl` with 4 locales: `en` (primary), `am`, `fr`, `es`.

Translation flow:
1. Editor creates content in EN
2. Clicks "Translate" button in admin
3. Backend calls Google Translate API
4. Other locales stored as separate `Content` rows with same `contentGroupId`
5. Editor can edit machine translations and mark human-reviewed

URL structure: `/{locale}/...` (default locale `en` is at root).

Glossary preserves terms like **Shukshuta**, **Horizon**, **Sanctuary** across all languages.

## Security

- **CORS** — only allows requests from `groovethiopia.com`, `admin.groovethiopia.com`, `localhost:3000/3001`
- **Rate limiting** — 20 POSTs/min and 200 GETs/min per IP for public endpoints (in-memory, resets every minute)
- **Security headers** — `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `HSTS` in production
- **CSP** — Content Security Policy allows Stripe.js, Google Fonts; blocks everything else
- **reCAPTCHA** — required on contact, inquiry, and ticket forms
- **bcrypt** — passwords hashed
- **OTP** — email-based verification, 10-min expiry, single-use
- **Stripe webhook** — verifies `stripe-signature` header
- **Audit log** — every admin action logged with user, action, entity, IP

## Performance

- **Image optimization** — Next.js Image with `next/image`, supports Unsplash + R2 + Cloudflare
- **Static generation** — Pages with `generateStaticParams` are SSG
- **Code splitting** — automatic with Next.js
- **Standalone output** — `output: "standalone"` for minimal Docker images
- **Cached Prisma client** — singleton pattern, reuses across HMR

## Observability

- **Sentry** — error tracking (optional, requires `SENTRY_DSN`)
- **Audit log** — admin actions in DB
- **Inngest** — function execution history + retries
- **Resend logs** — email send history
- **Stripe dashboard** — payment history

## Deployment

See [DEPLOY.md](./DEPLOY.md) for Hetzner deployment guide.

GitHub Pages preview has been retired — see [DEPLOY.md](./DEPLOY.md) for the only deployment target (Hetzner).
