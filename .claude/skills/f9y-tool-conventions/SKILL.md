---
name: f9y-tool-conventions
description: Conventions, gotchas, and verification steps for building or modifying Full 9 Yards graphic tools in this repo. Use whenever touching tools/*/index.html, tools/*/style.css, tools/*/app.js, assets/brand.css, or when adding a new tool under tools/.
---

# Full 9 Yards graphic tools — conventions

This repo is a growing collection of static, no-build HTML/CSS/JS tools
that render a branded card and export it as a PNG for social media. All of
this was learned the hard way building the Tier List Maker — follow it so
the next tool doesn't repeat the same rounds of bugs.

## Repo shape

```
index.html            hub page, one card per tool, links into tools/<name>/
assets/
  brand.css            shared design tokens — colors, fonts, .f9y-* classes
  fonts/                self-hosted @font-face files
  logos/                local team logo PNGs (tier-list-maker specific)
  vendor/               vendored third-party libs (sortable.min.js, html2canvas.min.js)
tools/
  <tool-name>/
    index.html
    style.css
    app.js
```

New tool checklist:
1. `tools/<tool-name>/` with its own `index.html` + `style.css` + `app.js`.
2. `index.html` links `../../assets/brand.css` **before** the tool's own
   stylesheet, and reuses `.f9y-card`, `.f9y-btn`, `.f9y-eyebrow`,
   `.f9y-headline`, etc. instead of one-off styles.
3. Add a card for it in the grid in the root `index.html`.
4. No build step, no npm, no bundler — everything must run by opening the
   file or serving it as static files (GitHub Pages). Vendor any third-party
   JS under `assets/vendor/` rather than pulling from a CDN, so export
   never depends on a CDN's uptime/CORS headers.

## Brand tokens (`assets/brand.css`)

- Colors: black `#101311` (header/footer), cream `#EFEDE7` (body), green
  `#3F7954` (accent/stripe/tagline), white (headline), gray `#8A8A85`
  (meta text). Gold `#D4AF37` is reserved for "highlight/award" callouts
  only — never a general UI accent.
- Fonts, self-hosted via `@font-face` (never Google Fonts / CDN fonts):
  `F9Y Display` (Barlow Condensed Black, weight 400) for headlines/
  taglines, `F9Y Mono` (DM Mono Regular 400 / Medium 500) for everything
  else. `font-synthesis: none` is set globally — don't rely on fake
  bold/italic.
- Always pull colors/fonts from the `:root` tokens rather than hardcoding
  hex values or font stacks, so a brand tweak happens in one place.

## The exportable card: JS-computed layout, not CSS layout

Every tool's exportable region (the thing that becomes the PNG) should be
laid out with a JS function that computes exact pixel values and applies
them as inline styles — **not** `aspect-ratio`, flexbox `grow`/`shrink`
tricks, or CSS Grid `fr` units for anything that needs to size precisely.

Why: the export path renders through **html2canvas**, whose layout engine
doesn't reliably support modern CSS layout features. Something that looks
perfect live in the browser can come out subtly wrong (clipped, misaligned,
or truncated) in the actual PNG. A JS "measure and set" pass
(`layoutBoard()` in tier-list-maker/app.js is the reference implementation)
that runs before every capture and pins the card to an exact aspect ratio
is the reliable approach. When something needs to shrink-to-fit (e.g. many
items in one row), compute the size in JS from the real available
width/height rather than trusting CSS to degrade gracefully.

Corollary: measure real rendered dimensions (`clientHeight`,
`getBoundingClientRect()`, actual decoded image height/width) instead of
assuming a static/config value — e.g. a logo file's on-disk PNG dimensions
are not its visible content bounds if it has transparent padding.

## Export format

- Target Instagram's optimal post ratio, 1080×1350 (4:5). Compute the
  html2canvas `scale` option dynamically so the output is always an exact
  pixel multiple of that ratio (`EXPORT_WIDTH * resolutionMultiplier /
  captureRoot.offsetWidth`), regardless of the on-screen render width.
- Give the user a resolution choice (1x/2x/3x) rather than hardcoding one
  — default to 2x for social-media sharpness.
- Export corners are square (`border-radius: 0` on the capture root), not
  rounded — that was an explicit brand call.

## html2canvas + custom web fonts: known failure mode

Custom `@font-face` text can render fine live but come out **bunched /
overlapping** in the exported PNG. This has needed multiple layers of
defense in this repo, and even all of them together are not 100%
guaranteed across every browser/OS — treat any headline-style text change
as needing visual re-verification of the export, not just the live DOM:

1. Await `document.fonts.ready` before calling `html2canvas(...)`.
2. That alone is not sufficient — also explicitly force-load the exact
   descriptors used (`document.fonts.load('400 100px "F9Y Display"')` etc.)
   before capture, since `fonts.ready` can resolve before a face that
   nothing has explicitly requested at that size/weight is actually usable.
3. Pass `letterRendering: true` to html2canvas — it measures/draws text
   letter-by-letter instead of as whole strings, which avoids one class of
   metrics mismatch (but sacrifices native kerning).
4. Give any display-font headline/title element an explicit
   `letter-spacing` (don't leave it at the font's own zero tracking) as a
   safety margin — canvas per-character text measurement has been observed
   to land tighter than the live DOM depending on the browser/OS doing the
   export, closing the gap between letters almost to zero even with (1)-(3)
   in place.

If a user reports "text renders fine on screen but the exported PNG looks
different" for a *different* symptom than bunched letters, suspect the same
family of html2canvas metrics/layout mismatch and reach for the same
toolkit (wait longer, measure real dimensions, avoid the CSS feature that
doesn't map cleanly to canvas).

## Verification pattern — do this before every commit

This repo has no automated test suite. The established, load-bearing
verification method is a headless Playwright pass against a local static
server, run before any commit that touches layout, export, or asset
loading:

```
python3 -m http.server <port>   # from repo root
```

Then drive it with Playwright
(`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, via
`/opt/node22/lib/node_modules/playwright`) to:
- Exercise the actual UI flow (click, type, drag) the change affects.
- Trigger the real export path (click Export, capture the download) —
  never just screenshot the live DOM and assume the PNG matches.
- **Read the resulting PNG with the `Read` tool and look at it.** Pixel
  dimensions and "no console errors" are not sufficient — export bugs in
  this codebase have repeatedly been things that only show up visually
  (clipped edges, bunched text, misaligned padding).
- For a fix that's specifically about layout stability (e.g. "X shouldn't
  move when Y changes"), assert on measured bounding boxes across both
  states, not just eyeballing one screenshot.

`page.on('dialog', d => d.accept())` is required — Playwright auto-dismisses
`window.confirm()` by default, which will silently no-op any confirm-gated
action (e.g. bulk-add) without raising an error.

Only commit/push after the exported PNG has actually been looked at and
matches what was asked for.

## Team data (tier-list-maker specific, but the pattern generalizes)

`tools/tier-list-maker/teams-data.js` holds the full FBS roster. Conference
realignment moves fast — if asked to verify or update roster/conference
data, use live web search/fetch against real sources (ESPN, conference
sites, etc.), never rely on training-data recall alone, and say so in the
file's header comment along with what was checked. This repo has already
had a real gap (a missing team) caught by the user after an earlier
training-data-only pass — treat "double check this against a live source"
requests literally.

Team logos live locally at `assets/logos/<slugified-team-name>.png` (see
`slugify()` in `app.js`) so export never depends on a third-party CDN.
Missing-logo teams fall back to a colored initials chip, never a broken
image.

## Multiple leagues/rosters in one tool

The Tier List Maker's Team Browser supports College and NFL via a league
toggle rather than two separate tools — this is the pattern to extend for
a third league/roster:
- A separate `<league>-teams-data.js` file, same object shape as the
  original (`name`/`conf`/`tier`/`colors`/optional `aliases`), so all of
  filtering/search/rendering keeps working unchanged against whichever
  roster is active. Don't invent a new shape per league.
- A separate logo folder under `assets/logos/<league>/`, same slug scheme.
- One `LOCAL_LOGO_DIRS` / `ALL_TEAMS` switch (`setLeague()` in app.js) that
  swaps the active roster, logo directory, and re-populates both filter
  `<select>`s — don't hardcode a single roster's filter options in the
  HTML; populate them from data (see `populateClassFilter()`) so they're
  correct for whichever league is active.
- Anything genuinely specific to one league (e.g. the AP Top 25 poll,
  which only makes sense for college) should hide itself entirely rather
  than show a control that silently does nothing in the other mode.
- Gotcha hit building this: don't put a `display` value in the same CSS
  rule as an element that gets toggled via the `hidden` attribute. Author
  CSS always overrides the UA stylesheet's `[hidden] { display: none }`
  regardless of specificity, so an authored `display: flex` (etc.) on that
  same selector silently defeats `hidden` — add an explicit
  `.your-class[hidden] { display: none; }` override alongside it.
