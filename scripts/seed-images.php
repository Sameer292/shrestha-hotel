<?php
// seed-images.php — run INSIDE wordpress container:
//   wp eval-file /tmp/seed-images.php
// Downloads curated Unsplash photos into the Media Library and attaches
// them as featured images. Idempotent: skips posts that already have one.
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

$U = fn($id) => "https://images.unsplash.com/$id?auto=format&fit=crop&w=1600&q=80";
$map = [
    'room' => [
        'forest-retreat-suite' => $U('photo-1566665797739-1674de7a421a'),
        'hotspring-deluxe' => $U('photo-1590490360182-c33d57733427'),
        'mountain-family-retreat' => $U('photo-1611892440504-42a792e24d32'),
        'riverside-calm' => $U('photo-1582719478250-c89cae4dc85b'),
    ],
    'experience' => [
        'natural-hot-spring-bathing' => $U('photo-1544550581-5f7ceaf7f992'),
        'mountain-walks' => $U('photo-1551632811-561732d1e306'),
        'village-exploration' => $U('photo-1486915309851-b0cc1f8a0084'),
        'riverside-relaxation' => $U('photo-1501785888041-af3ef285b470'),
        'bonfire-evenings' => $U('photo-1504280390367-361c6d9f38f4'),
        'scenic-viewpoints' => $U('photo-1464822759023-fed622ff2c3b'),
    ],
    'gallery_item' => [
        'timber-and-stone-lobby-at-dusk' => $U('photo-1520250497591-112f2f40a3f4'),
        'steam-rising-at-dawn' => $U('photo-1571896349842-33c89424de2d'),
        'forest-suite-photo' => $U('photo-1560448204-e02f11c3d0e2'),
        'misty-ridge-morning' => $U('photo-1506905925346-21bda4d32df4'),
        'wood-fired-bread-and-dal' => $U('photo-1414235077428-338989a2e8c0'),
        'village-walk' => $U('photo-1486915309851-b0cc1f8a0084'),
        'river-stones' => $U('photo-1501785888041-af3ef285b470'),
        'open-air-bath' => $U('photo-1518002054494-3a6f94352e9d'),
    ],
];

foreach ($map as $type => $posts) {
    foreach ($posts as $slug => $url) {
        $p = get_page_by_path($slug, OBJECT, $type);
        if (!$p) { echo "  ✗ $type/$slug not found\n"; continue; }
        if (has_post_thumbnail($p->ID)) { echo "  · $type/$slug already has image\n"; continue; }
        $tmp = download_url($url, 60);
        if (is_wp_error($tmp)) { echo "  ✗ $type/$slug download failed\n"; continue; }
        $file = ['name' => "$slug.jpg", 'tmp_name' => $tmp];
        $att = media_handle_sideload($file, $p->ID, $p->post_title);
        if (is_wp_error($att)) { @unlink($tmp); echo "  ✗ $type/$slug sideload failed\n"; continue; }
        set_post_thumbnail($p->ID, $att);
        echo "  ✓ $type/$slug\n";
    }
}
echo "done\n";
