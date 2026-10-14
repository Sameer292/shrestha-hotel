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
        'labels' => ['singular_name' => 'Booking', 'all_items' => 'All Bookings'],
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

// ---------- staff-friendly list: columns, sorting, filters ----------
function sh_booking_col_map() {
    return [
        'ref' => 'Ref',
        'guest' => 'Guest',
        'room' => 'Room',
        'stay' => 'Stay',
        'guests' => 'Guests',
        'total' => 'Total',
        'status' => 'Status',
    ];
}

add_filter('manage_booking_posts_columns', function ($cols) {
    // Keep checkbox + date, replace the rest with readable columns.
    $out = [];
    foreach ($cols as $k => $v) {
        if ($k === 'cb') $out[$k] = $v;
    }
    foreach (sh_booking_col_map() as $k => $v) $out[$k] = $v;
    $out['date'] = $cols['date'] ?? 'Date';
    return $out;
});

add_action('manage_booking_posts_custom_column', function ($col, $post_id) {
    $room_id = (int)get_post_meta($post_id, '_room_id', true);
    $room = $room_id ? get_post($room_id) : null;
    switch ($col) {
        case 'ref':
            echo '<strong>' . esc_html(get_post_meta($post_id, '_booking_ref', true)) . '</strong>';
            break;
        case 'guest':
            echo esc_html(get_post_meta($post_id, '_guest_name', true))
                . '<br><span style="color:#646970">' . esc_html(get_post_meta($post_id, '_guest_email', true)) . '</span>'
                . '<br><span style="color:#646970">' . esc_html(get_post_meta($post_id, '_guest_phone', true)) . '</span>';
            break;
        case 'room':
            echo $room ? esc_html($room->post_title) : '—';
            break;
        case 'stay':
            echo esc_html(get_post_meta($post_id, '_checkin', true))
                . ' → ' . esc_html(get_post_meta($post_id, '_checkout', true))
                . '<br><span style="color:#646970">' . (int)get_post_meta($post_id, '_nights', true) . ' nights</span>';
            break;
        case 'guests':
            echo (int)get_post_meta($post_id, '_adults', true) . 'A / '
                . (int)get_post_meta($post_id, '_children', true) . 'C / '
                . (int)get_post_meta($post_id, '_infants', true) . 'I';
            break;
        case 'total':
            echo esc_html(get_post_meta($post_id, '_currency', true) . ' '
                . number_format((float)get_post_meta($post_id, '_total', true), 2));
            break;
        case 'status':
            $st = get_post_meta($post_id, '_status', true) ?: 'confirmed';
            $colors = [
                'confirmed' => '#1a7f37;background:#dcfce7',
                'cancelled' => '#82071e;background:#ffebe9',
                'completed' => '#ffffff;background:#59636e',
                'no-show' => '#ffffff;background:#9e6a03',
            ];
            [$fg, $bg] = explode(';', $colors[$st] ?? $colors['completed']);
            echo '<span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;color:' . esc_attr($fg) . ';background:' . esc_attr($bg) . '">' . esc_html($st) . '</span>';
            break;
    }
}, 10, 2);

add_filter('manage_edit-booking_sortable_columns', function ($cols) {
    $cols['stay'] = '_checkin';
    $cols['total'] = '_total';
    return $cols;
});

add_action('pre_get_posts', function ($q) {
    if (!is_admin() || !$q->is_main_query() || $q->get('post_type') !== 'booking') return;
    // Sort by check-in / total.
    if ($q->get('orderby') === '_checkin') {
        $q->set('meta_key', '_checkin');
        $q->set('orderby', 'meta_value');
    } elseif ($q->get('orderby') === '_total') {
        $q->set('meta_key', '_total');
        $q->set('orderby', 'meta_value_num');
    }
    // Default order: soonest check-in first.
    if (!$q->get('orderby')) {
        $q->set('meta_key', '_checkin');
        $q->set('orderby', 'meta_value');
        $q->set('order', 'ASC');
    }
    // Staff filters: status + room.
    $meta = [];
    if (!empty($_GET['sh_status'])) {
        $meta[] = ['key' => '_status', 'value' => sanitize_key($_GET['sh_status'])];
    }
    if (!empty($_GET['sh_room'])) {
        $meta[] = ['key' => '_room_id', 'value' => (int)$_GET['sh_room']];
    }
    if ($meta) $q->set('meta_query', $meta);
});

