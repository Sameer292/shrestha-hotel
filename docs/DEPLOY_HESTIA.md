# Deploy on HestiaCP (nginx + panel MySQL + Docker app)

Dev (`docker-compose.yml`: WP + Caddy + MariaDB in Docker, Next on host) and
prod below are intentionally separate files — dev never touches prod data.

Prod shape: one domain, WordPress in the docroot, Docker runs **only Next.js**.
nginx sends just the `/wp-*` paths to PHP; everything else goes to Node:

```
visitor ──https──▶ Hestia nginx (www.shresthahotel.com)
                      ├── /wp-admin, /graphql, /wp-content, /wp-includes,
                      │    /wp-json, /wp-login.php, /wp-cron.php ──▶ Apache/PHP
                      └── everything else ──▶ 127.0.0.1:3000 (Docker: app)
app ──server-side fetch──▶ https://www.shresthahotel.com/graphql
WP save ──revalidate ping──▶ http://127.0.0.1:3000/api/revalidate
```

Rule: never add app routes under `/wp-*`. `xmlrpc.php` is blocked outright.

## 1. Panel setup (Hestia UI)

1. One **Web Domain**: `www.shresthahotel.com` (default templates for now).
2. Enable **SSL + Let's Encrypt + Force HTTPS** on it.
3. **DB**: Add Database (MySQL) for WP. Save credentials.

## 2. WordPress in the docroot (`public_html/`)

1. Install WP straight into `public_html/` (Quick Install or manual with
   the panel DB). Nothing else lives there — Node serves the site, not files.
2. `wp-config.php`, above `/* That's all, stop editing */`:
   ```php
   define('WP_HOME', 'https://www.shresthahotel.com');
   define('WP_SITEURL', 'https://www.shresthahotel.com');
   define('NEXT_APP_URL', 'http://127.0.0.1:3000');
   define('REVALIDATE_SECRET', '<same-value-as-app-env>');
   ```
3. Admin: **Settings → Permalinks → Post name**.
4. Plugins: **WPGraphQL**, **Advanced Custom Fields** (free),
   **WPGraphQL for ACF** (upload master zip from GitHub). Activate all.
5. Copy repo files in (SSH/File Manager):
   `scripts/mu-plugins/*` → `wp-content/mu-plugins/`
   `scripts/acf-json/*` → `wp-content/sh-acf-json/`
6. Enter content: Rooms/Experiences/Testimonials/Gallery/FAQs + the
   **Hotel Content** page, with featured images.
7. Mail: the contact/booking forms POST to Next (`/api/contact`,
   `/api/booking`), which forward to WP (`sh/v1/inquiry`). WP stores each as
   a private **Inquiries** entry (always checkable in wp-admin) and emails it
   via `wp_mail` (Hestia Exim). Verify deliverability once with
   https://www.mail-tester.com — if mail lands in spam, add the SPF/DKIM
   records Hestia generates (panel: Mail/Email deliverability) and consider
   an SMTP plugin as fallback.

## 3. Next.js proxy template (with `/cms/` passthrough)

```bash
sudo cp deploy/hestia/nextjs.tpl deploy/hestia/nextjs.stpl \
  /usr/local/hestia/data/templates/web/nginx/
# panel: Web > Edit www.shresthahotel.com > Proxy Template = nextjs > Save
# verify: sudo nginx -t && sudo systemctl reload nginx
```

The template proxies `/` to Node but serves `/cms/` from Hestia's
Apache/PHP backend (assumes the default **nginx + Apache2** stack — if your
Hestia runs nginx + PHP-FPM only, the `/cms/` block needs a fastcgi variant;
ask and I'll adapt it). `client_max_body_size 64m` is included for media uploads.

## 4. App container

```bash
cp .env.prod.example .env.prod   # set REVALIDATE_SECRET (same as wp-config)
bash scripts/prod.sh   # build + start app container, verify loopback answers
```

Redeploy frontend only: same command again. Content edits never need it.

## 5. Verify end-to-end

- `/stay` shows WP prices; `/wp-admin` logs in; `/graphql` answers.
- Edit a room → save → price updates within ~1 min (revalidate hook).

## 6. Backups

Panel Backup for the user (web files incl. `wp-content`, DBs, SSL) on a
schedule, plus off-panel copies. App is stateless — code in git, no backup.
