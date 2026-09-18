<?php
/**
 * Plugin Name: Shrestha Hotel Settings
 * Description: Global hotel settings (contact, socials, check-in/out…): staff-editable admin page, exposed in GraphQL, pings Next.js to revalidate on change. Page content lives on the page CPTs — not here.
 * Version: 2.0.0
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

// ---------- defaults (mirror src/lib/wordpress/mock.ts) ----------
function sh_defaults() {
    return [
            'hotelName' => 'Shrestha Hotel Hotspring',
            'tagline' => 'Where the Mountains Meet Warm Waters',
            'subtagline' => 'A peaceful Himalayan retreat shaped by nature, warm hospitality, and restorative natural hot springs.',
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
            'logoUrl' => '',
    ];
}

function sh_home_content_identity() {
    // Canonical hotel identity lives on the Home Content CPT (single
    // source). Reads post meta directly — never calls sh_get_hotel(),
    // so there is no recursion. Empty when the CPT entry is missing
    // (fresh install before seeding) and callers fall back to option.
    static $cache = null;
    if ($cache !== null) return $cache;
    $cache = [];
    if (!post_type_exists('home_content')) return $cache;
    $posts = get_posts(['post_type' => 'home_content', 'post_status' => 'publish', 'numberposts' => 1, 'no_found_rows' => true]);
    if (!$posts) return $cache;
    $id = $posts[0]->ID;
    foreach (['hotelName', 'tagline', 'subtagline', 'heroEyebrow'] as $k) {
        $v = trim((string)get_post_meta($id, $k, true));
        if ($v !== '') $cache[$k] = $v;
    }
    return $cache;
}

function sh_get_hotel() {
    $d = sh_defaults();
    $o = get_option(SH_HOTEL_OPTION, []);
    $merged = array_merge($d, is_array($o) ? $o : []);
    // Home Content CPT wins over the legacy option for identity fields.
    foreach (['hotelName', 'tagline', 'subtagline'] as $k) {
        $v = sh_home_content_identity()[$k] ?? '';
        if ($v !== '') $merged[$k] = $v;
    }
    return $merged;
}

// ---------- GraphQL ----------
add_action('graphql_register_types', function () {
    $str = ['type' => 'String'];
    register_graphql_object_type('ShHotelSettings', ['fields' => [
        'hotelName' => $str, 'tagline' => $str, 'subtagline' => $str,
        'phone' => $str, 'secondaryPhone' => $str,
        'email' => $str, 'whatsapp' => $str, 'address' => $str,
        'googleMapsUrl' => $str, 'googleMapsEmbed' => $str,
        'latitude' => $str, 'longitude' => $str,
        'instagram' => $str, 'facebook' => $str, 'tripadvisor' => $str,
        'bookingUrl' => $str, 'checkIn' => $str, 'checkOut' => $str,
        'currency' => $str, 'footerDescription' => $str,
        'logoUrl' => $str,
    ]]);
    register_graphql_field('RootQuery', 'hotelSettings', [
        'type' => 'ShHotelSettings',
        'description' => 'Global hotel settings (Hotel Content admin page)',
        'resolve' => fn() => sh_get_hotel(),
    ]);
});

// ---------- admin page ----------
function sh_field_defs() {
    // [option, section, key, label, type(text|textarea|images)]
    $F = [];
    // NOTE: hotel name / tagline / sub-tagline are edited on the
    // Home Content CPT (single source) — not here.
    foreach ([
        ['phone', 'Phone', 'text'], ['secondaryPhone', 'Secondary phone', 'text'],
        ['email', 'Email', 'text'], ['whatsapp', 'WhatsApp number', 'text'],
        ['address', 'Address', 'text'], ['googleMapsUrl', 'Google Maps URL', 'text'],
        ['googleMapsEmbed', 'Google Maps embed URL', 'textarea'],
        ['latitude', 'Latitude', 'text'], ['longitude', 'Longitude', 'text'],
        ['instagram', 'Instagram URL', 'text'], ['facebook', 'Facebook URL', 'text'],
        ['tripadvisor', 'Tripadvisor URL', 'text'], ['bookingUrl', 'Booking URL', 'text'],
        ['checkIn', 'Check-in', 'text'], ['checkOut', 'Check-out', 'text'],
        ['currency', 'Currency', 'text'], ['footerDescription', 'Footer description', 'textarea'],
        ['logoUrl', 'Logo image URL (upload in Media Library, paste file URL — empty = monogram)', 'text'],
    ] as [$k, $l, $t]) $F[] = [SH_HOTEL_OPTION, 'hotel', $k, $l, $t];
    // NOTE: page content (hero, story, hot spring, dining, location,
    // final CTA, about) is edited on the Home Content + page CPTs —
    // not here. Hotel Content keeps operational globals only.
    return $F;
}

function sh_opt_val($opt, $sec, $key) {
    $all = sh_get_hotel();
    return $all[$key] ?? '';
}

add_action('admin_menu', function () {
    add_menu_page('Hotel Content', 'Hotel Content', 'edit_posts', 'sh-hotel-content', 'sh_render_page', 'dashicons-admin-home', 30);
});

add_action('admin_init', function () {
    register_setting('sh_hotel_group', SH_HOTEL_OPTION, ['sanitize_callback' => 'sh_sanitize_hotel']);
    add_settings_section('sh_main', 'Managed by the website team — changes go live on the site within a minute.', '__return_false', 'sh-hotel-content');
    foreach (sh_field_defs() as $i => [$opt, $sec, $key, $label, $type]) {
        add_settings_field("sh_f_$i", $label, 'sh_render_field', 'sh-hotel-content', 'sh_main', [$opt, $sec, $key, $type]);
    }
});

// NOTE: option keys are camelCase (hotelName, googleMapsUrl…).
// Never run sanitize_key() on keys — it lowercases them so saved values
// stop matching defaults in sh_get_hotel() and edits silently
// revert. Whitelist against sh_defaults() instead; sanitize values only.
function sh_sanitize_hotel($in) {
    $out = [];
    if (!is_array($in)) return $out;
    $allowed = array_keys(sh_defaults());
    $textarea_keys = ['googleMapsEmbed', 'footerDescription', 'subtagline'];
    $url_keys = ['logoUrl', 'googleMapsUrl', 'instagram', 'facebook', 'tripadvisor', 'bookingUrl'];
    foreach ($in as $k => $v) {
        if (!is_string($k) || !in_array($k, $allowed, true)) continue;
        $v = (string)$v;
        if (in_array($k, $url_keys, true)) $out[$k] = esc_url_raw($v);
        else $out[$k] = in_array($k, $textarea_keys, true) ? sanitize_textarea_field($v) : sanitize_text_field($v);
    }
    return $out;
}

function sh_render_field($args) {
    [$opt, $sec, $key, $type] = $args;
    $name = esc_attr($opt . "[$key]");
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
        // Page CPTs (single entry each)
        'home_content' => ['/'],
        'stay_page' => ['/', '/stay'],
        'hot_spring_page' => ['/', '/hot-spring'],
        'experiences_page' => ['/', '/experiences'],
        'dining_page' => ['/', '/dining'],
        'gallery_page' => ['/', '/gallery'],
        'about_page' => ['/about'],
        'contact_page' => ['/contact'],
        // Item CPTs (one post per item)
        'room' => ['/', '/stay', '/stay/' . $post->post_name],
        'experience' => ['/', '/experiences', '/experiences/' . $post->post_name],
        'testimonial' => ['/'],
        'gallery_item' => ['/', '/gallery'],
        'faq' => ['/', '/hot-spring'],
        'offer' => ['/'],
    ];
    if (isset($map[$post->post_type])) sh_revalidate($map[$post->post_type]);
}, 10, 2);

add_action('update_option_' . SH_HOTEL_OPTION, fn() => sh_revalidate(['/']), 10, 0);