add_action('restrict_manage_posts', function ($post_type) {
    if ($post_type !== 'booking') return;
    $rooms = get_posts(['post_type' => 'room', 'post_status' => 'publish', 'numberposts' => -1, 'orderby' => 'title', 'order' => 'ASC', 'no_found_rows' => true]);
    echo '<select name="sh_status"><option value="">All statuses</option>';
    foreach (['confirmed', 'cancelled', 'completed', 'no-show'] as $st) {
        printf('<option value="%s"%s>%s</option>', esc_attr($st), selected($_GET['sh_status'] ?? '', $st, false), esc_html(ucfirst($st)));
    }
    echo '</select> <select name="sh_room"><option value="">All rooms</option>';
    foreach ($rooms as $r) {
        printf('<option value="%d"%s>%s</option>', $r->ID, selected($_GET['sh_room'] ?? '', (string)$r->ID, false), esc_html($r->post_title));
    }
    echo '</select>';
});

// ---------- readable booking view (plain-English meta box) ----------
add_action('add_meta_boxes_booking', function () {
    add_meta_box('sh_booking_view', 'Booking details', 'sh_booking_meta_box', 'booking', 'normal', 'high');
});

function sh_booking_meta_box($post) {
    $id = $post->ID;
    $room = get_post((int)get_post_meta($id, '_room_id', true));
    $rows = [
        'Reference' => get_post_meta($id, '_booking_ref', true),
        'Status' => get_post_meta($id, '_status', true) ?: 'confirmed',
        'Room' => $room ? $room->post_title : '—',
        'Check-in' => get_post_meta($id, '_checkin', true),
        'Check-out' => get_post_meta($id, '_checkout', true),
        'Nights' => (int)get_post_meta($id, '_nights', true),
        'Guest' => get_post_meta($id, '_guest_name', true),
        'Email' => get_post_meta($id, '_guest_email', true),
        'Phone' => get_post_meta($id, '_guest_phone', true),
        'Country' => get_post_meta($id, '_guest_country', true) ?: '—',
        'Purpose' => get_post_meta($id, '_purpose', true) ?: '—',
        'Adults / Children / Infants' => (int)get_post_meta($id, '_adults', true) . ' / ' . (int)get_post_meta($id, '_children', true) . ' / ' . (int)get_post_meta($id, '_infants', true),
        'Meal plan' => get_post_meta($id, '_meal_plan', true) ?: 'Room only',
        'Extra beds' => (int)get_post_meta($id, '_extra_beds', true),
        'Pickup' => get_post_meta($id, '_pickup', true) ? 'Yes' : 'No',
        'Requests' => get_post_meta($id, '_requests', true) ?: '—',
        'Total' => get_post_meta($id, '_currency', true) . ' ' . number_format((float)get_post_meta($id, '_total', true), 2),
    ];
    echo '<table class="widefat striped"><tbody>';
    foreach ($rows as $k => $v) {
        echo '<tr><th style="width:220px">' . esc_html($k) . '</th><td>' . esc_html((string)$v) . '</td></tr>';
    }
    echo '</tbody></table>';
    $breakdown = json_decode((string)get_post_meta($id, '_breakdown', true), true) ?: [];
    if ($breakdown) {
        echo '<h4 style="margin:12px 0 4px">Price breakdown</h4><table class="widefat striped"><tbody>';
        foreach ($breakdown as $l) {
            echo '<tr><td>' . esc_html($l['label'] ?? '') . '</td><td style="width:140px">' . esc_html(number_format((float)($l['amount'] ?? 0), 2)) . '</td></tr>';
        }
        echo '</tbody></table>';
    }
}

// ---------- availability board: rooms × next 30 days ----------
add_action('admin_menu', function () {
    add_submenu_page(
        'edit.php?post_type=booking',
        'Availability',
        'Availability',
        'edit_posts',
        'sh-availability',
        'sh_booking_availability_page'
    );
});

