<?php
/**
 * Plugin Name: Shrestha Page Menus
 * Description: Direct-edit admin menus — one per frontend page. Clicking a
 * menu opens that page's single entry straight away (options-page style),
 * auto-creating it on first click. Staff never sees a post list.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) exit;

// Single entry per page CPT. Returns the post ID, creating it when missing.
function sh_single_page_id($post_type, $slug, $title) {
    $p = get_page_by_path($slug, OBJECT, $post_type);
    if ($p) return (int)$p->ID;
    $id = wp_insert_post([
        'post_type' => $post_type,
        'post_name' => $slug,
        'post_title' => $title,
        'post_status' => 'publish',
    ], true);
    return is_wp_error($id) ? 0 : (int)$id;
}

add_action('admin_menu', function () {
    $menus = [
        // [menu slug, label, post type, entry slug, entry title, icon, position]
        ['sh-home', 'Home Content', 'home_content', 'home', 'Home', 'dashicons-admin-home', 31],
        ['sh-stay', 'Stay Page', 'stay_page', 'stay', 'Stay', 'dashicons-building', 32],
        ['sh-hot-spring', 'Hot Spring Page', 'hot_spring_page', 'hot-spring', 'Hot Spring', 'dashicons-palmtree', 33],
        ['sh-experiences', 'Experiences Page', 'experiences_page', 'experiences', 'Experiences', 'dashicons-camera', 34],
        ['sh-dining', 'Dining Page', 'dining_page', 'dining', 'Dining', 'dashicons-heart', 35],
        ['sh-gallery', 'Gallery Page', 'gallery_page', 'gallery', 'Gallery', 'dashicons-format-gallery', 36],
        ['sh-about', 'About Page', 'about_page', 'about', 'About', 'dashicons-info', 37],
        ['sh-contact', 'Contact Page', 'contact_page', 'contact', 'Contact', 'dashicons-email', 38],
    ];
    foreach ($menus as [$menu_slug, $label, $type, $slug, $title, $icon, $pos]) {
        // Redirect on the load-* hook (before any admin output), NOT in
        // the page callback — redirecting there triggers
        // "headers already sent" warnings.
        $hook = add_menu_page($label, $label, 'edit_posts', $menu_slug, function () {
            echo '<div class="wrap"><p>Opening… <a href="">click here if you are not redirected</a>.</p></div>';
        }, $icon, $pos);
        add_action('load-' . $hook, function () use ($type, $slug, $title) {
            $id = sh_single_page_id($type, $slug, $title);
            if (!$id) wp_die('Could not open this page. Please try again.');
            wp_safe_redirect(admin_url('post.php?post=' . $id . '&action=edit'));
            exit;
        });
    }
});
