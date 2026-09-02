#!/usr/bin/env bash
set -euo pipefail
# set-all-meta.sh — Sets ACF meta for all CPTs (ID-agnostic, looks up by title)

get_id() {
  local type="$1" title="$2"
  docker compose run --rm wpcli --path=/var/www/html post list --post_type="$type" --format=json 2>/dev/null \
    | python3 -c "import json,sys; data=json.load(sys.stdin); t=sys.argv[1]; print(next((str(x['ID']) for x in data if x.get('post_title')==t), ''))" "$title"
}

WP="docker compose run --rm wpcli --path=/var/www/html"

echo "==> Setting Experience meta..."
for title in "Natural Hot Spring Bathing" "Mountain Walks" "Village Exploration" "Riverside Relaxation" "Bonfire Evenings" "Scenic Viewpoints"; do
  ID=$(get_id experience "$title")
  case "$title" in
    "Natural Hot Spring Bathing") D="Open daily 6AM–9PM"; Diff="Easy"; S="Year-round"; F=1 ;;
    "Mountain Walks") D="1–4 hours"; Diff="Easy to Moderate"; S="Sep–May best"; F=1 ;;
    "Village Exploration") D="2–3 hours"; Diff="Easy"; S="Year-round"; F=1 ;;
    "Riverside Relaxation") D="Flexible"; Diff="Easy"; S="Year-round"; F=0 ;;
    "Bonfire Evenings") D="Evenings"; Diff="Easy"; S="Oct–Apr"; F=1 ;;
    "Scenic Viewpoints") D="Half-day"; Diff="Easy"; S="Oct–Apr"; F=0 ;;
  esac
  if [ -n "$ID" ]; then
    $WP post meta update "$ID" duration "$D" >/dev/null
    $WP post meta update "$ID" difficulty "$Diff" >/dev/null
    $WP post meta update "$ID" season "$S" >/dev/null
    $WP post meta update "$ID" featured "$F" >/dev/null
    echo "  ✓ $title (ID $ID)"
  else echo "  ✗ $title not found"; fi
done

echo ""
echo "==> Setting Testimonial meta..."
for title in "Aarav & Meera" "Sophie L." "Rajesh K."; do
  ID=$(get_id testimonial "$title")
  case "$title" in
    "Aarav & Meera") GN="Aarav & Meera"; GL="Kathmandu, Nepal"; Q="We came for the hot spring and stayed for the quiet. The kind of place that slows your breath without asking you to." ;;
    "Sophie L.") GN="Sophie L."; GL="Lyon, France"; Q="Warm water under open sky, forest all around, and staff who remember how you take your tea. Perfect." ;;
    "Rajesh K.") GN="Rajesh K."; GL="Pokhara, Nepal"; Q="Clean, calm, deeply Nepali in its hospitality. The rooms feel like a mountain home, not a hotel." ;;
  esac
  if [ -n "$ID" ]; then
    $WP post meta update "$ID" guestName "$GN" >/dev/null
    $WP post meta update "$ID" guestLocation "$GL" >/dev/null
    $WP post meta update "$ID" quote "$Q" >/dev/null
    $WP post meta update "$ID" rating 5 >/dev/null
    $WP post meta update "$ID" featured 1 >/dev/null
    echo "  ✓ $title (ID $ID)"
  else echo "  ✗ $title not found (might be renamed — check WP Admin)"; fi
done

echo ""
echo "==> Setting Gallery Item meta..."
declare -A GALLERY=(
  ["Timber and stone lobby at dusk"]="Hotel|Timber and stone lobby at dusk|1"
  ["Steam rising at dawn"]="Hot Spring|Steam rising at dawn|2"
  ["Forest Retreat Suite"]="Rooms|Forest Retreat Suite|3"
  ["Misty ridge morning"]="Nature|Misty ridge morning|4"
  ["Wood-fired bread and dal"]="Dining|Wood-fired bread and dal|5"
  ["Village walk"]="Experiences|Village walk|6"
  ["River stones"]="Nature|River stones|7"
  ["Open-air bath"]="Hot Spring|Open-air bath|8"
)
for title in "${!GALLERY[@]}"; do
  IFS='|' read -r cat cap order <<< "${GALLERY[$title]}"
  ID=$(get_id gallery_item "$title")
  if [ -n "$ID" ]; then
    $WP post meta update "$ID" category "$cat" >/dev/null
    $WP post meta update "$ID" caption "$cap" >/dev/null
    $WP post meta update "$ID" displayOrder "$order" >/dev/null
    echo "  ✓ $title (ID $ID)"
  else echo "  ✗ $title not found"; fi
done

echo ""
echo "==> Setting FAQ meta..."
declare -A FAQS=(
  ["Is the hot spring natural?"]="Yes — mineral-rich water sourced from deep Himalayan springs, maintained at 38–42°C for comfortable bathing.|Hot Spring|1"
  ["Who can use the hot spring?"]="All staying guests have complimentary access. Please shower before entering and follow posted etiquette.|Hot Spring|2"
  ["What are check-in and check-out times?"]="Check-in from 2:00 PM, check-out by 11:00 AM. Early check-in/late check-out on request, subject to availability.|Stay|3"
  ["Is the hotel suitable for families?"]="Yes — we have family rooms and interconnecting options. Please mention children's ages when booking.|Stay|4"
)
for title in "${!FAQS[@]}"; do
  IFS='|' read -r ans cat order <<< "${FAQS[$title]}"
  ID=$(get_id faq "$title")
  if [ -n "$ID" ]; then
    $WP post meta update "$ID" question "$title" >/dev/null
    $WP post meta update "$ID" answer "$ans" >/dev/null
    $WP post meta update "$ID" category "$cat" >/dev/null
    $WP post meta update "$ID" displayOrder "$order" >/dev/null
    echo "  ✓ $title (ID $ID)"
  else echo "  ✗ $title not found"; fi
done

echo ""
echo "==> Done! All meta values set."
