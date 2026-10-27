// Using Data to Drive Business Performance · prospectus v6
document.documentElement.classList.add('js');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Searchable registers (courses, textbooks).
document.querySelectorAll('[data-search-input]').forEach(input => {
  input.addEventListener('input', () => {
    const root = document.querySelector(input.dataset.searchInput);
    if (!root) return;
    const q = input.value.toLowerCase().trim();
    let found = 0;
    root.querySelectorAll('[data-search]').forEach(row => {
      const show = row.dataset.search.toLowerCase().includes(q);
      row.hidden = !show;
      if (show) found++;
    });
    const status = document.getElementById(input.dataset.status);
    if (status) status.textContent = found + ' matching records';
  });
});

// Open or close every part of the chapter outline.
document.querySelectorAll('[data-expand]').forEach(button => button.addEventListener('click', () => {
  const open = button.dataset.action === 'open';
  document.querySelectorAll(button.dataset.expand).forEach(d => { d.open = open; });
}));

// A link into a folded part or a reference opens the fold first.
function revealHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id && document.getElementById(id);
  if (!target) return;
  let el = target;
  while (el) { if (el.tagName === 'DETAILS') el.open = true; el = el.parentElement; }
  requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
}
addEventListener('hashchange', revealHash);
if (location.hash) revealHash();
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (a && a.getAttribute('href') === location.hash) revealHash();
});

// Reveal on scroll, bar growth, the course arc and the chapter-sequence grid.
(function () {
  const items = document.querySelectorAll('.reveal, .bars, .seq, .arc');
  if (reduceMotion || !('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(el => io.observe(el));
})();

// Count up the headline numbers once they are on screen. The final text is always the original.
(function () {
  const els = document.querySelectorAll('[data-count]');
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  const run = el => {
    const node = [...el.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.textContent));
    if (!node) return;
    const original = node.textContent;
    const m = original.match(/^(\D*?)([\d,]+(?:\.\d+)?)(.*)$/s);
    if (!m) return;
    const target = parseFloat(m[2].replace(/,/g, ''));
    const decimals = (m[2].split('.')[1] || '').length;
    const comma = m[2].includes(',');
    const fmt = v => {
      const s = v.toFixed(decimals);
      return comma ? Number(s).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : s;
    };
    const start = performance.now(), dur = 1400;
    const step = now => {
      const t = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - t, 3);
      node.textContent = m[1] + fmt(target * e) + m[3];
      if (t < 1) requestAnimationFrame(step); else node.textContent = original;
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
  }), { threshold: 0.6 });
  els.forEach(el => io.observe(el));
})();

// Header: highlight the current part, show reading progress and the back-to-top button.
(function () {
  const links = [...document.querySelectorAll('.site-nav a')];
  const parts = links.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  const bar = document.querySelector('.reading-progress span');
  const toTop = document.querySelector('.to-top');
  let pending = false;
  function update() {
    pending = false;
    const line = innerHeight * 0.35;
    let current = null;
    parts.forEach(p => { if (p.getBoundingClientRect().top <= line) current = p; });
    links.forEach(a => {
      const on = current && a.getAttribute('href') === '#' + current.id;
      a.classList.toggle('active', !!on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
    if (toTop) toTop.classList.toggle('show', scrollY > innerHeight * 1.2);
  }
  const request = () => { if (!pending) { pending = true; requestAnimationFrame(update); } };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  update();
})();

// Copy the email address.
(function () {
  const btn = document.getElementById('copy-email');
  if (!btn) return;
  const status = document.getElementById('copy-status');
  const email = btn.dataset.copy;
  let timer;
  const say = t => { status.textContent = t; clearTimeout(timer); timer = setTimeout(() => { status.textContent = ''; }, 4000); };
  const fallback = () => {
    const el = document.getElementById('email');
    try { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {}
    say('Could not copy. The address is selected: press Ctrl+C or Cmd+C.');
  };
  btn.addEventListener('click', () => {
    if (navigator.clipboard && isSecureContext) navigator.clipboard.writeText(email).then(() => say('Copied'), fallback);
    else fallback();
  });
})();
