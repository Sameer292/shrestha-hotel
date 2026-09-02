<?php
/**
 * WP-CLI Migration Script — Populates WordPress with all hotel content
 * Run: docker compose run --rm wpcli --path=/var/www/html eval-file /var/www/html/wp-content/mu-plugins/migrate-data.php
 */

if (!defined('ABSPATH')) exit;

// Helper: create post with ACF fields
function create_cpt_post($post_type, $title, $content, $excerpt, $acf_fields, $featured_image_url = null, $status = 'publish') {
    $post_data = [
        'post_title'   => $title,
        'post_content' => $content,
        'post_excerpt' => $excerpt,
        'post_status'  => $status,
        'post_type'    => $post_type,
        'meta_input'   => $acf_fields,
    ];

    // Store featured image URL as meta (Next.js fetches directly from Unsplash)
    if ($featured_image_url) {
        $post_data['meta_input']['_featured_image_url'] = $featured_image_url;
    }

    $post_id = wp_insert_post($post_data, true);
    if (is_wp_error($post_id)) {
        echo "  ERROR creating {$post_type}: {$title} — {$post_id->get_error_message()}\n";
        return null;
    }

    // Set ACF fields via update_field (ACF must be active)
    foreach ($acf_fields as $key => $value) {
        if (function_exists('update_field')) {
            update_field($key, $value, $post_id);
        } else {
            update_post_meta($post_id, $key, $value);
        }
    }

    echo "  ✓ {$post_type}: {$title} (ID: {$post_id})\n";
    return $post_id;
}

// Helper: set ACF option page field
function set_option_field($option_name, $field_key, $value) {
    if (function_exists('update_field')) {
        update_field($field_key, $value, "options_{$option_name}");
    } else {
        update_option("_{$option_name}_{$field_key}", $value);
    }
}

echo "====================================\n";
echo "  SHRESTHA HOTEL — CMS MIGRATION\n";
echo "====================================\n\n";

// ============================================
// 1. ROOMS
// ============================================
echo "==> Creating Rooms...\n";

$rooms = [
    [
        'title' => 'Forest Retreat Suite',
        'content' => '<p>A generous corner suite wrapped in timber and linen, with a private balcony facing the forested ridge. Stone bath, warm wood floors, and quiet mornings with tea as mist lifts from the valley. Designed for lingering.</p>',
        'excerpt' => 'Timber, stone and valley light — our most private suite.',
        'image' => 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&h=800&q=80',
        'acf' => [
            'startingPrice' => 18500,
            'currency' => 'NPR',
            'capacity' => 2,
            'adults' => 2,
            'children' => 1,
            'bedType' => 'King Bed',
            'roomSize' => '38 m²',
            'view' => 'Forest & Valley View',
            'amenities' => 'Mountain View, Hot Spring Access, Private Bathroom, Heating, Balcony, Wi-Fi, Garden View',
            'checkIn' => '2:00 PM',
            'checkOut' => '11:00 AM',
            'featured' => 1,
            'displayOrder' => 1,
        ],
    ],
    [
        'title' => 'Hotspring Deluxe',
        'content' => '<p>Closest to the hot spring baths, this warm, grounded room pairs oak details with soft cream linen. Ideal for guests who come for the water and stay for the quiet. Private sit-out with valley glimpses.</p>',
        'excerpt' => 'Steps from the spring — warmth, whenever you want it.',
        'image' => 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&h=800&q=80',
        'acf' => [
            'startingPrice' => 14500,
            'currency' => 'NPR',
            'capacity' => 2,
            'adults' => 2,
            'children' => 1,
            'bedType' => 'Queen Bed',
            'roomSize' => '28 m²',
            'view' => 'Garden & Spring View',
            'amenities' => 'Hot Spring Access, Mountain View, Private Bathroom, Heating, Wi-Fi, Room Service',
            'checkIn' => '2:00 PM',
            'checkOut' => '11:00 AM',
            'featured' => 1,
            'displayOrder' => 2,
        ],
    ],
    [
        'title' => 'Mountain Family Retreat',
        'content' => '<p>Two connected spaces, warm timber bunk and a king bed, with room for small travelers and quiet corners for tea. Large windows bring the ridge inside. Interconnecting option available.</p>',
        'excerpt' => 'Space for togetherness, framed by the Himalayas.',
        'image' => 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&h=800&q=80',
        'acf' => [
            'startingPrice' => 22000,
            'currency' => 'NPR',
            'capacity' => 4,
            'adults' => 3,
            'children' => 2,
            'bedType' => 'King + Bunk',
            'roomSize' => '45 m²',
            'view' => 'Mountain Panorama',
            'amenities' => 'Family Rooms, Mountain View, Hot Spring Access, Heating, Balcony, Wi-Fi',
            'checkIn' => '2:00 PM',
            'checkOut' => '11:00 AM',
            'featured' => 1,
            'displayOrder' => 3,
        ],
    ],
    [
        'title' => 'Riverside Calm',
        'content' => '<p>A small, deeply calm room near the riverside walk. Perfect for solo travelers or couples seeking simplicity: warm blanket, good book, balcony chair and the evening sound of water.</p>',
        'excerpt' => 'Intimate, quiet — the sound of water nearby.',
        'image' => 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&h=800&q=80',
        'acf' => [
            'startingPrice' => 11500,
            'currency' => 'NPR',
            'capacity' => 2,
            'adults' => 2,
            'children' => 0,
            'bedType' => 'Queen Bed',
            'roomSize' => '24 m²',
            'view' => 'River & Forest',
            'amenities' => 'Hot Spring Access, Private Bathroom, Wi-Fi, Heating',
            'checkIn' => '2:00 PM',
            'checkOut' => '11:00 AM',
            'featured' => 0,
            'displayOrder' => 4,
        ],
    ],
];

