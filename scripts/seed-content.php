<?php
/**
 * Seed ALL content: 8 page entries (plain ACF fields, no repeaters —
 * except the dining meals cards) + item CPT posts (rooms, experiences,
 * testimonials, gallery items, FAQs — one post per item).
 * Run: docker compose run --rm wpcli --path=/var/www/html eval-file /tmp/seed-content.php
 * (copy this file to /tmp inside the container first — never put it in
 * mu-plugins, it would auto-load during bootstrap and crash.)
 * Idempotent: upserts every entry by slug. Wipes stale repeater meta left
 * over from the old nested-repeaters layout.
 */

// ---------- helpers ----------
function sh_seed_page($type, $slug, $title, $content, $excerpt, $meta) {
    $posts = get_posts(['post_type' => $type, 'name' => $slug, 'post_status' => 'any', 'numberposts' => 1]);
    if ($posts) {
        $id = $posts[0]->ID;
        wp_update_post(['ID' => $id, 'post_title' => $title, 'post_content' => $content, 'post_excerpt' => $excerpt]);
        echo "~ updated $title ($id)\n";
    } else {
        $id = wp_insert_post(['post_type' => $type, 'post_name' => $slug, 'post_title' => $title, 'post_content' => $content, 'post_excerpt' => $excerpt, 'post_status' => 'publish']);
        echo "+ created $title ($id)\n";
    }
    foreach ($meta as $k => $v) update_post_meta($id, $k, $v);
    return $id;
}

// One post per list item. Title = name, content = long description,
// excerpt = short excerpt, featured image = card/hero photo (attach via
// Media Library, or run seed-images.php for demo photos).
function sh_seed_item($type, $slug, $title, $content, $excerpt, $meta) {
    return sh_seed_page($type, $slug, $title, $content, $excerpt, $meta);
}

// Removes repeater meta (count + per-row sub-keys + key refs) left over
// from the old layout where items lived inside page entries.
function sh_wipe_repeater($id, $name) {
    global $wpdb;
    $wpdb->query($wpdb->prepare(
        "DELETE FROM $wpdb->postmeta WHERE post_id = %d AND (meta_key = %s OR meta_key = %s OR meta_key LIKE %s OR meta_key LIKE %s)",
        $id, $name, '_' . $name, $wpdb->esc_like($name) . '\_%', $wpdb->esc_like('_' . $name) . '\_%'
    ));
}

// Writes a repeater in exact ACF storage format (count + per-row sub-keys
// + field-key references), wiping stale keys first. Only used for the
// dining meals cards (page-section content, no detail page by design).
function sh_seed_repeater($id, $name, $fkey, $rows, $subkeys) {
    global $wpdb;
    $wpdb->query($wpdb->prepare(
        "DELETE FROM $wpdb->postmeta WHERE post_id = %d AND (meta_key = %s OR meta_key LIKE %s)",
        $id, $name, $wpdb->esc_like($name) . '\_%'
    ));
    update_post_meta($id, $name, count($rows));
    update_post_meta($id, '_' . $name, $fkey);
    foreach ($rows as $i => $row) {
        foreach ($subkeys as $sub => $skey) {
            update_post_meta($id, "{$name}_{$i}_{$sub}", isset($row[$sub]) ? (string)$row[$sub] : '');
            update_post_meta($id, "_{$name}_{$i}_{$sub}", $skey);
        }
    }
}

