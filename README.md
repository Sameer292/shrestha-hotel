# Shrestha Hotel Hotspring — Next.js + Headless WordPress

Premium nature-retreat website for a Himalayan hot-spring hotel. Next.js (App Router) frontend renders all public UI; WordPress + WPGraphQL is the headless CMS. No WordPress theming touches the visitor.

**Stack:** Next.js 16 / React 19 / TypeScript / Tailwind v4 / GSAP + ScrollTrigger / Lenis / Lucide / Zod / next/image

## Quick start

```bash
bun install
cp .env.example .env.local   # fill WORDPRESS_API_URL etc.
bun run dev                  # http://localhost:3000
bun run build && bun start   # production
bun run check                # Biome lint + format (write)
bun run typecheck            # tsc --noEmit
```

## Env

```
NEXT_PUBLIC_SITE_URL=https://www.shresthahotel.com
WORDPRESS_API_URL=https://cms.shresthahotel.com/graphql
WORDPRESS_GRAPHQL_URL=https://cms.shresthahotel.com/graphql
REVALIDATE_SECRET=long-random-string
```

`WORDPRESS_API_URL` is the only place the CMS origin lives — never hardcoded elsewhere. Frontend gracefully falls back to typed mock data when WP is unreachable in development (`src/lib/wordpress/mock.ts`), with a console warning. In production it logs an error but still renders fallback UI rather than crashing.

## Project structure

```
src/app/
  page.tsx, layout.tsx, sitemap.ts, robots.ts, not-found.tsx
  stay/page.tsx, stay/[slug]/page.tsx
  hot-spring/page.tsx
  experiences/page.tsx, experiences/[slug]/page.tsx
  dining, gallery, about, contact, booking
  api/revalidate/route.ts
src/components/
  layout/Header, Footer, SmoothScroll
  home/Hero, Intro, HotSpringFeature, FeaturedRooms, Experiences, DiningPreview, GalleryPreview, Testimonials, Location, FinalCTA
  common/Button, Reveal, Lightbox, Breadcrumbs
src/lib/
  wordpress/client.ts, queries.ts, types.ts, mock.ts
  animations/gsap.ts
  utils.ts
```

`lib/wordpress/queries.ts` is the single GraphQL layer — components call `getRooms()` etc., never inline queries. Add new content by extending `mock.ts` + `queries.ts` + `types.ts`.

## Rendering & revalidation

Pages use `export const revalidate = 60` (ISR). No per-request DB hit. To invalidate after WP edits, POST to:

```
POST /api/revalidate
Header: x-revalidate-secret: <REVALIDATE_SECRET>
Body: { "path": "/stay" }   # or omit to revalidate /, /stay, /experiences
```

Keep `REVALIDATE_SECRET` server-only. In WP, hook `save_post` to call this endpoint.

## WordPress setup

Detailed guide: `docs/WORDPRESS_SETUP.md`

Plugins required:

- **WPGraphQL** — exposes Gutenberg + CPTs over GraphQL
- **Advanced Custom Fields (ACF)** + **WPGraphQL for ACF** — for structured fields
- Optional: **Yoast SEO** or **Rank Math** (OG fields flow to `metadata` if present)

CPTs to create (exposed to GraphQL):

- `rooms` — fields: title, slug, excerpt, description, featuredImage, gallery, startingPrice, currency, capacity, adults, children, bedType, roomSize, view, amenities (repeater), checkIn, checkOut, featured, displayOrder, seo*
- `experiences` — title, slug, excerpt, description, featuredImage, gallery, duration, difficulty, season, price, featured
- `testimonials` — guestName, guestLocation, quote, rating, image, featured
- `gallery_items` — image, altText, category (Hotel|Rooms|Hot Spring|Nature|Dining|Experiences), caption, displayOrder
- `offers` — title, slug, description, image, price, validity, terms, featured
- `faqs` — question, answer, category, displayOrder

Global settings: use **ACF Options Page** “Hotel Settings” for hotelName, tagline, logo, phones, email, whatsapp, address, maps URL/embed, lat/lng, socials, bookingUrl, check-in/out, currency, footerDescription. Also create a “Homepage” options group for hero/intro/hotSpring/dining/finalCta — so copy changes don’t require redeploys.

GraphQL endpoint must be `https://cms.shresthahotel.com/graphql`. Configure CORS to allow `www.shresthahotel.com`. Permalinks: Post name. Media: set featured images + alt text.

## Animation

- **Lenis** initialized once in `SmoothScroll.tsx` (`autoRaf: true`), synced to `ScrollTrigger` via `lenis.on("scroll", ScrollTrigger.update)` and `gsap.ticker`.
- Cleanup on unmount kills ScrollTriggers and destroys Lenis (no duplicate instances after navigation).
- Hero uses a one-shot GSAP context; section reveals are `ScrollTrigger` with `once:true`.
- `prefers-reduced-motion: reduce` disables GSAP/Lenis entirely — content remains fully accessible.
- Only `transform`/`opacity`/`clip-path` are animated; `will-change` is not left on.

## SEO & accessibility

- `metadata` + dynamic per-room/experience Open Graph images from WP.
- `sitemap.ts` / `robots.ts` auto-generated from WP (fallback to mock).
- JSON-LD: `Hotel` + `PostalAddress` sitewide, `BreadcrumbList` on detail pages.
- Semantic HTML, keyboard-navigable lightbox (Esc/Arrow), focus-visible outlines, correct heading hierarchy, alt text from CMS.

## Replacing placeholder images

All placeholder images are `picsum.photos` via `src/lib/wordpress/mock.ts:img()`. Search for `picsum` to find them. Replace with real photography by wiring WP media URLs — no code change beyond the WP query.

## Deployment

- Frontend on Vercel (or any Next.js host). Set env vars there.
- WordPress on `cms.shresthahotel.com` (any host with PHP/MySQL).
- Keep WP admin + app passwords private; never expose in client bundle.

## Content publishing

1. Edit in WP admin → 2. WP calls `/api/revalidate` (optional) → 3. Next.js revalidates ISR caches → 4. Visitors see new content without redeploy.

## Notes

- Booking is an **inquiry** form until a real PMS/booking engine URL is set in Hotel Settings → header CTA opens that URL, else `/booking`.
- No fake claims: amenities, distances, sustainability, medical benefits are only rendered if WP provides them.
- Contact/booking forms validate with inline errors and accessible states; wire to WP/Resend/Turnstile when backend is ready (see `ponytail:` comments).
