#!/usr/bin/env node
/* ==========================================================================
   Design-system preview builder.

   Emits self-contained HTML cards into design-system/{foundations,components}/
   for the Claude Design project. Preview pages must be standalone (they render
   in isolation), so the shared chrome CSS is inlined into each file rather
   than linked — that duplication is generated, never hand-maintained.

   Run:  node design-system/build.mjs
   Then: push with DesignSync (see CLAUDE.md → Design system).

   Palette values below mirror ../assets/css/tokens.css, which in turn mirrors
   the app. Change the app first, then tokens.css, then here.
   ========================================================================== */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));

/* ---- Chrome inlined into every card ------------------------------------- */

const CHROME = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
background:#F5F5F7;color:#0A0A0F;padding:28px;line-height:1.5;-webkit-font-smoothing:antialiased}
.t{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#4F8EF7;margin-bottom:6px}
.h{font-size:22px;font-weight:800;letter-spacing:-.02em;margin-bottom:6px}
.n{font-size:13px;color:#555570;margin-bottom:26px;max-width:64ch}
.g{margin-bottom:30px}.g:last-of-type{margin-bottom:0}
.gl{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.55;margin-bottom:12px}
.sw{display:grid;grid-template-columns:repeat(auto-fill,minmax(152px,1fr));gap:14px}
.s{border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(10,10,15,.10)}
.c{height:82px}
.m{padding:10px 12px 12px;background:#fff;border:1px solid #E0E0EA;border-top:none;border-radius:0 0 14px 14px}
.nm{font-size:13px;font-weight:600;margin-bottom:2px}
.hx{font-family:ui-monospace,SFMono-Regular,'SF Mono',Menlo,monospace;font-size:12px;opacity:.62;text-transform:uppercase}
.v{font-family:ui-monospace,SFMono-Regular,'SF Mono',Menlo,monospace;font-size:11px;opacity:.45;display:block;margin-top:3px;word-break:break-all}
.p{background:#fff;border:1px solid #E0E0EA;border-radius:16px;padding:22px}
.src{margin-top:28px;font-size:12px;font-family:ui-monospace,SFMono-Regular,'SF Mono',Menlo,monospace;opacity:.5}
@media (prefers-color-scheme:dark){
body{background:#242434;color:#F0F0FF}.n{color:#A0A0C0}
.m,.p{background:#36364E;border-color:#565672}
}
`.trim();

/* ---- Page shell ---------------------------------------------------------- */

function page({ card, group, title, eyebrow, note, body, source, extraCss = '' }) {
  return `<!-- @dsCard group="${group}" -->
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ClimbLog — ${card}</title>
<style>${CHROME}${extraCss}</style>
</head>
<body>
<div class="t">${eyebrow}</div>
<div class="h">${title}</div>
<p class="n">${note}</p>
${body}
<div class="src">source: ${source}</div>
</body>
</html>
`;
}

/* Pick readable ink for a swatch chip. */
function ink(hex) {
  const h = hex.replace('#', '');
  if (h.length !== 6) return '#fff';
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.45 ? 'rgba(10,10,15,.72)' : 'rgba(255,255,255,.82)';
}

function swatches(list) {
  return `<div class="sw">${list.map(({ name, hex, varName, chip }) => `
  <div class="s">
    <div class="c" style="background:${chip || hex};color:${ink(hex)}"></div>
    <div class="m">
      <div class="nm">${name}</div>
      <div class="hx">${hex}</div>
      ${varName ? `<code class="v">${varName}</code>` : ''}
    </div>
  </div>`).join('')}</div>`;
}

function group(label, list) {
  return `<div class="g"><div class="gl">${label}</div>${swatches(list)}</div>`;
}

/* ---- Palettes ------------------------------------------------------------ */

const BRAND = [
  { name: 'Brand',       hex: '#4F8EF7', varName: '--cl-brand' },
  { name: 'Brand dark',  hex: '#2D6FDF', varName: '--cl-brand-dark' },
  { name: 'Brand light', hex: '#7EB3FF', varName: '--cl-brand-light' },
];

const CHARCOAL = [
  { name: 'Background',       hex: '#242434', varName: 'dark.background' },
  { name: 'Surface',          hex: '#36364E', varName: 'dark.surface' },
  { name: 'Surface elevated', hex: '#424260', varName: 'dark.surfaceElevated' },
  { name: 'Border',           hex: '#565672', varName: 'dark.border' },
  { name: 'Text',             hex: '#F0F0FF', varName: 'dark.text' },
  { name: 'Text secondary',   hex: '#A0A0C0', varName: 'dark.textSecondary' },
];

const LIGHT = [
  { name: 'Background',       hex: '#F5F5F7', varName: 'light.background' },
  { name: 'Surface',          hex: '#FFFFFF', varName: 'light.surface' },
  { name: 'Surface elevated', hex: '#F0F0F5', varName: 'light.surfaceElevated' },
  { name: 'Border',           hex: '#E0E0EA', varName: 'light.border' },
  { name: 'Text',             hex: '#0A0A0F', varName: 'light.text' },
  { name: 'Text secondary',   hex: '#555570', varName: 'light.textSecondary' },
];

const ALTITUDE = [
  { name: 'Altitude',       hex: '#C9A84C', varName: '--cl-altitude' },
  { name: 'Altitude dark',  hex: '#A8863A', varName: '--cl-altitude-dark' },
  { name: 'Altitude light', hex: '#E8C97A', varName: '--cl-altitude-light' },
];

const PASSPORT_DARK = [
  { name: 'Indigo 1', hex: '#110C52', varName: '--cl-passport-1' },
  { name: 'Indigo 2', hex: '#1C1472', varName: '--cl-passport-2' },
  { name: 'Indigo 3', hex: '#0E0840', varName: '--cl-passport-3' },
  { name: 'Gold',     hex: '#FFC840', varName: '--cl-passport-gold' },
  { name: 'Route',    hex: '#FFD700', varName: '--cl-passport-route' },
  { name: 'Land',     hex: 'rgba(95,75,215,.82)', varName: '--cl-passport-land', chip: 'rgba(95,75,215,.82)' },
];

const PASSPORT_LIGHT = [
  { name: 'Violet mist', hex: '#F7F1FF', varName: '--cl-passport-l-1' },
  { name: 'Violet haze', hex: '#EAE3FF', varName: '--cl-passport-l-2' },
  { name: 'Sky wash',    hex: '#E2EEFF', varName: '--cl-passport-l-3' },
  { name: 'Ink',         hex: '#1B144E', varName: '--cl-passport-l-ink' },
  { name: 'Coral route', hex: '#E24B5B', varName: '--cl-passport-l-route' },
  { name: 'Land',        hex: 'rgba(75,49,198,.96)', varName: '--cl-passport-l-land', chip: 'rgba(75,49,198,.96)' },
];

const STATUS = [
  { name: 'Success',       hex: '#34C759', varName: '--cl-success (dark)' },
  { name: 'Success light', hex: '#28A745', varName: 'light.success' },
  { name: 'Warning',       hex: '#FF9F0A', varName: '--cl-warning' },
  { name: 'Error',         hex: '#FF453A', varName: '--cl-error (dark)' },
  { name: 'Error light',   hex: '#DC3545', varName: 'light.error' },
];

/* ---- Cards --------------------------------------------------------------- */

const files = [];

files.push(['foundations/colors-brand.html', page({
  card: 'Brand & app colors', group: 'Colors',
  eyebrow: 'Foundations', title: 'Brand & app colors',
  note: 'The core identity blue plus the charcoal and light surface ramps the app chrome is built from. ClimbLog is charcoal-dark-first — the dark background is <b>#242434</b>, never pure black.',
  body: group('Brand', BRAND) + group('Charcoal (dark mode)', CHARCOAL) + group('Light mode', LIGHT) + group('Status', STATUS),
  source: 'ClimbLog/src/constants/colors.ts',
})]);

files.push(['foundations/colors-passport.html', page({
  card: 'Passport indigo & gold', group: 'Colors',
  eyebrow: 'Foundations', title: 'Passport indigo &amp; gold',
  note: 'The Flight Passport share card scheme — the most distinctive surface in the product. The indigo gradient carries gold route lines in dark, coral in light. Reserved for Passport and share-card contexts; do not use as general chrome.',
  body: `<div class="g"><div class="gl">Dark card gradient</div>
<div class="s" style="margin-bottom:14px"><div class="c" style="height:96px;background:linear-gradient(155deg,#110C52 0%,#1C1472 55%,#0E0840 100%)"></div>
<div class="m"><div class="nm">Passport gradient</div><div class="hx">#110C52 → #1C1472 → #0E0840</div><code class="v">--cl-passport-gradient</code></div></div>
${swatches(PASSPORT_DARK)}</div>
<div class="g"><div class="gl">Light card gradient</div>
<div class="s" style="margin-bottom:14px"><div class="c" style="height:96px;background:linear-gradient(155deg,#F7F1FF 0%,#EAE3FF 55%,#E2EEFF 100%)"></div>
<div class="m"><div class="nm">Passport gradient (light)</div><div class="hx">#F7F1FF → #EAE3FF → #E2EEFF</div><code class="v">--cl-passport-l-gradient</code></div></div>
${swatches(PASSPORT_LIGHT)}</div>`,
  source: 'ClimbLog/src/components/passport/PassportShareCard.tsx (DARK_T / LIGHT_T)',
})]);

files.push(['foundations/colors-altitude.html', page({
  card: 'Altitude (premium)', group: 'Colors',
  eyebrow: 'Foundations', title: 'Altitude',
  note: 'Gold marks premium and nothing else. It signals the Altitude plan — subscriber avatar rings, upgrade surfaces, paywall. Using it decoratively dilutes the signal.',
  body: group('Altitude gold', ALTITUDE) + `
<div class="g"><div class="gl">In context</div>
<div class="p" style="background:#1B1B28;border-color:rgba(201,168,76,.28)">
  <div style="display:flex;align-items:center;gap:14px">
    <div style="width:52px;height:52px;border-radius:9999px;background:#36364E;border:2.5px solid #C9A84C"></div>
    <div>
      <div style="color:#F5F0E4;font-weight:600;font-size:15px">Altitude member</div>
      <div style="color:#C9A84C;font-size:13px;font-weight:600;letter-spacing:.04em">GOLD AVATAR RING</div>
    </div>
  </div>
</div></div>`,
  source: 'ClimbLog/src/constants/colors.ts → Colors.altitude',
})]);

files.push(['foundations/typography.html', page({
  card: 'Typography', group: 'Type',
  eyebrow: 'Foundations', title: 'Typography',
  note: 'Inter across app and web. The px scale is the app\'s; the rem column is the web equivalent used by tokens.css.',
  extraCss: `
.ty{border-bottom:1px solid #E0E0EA;padding:14px 0;display:flex;align-items:baseline;gap:18px;flex-wrap:wrap}
.ty:last-child{border-bottom:none}
.ty code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;opacity:.5;min-width:170px}
@media (prefers-color-scheme:dark){.ty{border-color:#565672}}`,
  body: `<div class="p">
${[['4xl', 42, '2.625rem', 800], ['3xl', 34, '2.125rem', 800], ['2xl', 28, '1.75rem', 700],
   ['xl', 24, '1.5rem', 700], ['lg', 20, '1.25rem', 600], ['md', 17, '1.0625rem', 400],
   ['base', 15, '0.9375rem', 400], ['sm', 13, '0.8125rem', 400], ['xs', 11, '0.6875rem', 500]]
  .map(([k, px, rem, w]) => `<div class="ty">
  <span style="font-size:${px}px;font-weight:${w};letter-spacing:${px >= 28 ? '-.02em' : '0'}">Climb higher</span>
  <code>${k} · ${px}px · ${rem}</code></div>`).join('')}
</div>
<div class="g" style="margin-top:26px"><div class="gl">Weights</div><div class="p">
${[[300, 'Light'], [400, 'Regular'], [500, 'Medium'], [600, 'SemiBold'], [700, 'Bold'], [800, 'ExtraBold (web headings)']]
  .map(([w, n]) => `<div class="ty"><span style="font-size:18px;font-weight:${w}">${n}</span><code>${w}</code></div>`).join('')}
</div></div>`,
  source: 'ClimbLog/src/constants/typography.ts',
})]);

files.push(['foundations/spacing-radius.html', page({
  card: 'Spacing & radius', group: 'Spacing',
  eyebrow: 'Foundations', title: 'Spacing &amp; radius',
  note: 'One 4px-based scale shared by app and web. Radii are the app\'s BorderRadius values — cards use lg (14px), pills use full.',
  extraCss: `
.bar{display:flex;align-items:center;gap:14px;margin-bottom:9px}
.bar code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;opacity:.5;min-width:150px}
.rr{display:flex;gap:16px;flex-wrap:wrap}
.rb{width:88px;height:88px;background:#4F8EF7;display:grid;place-items:flex-end;padding:8px;color:#fff;font-size:11px;font-weight:600}`,
  body: `<div class="g"><div class="gl">Spacing</div><div class="p">
${[['xs', 4], ['sm', 8], ['md', 12], ['base', 16], ['lg', 20], ['xl', 24], ['2xl', 32], ['3xl', 40], ['4xl', 48], ['5xl', 64]]
  .map(([k, px]) => `<div class="bar"><code>${k} · ${px}px</code>
  <div style="height:14px;width:${px}px;background:#4F8EF7;border-radius:3px"></div></div>`).join('')}
</div></div>
<div class="g"><div class="gl">Radius</div><div class="p"><div class="rr">
${[['sm', 6], ['md', 10], ['lg', 14], ['xl', 20], ['full', 9999]]
  .map(([k, px]) => `<div class="rb" style="border-radius:${px}px">${k}</div>`).join('')}
</div></div></div>`,
  source: 'ClimbLog/src/constants/spacing.ts',
})]);

/* ---- Component cards ----------------------------------------------------- */

const BTN_CSS = `
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:.8rem 1.4rem;
border-radius:10px;border:1.5px solid transparent;font-family:inherit;font-size:15px;font-weight:600;
text-decoration:none;cursor:pointer}
.row{display:flex;gap:14px;flex-wrap:wrap;align-items:center}`;

files.push(['components/buttons.html', page({
  card: 'Buttons', group: 'Components',
  eyebrow: 'Components', title: 'Buttons',
  note: 'Primary uses the section\'s accent, so the same markup adapts per context — blue on charcoal, gold on Passport indigo, gold on Altitude. Ghost is the paired secondary.',
  extraCss: BTN_CSS,
  body: `<div class="g"><div class="gl">Charcoal context — accent #4F8EF7</div>
<div class="p" style="background:#242434;border-color:rgba(255,255,255,.12)"><div class="row">
<a class="btn" style="background:#4F8EF7;border-color:#4F8EF7;color:#fff">Get ClimbLog</a>
<a class="btn" style="background:rgba(240,240,255,.08);border-color:rgba(240,240,255,.24);color:#F0F0FF">See features</a>
</div></div></div>

<div class="g"><div class="gl">Passport context — accent #FFC840</div>
<div class="p" style="background:linear-gradient(155deg,#110C52,#1C1472);border-color:rgba(255,255,255,.16)"><div class="row">
<a class="btn" style="background:#FFC840;border-color:#FFC840;color:#0F0F2D">Make your Passport</a>
<a class="btn" style="background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.24);color:#fff">Learn more</a>
</div></div></div>

<div class="g"><div class="gl">Altitude context — accent #C9A84C</div>
<div class="p" style="background:#1B1B28;border-color:rgba(201,168,76,.28)"><div class="row">
<a class="btn" style="background:#C9A84C;border-color:#C9A84C;color:#1B1B28">Go Altitude</a>
<a class="btn" style="background:rgba(245,240,228,.08);border-color:rgba(201,168,76,.42);color:#F5F0E4">Compare plans</a>
</div></div></div>

<div class="g"><div class="gl">Light context — accent #2D6FDF</div>
<div class="p"><div class="row">
<a class="btn" style="background:#2D6FDF;border-color:#2D6FDF;color:#fff">Download</a>
<a class="btn" style="background:rgba(10,10,15,.05);border-color:rgba(10,10,15,.16);color:#0A0A0F">Support</a>
</div></div></div>`,
  source: 'climblog-site/assets/css/site.css → .btn',
})]);

files.push(['components/section-contexts.html', page({
  card: 'Section contexts', group: 'Components',
  eyebrow: 'Components', title: 'Section contexts',
  note: 'The site alternates four palettes by section. Each <code>.ctx-*</code> class rebinds the semantic variables locally, so any card or button dropped inside inherits the right scheme with no per-element overrides.',
  extraCss: `
.ctx{border-radius:16px;padding:22px;margin-bottom:14px}
.ctx h4{font-size:16px;font-weight:700;margin-bottom:4px}
.ctx p{font-size:13px}
.tag{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.7;margin-bottom:8px}`,
  body: `
<div class="ctx" style="background:#242434;color:#F0F0FF">
  <div class="tag" style="color:#4F8EF7">.ctx-charcoal — nav, hero, footer</div>
  <h4>Your travel life, mapped</h4>
  <p style="color:#A0A0C0">App chrome. Identical in light and dark themes — it is the dark chrome.</p>
</div>
<div class="ctx" style="background:#F5F5F7;color:#0A0A0F;border:1px solid #E0E0EA">
  <div class="tag" style="color:#2D6FDF">default light — feature sections</div>
  <h4>Built for people who love flying</h4>
  <p style="color:#555570">Follows the reader's theme; flips to charcoal in dark mode.</p>
</div>
<div class="ctx" style="background:linear-gradient(155deg,#110C52,#1C1472);color:#fff">
  <div class="tag" style="color:#FFC840">.ctx-passport — Passport showcase</div>
  <h4>A Flight Passport worth sharing</h4>
  <p style="color:rgba(255,255,255,.66)">Indigo and gold. One band only, so it stays an event.</p>
</div>
<div class="ctx" style="background:#1B1B28;color:#F5F0E4">
  <div class="tag" style="color:#C9A84C">.ctx-altitude — premium</div>
  <h4>Altitude</h4>
  <p style="color:rgba(245,240,228,.66)">Gold means premium. Never decorative.</p>
</div>`,
  source: 'climblog-site/assets/css/tokens.css → .ctx-*',
})]);

files.push(['components/cards.html', page({
  card: 'Feature cards', group: 'Components',
  eyebrow: 'Components', title: 'Feature cards',
  note: 'The homepage feature grid unit: icon badge tinted from the section accent, title, and one supporting line. Auto-fit grid, minimum 270px.',
  extraCss: `
.cg{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}
.fc{background:#fff;border:1px solid #E0E0EA;border-radius:14px;padding:22px}
.ib{width:44px;height:44px;border-radius:10px;background:rgba(45,111,223,.14);color:#2D6FDF;
display:grid;place-items:center;margin-bottom:14px;font-size:19px}
.fc h4{font-size:15px;font-weight:700;margin-bottom:6px}
.fc p{font-size:13px;color:#555570}
@media (prefers-color-scheme:dark){.fc{background:#36364E;border-color:#565672}.fc p{color:#A0A0C0}
.ib{background:rgba(79,142,247,.18);color:#4F8EF7}}`,
  body: `<div class="cg">
${[['🗺️', 'Route map & globe', 'Every route you have flown, on a world map that zooms out to a globe.'],
   ['📊', 'Stats & milestones', 'Miles, countries, airports, aircraft, longest route, best year.'],
   ['🛫', 'Upcoming flights', 'Future trips kept separate from history, with live status.'],
   ['👥', 'Friends & shared routes', 'Follow friends, compare overlap, see who is flying where next.']]
  .map(([i, h, p]) => `<div class="fc"><div class="ib">${i}</div><h4>${h}</h4><p>${p}</p></div>`).join('')}
</div>`,
  source: 'climblog-site/assets/css/site.css → .card / .grid',
})]);

/* ---- Write --------------------------------------------------------------- */

for (const [rel, html] of files) {
  const out = join(ROOT, rel);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html, 'utf8');
  console.log('wrote', rel);
}
console.log(`\n${files.length} cards built.`);
