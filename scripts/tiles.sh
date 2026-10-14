#!/bin/sh
# Makes smaller copies of story photos for the tiles on the stories page.
# Run after adding or replacing a photo in assets/images/stories.
# Requires ImageMagick (brew install imagemagick).
cd "$(dirname "$0")/../assets/images/stories" || exit 1
mkdir -p tiles
for f in *.jpg; do
  magick "$f" -resize '800x800>' -strip -quality 80 "tiles/$f"
  echo "tiles/$f"
done
