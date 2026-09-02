#!/usr/bin/env bash
set -euo pipefail
# migrate-content.sh — Creates all content via WP-CLI commands

WPCLI="docker compose run --rm wpcli --path=/var/www/html"

echo "===================================="
echo "  SHRESTHA HOTEL — CMS MIGRATION"
echo "===================================="
echo ""

# ============================================
# 1. ROOMS
# ============================================
echo "==> Creating Rooms..."

$WPCLI post create --post_type=room --post_title="Forest Retreat Suite" \
  --post_content='<p>A generous corner suite wrapped in timber and linen, with a private balcony facing the forested ridge. Stone bath, warm wood floors, and quiet mornings with tea as mist lifts from the valley. Designed for lingering.</p>' \
  --post_excerpt='Timber, stone and valley light — our most private suite.' \
  --post_status=publish 2>/dev/null && echo "  ✓ Forest Retreat Suite"

$WPCLI post create --post_type=room --post_title="Hotspring Deluxe" \
  --post_content='<p>Closest to the hot spring baths, this warm, grounded room pairs oak details with soft cream linen. Ideal for guests who come for the water and stay for the quiet. Private sit-out with valley glimpses.</p>' \
  --post_excerpt='Steps from the spring — warmth, whenever you want it.' \
  --post_status=publish 2>/dev/null && echo "  ✓ Hotspring Deluxe"

$WPCLI post create --post_type=room --post_title="Mountain Family Retreat" \
  --post_content='<p>Two connected spaces, warm timber bunk and a king bed, with room for small travelers and quiet corners for tea. Large windows bring the ridge inside. Interconnecting option available.</p>' \
  --post_excerpt='Space for togetherness, framed by the Himalayas.' \
  --post_status=publish 2>/dev/null && echo "  ✓ Mountain Family Retreat"

$WPCLI post create --post_type=room --post_title="Riverside Calm" \
  --post_content='<p>A small, deeply calm room near the riverside walk. Perfect for solo travelers or couples seeking simplicity: warm blanket, good book, balcony chair and the evening sound of water.</p>' \
  --post_excerpt='Intimate, quiet — the sound of water nearby.' \
  --post_status=publish 2>/dev/null && echo "  ✓ Riverside Calm"

# ============================================
# 2. EXPERIENCES
# ============================================
echo ""
echo "==> Creating Experiences..."

$WPCLI post create --post_type=experience --post_title="Natural Hot Spring Bathing" \
  --post_content='<p>The spring is the hotel''s quiet center. Bathe at dawn when steam lifts into forest light, or after a walk when legs are tired. Indoor and open-air pools, stone-lined, with space for silence.</p>' \
  --post_excerpt='Mineral-rich waters held at a gentle warmth.' \
  --post_status=publish 2>/dev/null && echo "  ✓ Natural Hot Spring Bathing"

$WPCLI post create --post_type=experience --post_title="Mountain Walks" \
  --post_content='<p>Guided or self-led walks from the hotel gate — ridge viewpoints, village paths and forest loops. Mornings are clearest.</p>' \
  --post_excerpt='Unmarked trails through rhododendron and pine.' \
  --post_status=publish 2>/dev/null && echo "  ✓ Mountain Walks"

$WPCLI post create --post_type=experience --post_title="Village Exploration" \
  --post_content='<p>Walk to nearby villages, meet makers and farmers, taste local milks and honeys. A gentle immersion in Myagdi life.</p>' \
  --post_excerpt='Tea houses, terraced fields and unhurried conversation.' \
  --post_status=publish 2>/dev/null && echo "  ✓ Village Exploration"

$WPCLI post create --post_type=experience --post_title="Riverside Relaxation" \
  --post_content='<p>A short walk to river stones and shade. Bring tea, a book, or nothing at all.</p>' \
  --post_excerpt='Sit by the Kali Gandaki''s quiet stretches.' \
  --post_status=publish 2>/dev/null && echo "  ✓ Riverside Relaxation"

$WPCLI post create --post_type=experience --post_title="Bonfire Evenings" \
  --post_content='<p>When the evening cools, we gather by the fire — music, tea, and mountain air.</p>' \
  --post_excerpt='Firelight, stories and warm plates shared outside.' \
  --post_status=publish 2>/dev/null && echo "  ✓ Bonfire Evenings"

$WPCLI post create --post_type=experience --post_title="Scenic Viewpoints" \
  --post_content='<p>Short drives to viewpoints over Dhaulagiri and Annapurna on clear days.</p>' \
  --post_excerpt='Wide horizons, best at sunrise.' \
  --post_status=publish 2>/dev/null && echo "  ✓ Scenic Viewpoints"

# ============================================
# 3. TESTIMONIALS
# ============================================
echo ""
echo "==> Creating Testimonials..."

$WPCLI post create --post_type=testimonial --post_title="Aarav & Meera" \
  --post_content='<p>We came for the hot spring and stayed for the quiet. The kind of place that slows your breath without asking you to.</p>' \
  --post_status=publish 2>/dev/null && echo "  ✓ Aarav & Meera"

$WPCLI post create --post_type=testimonial --post_title="Sophie L." \
  --post_content='<p>Warm water under open sky, forest all around, and staff who remember how you take your tea. Perfect.</p>' \
  --post_status=publish 2>/dev/null && echo "  ✓ Sophie L."

