#!/bin/sh
# Makes the social sharing images (1200x630): the photo cropped to fit,
# a soft dark fade, and the yellow logo over the bottom left.
# Run after adding or replacing a story photo or the home/about photos.
# Requires ImageMagick (brew install imagemagick).
cd "$(dirname "$0")/../assets/images" || exit 1
OUT=social
mkdir -p "$OUT"

LOGO=$(mktemp -t slow-logo).png
magick -background none -density 400 logo.svg -resize 330x "$LOGO"

make() {
  # $1 source photo, $2 output name, $3 crop gravity (default Center)
  magick "$1" -resize '1200x630^' -gravity "${3:-Center}" -extent 1200x630 \
    \( -size 1200x630 gradient:'rgba(13,10,6,0)'-'rgba(13,10,6,0.75)' \) -compose over -composite \
    \( -size 1200x630 xc:'rgba(13,10,6,0.12)' \) -compose over -composite \
    "$LOGO" -gravity southwest -geometry +64+56 -compose over -composite \
    -strip -quality 82 "$OUT/$2.jpg"
  echo "assets/images/social/$2.jpg"
}

make home-hero.jpg home
make about-mat.jpg about North
for f in stories/*.jpg; do
  name=$(basename "$f" .jpg)
  make "$f" "$name"
done

rm -f "$LOGO"
