#!/bin/sh
# Run after the Jekyll build on Netlify when SITE_HIDDEN=true (see netlify.toml).
# Serves the holding page for every URL, but keeps /assets/ reachable so the
# Mailchimp email templates can still load their images and fonts.
set -e
cd "$(dirname "$0")/../_site"

cp holding/index.html index.html

cat > _redirects <<'REDIRECTS'
/assets/*  /assets/:splat  200!
/favicon.ico  /favicon.ico  200!
/favicon.svg  /favicon.svg  200!
/*  /index.html  200!
REDIRECTS

cat > _headers <<'HEADERS'
/*
  X-Robots-Tag: noindex
HEADERS

echo "Site hidden: holding page served for all URLs"
