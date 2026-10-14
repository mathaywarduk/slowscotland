# Slow Scotland

Jekyll site for Slow Scotland. Same setup as mathayward.com: Jekyll 4, jekyll-postcss with Tailwind, jekyll-minifier.

## Running locally

```
bundle install
npm install
bundle exec jekyll serve --livereload
```

Then open http://localhost:4000. For a production build, `JEKYLL_ENV=production bundle exec jekyll build`.

## Editing content

All copy lives in Markdown files with front matter. The body of each file is the main text.

| Page | File |
| --- | --- |
| Home | `index.md` (heading lines, button and hero image in front matter) |
| About | `about.md` |
| Stories index | `stories.md` |
| Public stories | `_stories/*.md` |
| Locked stories (teasers) | `_teasers/*.md` |
| Signup form text, nav, footer | `_config.yml` (restart the server after editing) |

### Headings

Headings use the same syntax everywhere (home, pages and stories):

- `---` places the thin rule, anywhere in the line
- `*asterisks*` make words italic
- a list of lines sets the line breaks, a single string wraps naturally

```yaml
heading: "Elgol, the Kayaker --- *at Dusk*"
heading:
  - "Plockton, the"
  - "--- *Tidal Cove*"
```

The rule always stays with the word after it, so it never ends a line on its own (see `_plugins/heading_line.rb`).

### Stories

Each public story in `_stories` has front matter for its tile, heading, "Before you go" rows and "In the area" items. See `_stories/plockton.md` for a full example. `order` sets the position on the stories page.

Teasers in `_teasers` only need `title`, `area`, `order` and `image`. They show as blurred tiles that link to the signup form. To make a teaser public, move its file into `_stories`, add the front matter from a public story and write the story below it.

### Images

Images go in `assets/images` and are referenced by filename in front matter. Locked tiles blur their image with CSS.

### Signup

The form posts to `signup.mailchimp_action` in `_config.yml`. Paste the Mailchimp embedded form action URL there.

## Styles

CSS is in `_postcss`, one file per area. Each partial must be imported directly in `assets/css/styles.css`. jekyll-postcss only notices changes to files imported from there.

## Mailchimp templates

Two templates in `email/`, to upload in Mailchimp under Templates, Create template, Code your own, Import HTML:

- `email/welcome.html`: the intro email. Letter text and the three photos are editable.
- `email/story.html`: the weekly story. Issue number, heading, story, sign-off, "Before you go" rows and "In the area" items are editable. Rows and items are repeatable (duplicate them in the editor), and both sections can be hidden.

Notes:

- The hero photo is a background image so the heading can sit over it, which means it can't be swapped in the editor. Upload the photo to Content Studio, then in the code view replace `HERO_IMAGE_URL` (three times, all in the hero block: twice on the `<td>`, once in the Outlook fallback just inside it). Classic Outlook on Windows shows the photo via that fallback, with the heading on a solid dark band below it since it can't draw the fade.
- The heading rule is a small image (`rule-light.png`). Cut and paste it to move it.
- The logo, rule and fade images, and the fonts, load from `https://slowscotland.uk/assets/`, so the site needs to be live before sending. Fonts show in Apple Mail and iOS; other clients fall back to Georgia and Helvetica.
- Leave Mailchimp's automatic CSS inlining switched on (the default).