// ---------- HOME ----------
echo "==> Home Content...\n";
$hid = sh_seed_page('home_content', 'home', 'Home',
    'Come for the mountains. Stay for the warmth.',
    'Where the Mountains Meet Warm Waters',
    [
        'hotelName' => 'Shrestha Hotel Hotspring',
        'tagline' => 'Where the Mountains Meet Warm Waters',
        'subtagline' => 'A peaceful Himalayan retreat shaped by nature, warm hospitality, and restorative natural hot springs.',
        'heroEyebrow' => 'SHRESTHA HOTEL HOTSPRING',
        'heroPrimaryCta' => 'Book Your Stay', 'heroPrimaryCtaUrl' => '/booking',
        'heroSecondaryCta' => 'Explore the Hotel', 'heroSecondaryCtaUrl' => '/stay',
        'storyEyebrow' => 'Our Story',
        'storyHeading' => "Come for the mountains.\nStay for the warmth.",
        'storyBody' => 'Nestled in the quiet folds of Myagdi, Shrestha Hotel Hotspring is a small, soulful retreat where forest air, stone and timber, and the hush of warm water set the rhythm of each day. Here, mornings begin with mist over the ridges and evenings end in the quiet glow of the hot spring — a place to slow down, breathe deeper, and feel held by the mountains.',
        'storyStats' => "12 | Rooms & Suites\n38–42° | Hot Spring\nSince | Myagdi",
        'locationHeading' => "In the quiet\nof Myagdi",
        'locationText' => 'Set in Beni, gateway to the Annapurna and Dhaulagiri trails — where the valley holds warmth and the ridges hold silence. Close enough to reach, far enough to feel away.',
        'footerTagline' => '', 'footerSubtagline' => '',
        'finalCtaHeading' => 'Your Mountain Escape Awaits',
        'finalCtaDescription' => "Let the hot spring hold the day's quiet. Let the mountains do the rest.",
        'finalCtaPrimaryCta' => 'Book Your Stay', 'finalCtaPrimaryCtaUrl' => '/booking',
        'finalCtaSecondaryCta' => 'Contact Us', 'finalCtaSecondaryCtaUrl' => '/contact',
    ]);
sh_wipe_repeater($hid, 'testimonials');

// ---------- STAY ----------
echo "==> Stay Page...\n";
$sid = sh_seed_page('stay_page', 'stay', 'Stay',
    'Timber, stone and linen — each room faces the valley or forest, with private baths and direct access to the hot spring.', '',
    [
        'heroEyebrow' => 'Stay',
        'heading' => "Rooms shaped by\nmountain quiet",
        'subheading' => 'Timber, stone and linen — each room faces the valley or forest, with private baths and direct access to the hot spring.',
        'sidebarText' => 'This is a reservation inquiry — no fake availability. Integrates with your PMS/booking engine via the Booking URL in WordPress settings.',
        'ctaLabel' => 'Check Availability', 'ctaUrl' => '/booking',
        'secondaryCtaLabel' => 'Ask a Question', 'secondaryCtaUrl' => '/contact',
    ]);
sh_wipe_repeater($sid, 'rooms');

// ---------- ROOMS (one post per room) ----------
echo "==> Rooms...\n";
$rooms = [
    ['forest-retreat-suite', 'Forest Retreat Suite', 'Timber, stone and valley light — our most private suite.',
        'A generous corner suite wrapped in timber and linen, with a private balcony facing the forested ridge. Stone bath, warm wood floors, and quiet mornings with tea as mist lifts from the valley. Designed for lingering.',
        ['startingPrice' => 18500, 'currency' => 'NPR', 'capacity' => 2, 'adults' => 2, 'children' => 1, 'bedType' => 'King Bed', 'roomSize' => '38 m²', 'view' => 'Forest & Valley View', 'amenities' => "Mountain View\nHot Spring Access\nPrivate Bathroom\nHeating\nBalcony\nWi-Fi\nGarden View", 'checkIn' => '2:00 PM', 'checkOut' => '11:00 AM', 'featured' => 1, 'displayOrder' => 1]],
    ['hotspring-deluxe', 'Hotspring Deluxe', 'Steps from the spring — warmth, whenever you want it.',
        'Closest to the hot spring baths, this warm, grounded room pairs oak details with soft cream linen. Ideal for guests who come for the water and stay for the quiet. Private sit-out with valley glimpses.',
        ['startingPrice' => 14500, 'currency' => 'NPR', 'capacity' => 2, 'adults' => 2, 'children' => 1, 'bedType' => 'Queen Bed', 'roomSize' => '28 m²', 'view' => 'Garden & Spring View', 'amenities' => "Hot Spring Access\nMountain View\nPrivate Bathroom\nHeating\nWi-Fi\nRoom Service", 'checkIn' => '2:00 PM', 'checkOut' => '11:00 AM', 'featured' => 1, 'displayOrder' => 2]],
    ['mountain-family-retreat', 'Mountain Family Retreat', 'Space for togetherness, framed by the Himalayas.',
        'Two connected spaces, warm timber bunk and a king bed, with room for small travelers and quiet corners for tea. Large windows bring the ridge inside. Interconnecting option available.',
        ['startingPrice' => 22000, 'currency' => 'NPR', 'capacity' => 4, 'adults' => 3, 'children' => 2, 'bedType' => 'King + Bunk', 'roomSize' => '45 m²', 'view' => 'Mountain Panorama', 'amenities' => "Family Rooms\nMountain View\nHot Spring Access\nHeating\nBalcony\nWi-Fi", 'checkIn' => '2:00 PM', 'checkOut' => '11:00 AM', 'featured' => 1, 'displayOrder' => 3]],
    ['riverside-calm', 'Riverside Calm', 'Intimate, quiet — the sound of water nearby.',
        'A small, deeply calm room near the riverside walk. Perfect for solo travelers or couples seeking simplicity: warm blanket, good book, balcony chair and the evening sound of water.',
        ['startingPrice' => 11500, 'currency' => 'NPR', 'capacity' => 2, 'adults' => 2, 'children' => 0, 'bedType' => 'Queen Bed', 'roomSize' => '24 m²', 'view' => 'River & Forest', 'amenities' => "Hot Spring Access\nPrivate Bathroom\nWi-Fi\nHeating", 'checkIn' => '2:00 PM', 'checkOut' => '11:00 AM', 'featured' => 0, 'displayOrder' => 4]],
];
foreach ($rooms as [$slug, $name, $excerpt, $desc, $meta]) {
    sh_seed_item('room', $slug, $name, $desc, $excerpt, $meta);
}

