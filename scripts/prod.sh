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

echo "✓ live: https://shresthahotel.hashtagweb.com.np (via Hestia nginx → 127.0.0.1:3200)"
$COMPOSE ps