foreach ($rooms as $room) {
    create_cpt_post('room', $room['title'], $room['content'], $room['excerpt'], $room['acf'], $room['image']);
}

// ============================================
// 2. EXPERIENCES
// ============================================
echo "\n==> Creating Experiences...\n";

$experiences = [
    [
        'title' => 'Natural Hot Spring Bathing',
        'content' => '<p>The spring is the hotel\'s quiet center. Bathe at dawn when steam lifts into forest light, or after a walk when legs are tired. Indoor and open-air pools, stone-lined, with space for silence.</p>',
        'excerpt' => 'Mineral-rich waters held at a gentle warmth.',
        'image' => 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?auto=format&fit=crop&w=800&h=600&q=80',
        'acf' => [
            'duration' => 'Open daily 6AM–9PM',
            'difficulty' => 'Easy',
            'season' => 'Year-round',
            'featured' => 1,
        ],
    ],
    [
        'title' => 'Mountain Walks',
        'content' => '<p>Guided or self-led walks from the hotel gate — ridge viewpoints, village paths and forest loops. Mornings are clearest.</p>',
        'excerpt' => 'Unmarked trails through rhododendron and pine.',
        'image' => 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&h=600&q=80',
        'acf' => [
            'duration' => '1–4 hours',
            'difficulty' => 'Easy to Moderate',
            'season' => 'Sep–May best',
            'featured' => 1,
        ],
    ],
    [
        'title' => 'Village Exploration',
        'content' => '<p>Walk to nearby villages, meet makers and farmers, taste local milks and honeys. A gentle immersion in Myagdi life.</p>',
        'excerpt' => 'Tea houses, terraced fields and unhurried conversation.',
        'image' => 'https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?auto=format&fit=crop&w=800&h=600&q=80',
        'acf' => [
            'duration' => '2–3 hours',
            'difficulty' => 'Easy',
            'season' => 'Year-round',
            'featured' => 1,
        ],
    ],
    [
        'title' => 'Riverside Relaxation',
        'content' => '<p>A short walk to river stones and shade. Bring tea, a book, or nothing at all.</p>',
        'excerpt' => 'Sit by the Kali Gandaki\'s quiet stretches.',
        'image' => 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&h=600&q=80',
        'acf' => [
            'duration' => 'Flexible',
            'difficulty' => 'Easy',
            'season' => 'Year-round',
            'featured' => 0,
        ],
    ],
    [
        'title' => 'Bonfire Evenings',
        'content' => '<p>When the evening cools, we gather by the fire — music, tea, and mountain air.</p>',
        'excerpt' => 'Firelight, stories and warm plates shared outside.',
        'image' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&h=600&q=80',
        'acf' => [
            'duration' => 'Evenings',
            'difficulty' => 'Easy',
            'season' => 'Oct–Apr',
            'featured' => 1,
        ],
    ],
    [
        'title' => 'Scenic Viewpoints',
        'content' => '<p>Short drives to viewpoints over Dhaulagiri and Annapurna on clear days.</p>',
        'excerpt' => 'Wide horizons, best at sunrise.',
        'image' => 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&h=600&q=80',
        'acf' => [
            'duration' => 'Half-day',
            'difficulty' => 'Easy',
            'season' => 'Oct–Apr',
            'featured' => 0,
        ],
    ],
];

