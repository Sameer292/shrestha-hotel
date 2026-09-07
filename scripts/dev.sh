#!/usr/bin/env bash
set -euo pipefail
# scripts/dev.sh — one command local dev.
#   Boots Docker (MariaDB + WordPress + Caddy on :8081), then runs Next.js.
#   App: http://shrestha.localhost:8081 | CMS: http://cms.shrestha.localhost:8081/wp-admin
#   Flags: --infra-only (start Docker, skip `bun dev`)
cd "$(dirname "$0")/.."

INFRA_ONLY=0
[ "${1:-}" = "--infra-only" ] && INFRA_ONLY=1

command -v docker >/dev/null || { echo "✗ docker not found — install it first"; exit 1; }
command -v bun >/dev/null || { echo "✗ bun not found — install it first"; exit 1; }

if ! getent hosts shrestha.localhost >/dev/null 2>&1; then
	echo "⚠ shrestha.localhost doesn't resolve — run once:"
	echo '  echo "127.0.0.1 shrestha.localhost" | sudo tee -a /etc/hosts'
fi

[ -f .env.local ] || { cp .env.example .env.local; echo "✓ created .env.local from example"; }
[ -d node_modules ] || { echo "==> bun install..."; bun install; }

echo "==> Starting Docker (db, wordpress, proxy)..."
docker compose up -d db wordpress proxy

echo "==> Waiting for GraphQL..."
ok=0
for _ in $(seq 1 90); do
	if curl -sf -X POST http://localhost:8080/graphql -H "Content-Type: application/json" \
		-d '{"query":"{ generalSettings { title } }"}' >/dev/null 2>&1; then ok=1; break; fi
	sleep 2
done
[ "$ok" = 1 ] || { echo "✗ WordPress didn't come up — see: docker compose logs wordpress"; exit 1; }
echo "✓ GraphQL is up"

if ! docker compose run --rm --user 33:33 wpcli --path=/var/www/html core is-installed >/dev/null 2>&1; then
	echo "==> First run — bootstrapping WordPress (core + plugins + CPTs)..."
	bash scripts/wp-setup.sh http://localhost:8080
	echo "   Then seed demo content once: bash scripts/migrate-content.sh && bash scripts/set-room-meta.sh && bash scripts/set-all-meta.sh"
fi

LAN_IP=$(ip -4 route get 1.1.1.1 2>/dev/null | grep -oE "src [0-9.]+" | cut -d" " -f2)
echo ""
echo "  App: http://shrestha.localhost:8081  (direct: http://localhost:3000)"
echo "  CMS: http://shrestha.localhost:8081/wp-admin  (admin / admin123 — change it)"
[ -n "${LAN_IP:-}" ] && echo "  Other devices on this Wi-Fi: http://$LAN_IP:8081 and http://$LAN_IP:8081/wp-admin"
echo ""

[ "$INFRA_ONLY" = 1 ] && exit 0
exec bun dev
