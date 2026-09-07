<?php
/**
 * Plugin Name: Shrestha Hotel Inquiries
 * Description: REST inbox for contact/booking forms. Stores a private Inquiry post and emails the hotel. Honeypot + rate limit included.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {
    register_rest_route('sh/v1', '/inquiry', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'args' => [
            'kind' => ['type' => 'string', 'required' => true, 'enum' => ['contact', 'booking']],
            'name' => ['type' => 'string', 'required' => true, 'minLength' => 2, 'maxLength' => 120],
            'email' => ['type' => 'string', 'required' => true, 'format' => 'email'],
            'phone' => ['type' => 'string', 'required' => false, 'maxLength' => 40],
            'subject' => ['type' => 'string', 'required' => false, 'maxLength' => 200],
            'message' => ['type' => 'string', 'required' => true, 'minLength' => 10, 'maxLength' => 5000],
            'meta' => ['type' => 'string', 'required' => false, 'maxLength' => 2000],
            'company' => ['type' => 'string', 'required' => false], // honeypot — must stay empty
        ],
        'callback' => 'sh_handle_inquiry',
    ]);
});

function sh_handle_inquiry(WP_REST_Request $req) {
    // Bots fill hidden fields — accept silently so they can't probe us
    if (!empty($req['company'])) return ['ok' => true];

    // 5 inquiries/hour per IP
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $key = 'sh_inq_' . md5($ip);
    $hits = (int) get_transient($key);
    if ($hits >= 5) return new WP_Error('rate_limited', 'Too many requests — try again later.', ['status' => 429]);
    set_transient($key, $hits + 1, HOUR_IN_SECONDS);

    $kind = $req['kind'] === 'booking' ? 'booking' : 'contact';
    $name = sanitize_text_field($req['name']);
    $email = sanitize_email($req['email']);
    $phone = sanitize_text_field($req['phone'] ?? '');
    $subject = sanitize_text_field($req['subject'] ?? ($kind === 'booking' ? 'Booking inquiry' : 'Contact message'));
    $message = sanitize_textarea_field($req['message']);
    $meta = sanitize_text_field($req['meta'] ?? '');

    $body = "Kind: $kind\nName: $name\nEmail: $email\nPhone: $phone\nSubject: $subject\nDetails: $meta\n\n$message";
    $post_id = wp_insert_post([
        'post_type' => 'inquiry',
        'post_title' => ($kind === 'booking' ? '[Booking] ' : '[Contact] ') . "$name — $subject",
        'post_content' => $body,
        'post_status' => 'private',
        'meta_input' => ['_sh_kind' => $kind, '_sh_email' => $email, '_sh_mailed' => 'no'],
    ], true);
    if (is_wp_error($post_id)) return new WP_Error('save_failed', 'Could not save inquiry.', ['status' => 500]);

    // Email best-effort: the admin list above is the reliable copy
    $to = '';
    if (function_exists('sh_get_hotel')) {
        $s = sh_get_hotel();
        $to = $s['email'] ?? '';
    }
    if (!$to) $to = get_option('admin_email');
    $mailed = wp_mail($to, "[Website] $subject", $body, ["Reply-To: $name <$email>"]);
    update_post_meta($post_id, '_sh_mailed', $mailed ? 'yes' : 'no');

    return ['ok' => true];
}
