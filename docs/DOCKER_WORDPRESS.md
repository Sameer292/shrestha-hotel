# Docker WordPress (local headless CMS)

One command local CMS — no hosting needed. Data lives in Docker volumes `db_data` / `wp_data`.

## Quick start

```bash
docker compose up -d
# wait ~15s for DB healthcheck, then:
bash scripts/wp-setup.sh http://localhost:8080
# or without script, open http://localhost:8080 and finish WP installer in browser
```

Then:

1. Open `http://localhost:8080/wp-admin` → login `admin / admin123` (change immediately in Users → Profile)
2. Settings → Permalinks → **Post Name** → Save (already done by script)
3. Follow `docs/WORDPRESS_SETUP.md:4` to create CPTs + ACF Options Pages (Hotel Settings / Homepage)

## Wire Next.js to it

`.env.local`:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3001
WORDPRESS_API_URL=http://localhost:8080/graphql
WORDPRESS_GRAPHQL_URL=http://localhost:8080/graphql
REVALIDATE_SECRET=dev-secret
```

```bash
bun run dev   # http://localhost:3001 — mock warnings disappear once GraphQL responds
```

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
