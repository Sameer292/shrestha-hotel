<?php
/**
 * Plugin Name: Shrestha Hotel ACF Loader
 * Description: Loads ACF field groups from local JSON and exposes them in GraphQL
 * Version: 1.0.3
 */

if (!defined('ABSPATH')) exit;

// Load ACF field groups from local JSON
add_filter('acf/settings/load_json', function ($paths) {
    $paths[] = get_stylesheet_directory() . '/acf-json';
    return $paths;
});

// Save ACF field groups to local JSON (for editing in admin)
add_filter('acf/settings/save_json', function ($path) {
    return get_stylesheet_directory() . '/acf-json';
});
