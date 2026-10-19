# Stops a single word sitting on the last line of a paragraph: the last
# space in each <p> becomes a non-breaking space, so the final two words
# wrap together. Spaces inside tags (e.g. link attributes) are left alone.
module NoWidows
  PARAGRAPH = %r{(<p(?:\s[^>]*)?>)(.*?)(</p>)}m.freeze

  def self.apply(html)
    html.gsub(PARAGRAPH) do
      open_tag, inner, close_tag = Regexp.last_match.captures
      parts = inner.rstrip.split(/(<[^>]*>)/)
      index = parts.rindex { |part| !part.start_with?("<") && part.include?(" ") }
      if index
        part = parts[index]
        at = part.rindex(" ")
        parts[index] = "#{part[0...at]}&nbsp;#{part[(at + 1)..]}"
      end
      "#{open_tag}#{parts.join}#{inner[inner.rstrip.length..]}#{close_tag}"
    end
  end
end

Jekyll::Hooks.register [:pages, :documents], :post_render do |doc|
  next unless doc.output_ext == ".html"

  doc.output = NoWidows.apply(doc.output)
end