// ---------- HOT SPRING ----------
echo "==> Hot Spring Page...\n";
$hsid = sh_seed_page('hot_spring_page', 'hot-spring', 'Hot Spring',
    'Mineral-rich waters, held at a gentle warmth for slow, restorative bathing.', '',
    [
        'heroEyebrow' => 'Hot Spring',
        'heading' => 'A spring the mountain kept',
        'subheading' => 'Mineral-rich waters, held at a gentle warmth for slow, restorative bathing — surrounded by timber, steam and forest light.',
        'teaserHeading' => "Nature's\nWarmest Welcome",
        'teaserText' => 'Our natural hot spring is the heart of the hotel — mineral-rich waters gathered from deep Himalayan stone, held at a gentle warmth for slow, restorative bathing.',
        'temperature' => '38–42°C', 'hours' => '6:00 AM — 9:00 PM',
        'bullets' => "Designed for relaxation and restoration\nIndoor & open-air pools • guest access included\nQuiet hours before 9AM — steam and silence",
        'body' => 'Please note: we describe the spring as designed for relaxation and restoration — not as a medical treatment.',
        'cards' => "Temperature | Mineral-rich • stone-lined\nHours | Guest access included\nAccess | Indoor & open-air • Quiet hours before 9AM",
        'etiquette' => "Please shower before entering the baths.\nKeep voices low — the spring is a place for quiet.\nChildren must be accompanied by an adult.\nManage time in the water — step out to cool when needed.\nFollow posted signage for indoor vs. open-air pools.",
        'sidebarTitle' => 'Plan your soak',
        'sidebarText' => 'The spring is best at dawn and after walks. Staying guests have complimentary access. Day access is not offered — the water is kept for guests of the house.',
        'ctaLabel' => 'Stay to Soak', 'ctaUrl' => '/booking',
        'cta' => 'Discover the Hot Spring', 'teaserCtaUrl' => '/hot-spring',
        'faqCategory' => 'Hot Spring',
    ]);
sh_wipe_repeater($hsid, 'faqs');

// ---------- FAQs (one post per FAQ) ----------
echo "==> FAQs...\n";
$faqs = [
    ['is-the-hot-spring-natural', 'Is the hot spring natural?', 'Yes — mineral-rich water sourced from deep Himalayan springs, maintained at 38–42°C for comfortable bathing.', 'Hot Spring', 1],
    ['who-can-use-the-hot-spring', 'Who can use the hot spring?', 'All staying guests have complimentary access. Please shower before entering and follow posted etiquette.', 'Hot Spring', 2],
    ['what-are-check-in-and-check-out-times', 'What are check-in and check-out times?', 'Check-in from 2:00 PM, check-out by 11:00 AM. Early check-in/late check-out on request, subject to availability.', 'Stay', 3],
    ['is-the-hotel-suitable-for-families', 'Is the hotel suitable for families?', "Yes — we have family rooms and interconnecting options. Please mention children's ages when booking.", 'Stay', 4],
];
foreach ($faqs as [$slug, $q, $a, $cat, $order]) {
    sh_seed_item('faq', $slug, $q, $a, '', ['question' => $q, 'answer' => $a, 'category' => $cat, 'displayOrder' => $order]);
}

