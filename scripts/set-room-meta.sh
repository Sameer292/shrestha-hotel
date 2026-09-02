#!/usr/bin/env bash
set -euo pipefail
# set-room-meta.sh — Sets ACF meta values for all rooms (ID-agnostic, looks up by slug)

get_id() {
  local type="$1" slug="$2"
  docker compose run --rm wpcli --path=/var/www/html post list --post_type="$type" --format=json 2>/dev/null \
    | python3 -c "import json,sys; data=json.load(sys.stdin); print(next((str(x['ID']) for x in data if x.get('post_name')==sys.argv[1]), ''))" "$slug"
}

WP="docker compose run --rm wpcli --path=/var/www/html"
echo "==> Setting room meta values..."

ID=$(get_id room forest-retreat-suite)
if [ -n "$ID" ]; then
  $WP post meta update "$ID" startingPrice 18500 >/dev/null
  $WP post meta update "$ID" capacity 2 >/dev/null
  $WP post meta update "$ID" adults 2 >/dev/null
  $WP post meta update "$ID" children 1 >/dev/null
  $WP post meta update "$ID" bedType "King Bed" >/dev/null
  $WP post meta update "$ID" roomSize "38 m²" >/dev/null
  $WP post meta update "$ID" view "Forest & Valley View" >/dev/null
  $WP post meta update "$ID" amenities "Mountain View, Hot Spring Access, Private Bathroom, Heating, Balcony, Wi-Fi, Garden View" >/dev/null
  $WP post meta update "$ID" checkIn "2:00 PM" >/dev/null
  $WP post meta update "$ID" checkOut "11:00 AM" >/dev/null
  $WP post meta update "$ID" featured 1 >/dev/null
  $WP post meta update "$ID" displayOrder 1 >/dev/null
  echo "  ✓ Forest Retreat Suite (ID $ID)"
else echo "  ✗ forest-retreat-suite not found"; fi

ID=$(get_id room hotspring-deluxe)
if [ -n "$ID" ]; then
  $WP post meta update "$ID" startingPrice 14500 >/dev/null
  $WP post meta update "$ID" capacity 2 >/dev/null
  $WP post meta update "$ID" adults 2 >/dev/null
  $WP post meta update "$ID" children 1 >/dev/null
  $WP post meta update "$ID" bedType "Queen Bed" >/dev/null
  $WP post meta update "$ID" roomSize "28 m²" >/dev/null
  $WP post meta update "$ID" view "Garden & Spring View" >/dev/null
  $WP post meta update "$ID" amenities "Hot Spring Access, Mountain View, Private Bathroom, Heating, Wi-Fi, Room Service" >/dev/null
  $WP post meta update "$ID" checkIn "2:00 PM" >/dev/null
  $WP post meta update "$ID" checkOut "11:00 AM" >/dev/null
  $WP post meta update "$ID" featured 1 >/dev/null
  $WP post meta update "$ID" displayOrder 2 >/dev/null
  echo "  ✓ Hotspring Deluxe (ID $ID)"
else echo "  ✗ hotspring-deluxe not found"; fi

ID=$(get_id room mountain-family-retreat)
if [ -n "$ID" ]; then
  $WP post meta update "$ID" startingPrice 22000 >/dev/null
  $WP post meta update "$ID" capacity 4 >/dev/null
  $WP post meta update "$ID" adults 3 >/dev/null
  $WP post meta update "$ID" children 2 >/dev/null
  $WP post meta update "$ID" bedType "King + Bunk" >/dev/null
  $WP post meta update "$ID" roomSize "45 m²" >/dev/null
  $WP post meta update "$ID" view "Mountain Panorama" >/dev/null
  $WP post meta update "$ID" amenities "Family Rooms, Mountain View, Hot Spring Access, Heating, Balcony, Wi-Fi" >/dev/null
  $WP post meta update "$ID" checkIn "2:00 PM" >/dev/null
  $WP post meta update "$ID" checkOut "11:00 AM" >/dev/null
  $WP post meta update "$ID" featured 1 >/dev/null
  $WP post meta update "$ID" displayOrder 3 >/dev/null
  echo "  ✓ Mountain Family Retreat (ID $ID)"
else echo "  ✗ mountain-family-retreat not found"; fi

ID=$(get_id room riverside-calm)
if [ -n "$ID" ]; then
  $WP post meta update "$ID" startingPrice 11500 >/dev/null
  $WP post meta update "$ID" capacity 2 >/dev/null
  $WP post meta update "$ID" adults 2 >/dev/null
  $WP post meta update "$ID" children 0 >/dev/null
  $WP post meta update "$ID" bedType "Queen Bed" >/dev/null
  $WP post meta update "$ID" roomSize "24 m²" >/dev/null
  $WP post meta update "$ID" view "River & Forest" >/dev/null
  $WP post meta update "$ID" amenities "Hot Spring Access, Private Bathroom, Wi-Fi, Heating" >/dev/null
  $WP post meta update "$ID" checkIn "2:00 PM" >/dev/null
  $WP post meta update "$ID" checkOut "11:00 AM" >/dev/null
  $WP post meta update "$ID" featured 0 >/dev/null
  $WP post meta update "$ID" displayOrder 4 >/dev/null
  echo "  ✓ Riverside Calm (ID $ID)"
else echo "  ✗ riverside-calm not found"; fi

echo ""
echo "==> Testing GraphQL..."
curl -s -X POST http://localhost:8080/graphql -H 'Content-Type: application/json' -d '{"query": "{ rooms { nodes { title roomFields { startingprice bedtype roomsize view } } } }"}' | python3 -m json.tool
