#!/bin/sh
# Makes the carousel copies of itinerary photos: 1040px high (twice the
# 520px they show at), any width, so portraits and landscapes keep their shape.
# Run after adding or replacing a photo in assets/images/itineraries.
# Requires ImageMagick (brew install imagemagick).
cd "$(dirname "$0")/../assets/images/itineraries" || exit 1
mkdir -p carousel
for f in *.jpg; do
  magick "$f" -auto-orient -resize 'x1040>' -strip -interlace Plane -quality 80 "carousel/$f"
  echo "carousel/$f"
done
