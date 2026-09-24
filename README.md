# Full 9 Yards — Graphic Tools

A growing collection of standalone, static, browser-based tools for making
Full 9 Yards social graphics. No build step, no server — every tool is
plain HTML/CSS/JS and can be opened directly or served via GitHub Pages.

## Structure

```
index.html            hub page listing every tool
assets/
  brand.css            shared design tokens (colors, fonts, buttons, cards)
tools/
  tier-list-maker/     Tier List Maker
    index.html
    style.css
    app.js
```

Each tool lives in its own folder under `tools/` and imports
`assets/brand.css` so they all share one visual identity. Tool-specific
styles/scripts stay local to that tool's folder.

## Tools

### Tier List Maker (`tools/tier-list-maker/`)

Build a branded tier list and export it as a PNG for socials.

- Up to 20 tiers, each with an editable name and color
- Add items as uploaded images or text cards
- **Team Browser** ("+ Add Teams"): every FBS team, filterable by
  conference or by Power 4 / Group of 6 / Independent, with search and a
  bulk "Add All Shown to Pool". Teams without a real logo wired in show a
  colored initials chip (using the team's actual colors) instead of a
  broken image, so the feature works immediately. See "Team logos" below
  for wiring in real logo images.
- Drag and drop items between tiers and the item pool (touch-friendly)
- Editable board title/subtitle
- "Export PNG" renders just the branded card (no UI chrome) at 2x
  resolution for crisp posting
- Autosaves your board to the browser's local storage, so a reload
  doesn't lose your work (this is per-browser only, not shared/synced)

Uses [SortableJS](https://github.com/SortableJS/Sortable) for drag-and-drop
and [html2canvas](https://github.com/niklasvh/html2canvas) for PNG export,
both vendored (unmodified, minified builds) under `assets/vendor/` — no
install step, no CDN dependency, and no build step required.

#### Team data (`teams-data.js`)

The full FBS roster (name, conference, Power 4 / Group of 6 / Independent
classification, and placeholder colors) lives in
`tools/tier-list-maker/teams-data.js` as a plain, commented array —
conference realignment moves fast, so double-check the Mountain West and
Pac-12 sections especially, and edit directly if anything's out of date.

#### Team logos

No real logo images are bundled yet — team chips currently render as
colored initials. To wire in real logos, click **Import Logos…** in the
Team Browser and paste a JSON object shaped like your existing
`team_logo_lookup()` output: `{"Alabama": "https://...", ...}`. Matching
is case/punctuation-insensitive and also checks each team's `aliases` in
`teams-data.js`. This is saved to that browser's local storage only.

When a logo URL resolves, the tool immediately loads the image into a
canvas and bakes it down to a local data URL (same treatment as an
uploaded file) rather than keeping a live hotlink — this keeps the board
portable/offline and avoids PNG export breaking on cross-origin images
that don't send CORS headers. If a URL fails to load for any reason, the
team silently falls back to its colored initials chip instead of a broken
image.

## Branding

`assets/brand.css` is ported directly from the real chart pipeline
(`graphics/branding.py` + `graphics/scatter.py`):

- **Colors** — black `#101311` header/footer bars, cream `#EFEDE7` body,
  green `#3F7954` accent (eyebrow, tagline, left border stripe), white
  headline text, gray `#8A8A85` meta text. Gold `#D4AF37` is reserved for
  "highlight/award" callouts only, never used as a general UI accent.
- **Fonts** — self-hosted under `assets/fonts/`: Barlow Condensed Black
  for headlines/taglines, DM Mono (Regular + Medium) for eyebrow,
  subtitle, meta, and body/UI text.
- **Card frame** — the Tier List Maker's exportable card mirrors
  `render_branded_card()`'s layout exactly: green left stripe, black
  header (eyebrow + headline + subtitle), cream body, black footer
  (tagline + meta).

Every tool should pull from the `:root` tokens in `assets/brand.css`
rather than hardcoding colors/fonts, so a future brand tweak (e.g. a
logo mark) happens in one place.

## Adding a new tool

1. Create `tools/<tool-name>/` with its own `index.html`, `style.css`,
   `app.js`.
2. Link `../../assets/brand.css` before your own stylesheet, and reuse the
   shared classes (`.f9y-card`, `.f9y-btn`, `.f9y-eyebrow`,
   `.f9y-headline`, etc.) instead of one-off styles where possible.
3. Add a card for it in the grid on the root `index.html`.

## Hosting (GitHub Pages)

This repo is set up to be served as-is from the repo root:

1. GitHub → **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: your default branch, folder **/ (root)**
4. Save — the hub page will be live at
   `https://<owner>.github.io/<repo>/`

The `.nojekyll` file at the repo root tells GitHub Pages to serve files
as-is (skip Jekyll processing), which matters once tool folders start
using filenames Jekyll would otherwise ignore.
