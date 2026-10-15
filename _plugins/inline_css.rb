# Production builds only: after the site is written, put the stylesheet
# straight into each page's <head> instead of linking to it. The CSS is
# small (about 5KB gzipped), so this removes a render-blocking request
# and lets the fonts start loading sooner.
#
# Font and image URLs in the CSS are root-relative (/assets/...), so they
# work unchanged when inlined.
Jekyll::Hooks.register :site, :post_write do |site|
  next unless Jekyll.env == "production"

  css_path = File.join(site.dest, "assets/css/styles.css")
  next unless File.exist?(css_path)

  css = File.read(css_path, encoding: "UTF-8").strip
  link = %r{<link rel="?stylesheet"? href="?/assets/css/styles\.css[^>]*>}

  Dir.glob(File.join(site.dest, "**/*.html")).each do |path|
    html = File.read(path, encoding: "UTF-8")
    next unless html.match?(link)

    File.write(path, html.sub(link) { "<style>#{css}</style>" }, encoding: "UTF-8")
  end
end
