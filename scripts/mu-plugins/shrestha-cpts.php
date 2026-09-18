<?php
/**
 * Plugin Name: Shrestha Hotel CPTs
 * Description: Page CPTs (one single entry per frontend page, edited via
 * direct menus) + Item CPTs (Rooms, Experiences, Testimonials, Gallery
 * Items, FAQs — normal post lists, one post per item). Every type is
 * public for WPGraphQL but rewrite=false + no archive + excluded from
 * search, so there are no frontend URLs: content is edited here,
 * rendered by Next.js.
 * Version: 3.0.0
 */

if (!defined('ABSPATH')) exit;

add_action('init', function () {
    // ----- Page CPTs: single entry each, hidden from the menu because
    // staff edits them through direct menus (see sh-page-menus.php),
    // options-page style — they never see a post list.
    $page_base = [
        'public' => true,
        'show_ui' => true,
        'show_in_menu' => false,
        'show_in_admin_bar' => false,
        'show_in_nav_menus' => false,
        'exclude_from_search' => true,
        'publicly_queryable' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
        'has_archive' => false,
        'rewrite' => false,
    ];

    $pages = [
        'home_content' => [
            'label' => 'Home Content',
            'graphql_single_name' => 'homeContentPage',
            'graphql_plural_name' => 'homeContentPages',
            'menu_icon' => 'dashicons-admin-home',
        ],
        'stay_page' => [
            'label' => 'Stay Page',
            'graphql_single_name' => 'stayPage',
            'graphql_plural_name' => 'stayPages',
            'menu_icon' => 'dashicons-building',
        ],
        'hot_spring_page' => [
            'label' => 'Hot Spring Page',
            'graphql_single_name' => 'hotSpringPage',
            'graphql_plural_name' => 'hotSpringPages',
            'menu_icon' => 'dashicons-palmtree',
        ],
        'experiences_page' => [
            'label' => 'Experiences Page',
            'graphql_single_name' => 'experiencesPage',
            'graphql_plural_name' => 'experiencesPages',
            'menu_icon' => 'dashicons-camera',
        ],
        'dining_page' => [
            'label' => 'Dining Page',
            'graphql_single_name' => 'diningPage',
            'graphql_plural_name' => 'diningPages',
            'menu_icon' => 'dashicons-heart',
        ],
        'events_page' => [
            'label' => 'Events Page',
            'graphql_single_name' => 'eventsPage',
            'graphql_plural_name' => 'eventsPages',
            'menu_icon' => 'dashicons-groups',
        ],
        'wellness_page' => [
            'label' => 'Wellness Page',
            'graphql_single_name' => 'wellnessPage',
            'graphql_plural_name' => 'wellnessPages',
            'menu_icon' => 'dashicons-heart',
        ],
        'gallery_page' => [
            'label' => 'Gallery Page',
            'graphql_single_name' => 'galleryPage',
            'graphql_plural_name' => 'galleryPages',
            'menu_icon' => 'dashicons-format-gallery',
        ],
        'about_page' => [
            'label' => 'About Page',
            'graphql_single_name' => 'aboutPage',
            'graphql_plural_name' => 'aboutPages',
            'menu_icon' => 'dashicons-info',
        ],
        'contact_page' => [
            'label' => 'Contact Page',
            'graphql_single_name' => 'contactPage',
            'graphql_plural_name' => 'contactPages',
            'menu_icon' => 'dashicons-email',
        ],
    ];

    foreach ($pages as $post_type => $args) {
        register_post_type($post_type, array_merge($page_base, $args));
    }

    // ----- Item CPTs: one post per room / experience / testimonial /
    // photo / FAQ. Normal wp-admin lists (sortable via Display order,
    // trash/restore per item, featured image per item). Slugs
    // (post_name) drive Next.js detail URLs (/stay/:slug, …).
    $item_base = [
        'public' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_admin_bar' => true,
        'show_in_nav_menus' => false,
        'exclude_from_search' => true,
        'publicly_queryable' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'has_archive' => false,
        'rewrite' => false,
        'hierarchical' => false,
    ];

    $items = [
        'room' => [
            'label' => 'Rooms',
            'labels' => ['singular_name' => 'Room', 'add_new_item' => 'Add Room'],
            'graphql_single_name' => 'room',
            'graphql_plural_name' => 'rooms',
            'menu_icon' => 'dashicons-building',
            'menu_position' => 40,
            'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
        ],
        'experience' => [
            'label' => 'Experiences',
            'labels' => ['singular_name' => 'Experience', 'add_new_item' => 'Add Experience'],
            'graphql_single_name' => 'experience',
            'graphql_plural_name' => 'experiences',
            'menu_icon' => 'dashicons-camera',
            'menu_position' => 41,
            'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
        ],
        'testimonial' => [
            'label' => 'Testimonials',
            'labels' => ['singular_name' => 'Testimonial', 'add_new_item' => 'Add Testimonial'],
            'graphql_single_name' => 'testimonial',
            'graphql_plural_name' => 'testimonials',
            'menu_icon' => 'dashicons-format-quote',
            'menu_position' => 42,
            'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
        ],
        'gallery_item' => [
            'label' => 'Gallery Items',
            'labels' => ['singular_name' => 'Gallery Item', 'add_new_item' => 'Add Photo'],
            'graphql_single_name' => 'galleryItem',
            'graphql_plural_name' => 'galleryItems',
            'menu_icon' => 'dashicons-format-gallery',
            'menu_position' => 43,
            'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
        ],
        'faq' => [
            'label' => 'FAQs',
            'labels' => ['singular_name' => 'FAQ', 'add_new_item' => 'Add FAQ'],
            'graphql_single_name' => 'faq',
            'graphql_plural_name' => 'faqs',
            'menu_icon' => 'dashicons-editor-help',
            'menu_position' => 44,
            'supports' => ['title', 'editor', 'custom-fields'],
        ],
        // Reserved for a future offers section — nothing in the app reads
        // it yet. Kept registered so existing Offer posts keep working.
        'offer' => [
            'label' => 'Offers',
            'labels' => ['singular_name' => 'Offer', 'add_new_item' => 'Add Offer'],
            'graphql_single_name' => 'offer',
            'graphql_plural_name' => 'offers',
            'menu_icon' => 'dashicons-tickets-alt',
            'menu_position' => 45,
            'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
        ],
    ];

    foreach ($items as $post_type => $args) {
        $labels = $args['labels'];
        unset($args['labels']);
        register_post_type($post_type, array_merge($item_base, $args, ['labels' => $labels]));
    }

    // Private inbox for contact/booking forms — visible in wp-admin only
    register_post_type('inquiry', [
        'label' => 'Inquiries',
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_graphql' => false,
        'show_in_rest' => false,
        'supports' => ['title', 'editor', 'custom-fields'],
        'menu_icon' => 'dashicons-inbox',
        'menu_position' => 50,
        'has_archive' => false,
        'capabilities' => ['create_posts' => false],
        'map_meta_cap' => true,
    ]);
});