foreach ($experiences as $exp) {
    create_cpt_post('experience', $exp['title'], $exp['content'], $exp['excerpt'], $exp['acf'], $exp['image']);
}

// ============================================
// 3. TESTIMONIALS
// ============================================
echo "\n==> Creating Testimonials...\n";

$testimonials = [
    [
        'title' => 'Aarav & Meera',
        'content' => '<p>We came for the hot spring and stayed for the quiet. The kind of place that slows your breath without asking you to.</p>',
        'excerpt' => '',
        'acf' => [
            'guestName' => 'Aarav & Meera',
            'guestLocation' => 'Kathmandu, Nepal',
            'quote' => 'We came for the hot spring and stayed for the quiet. The kind of place that slows your breath without asking you to.',
            'rating' => 5,
            'featured' => 1,
        ],
    ],
    [
        'title' => 'Sophie L.',
        'content' => '<p>Warm water under open sky, forest all around, and staff who remember how you take your tea. Perfect.</p>',
        'excerpt' => '',
        'acf' => [
            'guestName' => 'Sophie L.',
            'guestLocation' => 'Lyon, France',
            'quote' => 'Warm water under open sky, forest all around, and staff who remember how you take your tea. Perfect.',
            'rating' => 5,
            'featured' => 1,
        ],
    ],
    [
        'title' => 'Rajesh K.',
        'content' => '<p>Clean, calm, deeply Nepali in its hospitality. The rooms feel like a mountain home, not a hotel.</p>',
        'excerpt' => '',
        'acf' => [
            'guestName' => 'Rajesh K.',
            'guestLocation' => 'Pokhara, Nepal',
            'quote' => 'Clean, calm, deeply Nepali in its hospitality. The rooms feel like a mountain home, not a hotel.',
            'rating' => 5,
            'featured' => 1,
        ],
    ],
];

foreach ($testimonials as $test) {
    create_cpt_post('testimonial', $test['title'], $test['content'], $test['excerpt'], $test['acf']);
}

// ============================================
// 4. GALLERY ITEMS
// ============================================
echo "\n==> Creating Gallery Items...\n";

$gallery = [
    [
        'title' => 'Timber and stone lobby at dusk',
        'image' => 'https://images.unsplash.com/photo-1445019980597-93fa8ac97c40?auto=format&fit=crop&w=800&h=1000&q=80',
        'acf' => ['category' => 'Hotel', 'caption' => 'Timber and stone lobby at dusk', 'displayOrder' => 1],
    ],
    [
        'title' => 'Steam rising at dawn',
        'image' => 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&h=700&q=80',
        'acf' => ['category' => 'Hot Spring', 'caption' => 'Steam rising at dawn', 'displayOrder' => 2],
    ],
    [
        'title' => 'Forest Retreat Suite',
        'image' => 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&h=800&q=80',
        'acf' => ['category' => 'Rooms', 'caption' => 'Forest Retreat Suite', 'displayOrder' => 3],
    ],
    [
        'title' => 'Misty ridge morning',
        'image' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&h=1200&q=80',
        'acf' => ['category' => 'Nature', 'caption' => 'Misty ridge morning', 'displayOrder' => 4],
    ],
    [
        'title' => 'Wood-fired bread and dal',
        'image' => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&h=600&q=80',
        'acf' => ['category' => 'Dining', 'caption' => 'Wood-fired bread and dal', 'displayOrder' => 5],
    ],
    [
        'title' => 'Village walk',
        'image' => 'https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?auto=format&fit=crop&w=800&h=1000&q=80',
        'acf' => ['category' => 'Experiences', 'caption' => 'Village walk', 'displayOrder' => 6],
    ],
    [
        'title' => 'River stones',
        'image' => 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&h=700&q=80',
        'acf' => ['category' => 'Nature', 'caption' => 'River stones', 'displayOrder' => 7],
    ],
    [
        'title' => 'Open-air bath',
        'image' => 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?auto=format&fit=crop&w=800&h=800&q=80',
        'acf' => ['category' => 'Hot Spring', 'caption' => 'Open-air bath', 'displayOrder' => 8],
    ],
];

