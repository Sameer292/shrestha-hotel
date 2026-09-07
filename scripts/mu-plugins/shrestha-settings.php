<?php
/**
 * Plugin Name: Shrestha Hotel Settings
 * Description: Hotel Settings + Homepage content as options: staff-editable admin page, exposed in GraphQL, pings Next.js to revalidate on change.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) exit;

// Dynamic home URL (dev): serve WP on whatever whitelisted host the request
// came in on, so LAN IPs work without per-device hosts edits. Unknown hosts
// fall back to the canonical one (prevents Host-header cache poisoning).
if (!defined('WP_HOME')) {
    $sh_raw = strtolower($_SERVER['HTTP_HOST'] ?? '');
    $sh_parts = explode(':', $sh_raw, 2);
    $sh_h = $sh_parts[0];
    $sh_p = $sh_parts[1] ?? '';
    if (!in_array($sh_h, ['shrestha.localhost', '192.168.100.142', 'localhost'], true)) $sh_h = 'shrestha.localhost';
    if (!preg_match('/^\d{2,5}$/', $sh_p)) $sh_p = '8081';
    $sh_base = 'http://' . $sh_h . ($sh_p === '80' ? '' : ':' . $sh_p);
    define('WP_HOME', $sh_base);
    define('WP_SITEURL', $sh_base);
}

const SH_HOTEL_OPTION = 'sh_hotel';
const SH_HOME_OPTION = 'sh_home';

// ---------- defaults (mirror src/lib/wordpress/mock.ts) ----------
function sh_defaults() {
    $img = fn($u, $a) => ['url' => $u, 'alt' => $a];
    return [
        'hotel' => [
            'hotelName' => 'Shrestha Hotel Hotspring',
            'tagline' => 'Where the Mountains Meet Warm Waters',
            'phone' => '+977 9800000000',
            'secondaryPhone' => '',
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
        ],
        'home' => [
            'hero' => [
                'eyebrow' => 'SHRESTHA HOTEL HOTSPRING',
                'heading' => "Where the Mountains\nMeet Warm Waters",
                'subheading' => 'A peaceful Himalayan retreat shaped by nature, warm hospitality, and restorative natural hot springs.',
                'image' => $img('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&h=1080&q=80', 'Himalayan mountains at dawn — Myagdi'),
                'primaryCta' => 'Book Your Stay',
                'secondaryCta' => 'Explore the Hotel',
            ],
            'intro' => [
                'heading' => "Come for the mountains.\nStay for the warmth.",
                'body' => 'Nestled in the quiet folds of Myagdi, Shrestha Hotel Hotspring is a small, soulful retreat where forest air, stone and timber, and the hush of warm water set the rhythm of each day.',
                'images' => [
                    $img('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&h=1000&q=80', 'Timber lodge interior with warm light'),
                    $img('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&h=600&q=80', 'Pine forest and stone path'),
                ],
            ],
            'hotSpring' => [
                'heading' => "Nature's\nWarmest Welcome",
                'text' => 'Our natural hot spring is the heart of the hotel — mineral-rich waters gathered from deep Himalayan stone, held at a gentle warmth for slow, restorative bathing.',
                'image' => $img('https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&h=900&q=80', 'Stone-lined hot spring with steam at dawn'),
                'temperature' => '38–42°C',
                'hours' => '6:00 AM — 9:00 PM',
                'cta' => 'Discover the Hot Spring',
            ],
            'dining' => [
                'heading' => "From the Mountains\nto the Table",
                'text' => 'Food here follows the land — fresh, seasonal, and cooked with care.',
                'images' => [
                    $img('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=700&h=900&q=80', 'Mountain dining table with valley view'),
                    $img('https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=700&h=700&q=80', 'Nepali dal and wood-fired bread'),
                ],
                'cta' => 'Explore Dining',
            ],
            'finalCta' => [
                'heading' => 'The water is warm. The mountains are waiting.',
                'description' => 'Tell us when you would like to arrive — we will take care of everything else.',
                'image' => $img('https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1920&h=1080&q=80', 'Misty ridge at dawn'),
            ],
            'about' => [
                'heading' => "Hospitality,\nheld lightly",
                'body' => "Shrestha Hotel Hotspring began with a simple idea: a small place where people could be well — warm water, good food, and the quiet that the mountains do naturally.\n\nWe are a family-run retreat in Myagdi, built from local stone and timber, served by people from nearby villages who know the trails, the seasons, and how to remember your name.",
                'image' => $img('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&h=750&q=80', 'Timber lodge interior with warm light'),
            ],
        ],
    ];
}

function sh_get_hotel() {
    $d = sh_defaults()['hotel'];
    $o = get_option(SH_HOTEL_OPTION, []);
    return array_merge($d, is_array($o) ? $o : []);
}

function sh_media_list($v) {
    if (is_array($v) && isset($v['url'])) return [['url' => (string)($v['url'] ?? ''), 'alt' => (string)($v['alt'] ?? '')]];
    if (is_string($v)) {
        $out = [];
        foreach (preg_split('/\r?\n/', $v) as $line) {
            $line = trim($line);
            if ($line === '') continue;
            $parts = array_map('trim', explode('|', $line, 2));
            $out[] = ['url' => $parts[0], 'alt' => $parts[1] ?? ''];
        }
        return $out;
    }
    if (is_array($v)) return array_values(array_filter(array_map(fn($m) => ['url' => (string)($m['url'] ?? ''), 'alt' => (string)($m['alt'] ?? '')], $v), fn($m) => $m['url'] !== ''));
    return [];
}

function sh_get_home() {
    $d = sh_defaults()['home'];
    $o = get_option(SH_HOME_OPTION, []);
    if (!is_array($o)) $o = [];
    foreach (['hero', 'intro', 'hotSpring', 'dining', 'finalCta', 'about'] as $sec) {
        $d[$sec] = array_merge($d[$sec], $o[$sec] ?? []);
    }
    foreach (['hero', 'hotSpring', 'finalCta', 'about'] as $sec) {
        $d[$sec]['image'] = sh_media_list($d[$sec]['image'])[0] ?? ['url' => '', 'alt' => ''];
    }
    foreach (['intro', 'dining'] as $sec) {
        $d[$sec]['images'] = sh_media_list($d[$sec]['images']);
    }
    return $d;
}

// ---------- GraphQL ----------
add_action('graphql_register_types', function () {
    $str = ['type' => 'String'];
    register_graphql_object_type('ShMedia', [
        'description' => 'Image with alt text',
        'fields' => ['url' => $str, 'alt' => $str],
    ]);
    $media = ['type' => 'ShMedia'];
    $mediaList = ['type' => ['list_of' => 'ShMedia']];
    register_graphql_object_type('ShHero', ['fields' => [
        'eyebrow' => $str, 'heading' => $str, 'subheading' => $str,
        'image' => $media, 'primaryCta' => $str, 'secondaryCta' => $str,
    ]]);
    register_graphql_object_type('ShIntro', ['fields' => [
        'heading' => $str, 'body' => $str, 'images' => $mediaList,
    ]]);
    register_graphql_object_type('ShHotSpring', ['fields' => [
        'heading' => $str, 'text' => $str, 'image' => $media,
        'temperature' => $str, 'hours' => $str, 'cta' => $str,
    ]]);
    register_graphql_object_type('ShDining', ['fields' => [
        'heading' => $str, 'text' => $str, 'images' => $mediaList, 'cta' => $str,
    ]]);
    register_graphql_object_type('ShFinalCta', ['fields' => [
        'heading' => $str, 'description' => $str, 'image' => $media,
    ]]);
    register_graphql_object_type('ShAbout', ['fields' => [
        'heading' => $str, 'body' => $str, 'image' => $media,
    ]]);
    register_graphql_object_type('ShHomeContent', ['fields' => [
        'hero' => ['type' => 'ShHero'],
        'intro' => ['type' => 'ShIntro'],
        'hotSpring' => ['type' => 'ShHotSpring'],
        'dining' => ['type' => 'ShDining'],
        'finalCta' => ['type' => 'ShFinalCta'],
        'about' => ['type' => 'ShAbout'],
    ]]);
    register_graphql_object_type('ShHotelSettings', ['fields' => [
        'hotelName' => $str, 'tagline' => $str, 'phone' => $str, 'secondaryPhone' => $str,
        'email' => $str, 'whatsapp' => $str, 'address' => $str,
        'googleMapsUrl' => $str, 'googleMapsEmbed' => $str,
        'latitude' => $str, 'longitude' => $str,
        'instagram' => $str, 'facebook' => $str, 'tripadvisor' => $str,
        'bookingUrl' => $str, 'checkIn' => $str, 'checkOut' => $str,
        'currency' => $str, 'footerDescription' => $str,
    ]]);
    register_graphql_field('RootQuery', 'hotelSettings', [
        'type' => 'ShHotelSettings',
        'description' => 'Global hotel settings (Hotel Content admin page)',
        'resolve' => fn() => sh_get_hotel(),
    ]);
    register_graphql_field('RootQuery', 'homeContent', [
        'type' => 'ShHomeContent',
        'description' => 'Homepage content (Hotel Content admin page)',
        'resolve' => fn() => sh_get_home(),
    ]);
});

// ---------- admin page ----------
function sh_field_defs() {
    // [option, section, key, label, type(text|textarea|images)]
    $F = [];
    foreach ([
        ['hotelName', 'Hotel name', 'text'], ['tagline', 'Tagline', 'text'],
        ['phone', 'Phone', 'text'], ['secondaryPhone', 'Secondary phone', 'text'],
        ['email', 'Email', 'text'], ['whatsapp', 'WhatsApp number', 'text'],
        ['address', 'Address', 'text'], ['googleMapsUrl', 'Google Maps URL', 'text'],
        ['googleMapsEmbed', 'Google Maps embed URL', 'textarea'],
        ['latitude', 'Latitude', 'text'], ['longitude', 'Longitude', 'text'],
        ['instagram', 'Instagram URL', 'text'], ['facebook', 'Facebook URL', 'text'],
        ['tripadvisor', 'Tripadvisor URL', 'text'], ['bookingUrl', 'Booking URL', 'text'],
        ['checkIn', 'Check-in', 'text'], ['checkOut', 'Check-out', 'text'],
        ['currency', 'Currency', 'text'], ['footerDescription', 'Footer description', 'textarea'],
    ] as [$k, $l, $t]) $F[] = [SH_HOTEL_OPTION, 'hotel', $k, $l, $t];
    $H = [
        ['hero', 'eyebrow', 'Hero eyebrow', 'text'], ['hero', 'heading', 'Hero heading', 'textarea'],
        ['hero', 'subheading', 'Hero subheading', 'textarea'], ['hero', 'image', 'Hero image (URL | alt)', 'images'],
        ['hero', 'primaryCta', 'Hero primary button', 'text'], ['hero', 'secondaryCta', 'Hero secondary button', 'text'],
        ['intro', 'heading', 'Intro heading', 'textarea'], ['intro', 'body', 'Intro body', 'textarea'],
        ['intro', 'images', 'Intro images (one URL | alt per line)', 'images'],
        ['hotSpring', 'heading', 'Hot spring heading', 'textarea'], ['hotSpring', 'text', 'Hot spring text', 'textarea'],
        ['hotSpring', 'image', 'Hot spring image (URL | alt)', 'images'],
        ['hotSpring', 'temperature', 'Temperature', 'text'], ['hotSpring', 'hours', 'Hours', 'text'],
        ['hotSpring', 'cta', 'Hot spring button', 'text'],
        ['dining', 'heading', 'Dining heading', 'textarea'], ['dining', 'text', 'Dining text', 'textarea'],
        ['dining', 'images', 'Dining images (one URL | alt per line)', 'images'], ['dining', 'cta', 'Dining button', 'text'],
        ['finalCta', 'heading', 'Final CTA heading', 'textarea'], ['finalCta', 'description', 'Final CTA description', 'textarea'],
        ['finalCta', 'image', 'Final CTA image (URL | alt)', 'images'],
        ['about', 'heading', 'About heading', 'textarea'], ['about', 'body', 'About story', 'textarea'],
        ['about', 'image', 'About photo (URL | alt)', 'images'],
    ];
    foreach ($H as [$sec, $k, $l, $t]) $F[] = [SH_HOME_OPTION, $sec, $k, $l, $t];
    return $F;
}

function sh_opt_val($opt, $sec, $key) {
    if ($opt === SH_HOTEL_OPTION) {
        $all = sh_get_hotel();
        return $all[$key] ?? '';
    }
    $all = sh_get_home();
    $v = $all[$sec][$key] ?? '';
    if (is_array($v) && isset($v[0]['url'])) {
        return implode("\n", array_map(fn($m) => trim($m['url'] . ' | ' . $m['alt'], ' |'), $v));
    }
    if (is_array($v)) return ($v['url'] ?? '') . ' | ' . ($v['alt'] ?? '');
    return (string)$v;
}

add_action('admin_menu', function () {
    add_menu_page('Hotel Content', 'Hotel Content', 'edit_posts', 'sh-hotel-content', 'sh_render_page', 'dashicons-admin-home', 30);
});

add_action('admin_init', function () {
    register_setting('sh_hotel_group', SH_HOTEL_OPTION, ['sanitize_callback' => 'sh_sanitize_hotel']);
    register_setting('sh_hotel_group', SH_HOME_OPTION, ['sanitize_callback' => 'sh_sanitize_home']);
    add_settings_section('sh_main', 'Managed by the website team — changes go live on the site within a minute.', '__return_false', 'sh-hotel-content');
    foreach (sh_field_defs() as $i => [$opt, $sec, $key, $label, $type]) {
        add_settings_field("sh_f_$i", $label, 'sh_render_field', 'sh-hotel-content', 'sh_main', [$opt, $sec, $key, $type]);
    }
});

function sh_sanitize_hotel($in) {
    $out = [];
    if (!is_array($in)) return $out;
    foreach ($in as $k => $v) $out[sanitize_key($k)] = is_string($v) && str_contains($k, 'mbed') || str_contains($k, 'escription') ? sanitize_textarea_field($v) : sanitize_text_field((string)$v);
    return $out;
}

function sh_sanitize_home($in) {
    $out = [];
    if (!is_array($in)) return $out;
    foreach ($in as $sec => $fields) {
        if (!is_array($fields)) continue;
        foreach ($fields as $k => $v) {
            $v = (string)$v;
            $out[sanitize_key($sec)][sanitize_key($k)] = str_contains((string)$v, "\n") ? sanitize_textarea_field($v) : sanitize_text_field($v);
        }
    }
    return $out;
}

function sh_render_field($args) {
    [$opt, $sec, $key, $type] = $args;
    $name = esc_attr($opt . ($opt === SH_HOME_OPTION ? "[$sec]" : '') . "[$key]");
    $val = sh_opt_val($opt, $sec, $key);
    if ($type === 'text') {
        echo '<input type="text" class="regular-text" name="' . $name . '" value="' . esc_attr($val) . '" />';
    } else {
        echo '<textarea class="large-text" rows="' . ($type === 'images' ? 3 : 4) . '" name="' . $name . '">' . esc_textarea($val) . '</textarea>';
        if ($type === 'images') echo '<p class="description">Upload in Media Library, then paste URL and alt text: <code>https://…/photo.jpg | Alt text</code></p>';
    }
}

function sh_render_page() {
    echo '<div class="wrap"><h1>Hotel Content</h1>';
    echo '<form method="post" action="options.php">';
    settings_fields('sh_hotel_group');
    do_settings_sections('sh-hotel-content');
    submit_button();
    echo '</form></div>';
}

// ---------- revalidate Next.js on change ----------
function sh_env($key) {
    // Docker passes real env; Hestia (panel PHP) uses wp-config.php constants
    $v = getenv($key);
    if ($v) return $v;
    return defined($key) ? constant($key) : null;
}

function sh_revalidate($paths = ['/']) {
    $base = sh_env('NEXT_APP_URL');
    $secret = sh_env('REVALIDATE_SECRET');
    if (!$base || !$secret) return;
    foreach ((array)$paths as $p) {
        wp_remote_post(rtrim($base, '/') . '/api/revalidate', [
            'headers' => ['x-revalidate-secret' => $secret, 'Content-Type' => 'application/json'],
            'body' => json_encode(['path' => $p]),
            'timeout' => 3, 'blocking' => false,
        ]);
    }
}

add_action('save_post', function ($post_id, $post) {
    if (wp_is_post_autosave($post_id) || wp_is_post_revision($post_id)) return;
    $map = [
        'room' => ['/', '/stay', '/stay/' . $post->post_name],
        'experience' => ['/', '/experiences', '/experiences/' . $post->post_name],
        'testimonial' => ['/'], 'gallery_item' => ['/', '/gallery'],
        'faq' => ['/'], 'offer' => ['/'],
    ];
    if (isset($map[$post->post_type])) sh_revalidate($map[$post->post_type]);
}, 10, 2);

add_action('update_option_' . SH_HOTEL_OPTION, fn() => sh_revalidate(['/']), 10, 0);
add_action('update_option_' . SH_HOME_OPTION, fn() => sh_revalidate(['/']), 10, 0);
