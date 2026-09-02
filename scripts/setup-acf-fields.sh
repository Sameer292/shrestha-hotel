#!/usr/bin/env bash
set -euo pipefail
# setup-acf-fields.sh — Creates ACF field groups for all CPTs via WP REST API

WP_URL="http://localhost:8080"
WP_USER="admin"
WP_PASS="admin123"

echo "==> Creating ACF Field Groups..."

# Helper: create ACF field group via REST API
create_field_group() {
  local title="$1"
  local post_type="$2"
  local fields_json="$3"

  # Create the field group as an ACF field group post
  local result=$(curl -s -u "${WP_USER}:${WP_PASS}" \
    -X POST "${WP_URL}/wp-json/acf/v3/field-groups" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"${title}\",
      \"location\": [[{
        \"param\": \"post_type\",
        \"operator\": \"==\",
        \"value\": \"${post_type}\"
      }]],
      \"fields\": ${fields_json},
      \"show_in_graphql\": true,
      \"graphql_field_name\": \"${post_type}Fields\"
    }" 2>/dev/null)

  local id=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null || echo "")
  if [ -n "$id" ]; then
    echo "  ✓ ${title} (ID: ${id})"
  else
    echo "  ⚠ ${title} — may already exist or API error"
  fi
}

# Room Fields
create_field_group "Room Fields" "room" '[
  {"name": "startingPrice", "label": "Starting Price", "type": "number", "required": 0},
  {"name": "currency", "label": "Currency", "type": "select", "choices": {"NPR": "NPR", "USD": "USD"}, "default_value": "NPR"},
  {"name": "capacity", "label": "Capacity (guests)", "type": "number"},
  {"name": "adults", "label": "Adults", "type": "number"},
  {"name": "children", "label": "Children", "type": "number"},
  {"name": "bedType", "label": "Bed Type", "type": "text"},
  {"name": "roomSize", "label": "Room Size", "type": "text"},
  {"name": "view", "label": "View", "type": "text"},
  {"name": "amenities", "label": "Amenities", "type": "text"},
  {"name": "checkIn", "label": "Check-in Time", "type": "text"},
  {"name": "checkOut", "label": "Check-out Time", "type": "text"},
  {"name": "featured", "label": "Featured", "type": "true_false", "default_value": 0},
  {"name": "displayOrder", "label": "Display Order", "type": "number"}
]'

# Experience Fields
create_field_group "Experience Fields" "experience" '[
  {"name": "duration", "label": "Duration", "type": "text"},
  {"name": "difficulty", "label": "Difficulty", "type": "text"},
  {"name": "season", "label": "Season", "type": "text"},
  {"name": "optionalPrice", "label": "Optional Price", "type": "number"},
  {"name": "featured", "label": "Featured", "type": "true_false", "default_value": 0}
]'

# Testimonial Fields
create_field_group "Testimonial Fields" "testimonial" '[
  {"name": "guestName", "label": "Guest Name", "type": "text"},
  {"name": "guestLocation", "label": "Guest Location", "type": "text"},
  {"name": "quote", "label": "Quote", "type": "textarea"},
  {"name": "rating", "label": "Rating (1-5)", "type": "number", "min": 1, "max": 5},
  {"name": "featured", "label": "Featured", "type": "true_false", "default_value": 0}
]'

# Gallery Item Fields
create_field_group "Gallery Item Fields" "gallery_item" '[
  {"name": "category", "label": "Category", "type": "select", "choices": {"Hotel": "Hotel", "Rooms": "Rooms", "Hot Spring": "Hot Spring", "Nature": "Nature", "Dining": "Dining", "Experiences": "Experiences"}},
  {"name": "caption", "label": "Caption", "type": "text"},
  {"name": "displayOrder", "label": "Display Order", "type": "number"}
]'

# FAQ Fields
create_field_group "FAQ Fields" "faq" '[
  {"name": "question", "label": "Question", "type": "text"},
  {"name": "answer", "label": "Answer", "type": "textarea"},
  {"name": "category", "label": "Category", "type": "text"},
  {"name": "displayOrder", "label": "Display Order", "type": "number"}
]'

# Offer Fields
create_field_group "Offer Fields" "offer" '[
  {"name": "slug", "label": "Slug", "type": "text"},
  {"name": "description", "label": "Description", "type": "textarea"},
  {"name": "price", "label": "Price", "type": "text"},
  {"name": "validity", "label": "Validity", "type": "text"},
  {"name": "terms", "label": "Terms", "type": "textarea"},
  {"name": "featured", "label": "Featured", "type": "true_false", "default_value": 0}
]'

echo ""
echo "==> Flushing rewrite rules..."
docker compose run --rm wpcli --path=/var/www/html rewrite flush --hard 2>/dev/null

echo ""
echo "==> Done! ACF field groups created."
echo "Test GraphQL: curl -X POST http://localhost:8080/graphql -H 'Content-Type: application/json' -d '{\"query\":\"{ rooms { nodes { title roomFields { startingPrice } } } }\"}'"