foreach ($gallery as $item) {
    create_cpt_post('gallery_item', $item['title'], '', '', $item['acf'], $item['image']);
}

// ============================================
// 5. FAQs
// ============================================
echo "\n==> Creating FAQs...\n";

$faqs = [
    [
        'title' => 'Is the hot spring natural?',
        'content' => '<p>Yes — mineral-rich water sourced from deep Himalayan springs, maintained at 38–42°C for comfortable bathing.</p>',
        'acf' => ['question' => 'Is the hot spring natural?', 'answer' => 'Yes — mineral-rich water sourced from deep Himalayan springs, maintained at 38–42°C for comfortable bathing.', 'category' => 'Hot Spring', 'displayOrder' => 1],
    ],
    [
        'title' => 'Who can use the hot spring?',
        'content' => '<p>All staying guests have complimentary access. Please shower before entering and follow posted etiquette.</p>',
        'acf' => ['question' => 'Who can use the hot spring?', 'answer' => 'All staying guests have complimentary access. Please shower before entering and follow posted etiquette.', 'category' => 'Hot Spring', 'displayOrder' => 2],
    ],
    [
        'title' => 'What are check-in and check-out times?',
        'content' => '<p>Check-in from 2:00 PM, check-out by 11:00 AM. Early check-in/late check-out on request, subject to availability.</p>',
        'acf' => ['question' => 'What are check-in and check-out times?', 'answer' => 'Check-in from 2:00 PM, check-out by 11:00 AM. Early check-in/late check-out on request, subject to availability.', 'category' => 'Stay', 'displayOrder' => 3],
    ],
    [
        'title' => 'Is the hotel suitable for families?',
        'content' => '<p>Yes — we have family rooms and interconnecting options. Please mention children\'s ages when booking.</p>',
        'acf' => ['question' => 'Is the hotel suitable for families?', 'answer' => 'Yes — we have family rooms and interconnecting options. Please mention children\'s ages when booking.', 'category' => 'Stay', 'displayOrder' => 4],
    ],
];

foreach ($faqs as $faq) {
    create_cpt_post('faq', $faq['title'], $faq['content'], '', $faq['acf']);
}

// ============================================
// 6. OFFERS
// ============================================
echo "\n==> Creating Offers...\n";

$offers = [
    [
        'title' => 'Winter Warmth — 3 Nights',
        'content' => '<p>Three nights, daily hot spring, breakfast and a guided ridge walk. For slow winter light.</p>',
        'excerpt' => '',
        'image' => 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&h=600&q=80',
        'acf' => [
            'slug' => 'winter-warmth',
            'title' => 'Winter Warmth — 3 Nights',
            'description' => 'Three nights, daily hot spring, breakfast and a guided ridge walk. For slow winter light.',
            'price' => 'From NPR 42,000',
            'validity' => 'Dec — Feb',
            'featured' => 1,
        ],
    ],
];

foreach ($offers as $offer) {
    create_cpt_post('offer', $offer['title'], $offer['content'], $offer['excerpt'], $offer['acf'], $offer['image']);
}

// ============================================
// 7. ACF OPTIONS — HOTEL SETTINGS
// ============================================
echo "\n==> Setting Hotel Settings (ACF Options)...\n";

