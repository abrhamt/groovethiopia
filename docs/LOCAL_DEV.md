# Local Development

## Quick start

```bash
# 1. Install
pnpm install

# 2. Set up env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
# Edit both files (minimum: DATABASE_URL + AUTH_SECRET)

# 3. Generate Prisma client + run migrations on your dev DB
pnpm --filter @groovethiopia/db generate
pnpm --filter @groovethiopia/db migrate

# 4. Seed initial data
pnpm --filter @groovethiopia/db seed

# 5. Create your admin user
ADMIN_EMAIL="you@example.com" \
ADMIN_PASSWORD="YourSecurePassword!" \
pnpm tsx scripts/create-admin.ts

# 6. Start both apps
pnpm dev
```

Frontend → http://localhost:3000
Backend (admin) → http://localhost:3001

## Dev shortcuts

```bash
# Backend only
pnpm --filter @groovethiopia/backend dev

# Frontend only
pnpm --filter @groovethiopia/frontend dev

# Prisma Studio (visual DB editor)
pnpm --filter @groovethiopia/db studio

# Build for production
pnpm build

# Typecheck
pnpm typecheck
```

## Min dev requirements (works without all services)

If you just want to see the public site running without full backend:

- Frontend works with mock data (uses sample placeholders)
- Skip R2, Resend, Inngest, etc. — they're optional in dev
- **Only required**: DATABASE_URL (can use local Postgres)

## Test Google OAuth locally

1. Google Cloud Console → OAuth Client
2. Authorized JavaScript origins: `http://localhost:3000`
3. Authorized redirect URIs: `http://localhost:3000`
4. Copy Client ID to `apps/frontend/.env` as `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
5. Same Client ID + Secret to `apps/backend/.env`

## Useful tools

- `pnpm db:studio` — open Prisma Studio (http://localhost:5555)
- Admin bell polls every 30s — submits show up live
- All inquiries go to `/admin/inquiries`
- All form submissions appear in `/admin/review` for approval