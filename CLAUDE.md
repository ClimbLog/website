# ClimbLog Website — Claude Context

## What this is
The marketing and legal site for **ClimbLog**, served at **climblog.co**.
Static HTML on **GitHub Pages** (`CNAME` + `.nojekyll`, no build step, no framework).

The app itself lives in a separate repo at `/Users/keymastrion/ClimbLog` — see its
`CLAUDE.md` and `PROGRESS.md`. This repo ships only the website.

## Structure
```
climblog-site/
├── index.html              # Homepage
├── privacy.html            # Privacy Policy  (legal copy - do not reword)
├── terms.html              # Terms of Use    (legal copy - do not reword)
├── support.html            # Support contact form
├── delete-account.html     # Account deletion instructions (store requirement)
├── 404.html                # 404 AND every /u/{username} friend invite
├── assets/
│   ├── css/tokens.css      # Design tokens - the palette source of truth
│   ├── css/site.css        # Reset, layout, shared components
│   ├── js/site.js          # Store links, theme toggle, reveal, footer year
│   └── img/                # Favicons + og.png (generated from og.svg)
├── design-system/          # Claude Design preview cards + build.mjs
├── .well-known/            # apple-app-site-association, assetlinks.json
├── CNAME                   # climblog.co
└── .nojekyll               # Serve _-prefixed paths, skip Jekyll
```

## Design system

### Palette strategy — "sectioned"
The site alternates four palettes by section rather than using one flat scheme.
Each context class rebinds the semantic CSS variables locally, so any component
dropped inside inherits the right colors with no per-element overrides.

| Context | Class | Used for | Accent |
|---|---|---|---|
| Charcoal | `.ctx-charcoal` | nav, hero, final CTA, footer | brand blue `#4F8EF7` |
| Light/dark default | (none) | feature grid, value strip | `#2D6FDF` / `#4F8EF7` |
| Passport indigo | `.ctx-passport` | Passport showcase, `/u/` invites | gold `#FFC840` |
| Altitude gold | `.ctx-altitude` | premium band | `#C9A84C` |

### Where colors come from — do not invent hexes
`assets/css/tokens.css` mirrors the app. When a color changes, change it in the
app first, then tokens.css, then re-push the design system.

| Token group | App source |
|---|---|
| Brand, Altitude, charcoal, light | `ClimbLog/src/constants/colors.ts` |
| Passport indigo + light schemes | `ClimbLog/src/components/passport/PassportShareCard.tsx` (`DARK_T` / `LIGHT_T`) |
| Type scale, weights | `ClimbLog/src/constants/typography.ts` |
| Spacing, radii | `ClimbLog/src/constants/spacing.ts` |

**Gold means premium.** `#C9A84C` / `#FFC840` signal the Altitude plan and the
Passport. Using gold decoratively dilutes the signal - don't.

### Claude Design project
A design-system project catalogs the palettes as rendered swatch cards.

- Project: **ClimbLog Design System** — `b355f38d-c0c9-4609-b5f4-f0c618389942`
- Cards: 5 foundations (brand, passport, altitude, type, spacing) + 3 components
- Rebuild locally: `node design-system/build.mjs`
- Push: `DesignSync` → `finalize_plan` (writes `foundations/*.html`,
  `components/*.html`, `localDir` = `design-system/`) → `write_files`

Preview cards must be **self-contained** (they render standalone), so
`build.mjs` inlines the shared chrome CSS into each file. Never hand-edit the
generated HTML — edit `build.mjs` and rebuild.

## Conventions

- **No em dashes in site copy.** Same rule as the app: use a plain `-` or
  restructure. Applies to marketing copy. The legal pages' existing text is
  left as-authored; do not rewrite legal copy for style.
- **Absolute asset paths** (`/assets/...`), because `404.html` renders at
  arbitrary depths like `/u/name` where relative paths would break.
- **Theme:** an inline `<head>` script applies `data-theme` from
  `localStorage['cl-theme']` before first paint. Every page needs it or it
  flashes the wrong scheme.
- **Store links are centralized.** `STORE_LINKS` at the top of
  `assets/js/site.js` is the only place URLs go. Elements carry
  `data-store="ios|android"`; empty URLs render a "Coming soon" chip instead of
  a dead link.
- Pages are hand-maintained HTML. Nav and footer markup is duplicated across
  files by necessity — change one, change all six.

## Gotchas

- **`404.html` is load-bearing.** It serves both the real 404 and every
  `/u/{username}` friend invite via the GitHub Pages 404 fallback. The inline
  script regex-validates the username and injects with `textContent` only —
  never switch that to `innerHTML`. Test with a server that falls back to
  404.html; `python3 -m http.server` alone will not reproduce it.
- **`.well-known/` must survive any restructure.** `apple-app-site-association`
  and `assetlinks.json` back universal links / App Links. Breaking them breaks
  deep links in shipped app builds.
  The `assetlinks.json` debug fingerprint is beta-only — remove it at GA.
- **`og.png` is generated**, not hand-drawn: edit `assets/img/og.svg`, then
  `rsvg-convert -w 1200 -h 630 assets/img/og.svg -o assets/img/og.png`.
- **The support form has no backend** (`action="#"`). It silently discards
  submissions. Must be wired before launch.

## Local preview
```bash
cd /Users/keymastrion/climblog-site
python3 -m http.server 8899          # normal pages
```
To exercise `/u/{username}` and the 404 fallback you need a server that serves
`404.html` for unknown paths (GitHub Pages behavior).

## Work log → PROGRESS.md
Session history, current WIP, and the open backlog live in **`PROGRESS.md`**.
Read it at the start of every session alongside this file, and record progress
there. This file is for stable project knowledge only.
