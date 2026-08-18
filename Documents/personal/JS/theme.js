(() => {
  'use strict';

  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const storageKey = 'personal-trainer-theme';

  const getPreferredTheme = () => {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    if (toggle) {
      toggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'
      );
      toggle.setAttribute('aria-pressed', String(theme === 'light'));
    }
  };

  applyTheme(getPreferredTheme());

  toggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem(storageKey, next);
    applyTheme(next);
  });
})();
