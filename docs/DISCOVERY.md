# Groovethiopia Trading PLC — Full Discovery Document

**Status:** Awaiting final sign-off
**Date:** 2026-06-24

---

## PART 1 — PUBLIC SITE

### Phase 1 — Brand Foundation

| # | Decision | Choice |
|---|---|---|
| Q1 | Core adjective | **Curated** |
| Q2 | Brand voice | **Warm-Luxury** (Soho House / Aman feel) |
| Q3 | Tagline / one-liner | **"Curating the New Horizon"** |
| Q4 | Manifesto page | **Integrated on About page only** (no standalone page) |
| Q5 | Founder's note | **No** — keep it faceless, brand-first |
| Q6 | Logo | **Draft / partial** — placeholder wordmark "GROOVETHIOPIA" in Söhne until real logo arrives |

### Phase 2 — Tech & Infrastructure

| # | Decision | Choice |
|---|---|---|
| Q7 | Tech stack | **Next.js / React** |
| Q8 | Languages | **English + Amharic + French + Spanish** (4 languages) |
| Q9 | Domain & hosting | Domain in hand. Full stack hosting on Hetzner (Yegar) |
| Q10 | Who edits | **Me + small team** (2–4 people). **Separate admin app** with role-based workflow |

### Phase 3 — Site Map (10 pages)

| Code | Page |
|---|---|
| A | Home |
| C | About Us |
| D | Divisions (hub) |
| E | Events / The Pulse |
| F | Trading / The Collection |
| G | Real Estate / The Sanctuary |
| H | Portfolio / Gallery |
| I | Partners |
| L | Contact / Inquire |
| M | Legal |

Dropped: Manifesto (standalone page), Careers, Press/Journal

### Phase 4 — Visual Identity

| # | Decision | Choice |
|---|---|---|
| Q12 | Color palette | **Deep black + warm gold** (Rolls-Royce / Tom Ford) |
| Q13 | Typography | **Modern geometric + mono accent** (Söhne + JetBrains Mono) |
| Q14 | Imagery | **Stock for v1**, swap real photos via admin panel |
| Q15 | References | **Piknic Électronik** for events, **Black Coffee** for homepage. "One venue, three experiences" flagship section |

### Phase 5 — Per-Page Content

#### Home (Q17) — 8 sections + footer social
1. Hero (one-liner)
2. Manifesto teaser
3. One venue, three experiences
4. Featured upcoming event
5. The Collection preview
6. The Sanctuary preview
7. Partners strip
8. Inquire CTA
+ Footer: social icons

#### About Us (Q18, Q31) — 7 sections
1. Hero
2. **Manifesto (full version)**
3. Mission
4. Vision
5. The Story
6. Values
7. Team (placeholder portraits)
+ CTA

#### Events / The Pulse (Q19) — 7 sections
1. Hero
2. Manifesto blurb
3. Featured: Shukshuta Speakeasy (**sub-event series** — multiple events under it)
4. Upcoming events grid (Piknic Électronik style)
5. Past events gallery
6. Services
7. CTA

#### Trading / The Collection (Q20) — 7 sections
1. Hero
2. Manifesto blurb
3. Featured vehicles
4. Full catalog grid (filterable: Modern Luxury / Vintage Classic)
   - Each car has **detail page**: full description, price, multiple photos, specs
5. Sourcing story
6. Services
7. CTA

#### Real Estate / The Sanctuary (Q21) — 8 sections
1. Hero
2. Vision statement
3. Featured upcoming project
4. Project pipeline (grid → detail pages)
5. Design philosophy
6. Investment thesis
7. **On-Demand / Bespoke Commissions**
8. CTA

#### Portfolio / Gallery (Q22) — 5 sections
1. Hero
2. Filter tabs (All / Events / Collection / Sanctuary)
3. Masonry grid (lightbox: **full image + slim caption strip**)
4. Featured project spotlight
5. CTA

#### Partners (Q23) — 5 sections
1. Hero
2. Strategic partners (logo grid)
3. Featured partner spotlight (**rotating via admin**)
4. Cultural & media partners
5. CTA

#### Contact / Inquire (Q24) — 6 sections
1. Hero
2. Intro paragraph
3. Three inquiry paths → **three cards open focused modal forms** (Events / Trading / Real Estate)
4. Contact details (HQ, email, phone, hours)
5. Map (embedded)
6. Social row

#### Divisions Hub (Q25) — 6 sections
1. Hero
2. The Pulse (Events card)
3. The Collection (Trading card)
4. The Sanctuary (Real Estate card) — **all three equal**
5. Interconnection note
6. CTA

#### Legal (Q26) — 3 sections
1. Privacy Policy
2. Terms of Service
3. Cookie Policy

### Phase 6 — Functionality

| # | Decision | Choice |
|---|---|---|
| Q27 | Features | **Event booking, Instagram embed, WhatsApp button, Live event indicator, Language switcher, Site-wide search** (no newsletter) |
| Q28 | Form routing | **DB + email + auto-tagged by division** |
| Q-AP-Auth | Public user auth | **Google OAuth required** for: inquiry submission, event reservation, ticket purchase, on-demand service. **Phone number required** for ticket purchase. Anonymous browsing allowed. |

### Phase 7 — Logistics

| # | Decision | Choice |
|---|---|---|
| Q29 | Timeline | **ASAP — ship when quality is right** |
| Q30 | Budget | **Mid-range agency feel** |

---

## PART 2 — ADMIN PANEL (admin.groovethiopia.com)

