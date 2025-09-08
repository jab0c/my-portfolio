document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Smooth in-page nav
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        e.preventDefault();
        document.querySelector(id)?.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // ===== Theme switch =====
  const root = document.documentElement; // <html>
  const btn  = document.getElementById('theme-switch');
  const icon = document.getElementById('themeIcon');

  const FAV_LIGHT = 'favicon.svg';
  const FAV_DARK  = 'favicon-dark.svg';

  function setFavicon(href) {
    let link = document.querySelector('link[rel*="icon"]') || document.createElement('link');
    link.rel = 'icon';
    link.href = href;
    document.head.appendChild(link);
  }

  function applyTheme(theme, persist = true) {
    // set data-theme instead of toggling a .dark class
    root.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';

    // switch knob icon (moon <-> sun)
    if (icon) {
      icon.classList.toggle('bi-moon-stars', isDark);
      icon.classList.toggle('bi-sun', !isDark);
    }

    // button state + favicon
    btn?.setAttribute('aria-pressed', String(isDark));
    setFavicon(isDark ? FAV_DARK : FAV_LIGHT);

    if (persist) localStorage.setItem('theme', theme);
  }

  function systemPref() {
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // init (respect saved pref, else system)
  (function initTheme() {
    const saved = localStorage.getItem('theme');
    applyTheme(saved ?? systemPref(), false);
  })();

  // react to OS changes if user hasn't chosen
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const saved = localStorage.getItem('theme');
    if (!saved) applyTheme(e.matches ? 'dark' : 'light', false);
  });

  // click
  btn?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  });

  // Copy email fallback
  const copyBtn = document.getElementById('copyEmail');
  copyBtn?.addEventListener('click', async () => {
    const email = copyBtn.dataset.email || 'hello@jab0c.dev';
    try{
      await navigator.clipboard.writeText(email);
      copyBtn.innerHTML = '<i class="bi bi-check2-circle me-2"></i>Copied!';
      setTimeout(() => copyBtn.innerHTML = '<i class="bi bi-clipboard me-2"></i>Copy email', 1500);
    }catch{
      window.location.href = 'mailto:'+email;
    }
  });

  // CONTACT FORM (no backend) → opens mail client with prefilled body
  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    // basic validation UI
    let valid = true;
    form.querySelectorAll('[required]').forEach(el => {
      if (!el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value))){
        el.classList.add('is-invalid');
        valid = false;
      } else {
        el.classList.remove('is-invalid');
      }
    });
    if (!valid) return;

    const name = form.elements['name'].value.trim();
    const email = form.elements['email'].value.trim();
    const message = form.elements['message'].value.trim();

    const subject = encodeURIComponent(`Project Inquiry — ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}
Email: ${email}

Brief:
${message}

(Submitted from jab0c portfolio form)`
    );
    // change to your preferred inbox:
    const to = 'hello@jab0c.dev';
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  });
});

// ===== Section hints (prev/next labels) + active highlight
const _sections = Array.from(document.querySelectorAll('section.block'));
if (_sections.length){
  _sections.forEach((s, i) => {
    const prev = _sections[i-1]?.dataset.title || '';
    const next = _sections[i+1]?.dataset.title || '';
    const top    = s.querySelector('.section-hint.top');
    const bottom = s.querySelector('.section-hint.bottom');
    if (top)    top.textContent    = prev;
    if (bottom) bottom.textContent = next;
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      e.target.classList.toggle('is-active', e.isIntersecting && e.intersectionRatio > 0.6);
    });
  }, { rootMargin: '-20% 0px -60% 0px', threshold: [0.6] });

  _sections.forEach(s => io.observe(s));
}
