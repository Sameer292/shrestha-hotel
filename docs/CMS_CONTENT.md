# CMS Content Audit — every image & field in the app

Rule: **no hardcoded content images** — everything below is editable in
`wp-admin` (CPT entries, featured images, or the **Hotel Content** page).
Mock data in `src/lib/wordpress/mock.ts` is offline fallback only.

## Images — app surface → CMS source

| # | Where | CMS source | Status |
|---|---|---|---|
| 1 | Homepage hero | Hotel Content → Hero → image | ✅ ready |
| 2 | Homepage intro (2) | Hotel Content → Intro → images | ✅ ready |
| 3 | Homepage hot-spring card | Hotel Content → Hot Spring → image | ✅ ready |
| 4 | Room cards + detail hero | Room → Featured image | ✅ ready |
| 5 | Room detail gallery (3) | Room → **Gallery** (ACF gallery) | ✅ **added** (was missing) |
| 6 | Experience cards + detail hero | Experience → Featured image | ✅ ready |
| 7 | Homepage dining (2) | Hotel Content → Dining → images | ✅ ready |
| 8 | `/dining` page images | Hotel Content → Dining → images | ✅ **wired** (was mock) |
| 9 | `/hot-spring` hero | Hotel Content → Hot Spring → image | ✅ **wired** (was mock) |
| 10 | Gallery (all) | Gallery Items → Featured image + Category | ✅ **wired** (was mock, via `/api/gallery`) |
| 11 | Final CTA background | Hotel Content → Final CTA → image | ✅ ready |
| 12 | `/about` photo + story | Hotel Content → **About** (heading/body/image) | ✅ **added** (was picsum placeholder) |
| 13 | Testimonials | none — quote cards, no photos by design | — n/a |

How to change any image: **Media Library → upload**, then set as the entry's
Featured image, Gallery item, or paste its URL into the matching Hotel Content
field (`URL | alt` per line for lists).

## CPTs × ACF fields

**Room** (`room`): startingPrice, currency, capacity, adults, children,
bedType, roomSize, view, amenities, checkIn, checkOut, featured,
displayOrder — ✅ all ready. **gallery (gallery)** ✅ **added**.
Featured image = card + detail hero.

**Experience** (`experience`): duration, difficulty, season, optionalPrice,
featured — ✅ all ready. Featured image = card + detail hero.
(No gallery field — detail page shows no gallery by design.)

**Testimonial** (`testimonial`): guestName, guestLocation, quote, rating,
featured — ✅ all ready. (No photo — cards show stars, quote, name.)

**Gallery Item** (`gallery_item`): category, caption, displayOrder — ✅ all
ready. Featured image = the photo itself.

**FAQ** (`faq`): question, answer, category, displayOrder — ✅ all ready.

**Offer** (`offer` CPT + ACF group exist in WP): **nothing in the app reads
it** — reserved for a future offers section, safely ignorable.

**Hotel Content** (options page, no ACF Pro needed): Hotel Settings (18
fields) + Hero / Intro / Hot Spring / Dining / Final CTA / **About** sections
— ✅ all ready, editable at WP Admin → Hotel Content.

## Forms (not mock — real delivery)

Contact (`/contact`) and booking (`/booking`) POST JSON to Next
(`/api/contact`, `/api/booking`), validated with zod, forwarded to WP
(`POST sh/v1/inquiry`). WP stores a **private Inquiry** post (wp-admin →
Inquiries) and emails the hotel address (best-effort). Anti-spam: hidden
honeypot field + 5/hour per IP. Test: submit → entry appears in Inquiries.

## Fresh-machine order

`scripts/dev.sh` → `migrate-content.sh` → `set-room-meta.sh` →
`set-all-meta.sh` → `seed-images.php` (featured images) → galleries are
empty until staff adds photos (detail pages hide the strip when empty).
