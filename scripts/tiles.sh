#!/bin/sh
# Makes smaller copies of story photos: 800px for the tiles on the stories
# page, and 1200px wide so phones don't download the 2000px original for heroes.
# Run after adding or replacing a photo in assets/images/stories.
# Requires ImageMagick (brew install imagemagick).
cd "$(dirname "$0")/../assets/images/stories" || exit 1
mkdir -p tiles 1200
for f in *.jpg; do
  magick "$f" -resize '800x800>' -strip -interlace Plane -quality 80 "tiles/$f"
  magick "$f" -resize '1200x>' -strip -interlace Plane -quality 80 "1200/$f"
  echo "$f"
done
