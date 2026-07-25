/* ==========================================================================
   ClimbLog site behaviour. Small, dependency-free, safe to inline-cache.
   ========================================================================== */

/* ---- Store links --------------------------------------------------------
   LAUNCH DAY: paste the two live URLs here and every store button across the
   whole site turns from a "Coming soon" chip into a real link. Nothing else
   needs editing. Leave a value empty ('') to keep that platform pending.
   ------------------------------------------------------------------------ */
const STORE_LINKS = {
  ios: '',      // e.g. 'https://apps.apple.com/app/climblog/id0000000000'
  android: '',  // e.g. 'https://play.google.com/store/apps/details?id=com.climblog.app'
};

(function applyStoreLinks() {
  document.querySelectorAll('[data-store]').forEach(el => {
    const url = STORE_LINKS[el.dataset.store];
    const note = el.querySelector('[data-store-note]');
    if (url) {
      el.setAttribute('href', url);
      el.removeAttribute('aria-disabled');
      el.classList.remove('is-pending');
      if (note) note.textContent = el.dataset.storeLabel || 'Download on the';
    } else {
      el.removeAttribute('href');
      el.setAttribute('aria-disabled', 'true');
      el.classList.add('is-pending');
      if (note) note.textContent = 'Coming soon to';
    }
  });
})();

/* ---- Theme toggle -------------------------------------------------------
   The inline script in <head> sets data-theme before first paint to avoid a
   flash. This only handles the click and persists the choice.
   ------------------------------------------------------------------------ */
(function themeToggle() {
  const btn = document.querySelector('.theme-toggle');
  if (!btn) return;

  const systemPrefersDark = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const current = () =>
    document.documentElement.getAttribute('data-theme') ||
    (systemPrefersDark() ? 'dark' : 'light');

  const label = () =>
    btn.setAttribute('aria-label',
      current() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');

  label();

  btn.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('cl-theme', next); } catch (_) {}
    label();
  });
})();

/* ---- Reveal on scroll ---------------------------------------------------- */
(function reveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  items.forEach(el => io.observe(el));
})();

/* ---- Footer year --------------------------------------------------------- */
(function year() {
  const el = document.querySelector('[data-year]');
  if (el) el.textContent = new Date().getFullYear();
})();
