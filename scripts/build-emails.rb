# Builds the weekly story emails from the stories in _teasers/.
#
#   bundle exec ruby scripts/build-emails.rb
#
# Writes one finished email per story to email/issues/ (e.g. 01-stac-pollaidh.html),
# using the template in email/_story.liquid. Paste each file into Mailchimp with
# "Code your own" > "Paste in code". Re-run after editing a story.
#
# Story front matter used:
#   title, order (issue number), image.src (hero photo; the faded email version in
#   assets/email/heroes is made by scripts/email-heroes.sh), image.alt (optional),
#   heading (lines; --- places the rule, *asterisks* make italics),
#   before_you_go (label, text), in_the_area (title, text). Text is Markdown.

require "yaml"
require "liquid"
require "kramdown"

ROOT = File.expand_path("..", __dir__)
SITE = "https://slowscotland.uk"
TEMPLATE = Liquid::Template.parse(File.read(File.join(ROOT, "email/_story.liquid"), encoding: "UTF-8"))
OUT_DIR = File.join(ROOT, "email/issues")

RULE = %(<img class="rule" src="#{SITE}/assets/email/rule-light.png" width="64" height="1" alt="" ) +
       %(style="display:inline-block; width:64px; height:1px; vertical-align:middle; margin:0 10px 0 4px; border:0;">)

def markdown(text)
  Kramdown::Document.new(text.to_s, input: "GFM", hard_wrap: false, smart_quotes: %w[lsquo rsquo ldquo rdquo]).to_html.strip
end

# Inline Markdown (no wrapping <p>)
def inline(text)
  markdown(text).sub(%r{\A<p>}, "").sub(%r{</p>\z}, "")
end

# Email clients need colours on links inline
def style_links(html, colour)
  html.gsub("<a href=", %(<a style="color:#{colour}; text-decoration:underline;" href=))
end

def heading_html(lines)
  Array(lines).map do |line|
    html = inline(line.to_s.gsub("---", "XXRULEXX"))
    # Keep the rule with the first word after it, so the rule never ends a line
    # on its own. The rest of the heading can wrap: keeping more together can
    # make the heading wider than the 600px email and break the layout.
    html = html.gsub(%r{XXRULEXX\s*(<em>)?([^\s<]+)(</em>)?}) do
      open_em, word, close_em = Regexp.last_match.captures
      glued = open_em ? "<em>#{word}</em>" : word
      reopen = open_em && !close_em ? "<em>" : ""
      %(<span style="white-space:nowrap;">#{RULE} #{glued}</span>#{reopen})
    end
    html.gsub("<em>", %(<em style="font-style:italic; font-weight:300;">))
  end.join("<br>")
end

def story_html(body)
  html = style_links(markdown(body), "#EAE2DC")
  html.gsub("<p>", %(<p style="margin:0 0 1.1em;">))
end

Dir.mkdir(OUT_DIR) unless Dir.exist?(OUT_DIR)

Dir[File.join(ROOT, "_teasers/*.md")].sort.each do |path|
  raw = File.read(path, encoding: "UTF-8")
  _, front, body = raw.split(/^---\s*$/, 3)
  story = YAML.safe_load(front)

  html = TEMPLATE.render(
    "story" => story,
    "hero_url" => "#{SITE}/assets/email/heroes/#{story.dig('image', 'src')}",
    "hero_alt" => story.dig("image", "alt") || story["title"],
    "heading_html" => heading_html(story["heading"] || story["title"]),
    "story_html" => story_html(body),
    "before" => Array(story["before_you_go"]).map { |r| { "label" => r["label"], "text" => style_links(inline(r["text"]), "#1B1611") } },
    "area" => Array(story["in_the_area"]).map { |i| { "title" => i["title"], "text" => style_links(inline(i["text"]), "#1B1611") } }
  )

  out = File.join(OUT_DIR, File.basename(path, ".md") + ".html")
  File.write(out, html, encoding: "UTF-8")
  puts "email/issues/#{File.basename(out)}"
end
