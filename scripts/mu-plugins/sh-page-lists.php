<?php
/**
 * Plugin Name: Shrestha Page Lists
 * Description: Typed GraphQL list for the meals repeater nested in the
 * Dining Page entry (simple title+text cards with no detail page — they
 * stay on the page entry by design). All real list content (rooms,
 * experiences, testimonials, photos, FAQs) lives in its own CPT and is
 * queried natively — no custom resolvers needed for those.
 * Version: 2.0.0
 */

if (!defined('ABSPATH')) exit;

// ---------- generic repeater reader ----------
// Supports both ACF storage formats:
//  1. count + per-row sub-keys  (name=N, name_0_sub=…, …)
//  2. single serialized array   (some save paths)
function sh_repeater_rows($post_id, $name) {
    $rows = [];
    $count = (int)get_post_meta($post_id, $name, true);
    if ($count > 0) {
        global $wpdb;
        $like = $wpdb->esc_like($name) . '_%';
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $keys = $wpdb->get_col($wpdb->prepare(
            "SELECT meta_key FROM $wpdb->postmeta WHERE post_id = %d AND meta_key LIKE %s",
            $post_id, $like
        ));
        $subs = [];
        $prefix = $name . '_';
        foreach ((array)$keys as $k) {
            if (strpos($k, '_') === 0) continue; // _name_i_sub key refs
            if (strpos($k, $prefix) !== 0) continue;
            $rest = substr($k, strlen($prefix)); // "0_sub"
            $pos = strpos($rest, '_');
            if ($pos === false) continue;
            $i = (int)substr($rest, 0, $pos);
            if ((string)$i !== substr($rest, 0, $pos)) continue;
            if ($i < 0 || $i >= $count) continue;
            $subs[$i][] = substr($rest, $pos + 1);
        }
        for ($i = 0; $i < $count; $i++) {
            $row = [];
            foreach (array_unique($subs[$i] ?? []) as $sub) {
                $row[$sub] = get_post_meta($post_id, "{$name}_{$i}_{$sub}", true);
            }
            $rows[] = $row;
        }
        return $rows;
    }
    $raw = get_post_meta($post_id, $name, true);
    if (is_string($raw) && $raw !== '') {
        $u = @unserialize($raw);
        if (is_array($u)) return array_values(array_filter($u, 'is_array'));
    }
    if (is_array($raw)) return array_values(array_filter($raw, 'is_array'));
    return [];
}

function sh_str($v) { return is_string($v) || is_numeric($v) ? trim((string)$v) : ''; }

// ---------- GraphQL types + fields ----------
add_action('graphql_register_types', function () {
    register_graphql_object_type('ShMealRow', ['fields' => [
        'title' => ['type' => 'String'], 'text' => ['type' => 'String'],
    ]]);

    register_graphql_field('DiningPage', 'mealsList', [
        'type' => ['list_of' => 'ShMealRow'],
        'description' => 'Meal cards nested in the Dining Page entry',
        'resolve' => function ($post) {
            $id = $post->ID ?? ($post->databaseId ?? 0);
            $out = [];
            foreach (sh_repeater_rows($id, 'meals') as $r) {
                $out[] = [
                    'title' => sh_str($r['title'] ?? ''),
                    'text' => sh_str($r['text'] ?? ''),
                ];
            }
            return $out;
        },
    ]);
});
