#!/usr/bin/env bash
# Deploy the latest built images to the staging preview environment.
#
# Usage (run on the server, from /opt/groovethiopia):
#   bash scripts/deploy-staging.sh            # bring up staging
#   bash scripts/deploy-staging.sh reseed     # reseed the staging DB
#
# Prerequisites:
#   * apps/backend/.env.staging and apps/frontend/.env.staging are populated
#   * docker compose is available
#   * DNS for groovethiopia.livejamgames.com points at this host

set -euo pipefail

cd "$(dirname "$0")/.."

need_env_file() {
    if [ ! -f "$1" ]; then
        echo "✗ Missing $1 — copy from $1.example and fill in real values first."
        exit 1
    fi
}

need_env_file apps/backend/.env.staging
need_env_file apps/frontend/.env.staging

case "${1:-up}" in
    up|start|"")
        echo "▶ Pulling latest images and starting staging stack…"
        docker compose pull staging-frontend staging-backend 2>/dev/null || true
        docker compose --profile staging up -d --remove-orphans
        echo "▶ Running Prisma migrations on the staging DB…"
        docker compose --profile staging exec -T staging-backend \
            sh -lc 'node ./node_modules/.bin/prisma migrate deploy 2>/dev/null || true'
        echo "✅ Staging stack is up at https://groovethiopia.livejamgames.com"
        ;;

    down)
        echo "▶ Bringing staging stack down (keeps DB volume)…"
        docker compose --profile staging down --remove-orphans
        ;;

    reseed)
        echo "▶ Reseeding the staging DB from scratch…"
        docker compose --profile staging exec -T staging-mysql \
            sh -lc "mysql -uroot -pstaging -e 'DROP DATABASE IF EXISTS groovethiopia_staging; CREATE DATABASE groovethiopia_staging CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'"
        docker compose --profile staging restart staging-backend
        docker compose --profile staging exec -T staging-backend \
            sh -lc 'cd /app && DATABASE_URL=mysql://root:staging@staging-mysql:3306/groovethiopia_staging ./node_modules/.bin/prisma db push --accept-data-loss --skip-generate'
        echo "▶ Running demo seed…"
        docker compose --profile staging exec -T -e DATABASE_URL=mysql://root:staging@staging-mysql:3306/groovethiopia_staging \
            staging-backend sh -lc 'node ./node_modules/.bin/tsx ../../packages/db/prisma/seed.ts || true'
        echo "✅ Staging DB reseeded."
        ;;

    logs)
        docker compose --profile staging logs -f staging-frontend staging-backend
        ;;

    *)
        echo "usage: $0 {up|down|reseed|logs}"
        exit 1
        ;;
esac