// ---------- EXPERIENCES ----------
echo "==> Experiences Page...\n";
$eid = sh_seed_page('experiences_page', 'experiences', 'Experiences',
    'Small groups, local guides, weather-wise timing — every experience is arranged by our team.', '',
    [
        'heroEyebrow' => 'Experiences',
        'heading' => 'What the day asks for',
        'subheading' => 'Small groups, local guides, weather-wise timing — every experience is arranged by our team.',
        'sidebarTitle' => 'Book this experience',
        'sidebarText' => 'Mention this experience when you book your stay — our team will arrange timing around weather and season.',
        'ctaLabel' => 'Enquire to Book', 'ctaUrl' => '/booking',
    ]);
sh_wipe_repeater($eid, 'experiences');

// ---------- EXPERIENCE POSTS (one post per experience) ----------
echo "==> Experiences...\n";
$exps = [
    ['natural-hot-spring-bathing', 'Natural Hot Spring Bathing', 'Mineral-rich waters held at a gentle warmth.',
        "The spring is the hotel's quiet center. Bathe at dawn when steam lifts into forest light, or after a walk when legs are tired. Indoor and open-air pools, stone-lined, with space for silence.",
        ['duration' => 'Open daily 6AM–9PM', 'difficulty' => 'Easy', 'season' => 'Year-round', 'featured' => 1]],
    ['mountain-walks', 'Mountain Walks', 'Unmarked trails through rhododendron and pine.',
        'Guided or self-led walks from the hotel gate — ridge viewpoints, village paths and forest loops. Mornings are clearest.',
        ['duration' => '1–4 hours', 'difficulty' => 'Easy to Moderate', 'season' => 'Sep–May best', 'featured' => 1]],
    ['village-exploration', 'Village Exploration', 'Tea houses, terraced fields and unhurried conversation.',
        'Walk to nearby villages, meet makers and farmers, taste local milks and honeys. A gentle immersion in Myagdi life.',
        ['duration' => '2–3 hours', 'difficulty' => 'Easy', 'season' => 'Year-round', 'featured' => 1]],
    ['riverside-relaxation', 'Riverside Relaxation', "Sit by the Kali Gandaki's quiet stretches.",
        'A short walk to river stones and shade. Bring tea, a book, or nothing at all.',
        ['duration' => 'Flexible', 'difficulty' => 'Easy', 'season' => 'Year-round', 'featured' => 0]],
    ['bonfire-evenings', 'Bonfire Evenings', 'Firelight, stories and warm plates shared outside.',
        'When the evening cools, we gather by the fire — music, tea, and mountain air.',
        ['duration' => 'Evenings', 'difficulty' => 'Easy', 'season' => 'Oct–Apr', 'featured' => 1]],
    ['scenic-viewpoints', 'Scenic Viewpoints', 'Wide horizons, best at sunrise.',
        'Short drives to viewpoints over Dhaulagiri and Annapurna on clear days.',
        ['duration' => 'Half-day', 'difficulty' => 'Easy', 'season' => 'Oct–Apr', 'featured' => 0]],
];
foreach ($exps as [$slug, $name, $excerpt, $desc, $meta]) {
    sh_seed_item('experience', $slug, $name, $desc, $excerpt, $meta);
}

// ---------- TESTIMONIALS (one post per testimonial) ----------
echo "==> Testimonials...\n";
$testimonials = [
    ['aarav-meera', 'Aarav & Meera', 'Kathmandu, Nepal', 'We came for the hot spring and stayed for the quiet. The kind of place that slows your breath without asking you to.', 5, 1],
    ['sophie-l', 'Sophie L.', 'Lyon, France', 'Warm water under open sky, forest all around, and staff who remember how you take your tea. Perfect.', 5, 1],
    ['rajesh-k', 'Rajesh K.', 'Pokhara, Nepal', "Clean, calm, deeply Nepali in its hospitality. The rooms feel like a mountain home, not a hotel.", 5, 1],
];
foreach ($testimonials as [$slug, $name, $place, $quote, $rating, $featured]) {
    sh_seed_item('testimonial', $slug, $name, $quote, '', ['guestName' => $name, 'guestLocation' => $place, 'quote' => $quote, 'rating' => $rating, 'featured' => $featured]);
}