| # | Decision | Choice |
|---|---|---|
| Q-AP1 | URL | **Subdomain: admin.groovethiopia.com** |
| Q-AP2 | Admin authentication | **Email + password** + OTP for registration + password reset. **Admin approval required** for new registrations. |
| Q-AP3 | Roles | **Admin** (everything) + **Editor** (create drafts + submit for approval). External inquiries land in admin inbox. |
| Q-AP4 | Modules | **All 12:** Dashboard, Events, Vehicles, Real Estate, Gallery, Partners, Pages, Inquiries, Users, Media Library, Settings, Audit Log |
| Q-AP5 | File uploads | **R2 + auto image processing** (Sharp: thumbnails, WebP, blurhash) |
| Q-AP6 | Approval workflow | **Pending/Approved/Rejected + revision history with diffs** + comment thread |
| Q-AP7 | Email notifications | **Events 1–7 fire emails** (registration, approval, submissions, rejections, inquiries, password reset). No weekly summary. |
| Q-AP8 | Content scheduling | **Schedule + auto-unpublish** |
| Q-AP9 | Multi-language content | **Single content + Google Translate auto-fill** for AM/FR/ES. English primary. Fallback to English if blank. Glossary support for brand terms. |
| Q-AP10 | Real-time updates | **Admin bell with live notifications** |
| Q-AP11 | Draft auto-save | **Auto-save + session version history** |
| Q-AP12 | Backups | **Daily DB backups + off-site encrypted + 90-day retention + point-in-time recovery** |
| Q-AP13 | Anti-spam | **Honeypot + rate limiting + Google reCAPTCHA v3** (invisible) |
| Q-AP14 | First admin bootstrap | **CLI command** — most secure, no leakable signup URL |

---

## PART 3 — BACKEND & DB ARCHITECTURE

| # | Decision | Choice |
|---|---|---|
| Q-DB1 | Database | **PostgreSQL (managed via Neon)** — free tier, branching for preview deploys |
| Q-DB2 | ORM | **Prisma** — type-safe, auto-generated types, great migrations |
| Q-DB3 | Admin auth library | **Auth.js (NextAuth)** — battle-tested, integrates perfectly with Next.js + Prisma |
| Q-DB4 | Email service | **Resend** — React Email templates match black + gold brand |
| Q-DB5 | File storage | **Cloudflare R2** — S3-compatible, zero egress fees |
| Q-DB6 | Image processing | **Sharp on upload + Next.js Image** for runtime optimization |
| Q-DB7 | Background jobs | **Inngest** — scheduled + event-driven, free tier generous |
| Q-DB8 | Caching + CDN | **Vercel Edge Network** — ISR for instant admin → public updates |

### Hosting Architecture

| # | Decision | Choice |
|---|---|---|
| Q-DB9 | Deployment platform | **Self-hosted on Hetzner (Yegar)** — separate repos |
| Q-DB10 | Repo split | **Frontend repo** (public site) + **Backend repo** (admin + API). Both React + Next.js. |
| Q-DB11 | Deployment | **Docker + Docker Compose** on Hetzner |
| Q-DB12 | Reverse proxy + SSL | **Caddy** — auto HTTPS via Let's Encrypt |
| Q-DB13 | CI/CD | **GitHub Actions → SSH to Hetzner → docker pull + restart** |
| Q-DB14 | Error tracking | **Sentry** — free tier covers v1 |

---

## FINAL ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                       USERS / VISITORS                       │
│      (Anonymous browsers, Google OAuth for actions)         │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
   ┌────────────────────┐    ┌──────────────────────┐
   │   FRONTEND REPO    │    │    BACKEND REPO      │
   │   Next.js          │    │    Next.js           │
   │   (public site)    │    │    (admin + API)     │
   │   groovethiopia.com│    │ admin.groovethiopia.com│
   │                    │    │                      │
   │   - 10 pages       │    │   - 12 admin modules │
   │   - 4 languages    │    │   - REST API         │
   │   - Public auth    │    │   - Cron jobs        │
   └─────────┬──────────┘    └──────────┬───────────┘
             │                          │
             └──────────┬───────────────┘
                        │
              ┌─────────┴──────────┐
              ▼                    ▼
   ┌──────────────────┐  ┌──────────────────┐
   │  Cloudflare R2   │  │   Neon Postgres  │
   │  (images/files)  │  │   (database)     │
   └──────────────────┘  └──────────────────┘
              
              Supporting services:
              • Resend (emails)
              • Inngest (background jobs)
              • Sentry (error tracking)
              • Cloudflare R2 (storage)
              • Google Translate API
              • Google reCAPTCHA v3
              • Google OAuth
              
              Hosting:
              • Hetzner VPS (Yegar)
              • Docker + Docker Compose
              • Caddy (reverse proxy + SSL)
              • GitHub Actions (CI/CD)
```

---

## Build Sequence (planned)

1. **Foundation:** Set up Neon DB, R2 bucket, Inngest, Resend, Sentry, GitHub repos
2. **Backend repo:** Next.js API + Prisma schema + Auth.js + 12 admin modules
3. **Backend deploy:** Docker compose on Hetzner, Caddy SSL, GitHub Actions
4. **Frontend repo:** Next.js public site with all 10 pages + placeholders
5. **Frontend features:** 4-language routing, search, WhatsApp, IG, OAuth
6. **Wiring:** Frontend calls backend API, ISR revalidation on admin publishes
7. **Polish:** Motion, micro-interactions, image processing, backups, reCAPTCHA

---

## Pending Items (placeholder strategy)

Since user wants placeholders for v1:
- Logo: clean wordmark "GROOVETHIOPIA" in Söhne until real logo arrives
- Social platforms: Instagram, Telegram, TikTok, X (placeholder links)
- Domain: TBD — user has it, will provide exact string
- Sample content: I'll write warm-luxury placeholder copy throughout

---

**Next step:** User reviews + signs off → I begin build.