// Self-heal media parented to auto-drafts.
//
// Uploads made from an "Add …" screen belong to that screen's auto-draft,
// and WPGraphQL hides attachments of unpublished posts — so featured images
// AND ACF image fields resolve to null (frontend placeholders) even though
// wp-admin shows them as set. On save, re-attach such media to this post
// when its current parent is a draft/auto-draft/trash. Direct $wpdb update:
// no save_post recursion, no extra revisions. Attachments parented to other
// published posts (or unattached) are left alone.
add_action('save_post', function ($post_id) {
    if (wp_is_post_autosave($post_id) || wp_is_post_revision($post_id)) return;
    // ACF image-field meta keys (return_format array stores attachment ID).
    $image_keys = [
        'storyImage1', 'storyImage2', 'footerBackground', 'finalCtaImage',
        'diningImage1', 'diningImage2',
        'galleryImage1', 'galleryImage2', 'galleryImage3',
        'photo2', 'photo3', 'mapImage',
        'eventImage1', 'eventImage2', 'wellnessImage1', 'wellnessImage2',
        'locationMapImage', 'aboutImage1', 'aboutImage2', 'aboutImage3',
    ];
    $ids = [];
    $thumb_id = (int)get_post_thumbnail_id($post_id);
    if ($thumb_id) $ids[] = $thumb_id;
    foreach ($image_keys as $k) {
        $v = get_post_meta($post_id, $k, true);
        if (is_numeric($v) && (int)$v > 0) $ids[] = (int)$v;
    }
    $ids = array_unique($ids);
    if (!$ids) return;
    global $wpdb;
    foreach ($ids as $att_id) {
        $parent = (int)$wpdb->get_var($wpdb->prepare(
            "SELECT post_parent FROM $wpdb->posts WHERE ID = %d",
            $att_id
        ));
        if ($parent === (int)$post_id || $parent === 0) continue;
        $parent_status = $wpdb->get_var($wpdb->prepare(
            "SELECT post_status FROM $wpdb->posts WHERE ID = %d",
            $parent
        ));
        if (!in_array($parent_status, ['draft', 'auto-draft', 'trash'], true)) continue;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $wpdb->update($wpdb->posts, ['post_parent' => $post_id], ['ID' => $att_id]);
        clean_post_cache($att_id);
    }
}, 20);