// ---------- DINING ----------
echo "==> Dining Page...\n";
$did = sh_seed_page('dining_page', 'dining', 'Dining',
    'Food here follows the land — fresh, seasonal, and cooked with care.', '',
    [
        'heroEyebrow' => 'Dining',
        'heading' => "From the Mountains\nto the Table",
        'subheading' => 'Food here follows the land — fresh, seasonal, and cooked with care. Warm dal and gundruk from nearby farms, wood-fired breads, mountain herbs, and Nepali hospitality served without hurry. Dine looking out to the valley, or by the fire when the evening turns cool.',
        'teaserHeading' => "From the Mountains\nto the Table",
        'teaserText' => 'Food here follows the land — fresh, seasonal, and cooked with care.',
        'cta' => 'Explore Dining', 'teaserCtaUrl' => '/dining',
    ]);
sh_seed_repeater($did, 'meals', 'field_sh_dpg_meals', [
    ['title' => 'Breakfast', 'text' => 'Warm breads, mountain honey, seasonal fruit — served until 10:30 AM.'],
    ['title' => 'Lunch & Dinner', 'text' => 'Dal, thali, wood-fired plates and valley herbs. Vegetarian options always available.'],
    ['title' => 'Dietary', 'text' => 'Tell us your needs when booking — we cook with care for allergies and preferences.'],
], ['title' => 'field_sh_dpg_ml_title', 'text' => 'field_sh_dpg_ml_text']);

// ---------- GALLERY ----------
echo "==> Gallery Page...\n";
$gid = sh_seed_page('gallery_page', 'gallery', 'Gallery', 'A place in pictures.', '',
    ['heroEyebrow' => 'Gallery', 'heading' => 'A place in pictures', 'subheading' => '']);
sh_wipe_repeater($gid, 'photos');

// ---------- GALLERY ITEMS (one post per photo) ----------
echo "==> Gallery Items...\n";
$photos = [
    ['timber-and-stone-lobby-at-dusk', 'Timber and stone lobby at dusk', 'Hotel', 1],
    ['steam-rising-at-dawn', 'Steam rising at dawn', 'Hot Spring', 2],
    ['forest-suite-photo', 'Forest Retreat Suite', 'Rooms', 3],
    ['misty-ridge-morning', 'Misty ridge morning', 'Nature', 4],
    ['wood-fired-bread-and-dal', 'Wood-fired bread and dal', 'Dining', 5],
    ['village-walk', 'Village walk', 'Experiences', 6],
    ['river-stones', 'River stones', 'Nature', 7],
    ['open-air-bath', 'Open-air bath', 'Hot Spring', 8],
];
foreach ($photos as [$slug, $title, $cat, $order]) {
    sh_seed_item('gallery_item', $slug, $title, '', '', ['category' => $cat, 'caption' => $title, 'displayOrder' => $order]);
}

// ---------- ABOUT ----------
echo "==> About Page...\n";
sh_seed_page('about_page', 'about', 'About',
    'Shrestha Hotel Hotspring began with a simple idea: a small place where people could be well.',
    '',
    [
        'heroEyebrow' => 'About',
        'heading' => "Hospitality,\nheld lightly",
        'stats' => "Local | Built and run with Myagdi families\nSmall | 12 rooms — calm over crowds\nWarm | Hot spring at the heart",
    ]);

// ---------- CONTACT ----------
echo "==> Contact Page...\n";
sh_seed_page('contact_page', 'contact', 'Contact',
    'We reply within a few hours. For urgent requests, call or WhatsApp.', '',
    [
        'heroEyebrow' => 'Contact',
        'heading' => "We're here to help\nyou arrive",
        'subheading' => 'We reply within a few hours. For urgent requests, call or WhatsApp.',
        'sidebarTitle' => 'Send a message',
    ]);

echo "\nSeed complete. Attach Featured images per item/page in WP Admin (or run seed-images.php for demo photos).\n";
