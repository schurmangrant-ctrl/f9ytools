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

## Branding

`assets/brand.css` currently uses **placeholder** colors/fonts (dark
surface + gold accent, `Anton`/`Inter`), matching the look implied by the
existing Full 9 Yards chart pipeline (`FULL 9 YARDS` eyebrow, bold
all-caps headline, `MAKE YOUR CALL.` tagline, small meta footer) — but not
the exact palette.

Once the real `graphics/branding.py` values (hex colors, fonts, logo file)
are available, port them into the `:root` variables at the top of
`assets/brand.css` and every tool picks them up automatically.

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
