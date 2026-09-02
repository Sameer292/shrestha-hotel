#!/usr/bin/env bash
set -euo pipefail
# set-room-meta.sh — Sets ACF meta values for all rooms

WP="docker compose run --rm wpcli --path=/var/www/html"

echo "==> Setting room meta values..."

# Forest Retreat Suite (ID 38)
$WP post meta update 38 startingPrice 18500
$WP post meta update 38 capacity 2
$WP post meta update 38 adults 2
$WP post meta update 38 children 1
$WP post meta update 38 bedType "King Bed"
$WP post meta update 38 roomSize "38 m²"
$WP post meta update 38 view "Forest & Valley View"
$WP post meta update 38 amenities "Mountain View, Hot Spring Access, Private Bathroom, Heating, Balcony, Wi-Fi, Garden View"
$WP post meta update 38 checkIn "2:00 PM"
$WP post meta update 38 checkOut "11:00 AM"
$WP post meta update 38 featured 1
$WP post meta update 38 displayOrder 1
echo "  ✓ Forest Retreat Suite"

# Hotspring Deluxe (ID 39)
$WP post meta update 39 startingPrice 14500
$WP post meta update 39 capacity 2
$WP post meta update 39 adults 2
$WP post meta update 39 children 1
$WP post meta update 39 bedType "Queen Bed"
$WP post meta update 39 roomSize "28 m²"
$WP post meta update 39 view "Garden & Spring View"
$WP post meta update 39 amenities "Hot Spring Access, Mountain View, Private Bathroom, Heating, Wi-Fi, Room Service"
$WP post meta update 39 checkIn "2:00 PM"
$WP post meta update 39 checkOut "11:00 AM"
$WP post meta update 39 featured 1
$WP post meta update 39 displayOrder 2
echo "  ✓ Hotspring Deluxe"

# Mountain Family Retreat (ID 40)
$WP post meta update 40 startingPrice 22000
$WP post meta update 40 capacity 4
$WP post meta update 40 adults 3
$WP post meta update 40 children 2
$WP post meta update 40 bedType "King + Bunk"
$WP post meta update 40 roomSize "45 m²"
$WP post meta update 40 view "Mountain Panorama"
$WP post meta update 40 amenities "Family Rooms, Mountain View, Hot Spring Access, Heating, Balcony, Wi-Fi"
$WP post meta update 40 checkIn "2:00 PM"
$WP post meta update 40 checkOut "11:00 AM"
$WP post meta update 40 featured 1
$WP post meta update 40 displayOrder 3
echo "  ✓ Mountain Family Retreat"

# Riverside Calm (ID 41)
$WP post meta update 41 startingPrice 11500
$WP post meta update 41 capacity 2
$WP post meta update 41 adults 2
$WP post meta update 41 children 0
$WP post meta update 41 bedType "Queen Bed"
$WP post meta update 41 roomSize "24 m²"
$WP post meta update 41 view "River & Forest"
$WP post meta update 41 amenities "Hot Spring Access, Private Bathroom, Wi-Fi, Heating"
$WP post meta update 41 checkIn "2:00 PM"
$WP post meta update 41 checkOut "11:00 AM"
$WP post meta update 41 featured 0
$WP post meta update 41 displayOrder 4
echo "  ✓ Riverside Calm"

echo ""
echo "==> Testing GraphQL..."
curl -s -X POST http://localhost:8080/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query": "{ rooms { nodes { title roomFields { startingprice bedtype roomsize view } } } }"}' | python3 -m json.tool
