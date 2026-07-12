# Multi-stage Dockerfile for backend
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# --- Dependencies stage ---
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/db/package.json ./packages/db/
RUN pnpm install --frozen-lockfile

# --- Build stage ---
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @groovethiopia/db generate
RUN pnpm --filter @groovethiopia/backend build

# --- Production stage ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=build /app/apps/backend/public ./public
COPY --from=build --chown=nextjs:nodejs /app/apps/backend/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/backend/.next/static ./.next/static

USER nextjs
EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]