$WPCLI post create --post_type=testimonial --post_title="Rajesh K." \
  --post_content='<p>Clean, calm, deeply Nepali in its hospitality. The rooms feel like a mountain home, not a hotel.</p>' \
  --post_status=publish 2>/dev/null && echo "  ✓ Rajesh K."

# ============================================
# 4. GALLERY ITEMS
# ============================================
echo ""
echo "==> Creating Gallery Items..."

$WPCLI post create --post_type=gallery_item --post_title="Timber and stone lobby at dusk" --post_status=publish 2>/dev/null && echo "  ✓ Timber and stone lobby at dusk"
$WPCLI post create --post_type=gallery_item --post_title="Steam rising at dawn" --post_status=publish 2>/dev/null && echo "  ✓ Steam rising at dawn"
$WPCLI post create --post_type=gallery_item --post_title="Forest Retreat Suite" --post_status=publish 2>/dev/null && echo "  ✓ Forest Retreat Suite"
$WPCLI post create --post_type=gallery_item --post_title="Misty ridge morning" --post_status=publish 2>/dev/null && echo "  ✓ Misty ridge morning"
$WPCLI post create --post_type=gallery_item --post_title="Wood-fired bread and dal" --post_status=publish 2>/dev/null && echo "  ✓ Wood-fired bread and dal"
$WPCLI post create --post_type=gallery_item --post_title="Village walk" --post_status=publish 2>/dev/null && echo "  ✓ Village walk"
$WPCLI post create --post_type=gallery_item --post_title="River stones" --post_status=publish 2>/dev/null && echo "  ✓ River stones"
$WPCLI post create --post_type=gallery_item --post_title="Open-air bath" --post_status=publish 2>/dev/null && echo "  ✓ Open-air bath"

# ============================================
# 5. FAQs
# ============================================
echo ""
echo "==> Creating FAQs..."

$WPCLI post create --post_type=faq --post_title="Is the hot spring natural?" \
  --post_content='<p>Yes — mineral-rich water sourced from deep Himalayan springs, maintained at 38–42°C for comfortable bathing.</p>' \
  --post_status=publish 2>/dev/null && echo "  ✓ Is the hot spring natural?"

$WPCLI post create --post_type=faq --post_title="Who can use the hot spring?" \
  --post_content='<p>All staying guests have complimentary access. Please shower before entering and follow posted etiquette.</p>' \
  --post_status=publish 2>/dev/null && echo "  ✓ Who can use the hot spring?"

$WPCLI post create --post_type=faq --post_title="What are check-in and check-out times?" \
  --post_content='<p>Check-in from 2:00 PM, check-out by 11:00 AM. Early check-in/late check-out on request, subject to availability.</p>' \
  --post_status=publish 2>/dev/null && echo "  ✓ What are check-in and check-out times?"

$WPCLI post create --post_type=faq --post_title="Is the hotel suitable for families?" \
  --post_content='<p>Yes — we have family rooms and interconnecting options. Please mention children''s ages when booking.</p>' \
  --post_status=publish 2>/dev/null && echo "  ✓ Is the hotel suitable for families?"

# ============================================
# 6. OFFERS
# ============================================
echo ""
echo "==> Creating Offers..."

$WPCLI post create --post_type=offer --post_title="Winter Warmth — 3 Nights" \
  --post_content='<p>Three nights, daily hot spring, breakfast and a guided ridge walk. For slow winter light.</p>' \
  --post_status=publish 2>/dev/null && echo "  ✓ Winter Warmth — 3 Nights"

# ============================================
# 7. ACF OPTIONS — HOTEL SETTINGS
# ============================================
echo ""
echo "==> Setting Hotel Settings..."

$WPCLI option update shrestha_hotel_settings_hotelName 'Shrestha Hotel Hotspring' 2>/dev/null
$WPCLI option update shrestha_hotel_settings_tagline 'Where the Mountains Meet Warm Waters' 2>/dev/null
$WPCLI option update shrestha_hotel_settings_phone '+977 9800000000' 2>/dev/null
$WPCLI option update shrestha_hotel_settings_email 'namaste@shresthahotel.com' 2>/dev/null
$WPCLI option update shrestha_hotel_settings_whatsapp '+9779800000000' 2>/dev/null
$WPCLI option update shrestha_hotel_settings_address 'Beni, Myagdi, Gandaki Province, Nepal' 2>/dev/null
$WPCLI option update shrestha_hotel_settings_checkIn '2:00 PM' 2>/dev/null
$WPCLI option update shrestha_hotel_settings_checkOut '11:00 AM' 2>/dev/null
$WPCLI option update shrestha_hotel_settings_currency 'NPR' 2>/dev/null
$WPCLI option update shrestha_hotel_settings_footerDescription 'A peaceful Himalayan retreat shaped by nature, warm hospitality, and restorative natural hot springs in the heart of Myagdi.' 2>/dev/null
echo "  ✓ Hotel Settings saved"

# ============================================
# DONE
# ============================================
echo ""
echo "===================================="
echo "  MIGRATION COMPLETE!"
echo "===================================="
echo ""
echo "WordPress Admin: http://localhost:8080/wp-admin"
echo "GraphQL: http://localhost:8080/graphql"
echo ""
echo "Next steps:"
echo "  1. Open WP Admin and create ACF field groups manually"
echo "  2. Test GraphQL query: curl -X POST http://localhost:8080/graphql -H 'Content-Type: application/json' -d '{\"query\":\"{ rooms { nodes { title } } }\"}'"
