# Docker WordPress (local headless CMS)

One command local CMS — no hosting needed. Data lives in Docker volumes `db_data` / `wp_data`.
WordPress is **content-admin only**: visitors never see it, Next.js renders everything.

## Quick start (fresh machine)

```bash
bash scripts/dev.sh   # docker (db + WP + proxy) then Next.js; bootstraps WP on first run
# --- everything below happens automatically; manual equivalents follow ---
docker compose up -d
bash scripts/wp-setup.sh http://cms.shrestha.localhost:8081   # core + plugins + CPTs + ACF JSON
bash scripts/seed-all-content.sh  # Home Content + 7 page CPTs (rooms, experiences, photos, testimonials, FAQs, meals nested inside)
# featured images (one WP-CLI run, idempotent):
docker compose cp scripts/seed-images.php wordpress:/var/www/html/seed-images.php
docker compose run --rm wpcli --path=/var/www/html eval-file seed-images.php
docker compose exec wordpress rm -f /var/www/html/seed-images.php
```

## Single-port dev (mirrors prod)

Caddy (`proxy` service) serves everything on **:8081**, one hostname split by path:

| URL | Goes to |
|---|---|
| `http://shrestha.localhost:8081/…` | Next.js dev (`bun dev` on host :3000) |
| `http://shrestha.localhost:8081/wp-admin` | WordPress admin |
| `http://shrestha.localhost:8081/graphql` | GraphQL API |

Same on LAN by IP: `http://<lan-ip>:8081` and `http://<lan-ip>:8081/wp-admin`
(`scripts/dev.sh` prints your IP). No per-device setup.

One-time host setup + restart dev (reads `.env.local`, `next.config.ts`):

```bash
echo "127.0.0.1 shrestha.localhost" | sudo tee -a /etc/hosts
bun dev   # restart so new env + allowedDevOrigins apply
```

`WORDPRESS_API_URL` already points at the proxy address. `WP_HOME`/`WP_SITEURL`
are set dynamically in `scripts/mu-plugins/shrestha-settings.php` — they follow
the request host (whitelisted), so LAN IPs work with zero per-device setup.
Direct access still works too: app `http://localhost:3000`, WP `http://localhost:8080`.

## Staff workflow

Content team: WP Admin → **Rooms / Experiences / Testimonials / Gallery Items / FAQs**
to edit entries, **Hotel Content** page for site-wide text (hero, contact, footer…).
On every save, WordPress pings Next.js (`/api/revalidate`) — pages refresh within ~a minute, no deploy.

Test GraphQL without Next:

```bash
curl -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ generalSettings { title } }"}'
```

## Scripts

```bash
bash scripts/wp-setup.sh              # idempotent: installs core + WPGraphQL + WPGraphQL for ACF + ACF free + permalinks
docker compose run --rm wpcli --path=/var/www/html plugin list
docker compose run --rm wpcli --path=/var/www/html plugin install <slug> --activate
docker compose logs -f wordpress
docker compose logs -f db
```

## Volumes & reset

Data persists in `db_data` / `wp_data`.

Hard reset (deletes all WP content):

```bash
docker compose down -v
docker compose up -d
bash scripts/wp-setup.sh
```

Stop without deleting:

```bash
docker compose down
docker compose up -d
```

## Production

Replace local URL with `https://cms.shresthahotel.com/graphql` in hosting env (Vercel → Environment Variables). Keep `REVALIDATE_SECRET` identical in WP env and Next env. The Docker setup is **dev only** — production WP should be on managed hosting with backups.