function sh_booking_availability_page() {
    global $wpdb;
    $table = sh_booking_table_name();
    $tz = wp_timezone();
    $start_raw = sanitize_text_field($_GET['start'] ?? '');
    $start = DateTime::createFromFormat('Y-m-d', $start_raw, $tz) ?: new DateTime('today', $tz);
    $days = [];
    $d = clone $start;
    for ($i = 0; $i < 30; $i++) {
        $days[] = $d->format('Y-m-d');
        $d->modify('+1 day');
    }
    $rooms = get_posts(['post_type' => 'room', 'post_status' => 'publish', 'numberposts' => -1, 'orderby' => 'title', 'order' => 'ASC', 'no_found_rows' => true]);
    // One query for the whole board.
    $in = implode(',', array_fill(0, count($days), '%s'));
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery
    $rows = $wpdb->get_results($wpdb->prepare(
        "SELECT room_id, night, units_taken FROM $table WHERE night IN ($in)",
        ...$days
    ), ARRAY_A);
    $taken = [];
    foreach ((array)$rows as $r) $taken[(int)$r['room_id']][$r['night']] = (int)$r['units_taken'];

    $prev = (clone $start)->modify('-30 days')->format('Y-m-d');
    $next = (clone $start)->modify('+30 days')->format('Y-m-d');
    echo '<div class="wrap"><h1>Room availability</h1>';
    echo '<p>Booked / total rooms per night. Green = free, amber = filling, red = full.</p>';
    printf(
        '<p><a class="button" href="%s">&larr; Previous 30 days</a> <strong>%s → %s</strong> <a class="button" href="%s">Next 30 days &rarr;</a></p>',
        esc_url(admin_url('edit.php?post_type=booking&page=sh-availability&start=' . $prev)),
        esc_html($days[0]),
        esc_html(end($days)),
        esc_url(admin_url('edit.php?post_type=booking&page=sh-availability&start=' . $next))
    );
    echo '<div style="overflow-x:auto"><table class="widefat striped" style="width:max-content;min-width:100%"><thead><tr><th style="position:sticky;left:0;background:#fff">Room</th>';
    foreach ($days as $day) {
        $dt = DateTime::createFromFormat('Y-m-d', $day, $tz);
        echo '<th style="text-align:center;min-width:64px">' . esc_html($dt->format('d M')) . '<br><span style="font-weight:normal;color:#646970">' . esc_html($dt->format('D')) . '</span></th>';
    }
    echo '</tr></thead><tbody>';
    foreach ($rooms as $r) {
        $units = sh_booking_room_units($r->ID);
        echo '<tr><td style="position:sticky;left:0;background:#fff;font-weight:600">' . esc_html($r->post_title) . '<br><span style="font-weight:normal;color:#646970">' . $units . ' rooms</span></td>';
        foreach ($days as $day) {
            $t = $taken[$r->ID][$day] ?? 0;
            $free = $units - $t;
            if ($free <= 0) {
                $bg = '#ffebe9';
            } elseif ($free <= max(1, (int)floor($units / 2))) {
                $bg = '#fff8c5';
            } else {
                $bg = '#dcfce7';
            }
            printf(
                '<td style="text-align:center;background:%s">%d/%d</td>',
                esc_attr($bg),
                $t,
                $units
            );
        }
        echo '</tr>';
    }
    echo '</tbody></table></div></div>';
}

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
        'Requests: ' . (get_post_meta($post->ID, '_requests', true) ?: '—'),
        'Meal plan: ' . (get_post_meta($post->ID, '_meal_plan', true) ?: 'Room only'),
        'Total (pay at hotel): ' . $quote['currency'] . ' ' . number_format((float)$quote['total'], 2),
        '',
        'Price breakdown:',
    ]);
    $body = $detail . "\n" . implode("\n", $lines);
    // House policies (editable in Hotel Content) — guests see these at
    // booking time too; repeating them here removes later arguments.
    $policies = [];
    if (function_exists('sh_get_hotel')) {
        $h = sh_get_hotel();
        foreach ([
            'cancellationPolicy' => 'Cancellation',
            'paymentTerms' => 'Payment',
            'childPolicy' => 'Children',
            'idRequirement' => 'Check-in',
        ] as $k => $label) {
            if (!empty($h[$k])) $policies[] = "$label: " . $h[$k];
        }
        if (empty($policies)) {
            $policies[] = 'Check-in: ' . ($h['checkIn'] ?? '') . ' / Check-out: ' . ($h['checkOut'] ?? '');
        }
    }
    if ($policies) $body .= "\n\nGood to know:\n- " . implode("\n- ", $policies);
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
                '_requests' => sanitize_textarea_field((string)($req['requests'] ?? '')),
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

