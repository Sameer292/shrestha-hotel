<?php
/**
 * Plugin Name: Shrestha Hotel CPTs
 * Description: Registers Custom Post Types for the hotel website
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) exit;

add_action('init', function () {
    $cpts = [
        'room' => [
            'label' => 'Rooms',
            'public' => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'room',
            'graphql_plural_name' => 'rooms',
            'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
            'menu_icon' => 'dashicons-admin-home',
            'has_archive' => true,
            'rewrite' => ['slug' => 'rooms'],
        ],
        'experience' => [
            'label' => 'Experiences',
            'public' => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'experience',
            'graphql_plural_name' => 'experiences',
            'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
            'menu_icon' => 'dashicons-palmtree',
            'has_archive' => true,
            'rewrite' => ['slug' => 'experiences'],
        ],
        'testimonial' => [
            'label' => 'Testimonials',
            'public' => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'testimonial',
            'graphql_plural_name' => 'testimonials',
            'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
            'menu_icon' => 'dashicons-format-quote',
            'has_archive' => false,
        ],
        'gallery_item' => [
            'label' => 'Gallery Items',
            'public' => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'galleryItem',
            'graphql_plural_name' => 'galleryItems',
            'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
            'menu_icon' => 'dashicons-format-gallery',
            'has_archive' => true,
            'rewrite' => ['slug' => 'gallery'],
        ],
        'offer' => [
            'label' => 'Offers',
            'public' => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'offer',
            'graphql_plural_name' => 'offers',
            'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
            'menu_icon' => 'dashicons-tickets-alt',
            'has_archive' => true,
        ],
        'faq' => [
            'label' => 'FAQs',
            'public' => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'faq',
            'graphql_plural_name' => 'faqs',
            'supports' => ['title', 'editor', 'custom-fields'],
            'menu_icon' => 'dashicons-editor-help',
            'has_archive' => false,
        ],
    ];

    foreach ($cpts as $post_type => $args) {
        register_post_type($post_type, $args);
    }
});
