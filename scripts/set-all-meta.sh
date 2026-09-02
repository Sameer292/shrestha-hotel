#!/usr/bin/env bash
set -euo pipefail
# set-all-meta.sh — Sets ACF meta for all CPTs

WP="docker compose run --rm wpcli --path=/var/www/html"

echo "==> Setting Experience meta..."

# Natural Hot Spring Bathing (42)
$WP post meta update 42 duration "Open daily 6AM–9PM"
$WP post meta update 42 difficulty "Easy"
$WP post meta update 42 season "Year-round"
$WP post meta update 42 featured 1
echo "  ✓ Natural Hot Spring Bathing"

# Mountain Walks (43)
$WP post meta update 43 duration "1–4 hours"
$WP post meta update 43 difficulty "Easy to Moderate"
$WP post meta update 43 season "Sep–May best"
$WP post meta update 43 featured 1
echo "  ✓ Mountain Walks"

# Village Exploration (44)
$WP post meta update 44 duration "2–3 hours"
$WP post meta update 44 difficulty "Easy"
$WP post meta update 44 season "Year-round"
$WP post meta update 44 featured 1
echo "  ✓ Village Exploration"

# Riverside Relaxation (45)
$WP post meta update 45 duration "Flexible"
$WP post meta update 45 difficulty "Easy"
$WP post meta update 45 season "Year-round"
$WP post meta update 45 featured 0
echo "  ✓ Riverside Relaxation"

# Bonfire Evenings (46)
$WP post meta update 46 duration "Evenings"
$WP post meta update 46 difficulty "Easy"
$WP post meta update 46 season "Oct–Apr"
$WP post meta update 46 featured 1
echo "  ✓ Bonfire Evenings"

# Scenic Viewpoints (47)
$WP post meta update 47 duration "Half-day"
$WP post meta update 47 difficulty "Easy"
$WP post meta update 47 season "Oct–Apr"
$WP post meta update 47 featured 0
echo "  ✓ Scenic Viewpoints"

echo ""
echo "==> Setting Testimonial meta..."

# Aarav & Meera (48)
$WP post meta update 48 guestName "Aarav & Meera"
$WP post meta update 48 guestLocation "Kathmandu, Nepal"
$WP post meta update 48 quote "We came for the hot spring and stayed for the quiet. The kind of place that slows your breath without asking you to."
$WP post meta update 48 rating 5
$WP post meta update 48 featured 1
echo "  ✓ Aarav & Meera"

# Sophie L. (49)
$WP post meta update 49 guestName "Sophie L."
$WP post meta update 49 guestLocation "Lyon, France"
$WP post meta update 49 quote "Warm water under open sky, forest all around, and staff who remember how you take your tea. Perfect."
$WP post meta update 49 rating 5
$WP post meta update 49 featured 1
echo "  ✓ Sophie L."

# Rajesh K. (50)
$WP post meta update 50 guestName "Rajesh K."
$WP post meta update 50 guestLocation "Pokhara, Nepal"
$WP post meta update 50 quote "Clean, calm, deeply Nepali in its hospitality. The rooms feel like a mountain home, not a hotel."
$WP post meta update 50 rating 5
$WP post meta update 50 featured 1
echo "  ✓ Rajesh K."

echo ""
echo "==> Setting Gallery Item meta..."

$WP post meta update 51 category "Hotel"
$WP post meta update 51 caption "Timber and stone lobby at dusk"
$WP post meta update 51 displayOrder 1

$WP post meta update 52 category "Hot Spring"
$WP post meta update 52 caption "Steam rising at dawn"
$WP post meta update 52 displayOrder 2

$WP post meta update 53 category "Rooms"
$WP post meta update 53 caption "Forest Retreat Suite"
$WP post meta update 53 displayOrder 3

$WP post meta update 54 category "Nature"
$WP post meta update 54 caption "Misty ridge morning"
$WP post meta update 54 displayOrder 4

$WP post meta update 55 category "Dining"
$WP post meta update 55 caption "Wood-fired bread and dal"
$WP post meta update 55 displayOrder 5

$WP post meta update 56 category "Experiences"
$WP post meta update 56 caption "Village walk"
$WP post meta update 56 displayOrder 6

$WP post meta update 57 category "Nature"
$WP post meta update 57 caption "River stones"
$WP post meta update 57 displayOrder 7

$WP post meta update 58 category "Hot Spring"
$WP post meta update 58 caption "Open-air bath"
$WP post meta update 58 displayOrder 8
echo "  ✓ All gallery items"

echo ""
echo "==> Setting FAQ meta..."

$WP post meta update 59 question "Is the hot spring natural?"
$WP post meta update 59 answer "Yes — mineral-rich water sourced from deep Himalayan springs, maintained at 38–42°C for comfortable bathing."
$WP post meta update 59 category "Hot Spring"
$WP post meta update 59 displayOrder 1

$WP post meta update 60 question "Who can use the hot spring?"
$WP post meta update 60 answer "All staying guests have complimentary access. Please shower before entering and follow posted etiquette."
$WP post meta update 60 category "Hot Spring"
$WP post meta update 60 displayOrder 2

$WP post meta update 61 question "What are check-in and check-out times?"
$WP post meta update 61 answer "Check-in from 2:00 PM, check-out by 11:00 AM. Early check-in/late check-out on request, subject to availability."
$WP post meta update 61 category "Stay"
$WP post meta update 61 displayOrder 3

$WP post meta update 62 question "Is the hotel suitable for families?"
$WP post meta update 62 answer "Yes — we have family rooms and interconnecting options. Please mention children's ages when booking."
$WP post meta update 62 category "Stay"
$WP post meta update 62 displayOrder 4
echo "  ✓ All FAQs"

echo ""
echo "==> Done! All meta values set."
