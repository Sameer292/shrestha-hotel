#!/usr/bin/env bash
set -euo pipefail
# ponytail: minimal WPGraphQL bootstrap — idempotent, rerun safely
WP_URL="http://localhost:8080"
if [ -n "${1:-}" ]; then WP_URL="$1"; fi

echo "==> Waiting for WordPress at $WP_URL ..."
until curl -sf "$WP_URL/wp-admin/install.php" >/dev/null 2>&1 || curl -sf "$WP_URL/wp-login.php" >/dev/null 2>&1; do sleep 2; done
echo "WordPress is up."

# core install if not installed
if ! docker compose run --rm --user 33:33 wpcli --path=/var/www/html core is-installed 2>/dev/null; then
  echo "==> Installing WordPress core..."
  docker compose run --rm --user 33:33 wpcli --path=/var/www/html core install \
    --url="$WP_URL" \
    --title="Shrestha Hotel Hotspring CMS" \
    --admin_user=admin \
    --admin_password=admin123 \
    --admin_email=admin@shresthahotel.local
  echo "Admin: admin / admin123"
else
  echo "WordPress already installed."
fi

echo "==> Installing plugins..."
docker compose run --rm --user 33:33 wpcli --path=/var/www/html plugin install wp-graphql --activate || true
docker compose run --rm --user 33:33 wpcli --path=/var/www/html plugin install https://github.com/wp-graphql/wp-graphql-acf/archive/refs/heads/master.zip --activate || true
# ACF Pro is paid — install free ACF if Pro not present
docker compose run --rm --user 33:33 wpcli --path=/var/www/html plugin is-installed advanced-custom-fields || \
  docker compose run --rm --user 33:33 wpcli --path=/var/www/html plugin install advanced-custom-fields --activate || true

echo "==> Installing mu-plugins (CPTs + ACF loader)..."
docker compose exec wordpress mkdir -p /var/www/html/wp-content/mu-plugins
docker compose cp scripts/mu-plugins/. wordpress:/var/www/html/wp-content/mu-plugins/
docker compose exec wordpress mkdir -p /var/www/html/wp-content/themes/twentytwentyfive/acf-json
docker compose cp scripts/acf-json/. wordpress:/var/www/html/wp-content/themes/twentytwentyfive/acf-json/
docker compose restart wordpress
echo "  waiting for WP to come back..."
until curl -sf "$WP_URL/wp-admin/install.php" >/dev/null 2>&1 || curl -sf "$WP_URL/wp-login.php" >/dev/null 2>&1; do sleep 2; done

echo "==> Permalinks → postname, rewrite flush..."
docker compose run --rm --user 33:33 wpcli --path=/var/www/html rewrite structure '/%postname%/' --hard || true
docker compose run --rm --user 33:33 wpcli --path=/var/www/html rewrite flush --hard || true
docker compose exec wordpress a2enmod rewrite >/dev/null 2>&1 || true

echo "==> Done."
echo "WP Admin:   $WP_URL/wp-admin  (admin / admin123)"
echo "GraphQL:    $WP_URL/graphql"
echo "Next env:   WORDPRESS_API_URL=$WP_URL/graphql"
