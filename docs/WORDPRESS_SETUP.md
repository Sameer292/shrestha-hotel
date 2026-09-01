# WordPress as Headless CMS — Setup Guide

WordPress lives at `https://cms.shresthahotel.com` and is **never** used to render the public site. Next.js at `www.shresthahotel.com` fetches over GraphQL.

## 1. Install WordPress

- Fresh WP on `cms.shresthahotel.com` (PHP 8.2+, MySQL/MariaDB).
- Create admin + editor accounts (editors manage content, not code).
- Settings → Permalinks → **Post name**.

## 2. Required plugins

Install & activate:

- **WPGraphQL** — https://wordpress.org/plugins/wp-graphql/
- **Advanced Custom Fields (ACF) Pro** — field groups + Options Pages
- **WPGraphQL for ACF** — exposes ACF fields in GraphQL (https://github.com/wp-graphql/wpgraphql-acf)
- Optional: **Yoast SEO** or **Rank Math** for SEO fields → consumed in `metadata`

## 3. Custom Post Types

Create via CPT UI plugin or code (in a small must-use plugin). Each must be `show_in_graphql: true`:

```php
register_post_type('room', [
  'public' => true, 'show_in_graphql' => true,
  'graphql_single_name' => 'room', 'graphql_plural_name' => 'rooms',
  'supports' => ['title','editor','thumbnail','excerpt'],
]);
register_post_type('experience', [ /* similar */ 'graphql_single_name'=>'experience','graphql_plural_name'=>'experiences' ]);
register_post_type('testimonial', [ 'graphql_single_name'=>'testimonial','graphql_plural_name'=>'testimonials' ]);
register_post_type('gallery_item', [ 'graphql_single_name'=>'galleryItem','graphql_plural_name'=>'galleryItems' ]);
register_post_type('offer', [ 'graphql_single_name'=>'offer','graphql_plural_name'=>'offers' ]);
register_post_type('faq', [ 'graphql_single_name'=>'faq','graphql_plural_name'=>'faqs' ]);
```

Assign a featured image to every post; alt text is required.

## 4. ACF field groups

For each CPT, create an ACF field group with location = Post Type is equal to that CPT.

**Room fields** (field names must match `types.ts`): `startingPrice` (number), `currency` (select NPR/USD), `capacity` (number), `adults`, `children`, `bedType` (text), `roomSize` (text e.g. "38 m²"), `view` (text), `amenities` (repeater → text), `checkIn`, `checkOut`, `featured` (true/false), `displayOrder` (number), `gallery` (gallery). Long description = post content; short = excerpt. Also add SEO fields if not using Yoast.

**Experience**: `duration`, `difficulty`, `season`, `optionalPrice`, `featured`, `gallery`.

**Testimonial**: `guestName`, `guestLocation`, `quote` (textarea), `rating` (1-5), `featured`.

**Gallery Item**: `category` (select: Hotel, Rooms, Hot Spring, Nature, Dining, Experiences), `caption`, `displayOrder`.

**FAQ**: `question`, `answer`, `category`, `displayOrder`.

Organize fields into tabs: Basic Information / Details / Amenities / Images / Pricing / SEO — keep it pleasant for hotel staff.

## 5. Global settings — ACF Options Pages

```php
if (function_exists('acf_add_options_page')) {
  acf_add_options_page(['page_title'=>'Hotel Settings','menu_slug'=>'hotel-settings','capability'=>'edit_posts']);
  acf_add_options_page(['page_title'=>'Homepage','menu_slug'=>'homepage-settings']);
}
```

Hotel Settings fields: `hotelName`, `tagline`, `logo`, `favicon`, `phone`, `secondaryPhone`, `email`, `whatsapp`, `address`, `googleMapsUrl`, `googleMapsEmbed`, `latitude`, `longitude`, `instagram`, `facebook`, `tiktok`, `tripadvisor`, `bookingUrl`, `checkIn`, `checkOut`, `currency`, `footerDescription`.

Homepage fields: hero { eyebrow, heading, description, image, primaryCta, secondaryCta }, intro { heading, body, images }, hotSpring { heading, text, image, temperature, hours }, dining { heading, text, images }, finalCta { heading, description, image }.

All GraphQL queries in `src/lib/wordpress/queries.ts` read these — extend there when you add fields.

## 6. GraphQL

Endpoint: `https://cms.shresthahotel.com/graphql`

- Test with GraphiQL (ships with WPGraphQL) or https://studio.apollographql.com.
- CORS: allow `https://www.shresthahotel.com` (and `http://localhost:3000` in dev). In WP, filter `graphql_response_headers` or via hosting.

## 7. Media

- Upload featured images + gallery at 1600px+ wide; WP will serve responsive sizes and `next/image` handles optimization.
- Always fill Alt Text — it becomes `alt` in the frontend.

## 8. Revalidation

In `functions.php` or a small plugin, after saving relevant post types/options, call Next.js:

```php
add_action('save_post', function($post_id){
  if (wp_is_post_autosave($post_id) || wp_is_post_revision($post_id)) return;
  wp_remote_post('https://www.shresthahotel.com/api/revalidate', [
    'headers' => ['x-revalidate-secret' => getenv('REVALIDATE_SECRET'), 'Content-Type'=>'application/json'],
    'body' => json_encode(['path' => '/']),
    'timeout' => 5,
  ]);
}, 10, 1);
```

Keep `REVALIDATE_SECRET` in WP env (not in the repo) — same value as Next.js `REVALIDATE_SECRET`.

## 9. Editor workflow

Editors: WordPress Admin → Rooms / Experiences / Gallery Items / Testimonials / Homepage → edit → Update. Changes go live after revalidation (≤60s via ISR even without webhook).

## 10. Security

- Never commit `REVALIDATE_SECRET` or application passwords.
- Frontend never holds WP credentials; all WP fetches are server-side via `WORDPRESS_API_URL`.
- Validate forms server-side before forwarding to email/CRM.

## 11. Going live

Replace placeholder `picsum.photos` images by uploading real hotel photography to WP and updating the homepage/room/gallery entries. No frontend deploy needed.
