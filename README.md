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
| Itineraries index | `itineraries.md` |
| Itineraries | `_itineraries/*.md` (facts, carousel photos, price and Payhip product code in front matter) |
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

For search engines, each story also has `description` (lead with the place), `date` (published; add `updated` when you change a story), `place` and `geo` (rough coordinates). Always set `date`: without it Jekyll uses the build time.

Teasers in `_teasers` only need `title`, `area`, `order` and `image`. They show as blurred tiles that link to the signup form. To make a teaser public, move its file into `_stories`, add the front matter from a public story and write the story below it.

### Images

Story photos go in `assets/images/stories` and are referenced by filename in front matter (`image.src`). Add `image.position` (e.g. `"50% 70%"`) to choose which part of the photo crops keep. If a story's subject sits low in the photo and gets hidden by the fade and heading, add `image.lift` (e.g. `"22%"`) to raise the photo so the heading sits below it (see `_stories/elgol.md`).

Itinerary carousel photos go in `assets/images/itineraries`. After adding or replacing one, run `./scripts/itinerary-photos.sh` to make the 1040px high copies the carousel uses. The full-size originals there aren't committed (see `.gitignore`), only the copies in `carousel/`, so keep the originals backed up elsewhere.

Social sharing images (1200x630, with the logo) are in `assets/images/social`, made by `./scripts/social-images.sh`; re-run it after changing a story, home or about photo. A page can choose its image with `social_image` in front matter.

After adding or replacing a story photo, run `./scripts/tiles.sh` to make the smaller copies the tiles and phones use (needs ImageMagick). Locked tiles blur their image with CSS.

### Signup

The form posts to `signup.mailchimp_action` in `_config.yml`. Paste the Mailchimp embedded form action URL there.

## Styles

CSS is in `_postcss`, one file per area. Each partial must be imported directly in `assets/css/styles.css`. jekyll-postcss only notices changes to files imported from there.

## Story emails

The twelve weekly emails are generated from the stories in `_teasers/` (front matter for the heading, "Before you go" and "In the area"; the story text below). The text is used for the emails only and isn't published on the site.

```
./scripts/email-heroes.sh                  # after adding or replacing a story photo
bundle exec ruby scripts/build-emails.rb   # after editing any story
```

This writes `email/issues/01-stac-pollaidh.html` to `12-suilven.html`. In Mailchimp, for each email in the journey choose "Code your own" > "Paste in code" and paste the file. Set the subject line and preview text in Mailchimp. The hero photos load from `assets/email/heroes/`, so push to the site before sending.

## Mailchimp templates

Two templates in `email/`, to upload in Mailchimp under Templates, Create template, Code your own, Import HTML:

- `email/welcome.html`: the intro email. Letter text and the three photos are editable.
- `email/story.html`: the weekly story. Issue number, heading, story, sign-off, "Before you go" rows and "In the area" items are editable. Rows and items are repeatable (duplicate them in the editor), and both sections can be hidden.

Notes:

- The story template's hero is a normal image showing the whole photo, with the heading below it. Click it in the editor to replace it, using the faded versions in `assets/email/heroes/`.
- The heading rule is a small image (`rule-light.png`). Cut and paste it to move it.
- The logo, rule and fade images, and the fonts, load from `https://slowscotland.uk/assets/`, so the site needs to be live before sending. Fonts show in Apple Mail and iOS; other clients fall back to Georgia and Helvetica.
- Leave Mailchimp's automatic CSS inlining switched on (the default).
- Emails are a single 600px column on a light grey (#F4F4F4) page; each band (header, hero, story, notes, collage, footer) has its own background colour.


## Hosting

Hosted on Netlify, which builds the site on every push to `main` (settings in `netlify.toml`).

To hide the site temporarily, set the environment variable `SITE_HIDDEN` to `true` in Netlify (Project configuration → Environment variables) and redeploy. Every page then shows a holding page (`holding.html`), hidden from search engines, while `/assets/` stays reachable for the email templates. Delete the variable and redeploy to bring the site back.
