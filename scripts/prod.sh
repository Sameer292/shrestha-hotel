#!/usr/bin/env bash
set -euo pipefail
# scripts/prod.sh — run ON THE SERVER (HestiaCP): build + start the Next.js
# app container only. Panel owns nginx/MySQL/WordPress (see docs/DEPLOY_HESTIA.md).
# Re-run after every `git pull` to redeploy the frontend.
cd "$(dirname "$0")/.."

COMPOSE="docker compose -f docker-compose.hestia.yml --env-file .env.prod"

command -v docker >/dev/null || { echo "✗ docker not found"; exit 1; }
[ -f .env.prod ] || { echo "✗ .env.prod missing — copy .env.prod.example and fill secrets"; exit 1; }
if grep -q "generate-" .env.prod; then
	echo "✗ .env.prod still has placeholder secrets — fill them first"; exit 1
fi

echo "==> Building + starting app..."
$COMPOSE up -d --build

echo "==> Waiting for http://127.0.0.1:3200 ..."
ok=0
for _ in $(seq 1 60); do
	if curl -sf http://127.0.0.1:3200/ >/dev/null 2>&1; then ok=1; break; fi
	sleep 2
done
[ "$ok" = 1 ] || { echo "✗ app didn't answer — see: $COMPOSE logs app"; exit 1; }

echo "✓ live: https://shresthahotelhotspring.com (via Hestia nginx → 127.0.0.1:3200)"
$COMPOSE ps

echo "==> Revalidating pages (drop build-time fallback content)..."
# Pages are baked during `docker build`, when WordPress may be unreachable,
# so fresh deploys can briefly serve placeholder content. Revalidate every
# static route (mirrors sitemap.ts) so the first visitor gets live WP data.
# Non-fatal: time-based ISR still refreshes pages even if this step fails.
set -a
# shellcheck disable=SC1091
. ./.env.prod
set +a
SITE_URL="${SITE_URL:-https://shresthahotelhotspring.com}"
revalidate() { # $1 = path, empty = default set (/ + /stay + /experiences)
	if [ -z "${1:-}" ]; then
		curl -sf -X POST "$SITE_URL/api/revalidate" \
			-H "x-revalidate-secret: $REVALIDATE_SECRET" \
			-H "Content-Type: application/json" \
			-d '{}' >/dev/null
	else
		curl -sf -X POST "$SITE_URL/api/revalidate" \
			-H "x-revalidate-secret: $REVALIDATE_SECRET" \
			-H "Content-Type: application/json" \
			-d "{\"path\":\"$1\"}" >/dev/null
	fi
}
if ! revalidate ""; then
	echo "⚠ revalidate failed for default paths (ISR will refresh them shortly)"
fi
for p in /hot-spring /events /wellness /gallery /about /contact /booking; do
	if revalidate "$p"; then
		echo "  ✓ $p"
	else
		echo "  ⚠ $p not revalidated (ISR will refresh it shortly)"
	fi
done
