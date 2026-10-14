#!/bin/sh
# Makes the email hero photos: each story photo at email size (1200px wide,
# shown at 600px) with the bottom quarter fading into the dark ground colour,
# so the heading below the photo sits on a seamless background.
# Run after adding or replacing a photo in assets/images/stories.
# Requires ImageMagick (brew install imagemagick).
cd "$(dirname "$0")/../assets/images/stories" || exit 1
OUT=../../email/heroes
mkdir -p "$OUT"
for f in *.jpg; do
  h=$(magick "$f" -resize 1200x -format '%h' info:)
  fade=$((h / 4))
  magick "$f" -resize 1200x \
    \( -size 1200x$fade gradient:'rgba(13,10,6,0)'-'rgba(13,10,6,1)' \) \
    -gravity south -composite -strip -quality 80 "$OUT/$f"
  echo "assets/email/heroes/$f"
done
