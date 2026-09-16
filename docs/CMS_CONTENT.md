# CMS Content Audit — every image & field in the app

Rule: **no hardcoded content images** — everything below is editable in
`wp-admin` (item CPT posts, featured images, or page CPT entries).
Mock data in `src/lib/wordpress/mock.ts` is offline fallback only.

## Images — app surface → CMS source

| # | Where | CMS source | Status |
|---|---|---|---|
| 1 | Homepage hero | Home Content entry → Featured image | ✅ ready |
| 2 | Homepage intro (2) | Home Content → Our story images (gallery) | ✅ ready |
| 3 | Homepage hot-spring card | Hot Spring Page entry → Featured image | ✅ ready |
| 4 | Room cards + detail hero | Room post → Featured image | ✅ ready |
| 5 | Room detail gallery | Room post → Gallery (ACF gallery) | ✅ ready |
| 6 | Experience cards + detail hero | Experience post → Featured image | ✅ ready |
| 7 | Homepage dining (2) | Dining Page → Page images (gallery) | ✅ ready |
| 8 | `/dining` page images | Dining Page → Page images (gallery) | ✅ ready |
| 9 | `/hot-spring` hero | Hot Spring Page entry → Featured image | ✅ ready |
| 10 | Gallery (all) | Gallery Items → Featured image + Category | ✅ ready |
| 11 | Final CTA background | Home Content → Final CTA image (gallery) | ✅ ready |
| 12 | `/about` photo + story | About Page → Featured image + body (= post content) | ✅ ready |
| 13 | Testimonials | none — quote cards, no photos by design | — n/a |

How to change any image: **Media Library → upload**, then set as the
post's Featured image or ACF gallery item.

## CPTs × ACF fields

**Page CPTs** (one entry each, direct-edit menus, every section a
separate ACF field): Home Content (`home_content`), Stay
(`stay_page`), Hot Spring (`hot_spring_page`), Experiences
(`experiences_page`), Dining (`dining_page` — incl. meal-cards
repeater), Gallery (`gallery_page`), About (`about_page`), Contact
(`contact_page`). Groups in `scripts/acf-json/group_sh_*page.json`.

**Room** (`room`, `group_sh_room.json`): startingPrice, currency,
capacity, adults, children, bedType, roomSize, view, amenities (one
per line), checkIn, checkOut, gallery, featured, displayOrder.
Featured image = card + detail hero.

**Experience** (`experience`, `group_sh_exp.json`): duration,
difficulty, season, optionalPrice, gallery, featured. Featured image
= card + detail hero.

**Testimonial** (`testimonial`, `group_sh_test.json`):
guestName, guestLocation, quote, rating, featured. (No photo — cards
show stars, quote, name.)

**Gallery Item** (`gallery_item`, `group_sh_gallery.json`):
category, caption, displayOrder. Featured image = the photo itself.

**FAQ** (`faq`, `group_sh_faq.json`): question, answer, category,
displayOrder.

**Offer** (`offer`, `group_sh_offer.json`): reserved — nothing in the
app reads it yet.

**Hotel Content** (options page, no ACF Pro needed): Hotel Settings
operational globals only (phone, email, address, socials, check-in/
out, currency, booking URL, footer description) — identity
(hotelName/tagline/subtagline) lives on the Home Content entry.
Editable at WP Admin → Hotel Content.

## Forms (not mock — real delivery)

Contact (`/contact`) and booking (`/booking`) POST JSON to Next
(`/api/contact`, `/api/booking`), validated with zod, forwarded to WP
(`POST sh/v1/inquiry`). WP stores a **private Inquiry** post (wp-admin →
Inquiries) and emails the hotel address (best-effort). Anti-spam: hidden
honeypot field + 5/hour per IP. Test: submit → entry appears in Inquiries.

## Fresh-machine order

`scripts/dev.sh` → `wp-setup.sh` (core + plugins + CPTs + ACF JSON)
→ `seed-all-content.sh` (8 page entries + all item posts; idempotent,
upserts by slug, wipes stale repeater meta) → `seed-images.php` (demo
featured images; skips posts that already have one).
