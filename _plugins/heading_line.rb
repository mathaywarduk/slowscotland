# Heading line filter.
# "---" places the inline rule; *asterisks* make italics (Markdown).
# The rule is glued to the following word so it never ends a line on its own.
#
#   {{ "Plockton, the --- *Tidal Cove*" | heading_line }}
module Jekyll
  module HeadingLineFilter
    RULE = '<span class="h1-rule" aria-hidden="true"></span>'.freeze
    TOKEN = 'XXRULEXX'.freeze

    def heading_line(input)
      site = @context.registers[:site]
      converter = site.find_converter_instance(Jekyll::Converters::Markdown)
      html = converter.convert(input.to_s.gsub('---', TOKEN)).strip
      html = html.sub(/\A<p>/, '').sub(%r{</p>\z}, '')

      html.gsub(/#{TOKEN}\s*(<em>)?([^\s<]*)(<\/em>)?/) do
        open_em, word, close_em = Regexp.last_match.captures
        glued = open_em ? "<em>#{word}</em>" : word
        reopen = open_em && !close_em ? '<em>' : ''
        %(<span class="h1-glue">#{RULE}#{glued}</span>#{reopen})
      end
    end
  end
end

Liquid::Template.register_filter(Jekyll::HeadingLineFilter)
