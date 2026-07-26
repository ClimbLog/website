# ClimbLog Website — Progress

Work log for `climblog-site`. Stable project knowledge lives in `CLAUDE.md`.

---

## Current WIP / PICK UP HERE

Full redesign shipped and live at https://climblog.co as of 2026-07-25.

**2026-07-26:** mobile nav fix + new `beta.html`, with both live
invite URLs already in `BETA_LINKS`. Verified rendering as real links, not the
pending chip. Page is `noindex, nofollow` and is not in the nav, so it does not
turn up in search - it is reached by URL, by the footer link, or from the two
homepage mentions.

Next actions are in the backlog below, **P0 first** — both P0 items are launch
blockers that are currently invisible to visitors, so they are easy to forget:
the store buttons render "Coming soon" chips, and the support form silently
discards every message.

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
- [ ] Nav/footer markup is duplicated across six files (seven with
      `beta.html`; `404.html` has no nav). If it starts drifting,
      revisit the build-step decision (Astro/11ty was considered and declined
      on 2026-07-25 to keep GitHub Pages deploys zero-risk).
- [ ] No sitemap.xml or robots.txt.
- [ ] Legal pages contain em dashes (pre-existing, as-authored). The no-em-dash
      rule was applied to marketing copy only — legal text was deliberately not
      reworded. Decide whether to normalize.
- [ ] Mobile nav is a wrapping list, not a hamburger. Fine at current link
      count, but the beta CTA pushed it to three rows on a 390px screen —
      a hamburger is the next move if another link is added.

---

## Session log

### 2026-07-26 — Mobile nav fix + beta page

**Mobile nav.** The theme toggle was the last `<li>` inside `.nav-links`, so on
a phone it wrapped onto a row of its own and sat alone under the links on the
left. It is now a sibling of the `<ul>`: `.nav-links { margin-left: auto }`
keeps desktop identical (brand left, links + toggle right), and a new
`max-width: 640px` block uses flex `order` to put the toggle on the top row at
the far right beside the brand, with the links wrapping full-width below.
Applied to all five pages that have a nav; `404.html` has none.

**`beta.html`** — new page, linked from the nav as a "Join the beta" pill
(`.nav-cta`), from the footer of every page, from the hero note, and from the
final CTA. Two platform buttons (TestFlight, Firebase App Distribution), per
platform install steps, a bug-report pointer at `/support.html`, and a note
covering terms/privacy plus how to leave the beta. Links run through
`BETA_LINKS` + `data-beta` in `site.js`, the same pattern as `STORE_LINKS`, so
the URLs live in exactly one place and render a disabled "Invites opening soon"
state while empty. Both live URLs were supplied and are in place: TestFlight
`join/8RqTZfRQ` and App Distribution `i/d98e7ae5c6ffa25b`. Buttons are labelled
"iPhone beta" / "Android beta" rather than by the distribution tool, at the
owner's request.

**Unlisted on purpose.** Both invite URLs admit anyone holding them, so the page
carries `noindex, nofollow` and the nav pill was pulled back out after review.
The footer "Beta" link and the two homepage mentions were kept - if the beta
needs to be fully private, those three are the remaining on-site entry points.
Remove the noindex at GA.

**Copy + type pass (same day, post-review).** Masthead lockup enlarged over three
rounds, ending at 28px text (`--cl-text-2xl`) and a 44px mark, with the footer mark
taken to 28px against its unchanged 20px wordmark. The nav mark is now at its
ceiling: 44px plus the 8px block padding exactly fills the 60px
`--cl-nav-height`, so any further growth makes the sticky bar taller and the
`scroll-margin-top` on anchor targets has to move with it. The size lives on
`.site-nav .nav-brand` rather than `.nav-brand`, so the footer lockup keeps the
smaller 20px/22px pairing. The svg rule overrides the width/height attributes in
the markup, which avoids editing the same lockup across seven files. Dropped the trailing periods from the two hero
headlines, cut "Free to use. Altitude unlocks the premium extras." from the
hero note, and corrected the beta exit copy: leaving the beta means deleting
your account in the app, not deleting the app. A reported desktop gap between
the nav links and the theme toggle did not reproduce - measured a constant 20px
at seven widths from 700 to 1440px; it was a stale cache.

**Tagline changed** to "Your flights, logged and shared" (was "Your travel
life, mapped and remembered"). Hero headline, lede, and beta note rewritten to
match, and the tagline was chased into the four places it also lived: the
homepage `<title>`, `og:title`, `twitter:title`, the `404.html` description, and
`og.svg` - which was re-rendered to `og.png` with the documented
`rsvg-convert -w 1200 -h 630` command so shared links do not preview stale copy.

**Verified** at 390px and desktop width, light and dark, no console errors, no
horizontal overflow, theme toggle still switches and persists.

### 2026-07-25 (b) — Real icons, Friends band, copy aligned to the app

- **Brand mark is now the actual app icon.** Replaced the placeholder plane
  glyph (originally a *telephone handset*, then a generic plane) with the real
  mark from `ClimbLog/assets/app_icon/app_icon_main.svg` — the climbing/takeoff
  plane with its runway line. Applied to nav, footer, Passport seal, and the
  aircraft marker on the hero route. Uses `fill="currentColor"` so it inherits
  the section accent.
- **Google Play logo is the official geometry** (four-color, from simple-icons)
  rather than a hand-drawn approximation. Apple mark was already the standard one.
- **Delete-account link removed from the footer** on all pages. It lived in the
  footer nav row. It is *still* reachable from the top nav ("Account") and the
  support page — deliberately, since Apple and Google both require a
  discoverable account-deletion path for apps with account creation. Do not
  remove those two as well without checking store review requirements.
- **New Friends band** (`#friends`, charcoal) between Features and Passport,
  with a CSS friends-feed mockup: avatars (Altitude members carry the gold ring,
  same as in-app), route rows, status chips, and the `climblog.co/u/yourname`
  share link. Added to the nav. This is the competitive-differentiation section —
  Flighty and byAir are both single-user trackers.
- **Copy aligned to the app.** Dropped "not filing paperwork" and the
  spreadsheet framing. Hero lede and section headings now lead with the social
  angle; feature cards describe what the app actually does (flight-number search
  autofill, map styles, separate upcoming list, Passport light/dark). Meta and
  OG descriptions updated to match.
- `.alt-list svg` now uses `var(--accent)` instead of hard-coded gold, so the
  checkmarks are blue in the Friends band and gold in the Altitude band.


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
