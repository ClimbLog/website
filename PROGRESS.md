# ClimbLog Website — Progress

Work log for `climblog-site`. Stable project knowledge lives in `CLAUDE.md`.

---

## Current WIP / PICK UP HERE

Full redesign landed 2026-07-25 (uncommitted — review `git diff` before committing).
Nothing in flight. Next actions are in the backlog below, **P0 first**.

---

## Backlog

### P0 — blocks launch
- [ ] **Store links.** `STORE_LINKS` in `assets/js/site.js` is empty, so every
      download button renders "Coming soon" instead of linking. Paste the two
      URLs there on launch day; nothing else needs editing.
- [ ] **Support form has no backend.** `support.html` posts to `action="#"` —
      every message a user sends is silently discarded. Needs a real endpoint
      (Formspree, or a Cloud Function alongside the existing app CFs). Decide
      which, then wire it.

### P1 — should do before GA
- [ ] **Real screenshots.** The hero phone and the Passport card are CSS
      mockups, not captures. They are sharp and theme-aware, but they are
      approximations of the app. Swap in real captures when store assets are
      produced. Android screenshots in `~/Downloads` are not usable as-is
      (status bars, battery icons, "Photos Coming Soon" placeholder).
- [ ] **`assetlinks.json` debug fingerprint** is beta-only — remove at GA.
- [ ] Verify OG cards actually unfurl (post a `climblog.co/u/name` link to
      Slack/iMessage/X once deployed).

### P2 — nice to have
- [ ] Nav/footer markup is duplicated across six files. If it starts drifting,
      revisit the build-step decision (Astro/11ty was considered and declined
      on 2026-07-25 to keep GitHub Pages deploys zero-risk).
- [ ] No sitemap.xml or robots.txt.
- [ ] Legal pages contain em dashes (pre-existing, as-authored). The no-em-dash
      rule was applied to marketing copy only — legal text was deliberately not
      reworded. Decide whether to normalize.
- [ ] Mobile nav is a wrapping list, not a hamburger. Fine at current link
      count; revisit if nav grows.

---

## Session log

### 2026-07-25 — Full redesign: tokens, design system, six-page rebuild

**Problem.** The site was visually unrelated to the app. It used a navy/sky/orange
palette (`#1B3A6B` / `#3A7FD5` / `#E8A020`) that appears nowhere in the product.
It also had no meta tags at all, no favicon, no social card, no dark mode, no
screenshots, dead store links, and ~1740 lines of copy-pasted CSS across six files.
The nav "brand" icon was a **telephone handset**.

**Decisions taken** (user-chosen):
- Palette: **sectioned** — charcoal + brand blue for chrome, light for feature
  sections, Passport indigo/gold for the Passport band, gold for Altitude.
  Rejected: single-palette brand blue (too close to byAir), Passport-only.
- Structure: **keep static HTML + shared CSS**. Rejected a build step (Astro/11ty)
  to avoid re-verifying `.well-known/` and the `404.html` `/u/` handler under a
  new deploy pipeline.
- Design system: created in Claude Design, populated with foundations + components.

**Built.**
- `assets/css/tokens.css` — palette, type, spacing, radii; semantic light/dark
  layers; four `.ctx-*` section-context classes. Every value traced to an app
  source file, recorded in a header comment.
- `assets/css/site.css` — reset, layout, buttons, cards, nav, footer, forms,
  legal two-column layout, reveal-on-scroll.
- `assets/js/site.js` — centralized `STORE_LINKS`, theme toggle, IntersectionObserver
  reveal (respects `prefers-reduced-motion`), footer year.
- `design-system/build.mjs` — generates 8 self-contained preview cards.
  Generated rather than hand-written so the duplicated inline chrome CSS is
  never hand-maintained.
- `assets/img/` — favicons (from the app icon via `sips`), `og.svg` → `og.png`
  (1200x630, rendered with `rsvg-convert`).
- **index.html rebuilt** — hero with CSS phone mockup, 6-card feature grid,
  Passport indigo band with a CSS passport card (map, stats, MRZ line), Altitude
  gold band, value strip, CTA, footer.
- **All five other pages migrated** onto the shared system with full meta/OG tags
  and the theme toggle. Legal article text was preserved **byte-identical**
  (verified by comparing the extracted `<article>` contents before and after).
- **404.html** restyled in Passport indigo and given OG tags — it is the page
  that renders shared `/u/{username}` invite links, so those now unfurl with a
  social card. The invite script was carried over verbatim.

**Claude Design project.** "ClimbLog Design System",
`b355f38d-c0c9-4609-b5f4-f0c618389942`. 8 cards pushed: brand/app colors,
Passport indigo + gold, Altitude, typography, spacing + radius, buttons,
section contexts, feature cards.

**Verified in-browser** (Chrome, local server): homepage in light + dark, privacy,
terms, support, delete-account, 404 plain branch, and `/u/alexflies` rendering the
username correctly through a GitHub-Pages-style 404 fallback. No console errors.

**Fixed during review:** phone mockup had dead space (tightened aspect ratio, added
a row); the Passport CTA misused the store-button "Coming soon" pattern (made it a
plain anchor); anchor targets hid under the sticky nav (`scroll-margin-top`); in
dark mode the Altitude band was indistinguishable from its neighbours (own darker
base + gold radial wash + band hairlines).

**Inspiration reviewed:** flighty.com (award badges, scenario-driven testimonial
density, timeline of a flight's progression) and byairapp.com (device mockups,
alternating visual/text sections, quantified social proof). Both lead with
screenshots and social proof — ClimbLog has neither yet, hence the P1 items above.

---

## Reference

- Live: https://climblog.co
- Repo root: `/Users/keymastrion/climblog-site`
- App repo: `/Users/keymastrion/ClimbLog`
- Design system: Claude Design → "ClimbLog Design System"
