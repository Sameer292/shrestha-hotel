<?php
/**
 * Plugin Name: Shrestha Booking Engine
 * Description: Internal booking system (no third-party engine). Booking CPT + per-night inventory ledger (custom table, transactional) + REST endpoints for availability, quotes, create/lookup/cancel. Pay at hotel; instant confirmation.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) exit;

const SH_BOOKING_TABLE = 'sh_booking_nights';
const SH_BOOKING_MAX_NIGHTS = 30;

// ---------- ledger table ----------
function sh_booking_table_name() {
    global $wpdb;
    return $wpdb->prefix . SH_BOOKING_TABLE;
}

function sh_booking_ensure_table() {
    global $wpdb;
    $table = sh_booking_table_name();
    // Cheap existence check on every load; dbDelta only when missing.
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery
    $exists = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table));
    if ($exists === $table) return;
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    $charset = $wpdb->get_charset_collate();
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery
    dbDelta("CREATE TABLE $table (
        room_id bigint(20) unsigned NOT NULL,
        night date NOT NULL,
        units_taken int unsigned NOT NULL DEFAULT 0,
        PRIMARY KEY (room_id, night),
        KEY night (night)
    ) $charset;");
}
add_action('init', 'sh_booking_ensure_table', 5);

// ---------- Booking CPT (staff inbox, not public) ----------
add_action('init', function () {
    register_post_type('booking', [
        'label' => 'Bookings',
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_graphql' => false,
        'show_in_rest' => false,
        'supports' => ['title', 'custom-fields'],
        'menu_icon' => 'dashicons-calendar-alt',
        'menu_position' => 51,
        'has_archive' => false,
        'capabilities' => ['create_posts' => false],
        'map_meta_cap' => true,
    ]);
});

// ---------- helpers ----------
function sh_booking_room_units($room_id) {
    $u = (int)get_post_meta($room_id, 'units', true);
    return $u > 0 ? $u : 1; // safe default: never oversell an unconfigured room
}

function sh_booking_valid_room($room_id) {
    $p = get_post($room_id);
    return $p && $p->post_type === 'room' && $p->post_status === 'publish' ? $p : null;
}

function sh_booking_nights($checkin, $checkout) {
    // Returns list of Y-m-d nights or WP_Error.
    $in = DateTime::createFromFormat('Y-m-d', $checkin);
    $out = DateTime::createFromFormat('Y-m-d', $checkout);
    if (!$in || !$out || $in->format('Y-m-d') !== $checkin || $out->format('Y-m-d') !== $checkout) {
        return new WP_Error('bad_dates', 'Dates must be YYYY-MM-DD.', ['status' => 400]);
    }
    $today = new DateTime('today', wp_timezone());
    if ($in < $today) return new WP_Error('past_dates', 'Check-in cannot be in the past.', ['status' => 400]);
    if ($out <= $in) return new WP_Error('bad_range', 'Check-out must be after check-in.', ['status' => 400]);
    $nights = [];
    $d = clone $in;
    while ($d < $out) {
        $nights[] = $d->format('Y-m-d');
        $d->modify('+1 day');
        if (count($nights) > SH_BOOKING_MAX_NIGHTS) {
            return new WP_Error('too_long', 'Maximum stay is ' . SH_BOOKING_MAX_NIGHTS . ' nights.', ['status' => 400]);
        }
    }
    return $nights;
}

function sh_booking_rate_limit($action, $limit = 20) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $key = 'sh_bk_' . $action . '_' . md5($ip);
    $hits = (int)get_transient($key);
    if ($hits >= $limit) return false;
    set_transient($key, $hits + 1, HOUR_IN_SECONDS);
    return true;
}

function sh_booking_meal_plans() {
    // "Name | price per person/night" per line, from Hotel Content.
    $raw = '';
    if (function_exists('sh_get_hotel')) {
        $h = sh_get_hotel();
        $raw = $h['mealPlans'] ?? '';
    } else {
        $o = get_option('sh_hotel', []);
        $raw = is_array($o) ? ($o['mealPlans'] ?? '') : '';
    }
    $plans = [];
    foreach (preg_split('/\r?\n/', (string)$raw) as $line) {
        $line = trim($line);
        if ($line === '') continue;
        $parts = array_map('trim', explode('|', $line, 2));
        if (count($parts) < 2 || $parts[0] === '' || !is_numeric($parts[1])) continue;
        $plans[$parts[0]] = (float)$parts[1];
    }
    return $plans;
}

function sh_booking_money($key, $default = 0.0) {
    if (function_exists('sh_get_hotel')) {
        $h = sh_get_hotel();
        $v = $h[$key] ?? $default;
    } else {
        $o = get_option('sh_hotel', []);
        $v = (is_array($o) && isset($o[$key])) ? $o[$key] : $default;
    }
    return is_numeric($v) ? (float)$v : (float)$default;
}

// Pure price math — shared by quote + create so they can never disagree.
function sh_booking_quote($room_id, $nights, $args) {
    $price = (float)get_post_meta($room_id, 'startingPrice', true);
    $currency = get_post_meta($room_id, 'currency', true) ?: sh_booking_money('currency_default', 'NPR');
    if (is_numeric($currency)) $currency = 'NPR'; // guard: currency stored as code, not number
    if (!$price || $price <= 0) return new WP_Error('no_price', 'This room has no nightly price yet.', ['status' => 422]);

    $n = count($nights);
    $adults = max(1, (int)($args['adults'] ?? 1));
    $children = max(0, (int)($args['children'] ?? 0));
    $infants = max(0, (int)($args['infants'] ?? 0));
    $extra_beds = max(0, (int)($args['extra_beds'] ?? 0));
    $pickup = !empty($args['pickup']);

    $base = $price * $n;
    $lines = [['label' => "Room × $n night" . ($n > 1 ? 's' : ''), 'amount' => round($base, 2)]];

    $meal_total = 0.0;
    $meal_plan = trim((string)($args['meal_plan'] ?? ''));
    if ($meal_plan !== '') {
        $plans = sh_booking_meal_plans();
        if (!isset($plans[$meal_plan])) {
            return new WP_Error('bad_meal_plan', 'Unknown meal plan.', ['status' => 400]);
        }
        // Infants eat free; children half.
        $meal_total = $plans[$meal_plan] * $n * ($adults + $children * 0.5);
        $lines[] = ['label' => "Meal plan ($meal_plan)", 'amount' => round($meal_total, 2)];
    }

    $bed_price = sh_booking_money('extraBedPrice', 0);
    $bed_total = $bed_price * $extra_beds * $n;
    if ($bed_total > 0) $lines[] = ['label' => "Extra bed × $extra_beds × $n night" . ($n > 1 ? 's' : ''), 'amount' => round($bed_total, 2)];

    $pickup_price = sh_booking_money('pickupPrice', 0);
    $pickup_total = ($pickup && $pickup_price > 0) ? $pickup_price : 0.0;
    if ($pickup_total > 0) $lines[] = ['label' => 'Airport pickup', 'amount' => round($pickup_total, 2)];

    $subtotal = $base + $meal_total + $bed_total + $pickup_total;
    $tax_pct = sh_booking_money('taxPercent', 0);
    $svc_pct = sh_booking_money('servicePercent', 0);
    $tax = $subtotal * $tax_pct / 100;
    $svc = $subtotal * $svc_pct / 100;
    if ($tax > 0) $lines[] = ['label' => "Tax ($tax_pct%)", 'amount' => round($tax, 2)];
    if ($svc > 0) $lines[] = ['label' => "Service ($svc_pct%)", 'amount' => round($svc, 2)];

    return [
        'currency' => is_string($currency) ? $currency : 'NPR',
        'nights' => $n,
        'lines' => $lines,
        'subtotal' => round($subtotal, 2),
        'total' => round($subtotal + $tax + $svc, 2),
        'per_night' => round($price, 2),
    ];
}

function sh_booking_availability($room_id, $nights, $lock = false) {
    // unitsLeft per night. $lock wraps rows in FOR UPDATE (inside a transaction).
    global $wpdb;
    $table = sh_booking_table_name();
    $units = sh_booking_room_units($room_id);
    $left = [];
    foreach ($nights as $night) {
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $taken = (int)$wpdb->get_var($wpdb->prepare(
            $lock
                ? "SELECT units_taken FROM $table WHERE room_id = %d AND night = %s FOR UPDATE"
                : "SELECT units_taken FROM $table WHERE room_id = %d AND night = %s",
            $room_id, $night
        ));
        $left[$night] = max(0, $units - $taken);
    }
    return [$left, $units];
}

function sh_booking_new_ref() {
    global $wpdb;
    for ($i = 0; $i < 10; $i++) {
        $ref = 'SH-' . strtoupper(wp_generate_password(6, false, false));
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $exists = (int)$wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $wpdb->postmeta WHERE meta_key = '_booking_ref' AND meta_value = %s",
            $ref
        ));
        if (!$exists) return $ref;
    }
    return 'SH-' . strtoupper(wp_generate_password(8, false, false)) . time();
}

function sh_booking_find($ref, $email) {
    $ref = strtoupper(trim((string)$ref));
    $email = strtolower(trim((string)$email));
    if ($ref === '' || !is_email($email)) return null;
    $posts = get_posts([
        'post_type' => 'booking',
        'post_status' => 'any',
        'numberposts' => 2,
        'meta_query' => [['key' => '_booking_ref', 'value' => $ref]],
        'no_found_rows' => true,
    ]);
    foreach ($posts as $p) {
        if (strtolower(trim((string)get_post_meta($p->ID, '_guest_email', true))) === $email) {
            return $p;
        }
    }
    return null;
}

function sh_booking_public($post) {
    $id = $post->ID;
    $room_id = (int)get_post_meta($id, '_room_id', true);
    $room = get_post($room_id);
    return [
        'ref' => get_post_meta($id, '_booking_ref', true),
        'status' => get_post_meta($id, '_status', true) ?: 'confirmed',
        'room' => $room ? ['id' => $room_id, 'name' => $room->post_title, 'slug' => $room->post_name] : null,
        'checkin' => get_post_meta($id, '_checkin', true),
        'checkout' => get_post_meta($id, '_checkout', true),
        'nights' => (int)get_post_meta($id, '_nights', true),
        'guests' => [
            'adults' => (int)get_post_meta($id, '_adults', true),
            'children' => (int)get_post_meta($id, '_children', true),
            'infants' => (int)get_post_meta($id, '_infants', true),
        ],
        'name' => get_post_meta($id, '_guest_name', true),
        'total' => (float)get_post_meta($id, '_total', true),
        'currency' => get_post_meta($id, '_currency', true) ?: 'NPR',
        'breakdown' => json_decode((string)get_post_meta($id, '_breakdown', true), true) ?: [],
    ];
}

function sh_booking_mail($to, $subject, $body) {
    if (!$to || !is_email($to)) return false;
    return wp_mail($to, $subject, $body, ['Content-Type: text/plain; charset=UTF-8']);
}

function sh_booking_notify($post, $quote, $args) {
    $name = get_post_meta($post->ID, '_guest_name', true);
    $email = get_post_meta($post->ID, '_guest_email', true);
    $ref = get_post_meta($post->ID, '_booking_ref', true);
    $room = get_post((int)get_post_meta($post->ID, '_room_id', true));
    $lines = [];
    foreach ((array)($quote['lines'] ?? []) as $l) {
        $lines[] = '- ' . $l['label'] . ': ' . $quote['currency'] . ' ' . number_format((float)$l['amount'], 2);
    }
    $detail = implode("\n", [
        "Booking $ref — {$room->post_title}",
        "Guest: $name <$email>, phone: " . get_post_meta($post->ID, '_guest_phone', true),
        'Stay: ' . get_post_meta($post->ID, '_checkin', true) . ' → ' . get_post_meta($post->ID, '_checkout', true)
            . ' (' . get_post_meta($post->ID, '_nights', true) . ' nights)',
        'Guests: ' . get_post_meta($post->ID, '_adults', true) . ' adults, '
            . get_post_meta($post->ID, '_children', true) . ' children, '
            . get_post_meta($post->ID, '_infants', true) . ' infants',
        'Purpose: ' . (get_post_meta($post->ID, '_purpose', true) ?: '—'),
        'Meal plan: ' . (get_post_meta($post->ID, '_meal_plan', true) ?: 'Room only'),
        'Total (pay at hotel): ' . $quote['currency'] . ' ' . number_format((float)$quote['total'], 2),
        '',
        'Price breakdown:',
    ]);
    $body = $detail . "\n" . implode("\n", $lines);
    // Guest confirmation.
    sh_booking_mail($email, "Your booking $ref is confirmed — Shrestha Hotel", "Namaste $name,\n\nYour booking is confirmed. Pay at the hotel on arrival.\n\n$body");
    // Hotel notification.
    $hotel = '';
    if (function_exists('sh_get_hotel')) {
        $h = sh_get_hotel();
        $hotel = $h['email'] ?? '';
    }
    if (!$hotel) $hotel = get_option('admin_email');
    sh_booking_mail($hotel, "[Booking $ref] {$room->post_title} — $name", $body);
}

// ---------- REST ----------
add_action('rest_api_init', function () {
    // Availability: room + date range → units left per night.
    register_rest_route('sh/v1', '/availability', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            if (!sh_booking_rate_limit('avail', 60)) {
                return new WP_Error('rate_limited', 'Too many requests.', ['status' => 429]);
            }
            $room_id = (int)$req['room_id'];
            if (!sh_booking_valid_room($room_id)) {
                return new WP_Error('bad_room', 'Unknown room.', ['status' => 400]);
            }
            $nights = sh_booking_nights((string)$req['from'], (string)$req['to']);
            if (is_wp_error($nights)) return $nights;
            [$left, $units] = sh_booking_availability($room_id, $nights);
            return ['room_id' => $room_id, 'units' => $units, 'nights' => $left];
        },
    ]);

    // Quote: exact price for a stay (same math as booking).
    register_rest_route('sh/v1', '/quote', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            if (!sh_booking_rate_limit('quote', 60)) {
                return new WP_Error('rate_limited', 'Too many requests.', ['status' => 429]);
            }
            $room_id = (int)$req['room_id'];
            if (!sh_booking_valid_room($room_id)) {
                return new WP_Error('bad_room', 'Unknown room.', ['status' => 400]);
            }
            $nights = sh_booking_nights((string)$req['checkin'], (string)$req['checkout']);
            if (is_wp_error($nights)) return $nights;
            $q = sh_booking_quote($room_id, $nights, [
                'adults' => $req['adults'], 'children' => $req['children'],
                'infants' => $req['infants'], 'extra_beds' => $req['extra_beds'],
                'meal_plan' => $req['meal_plan'], 'pickup' => $req['pickup'],
            ]);
            if (is_wp_error($q)) return $q;
            [$left] = sh_booking_availability($room_id, $nights);
            $q['available'] = min($left) > 0;
            $q['units_left'] = $left;
            return $q;
        },
    ]);

    // Create booking (transactional — the overbooking guard lives here).
    register_rest_route('sh/v1', '/bookings', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            if (!empty($req['company'])) return ['ok' => true]; // honeypot
            if (!sh_booking_rate_limit('create', 10)) {
                return new WP_Error('rate_limited', 'Too many requests.', ['status' => 429]);
            }
            $name = sanitize_text_field((string)$req['name']);
            $email = sanitize_email((string)$req['email']);
            if (strlen($name) < 2 || !is_email($email)) {
                return new WP_Error('bad_guest', 'Name and valid email are required.', ['status' => 400]);
            }
            $room_id = (int)$req['room_id'];
            $room = sh_booking_valid_room($room_id);
            if (!$room) return new WP_Error('bad_room', 'Unknown room.', ['status' => 400]);
            $nights = sh_booking_nights((string)$req['checkin'], (string)$req['checkout']);
            if (is_wp_error($nights)) return $nights;

            $args = [
                'adults' => max(1, (int)$req['adults']),
                'children' => max(0, (int)$req['children']),
                'infants' => max(0, (int)$req['infants']),
                'extra_beds' => max(0, (int)$req['extra_beds']),
                'meal_plan' => sanitize_text_field((string)($req['meal_plan'] ?? '')),
                'pickup' => !empty($req['pickup']),
            ];
            $q = sh_booking_quote($room_id, $nights, $args);
            if (is_wp_error($q)) return $q;

            global $wpdb;
            $table = sh_booking_table_name();
            // Serialize creates per room: row locks alone can deadlock under
            // concurrency (gap inserts), failing innocent requests with 500s.
            $lock_name = 'sh_bk_' . $room_id;
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $got_lock = (int)$wpdb->get_var($wpdb->prepare('SELECT GET_LOCK(%s, 5)', $lock_name));
            if (!$got_lock) {
                return new WP_Error('busy', 'Booking system busy — try again.', ['status' => 503]);
            }
            $release = function () use ($wpdb, $lock_name) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery
                $wpdb->query($wpdb->prepare('SELECT RELEASE_LOCK(%s)', $lock_name));
            };
            $wpdb->query('START TRANSACTION');
            [$left] = sh_booking_availability($room_id, $nights, true); // row locks
            if (min($left) < 1) {
                $wpdb->query('ROLLBACK');
                $release();
                return new WP_Error('unavailable', 'Just booked out — try other dates.', ['status' => 409]);
            }
            $ref = sh_booking_new_ref();
            $post_id = wp_insert_post([
                'post_type' => 'booking',
                'post_title' => "$ref — $name — {$room->post_title}",
                'post_status' => 'publish',
            ], true);
            if (is_wp_error($post_id)) {
                $wpdb->query('ROLLBACK');
                $release();
                return new WP_Error('failed', 'Could not save booking.', ['status' => 500]);
            }
            $meta = [
                '_booking_ref' => $ref, '_status' => 'confirmed',
                '_room_id' => $room_id,
                '_checkin' => $nights[0], '_checkout' => (string)$req['checkout'],
                '_nights' => count($nights),
                '_guest_name' => $name, '_guest_email' => strtolower($email),
                '_guest_phone' => sanitize_text_field((string)($req['phone'] ?? '')),
                '_guest_country' => sanitize_text_field((string)($req['country'] ?? '')),
                '_purpose' => sanitize_text_field((string)($req['purpose'] ?? '')),
                '_adults' => $args['adults'], '_children' => $args['children'],
                '_infants' => $args['infants'], '_extra_beds' => $args['extra_beds'],
                '_meal_plan' => $args['meal_plan'], '_pickup' => $args['pickup'] ? '1' : '0',
                '_total' => $q['total'], '_currency' => $q['currency'],
                '_breakdown' => wp_json_encode($q['lines']),
            ];
            foreach ($meta as $k => $v) update_post_meta($post_id, $k, $v);
            foreach ($nights as $night) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery
                $r = $wpdb->query($wpdb->prepare(
                    "INSERT INTO $table (room_id, night, units_taken) VALUES (%d, %s, 1)
                     ON DUPLICATE KEY UPDATE units_taken = units_taken + 1",
                    $room_id, $night
                ));
                if ($r === false) {
                    $wpdb->query('ROLLBACK');
                    $release();
                    wp_delete_post($post_id, true);
                    return new WP_Error('failed', 'Could not reserve nights.', ['status' => 500]);
                }
            }
            $wpdb->query('COMMIT');
            $release();
            $post = get_post($post_id);
            sh_booking_notify($post, $q, $args);
            return ['ok' => true, 'ref' => $ref, 'total' => $q['total'], 'currency' => $q['currency']];
        },
    ]);

    // Lookup: ref + email → booking summary.
    register_rest_route('sh/v1', '/bookings/lookup', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            if (!sh_booking_rate_limit('lookup', 20)) {
                return new WP_Error('rate_limited', 'Too many requests.', ['status' => 429]);
            }
            $post = sh_booking_find($req['ref'], $req['email']);
            if (!$post) return new WP_Error('not_found', 'No booking matches.', ['status' => 404]);
            return sh_booking_public($post);
        },
    ]);

    // Cancel: ref + email → frees the nights.
    register_rest_route('sh/v1', '/bookings/cancel', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $req) {
            if (!sh_booking_rate_limit('cancel', 10)) {
                return new WP_Error('rate_limited', 'Too many requests.', ['status' => 429]);
            }
            $post = sh_booking_find($req['ref'], $req['email']);
            if (!$post) return new WP_Error('not_found', 'No booking matches.', ['status' => 404]);
            if ((get_post_meta($post->ID, '_status', true) ?: 'confirmed') !== 'confirmed') {
                return new WP_Error('bad_status', 'Only confirmed bookings can be cancelled.', ['status' => 400]);
            }
            global $wpdb;
            $table = sh_booking_table_name();
            $room_id = (int)get_post_meta($post->ID, '_room_id', true);
            $nights = sh_booking_nights(
                (string)get_post_meta($post->ID, '_checkin', true),
                (string)get_post_meta($post->ID, '_checkout', true)
            );
            if (is_wp_error($nights)) $nights = [];
            $wpdb->query('START TRANSACTION');
            update_post_meta($post->ID, '_status', 'cancelled');
            foreach ($nights as $night) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery
                $wpdb->query($wpdb->prepare(
                    "UPDATE $table SET units_taken = GREATEST(units_taken - 1, 0)
                     WHERE room_id = %d AND night = %s",
                    $room_id, $night
                ));
            }
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $wpdb->query($wpdb->prepare(
                "DELETE FROM $table WHERE room_id = %d AND units_taken = 0",
                $room_id
            ));
            $wpdb->query('COMMIT');
            $email = get_post_meta($post->ID, '_guest_email', true);
            $ref = get_post_meta($post->ID, '_booking_ref', true);
            sh_booking_mail($email, "Booking $ref cancelled", "Your booking $ref has been cancelled. No charge — you pay at the hotel only for stays you complete.\n\nReply to this email if that was a mistake and we will help you rebook.");
            return ['ok' => true, 'ref' => $ref];
        },
    ]);
});
