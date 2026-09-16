#!/usr/bin/env bash
set -euo pipefail
# seed-all-content.sh — Seeds the 8 page entries + all item CPT posts
# (rooms, experiences, testimonials, gallery items, FAQs). Idempotent:
# upserts by slug, wipes stale repeater meta from the old layout.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "==> Copying seed script (via shared wp-content volume)..."
docker compose -f "$PROJECT_DIR/docker-compose.yml" cp "$SCRIPT_DIR/seed-content.php" wordpress:/var/www/html/wp-content/seed-content.php

echo "==> Seeding..."
docker compose -f "$PROJECT_DIR/docker-compose.yml" run --rm wpcli --path=/var/www/html eval-file /var/www/html/wp-content/seed-content.php
docker compose -f "$PROJECT_DIR/docker-compose.yml" exec wordpress rm -f /var/www/html/wp-content/seed-content.php

echo "==> Flushing rewrites..."
docker compose -f "$PROJECT_DIR/docker-compose.yml" run --rm wpcli --path=/var/www/html rewrite flush --hard >/dev/null 2>&1 || true

echo ""
echo "Done! Check WP Admin → Home Content / Stay Page / … / Rooms / Experiences / Testimonials / Gallery Items / FAQs, then attach Featured images (or run seed-images.php for demo photos)."