// ---------- calendar: who is in which room, when ----------
add_action('admin_menu', function () {
    add_submenu_page(
        'edit.php?post_type=booking',
        'Calendar',
        'Calendar',
        'edit_posts',
        'sh-calendar',
        'sh_booking_calendar_page'
    );
});

function sh_booking_calendar_page() {
    $tz = wp_timezone();
    $month_raw = sanitize_text_field($_GET['month'] ?? '');
    $month = DateTime::createFromFormat('Y-m', $month_raw, $tz) ?: new DateTime('first day of this month', $tz);
    $month->modify('first day of this month');
    $month_start = $month->format('Y-m-01');
    $next_start = (clone $month)->modify('+1 month')->format('Y-m-01');
    $days_in_month = (int)$month->format('t');
    $today = (new DateTime('today', $tz))->format('Y-m-d');
    $room_filter = (int)($_GET['room'] ?? 0);

    $rooms = get_posts(['post_type' => 'room', 'post_status' => 'publish', 'numberposts' => -1, 'orderby' => 'title', 'order' => 'ASC', 'no_found_rows' => true]);
    if ($room_filter) $rooms = array_values(array_filter($rooms, fn($r) => $r->ID === $room_filter));

    // All bookings touching this month (any status except trash).
    $all = get_posts([
        'post_type' => 'booking',
        'post_status' => 'publish',
        'numberposts' => -1,
        'no_found_rows' => true,
        'meta_query' => [
            ['key' => '_checkin', 'value' => $next_start, 'compare' => '<', 'type' => 'DATE'],
            ['key' => '_checkout', 'value' => $month_start, 'compare' => '>', 'type' => 'DATE'],
        ],
    ]);
    $by_room = [];
    foreach ($all as $p) {
        $rid = (int)get_post_meta($p->ID, '_room_id', true);
        $by_room[$rid][] = [
            'id' => $p->ID,
            'ref' => get_post_meta($p->ID, '_booking_ref', true),
            'name' => get_post_meta($p->ID, '_guest_name', true),
            'in' => get_post_meta($p->ID, '_checkin', true),
            'out' => get_post_meta($p->ID, '_checkout', true),
            'status' => get_post_meta($p->ID, '_status', true) ?: 'confirmed',
        ];
    }

    $colors = [
        'confirmed' => 'background:#dcfce7;color:#1a7f37',
        'completed' => 'background:#e8eaed;color:#59636e',
        'cancelled' => 'background:#ffebe9;color:#82071e;text-decoration:line-through',
        'no-show' => 'background:#fff8c5;color:#9e6a03',
    ];
    $prev = (clone $month)->modify('-1 month')->format('Y-m');
    $next = (clone $month)->modify('+1 month')->format('Y-m');
    $base = admin_url('edit.php?post_type=booking&page=sh-calendar');

    echo '<div class="wrap"><h1>Booking calendar</h1>';
    echo '<form method="get" style="margin:12px 0;display:flex;gap:8px;align-items:center">';
    echo '<input type="hidden" name="post_type" value="booking"><input type="hidden" name="page" value="sh-calendar">';
    printf(
        '<a class="button" href="%s">&larr;</a> <strong style="font-size:15px">%s</strong> <a class="button" href="%s">&rarr;</a>',
        esc_url($base . '&month=' . $prev), esc_html($month->format('F Y')), esc_url($base . '&month=' . $next)
    );
    echo '<input type="month" name="month" value="' . esc_attr($month->format('Y-m')) . '">';
    echo '<select name="room"><option value="0">All rooms</option>';
    $all_rooms = get_posts(['post_type' => 'room', 'post_status' => 'publish', 'numberposts' => -1, 'orderby' => 'title', 'order' => 'ASC', 'no_found_rows' => true]);
    foreach ($all_rooms as $r) {
        printf('<option value="%d"%s>%s</option>', $r->ID, selected($room_filter, $r->ID, false), esc_html($r->post_title));
    }
    echo '</select><button class="button button-primary">Show</button></form>';

    echo '<p><span style="display:inline-block;width:12px;height:12px;background:#dcfce7;border:1px solid #1a7f37"></span> confirmed &nbsp;'
        . '<span style="display:inline-block;width:12px;height:12px;background:#e8eaed;border:1px solid #59636e"></span> completed &nbsp;'
        . '<span style="display:inline-block;width:12px;height:12px;background:#ffebe9;border:1px solid #82071e"></span> cancelled &nbsp;'
        . '<span style="display:inline-block;width:12px;height:12px;background:#fff8c5;border:1px solid #9e6a03"></span> no-show</p>';

    echo '<div style="overflow-x:auto;border:1px solid #c3c4c7;background:#fff"><table class="widefat" style="border:0;width:max-content;min-width:100%;border-collapse:collapse"><thead><tr><th style="position:sticky;left:0;background:#fff;z-index:2;min-width:160px">Room</th>';
    for ($d = 1; $d <= $days_in_month; $d++) {
        $date = $month->format('Y-m-') . str_pad((string)$d, 2, '0', STR_PAD_LEFT);
        $dow = (new DateTime($date, $tz))->format('D');
        $hl = $date === $today ? 'background:#fff8c5;' : '';
        echo '<th style="text-align:center;min-width:96px;' . esc_attr($hl) . '">' . $d . '<br><span style="font-weight:normal;color:#646970;font-size:11px">' . esc_html($dow) . '</span></th>';
    }
    echo '</tr></thead><tbody>';
    foreach ($rooms as $r) {
        echo '<tr><td style="position:sticky;left:0;background:#fff;z-index:1;font-weight:600">' . esc_html($r->post_title) . '</td>';
        $bookings = $by_room[$r->ID] ?? [];
        for ($d = 1; $d <= $days_in_month; $d++) {
            $date = $month->format('Y-m-') . str_pad((string)$d, 2, '0', STR_PAD_LEFT);
            $cell = '<td style="border-left:1px solid #eee;min-width:96px;max-width:96px;overflow:hidden"></td>';
            $covering = [];
            foreach ($bookings as $b) {
                if ($b['in'] <= $date && $date < $b['out']) $covering[] = $b;
            }
            if ($covering) {
                // Multi-unit rooms can hold several stays a night: label the
                // first, count the rest.
                $b = $covering[0];
                $show_name = ($b['in'] >= $month_start && $b['in'] === $date) || ($b['in'] < $month_start && $d === 1);
                $label = $show_name ? $b['name'] . ' · ' . $b['ref'] : '';
                if (count($covering) > 1 && $show_name) $label .= ' (+' . (count($covering) - 1) . ')';
                $title = implode(' | ', array_map(fn($x) => $x['name'] . ' · ' . $x['ref'] . ' · ' . $x['in'] . ' → ' . $x['out'], $covering));
                $link = esc_url(get_edit_post_link($b['id']));
                $cell = '<td title="' . esc_attr($title) . '" style="border-left:1px solid #eee;min-width:96px;max-width:96px;overflow:hidden;white-space:nowrap;' . esc_attr($colors[$b['status']] ?? $colors['confirmed']) . '">'
                    . ($label !== '' ? '<a href="' . $link . '" style="color:inherit;font-size:12px">' . esc_html($label) . '</a>' : '') . '</td>';
            }
            echo $cell; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        }
        echo '</tr>';
    }
    echo '</tbody></table></div></div>';
}
