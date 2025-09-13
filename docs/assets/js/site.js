document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Smooth in-page nav
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id && id.length > 1) {
        e.preventDefault();
        document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== Theme switch =====
  const btn  = document.getElementById('theme-switch');
  const icon = document.getElementById('themeIcon');
  const toggle = document.getElementById('theme-toggle');

  // Single favicon for now (both constants point to same file)
  const FAV_LIGHT = 'favicon.svg';
  const FAV_DARK  = 'favicon.svg';

  function setFavicon(href) {
    // replace or create a single <link rel="icon">
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = href;
  }

  function applyTheme(theme, persist = true) {
    const isDark = theme === 'dark';
    root.setAttribute('data-theme', theme);

    if (icon) {
      icon.classList.toggle('bi-moon-stars', isDark);
      icon.classList.toggle('bi-sun', !isDark);
    }
    btn?.setAttribute('aria-pressed', String(isDark));

    setFavicon(isDark ? FAV_DARK : FAV_LIGHT);
    if (persist) localStorage.setItem('theme', theme);
  }

  // init: default to DARK unless user saved a preference
  (function initTheme() {
    const saved = localStorage.getItem('theme');
    applyTheme(saved ?? 'dark', false);
  })();

  // Respond to OS changes only if user hasn't chosen
  const media = matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', e => {
    const saved = localStorage.getItem('theme');
    if (!saved) applyTheme(e.matches ? 'dark' : 'light', false);
  });

  // Click: center switch
  btn?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  });

  // Make "Light" / "Dark" labels clickable
  toggle?.querySelectorAll('[data-theme-choice]').forEach(el => {
    el.addEventListener('click', () => {
      const choice = el.getAttribute('data-theme-choice');
      if (choice) applyTheme(choice, true);
    });
  });

  // Copy email (fallback mailto)
  const copyBtn = document.getElementById('copyEmail');
  copyBtn?.addEventListener('click', async () => {
    const email = copyBtn.dataset.email || 'contact@jab0c.com';
    try {
      await navigator.clipboard.writeText(email);
      copyBtn.innerHTML = '<i class="bi bi-check2-circle me-2"></i>Copied!';
      setTimeout(() => copyBtn.innerHTML = '<i class="bi bi-clipboard me-2"></i>Copy email', 1500);
    } catch {
      window.location.href = 'mailto:' + email;
    }
  });

  // CONTACT FORM → opens mail client with prefilled body
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(el => {
      const badEmail = el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value);
      if (!el.value.trim() || badEmail) {
        el.classList.add('is-invalid');
        valid = false;
      } else {
        el.classList.remove('is-invalid');
      }
    });
    if (!valid) {
      formStatus && (formStatus.textContent = 'Please fix the highlighted fields.');
      return;
    }

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
    const to = 'contact@jab0c.com';
    formStatus && (formStatus.textContent = 'Opening your email client…');
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  });
});

// ===== Section hints + active highlight (outside DOMContentLoaded so it can run early if needed)
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
      e.target.classList.toggle('is-active', e.isIntersecting && e.intersectionRatio > 0.5);
    });
  }, { rootMargin: '-25% 0px -55% 0px', threshold: [0.5] });

  _sections.forEach(s => io.observe(s));
}