$hotel_settings = [
    'hotelName' => 'Shrestha Hotel Hotspring',
    'tagline' => 'Where the Mountains Meet Warm Waters',
    'phone' => '+977 9800000000',
    'email' => 'namaste@shresthahotel.com',
    'whatsapp' => '+9779800000000',
    'address' => 'Beni, Myagdi, Gandaki Province, Nepal',
    'googleMapsUrl' => 'https://maps.google.com/?q=Beni+Myagdi+Nepal',
    'googleMapsEmbed' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3519!2d83.5!3d28.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sBeni%20Myagdi!5e0!3m2!1sen!2snp!4v1700000000000',
    'latitude' => '28.3417',
    'longitude' => '83.5603',
    'instagram' => 'https://instagram.com/',
    'facebook' => 'https://facebook.com/',
    'tripadvisor' => 'https://tripadvisor.com/',
    'bookingUrl' => '/booking',
    'checkIn' => '2:00 PM',
    'checkOut' => '11:00 AM',
    'currency' => 'NPR',
    'footerDescription' => 'A peaceful Himalayan retreat shaped by nature, warm hospitality, and restorative natural hot springs in the heart of Myagdi.',
];

foreach ($hotel_settings as $key => $value) {
    set_option_field('hotel-settings', $key, $value);
}
echo "  ✓ Hotel Settings saved\n";

// ============================================
// 8. ACF OPTIONS — HOMEPAGE CONTENT
// ============================================
echo "\n==> Setting Homepage Content (ACF Options)...\n";

$home_hero = [
    'eyebrow' => 'SHRESTHA HOTEL HOTSPRING',
    'heading' => "Where the Mountains\nMeet Warm Waters",
    'subheading' => 'A peaceful Himalayan retreat shaped by nature, warm hospitality, and restorative natural hot springs.',
    'primaryCta' => 'Book Your Stay',
    'secondaryCta' => 'Explore the Hotel',
];

$home_intro = [
    'heading' => "Come for the mountains.\nStay for the warmth.",
    'body' => 'Nestled in the quiet folds of Myagdi, Shrestha Hotel Hotspring is a small, soulful retreat where forest air, stone and timber, and the hush of warm water set the rhythm of each day. Here, mornings begin with mist over the ridges and evenings end in the quiet glow of the hot spring — a place to slow down, breathe deeper, and feel held by the mountains.',
];

$home_hotspring = [
    'heading' => "Nature's\nWarmest Welcome",
    'text' => "Our natural hot spring is the heart of the hotel — mineral-rich waters gathered from deep Himalayan stone, held at a gentle warmth for slow, restorative bathing. Surrounded by timber, steam and forest light, it's a place for quiet restoration, shared silence, and the simple luxury of water that has traveled through the mountain to reach you.",
    'temperature' => '38–42°C',
    'hours' => '6:00 AM — 9:00 PM',
    'cta' => 'Discover the Hot Spring',
];

$home_dining = [
    'heading' => "From the Mountains\nto the Table",
    'text' => 'Food here follows the land — fresh, seasonal, and cooked with care. Warm dal and gundruk from nearby farms, wood-fired breads, mountain herbs, and Nepali hospitality served without hurry. Dine looking out to the valley, or by the fire when the evening turns cool.',
    'cta' => 'Explore Dining',
];

$home_final_cta = [
    'heading' => 'Your Mountain Escape Awaits',
    'description' => "Let the hot spring hold the day's quiet. Let the mountains do the rest.",
];

foreach ($home_hero as $key => $value) set_option_field('homepage-settings', "hero_{$key}", $value);
foreach ($home_intro as $key => $value) set_option_field('homepage-settings', "intro_{$key}", $value);
foreach ($home_hotspring as $key => $value) set_option_field('homepage-settings', "hotSpring_{$key}", $value);
foreach ($home_dining as $key => $value) set_option_field('homepage-settings', "dining_{$key}", $value);
foreach ($home_final_cta as $key => $value) set_option_field('homepage-settings', "finalCta_{$key}", $value);

echo "  ✓ Homepage Content saved\n";

// ============================================
// DONE
// ============================================
echo "\n====================================\n";
echo "  MIGRATION COMPLETE!\n";
echo "====================================\n";
echo "\nWordPress Admin: http://localhost:8080/wp-admin\n";
echo "GraphQL: http://localhost:8080/graphql\n";
echo "\nNext steps:\n";
echo "  1. Run: docker compose run --rm wpcli --path=/var/www/html rewrite flush --hard\n";
echo "  2. Open WP Admin and verify all content\n";
echo "  3. Test GraphQL: curl -X POST http://localhost:8080/graphql -H 'Content-Type: application/json' -d '{\"query\":\"{ rooms { nodes { title } } }\"}'\n";
