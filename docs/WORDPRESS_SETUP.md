# WordPress as Headless CMS — Setup Guide

WordPress lives at `https://cms.shresthahotel.com` and is **never** used to render the public site. Next.js at `www.shresthahotel.com` fetches over GraphQL.

## 1. Install WordPress

- Fresh WP on `cms.shresthahotel.com` (PHP 8.2+, MySQL/MariaDB).
- Create admin + editor accounts (editors manage content, not code).
- Settings → Permalinks → **Post name**.

## 2. Required plugins

Install & activate:

- **WPGraphQL** — https://wordpress.org/plugins/wp-graphql/
- **Advanced Custom Fields (ACF)** free — field groups (Options Pages are Pro-only; we don't use them)
- **WPGraphQL for ACF** — exposes ACF fields in GraphQL (https://github.com/wp-graphql/wpgraphql-acf)
- Optional: **Yoast SEO** or **Rank Math** for SEO fields → consumed in `metadata`

## 3. Custom Post Types

Registered in code (`scripts/mu-plugins/shrestha-cpts.php`, synced by
`wp-setup.sh`). Every type is public for GraphQL but has no frontend
URLs (`rewrite => false`, no archive, excluded from search).

There are two families — do not mix them:

### 3a. Page CPTs (one entry per frontend page)

Each is edited through its direct menu (`scripts/mu-plugins/
sh-page-menus.php`), which opens the single entry straight away,
options-page style — there is intentionally NO post list. Clicking
e.g. **Stay Page** lands straight on the Stay edit screen
(auto-created on first click). Every section of the page is a
separate ACF field on that screen (see `scripts/acf-json/
group_sh_*page.json`).

Assign a featured image to every page entry (used as hero photo).

| Admin menu | Entry slug | Holds |
|---|---|---|
| Home Content | `home` | Hotel name, tagline, sub-tagline (canonical — Hotel Settings resolves from here), hero (image = Featured image), Our Story, Location, footer, Final CTA |
| Stay Page | `stay` | Listing hero + room-detail sidebar/CTA copy (cards auto-pull from Rooms) |
| Hot Spring Page | `hot-spring` | Hero, teaser (homepage mirror), temperature/hours, info cards, etiquette, sidebar, FAQ category |
| Experiences Page | `experiences` | Listing hero + experience-detail sidebar (items auto-pull from Experiences) |
| Dining Page | `dining` | Hero, teaser (homepage mirror), page images, meal cards (repeater — page-section content, no detail page by design) |
| Gallery Page | `gallery` | Hero only (photos auto-pull from Gallery Items) |
| About Page | `about` | Hero, body (= post content), photo (= Featured image), stat cards |
| Contact Page | `contact` | Hero, form intro, form card title (address/phone/map from Hotel Settings) |

### 3b. Item CPTs (one post per list item — normal post lists)

Rooms, Experiences, Testimonials, Gallery Items, FAQs. Each is a
regular wp-admin list: add/edit/trash per item, featured image per
item (card + detail hero), Display order for sorting, Featured
checkbox for homepage picks. Detail URLs (`/stay/:slug`,
`/experiences/:slug`) come from the post slug. Fields live in
`scripts/acf-json/group_sh_room.json`,
`group_sh_exp.json`, `group_sh_test.json`,
`group_sh_gallery.json`, `group_sh_faq.json`; long description =
post content, short excerpt = post excerpt.

| Admin menu | Post type | Key fields |
|---|---|---|
| Rooms | `room` | startingPrice, currency, capacity, adults, children, bedType, roomSize, view, amenities (one per line), checkIn, checkOut, gallery, featured, displayOrder |
| Experiences | `experience` | duration, difficulty, season, optionalPrice, gallery, featured |
| Testimonials | `testimonial` | guestName, guestLocation, quote, rating (1–5), featured |
| Gallery Items | `gallery_item` | category (Hotel/Rooms/Hot Spring/Nature/Dining/Experiences), caption, displayOrder — featured image = the photo itself |
| FAQs | `faq` | question, answer, category (e.g. Hot Spring, Stay), displayOrder |

Seed/update everything with `bash scripts/seed-all-content.sh`
(idempotent, upserts by slug — never hardcodes IDs), then
`seed-images.php` for demo featured images (skips posts that
already have one).

## 4. ACF field groups

For each CPT, the ACF field group in `scripts/acf-json/` (location =
Post Type is equal to that CPT) defines its fields — field names must
match `src/lib/wordpress/queries.ts` (queried lowercase, e.g.
`startingPrice` → `startingprice`).

**Room** (`room`, `group_sh_room.json`): `startingPrice` (number),
`currency` (select NPR/USD), `capacity`, `adults`, `children`,
`bedType`, `roomSize` (e.g. "38 m²"), `view`, `amenities` (textarea,
one per line), `checkIn`, `checkOut`, `gallery` (gallery),
`featured` (true/false), `displayOrder` (number). Long description =
post content; short = excerpt; card + detail hero = featured image.

**Experience** (`experience`, `group_sh_exp.json`):
`duration`, `difficulty`, `season`, `optionalPrice`, `gallery`,
`featured`.

**Testimonial** (`testimonial`, `group_sh_test.json`):
`guestName` (empty = post title), `guestLocation`, `quote`
(textarea), `rating` (1–5), `featured`. No photo — cards show stars,
quote, name by design.

**Gallery Item** (`gallery_item`, `group_sh_gallery.json`):
`category` (select: Hotel, Rooms, Hot Spring, Nature, Dining,
Experiences), `caption` (empty = post title), `displayOrder`.
Featured image = the photo itself.

**FAQ** (`faq`, `group_sh_faq.json`): `question` (empty = post
title), `answer`, `category` (e.g. Hot Spring, Stay), `displayOrder`.

**Offer** (`offer`, `group_sh_offer.json`): reserved for a future
offers section — nothing in the app reads it yet.

Organize fields into tabs: Basic Information / Details / Amenities / Images / Pricing / SEO — keep it pleasant for hotel staff.

## 5. Global settings — Hotel Content page (no ACF Pro needed)

`scripts/mu-plugins/shrestha-settings.php` registers a **Hotel Content** admin
page (options + GraphQL `hotelSettings` / `homeContent`) — this replaces ACF
Options Pages, which are Pro-only.

Hotel Settings fields: `hotelName`, `tagline`, `phone`, `secondaryPhone`,
`email`, `whatsapp`, `address`, `googleMapsUrl`, `googleMapsEmbed`,
`latitude`, `longitude`, `instagram`, `facebook`, `tripadvisor`, `bookingUrl`,
`checkIn`, `checkOut`, `currency`, `footerDescription`.

Homepage sections: hero { eyebrow, heading, subheading, image, primaryCta, secondaryCta }, intro { heading, body, images }, hotSpring { heading, text, image, temperature, hours, cta }, dining { heading, text, images, cta }, finalCta { heading, description, image }, about { heading, body, image }.

All GraphQL queries in `src/lib/wordpress/queries.ts` read these — extend there when you add fields.

## 6. GraphQL

Endpoint: `https://cms.shresthahotel.com/graphql`

- Test with GraphiQL (ships with WPGraphQL) or https://studio.apollographql.com.
- CORS: allow `https://www.shresthahotel.com` (and `http://localhost:3000` in dev). In WP, filter `graphql_response_headers` or via hosting.

## 7. Media

- Upload featured images + gallery at 1600px+ wide; WP will serve responsive sizes and `next/image` handles optimization.
- Always fill Alt Text — it becomes `alt` in the frontend.

## 8. Revalidation — automatic

`shrestha-settings.php` pings Next.js `/api/revalidate` on every save of our
post types and on Hotel Content updates (non-blocking, 3s timeout). Configure
via env (`NEXT_APP_URL`, `REVALIDATE_SECRET`) in Docker, or `wp-config.php`
constants on Hestia. Keep `REVALIDATE_SECRET` out of the repo — same value as
Next.js `REVALIDATE_SECRET`.

## 9. Editor workflow

Editors: WordPress Admin → Rooms / Experiences / Gallery Items / Testimonials / Homepage → edit → Update. Changes go live after revalidation (≤60s via ISR even without webhook).

## 10. Security

- Never commit `REVALIDATE_SECRET` or application passwords.
- Frontend never holds WP credentials; all WP fetches are server-side via `WORDPRESS_API_URL`.
- Validate forms server-side before forwarding to email/CRM.

## 11. Going live

Replace placeholder `picsum.photos` images by uploading real hotel photography to WP and updating the homepage/room/gallery entries. No frontend deploy needed.
