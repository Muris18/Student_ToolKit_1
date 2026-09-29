// Shared: mobile nav + theme toggle (remembers choice)
(function () {
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem('theme');
    if (saved) root.setAttribute('data-theme', saved);
  } catch (e) {}

  const navBtn = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav');
  if (navBtn && nav) {
    navBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navBtn.setAttribute('aria-expanded', String(open));
    });
  }

  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const dark = current === 'dark' ||
        (!current && matchMedia('(prefers-color-scheme: dark)').matches);
      const next = dark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }
})();
