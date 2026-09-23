(() => {
  'use strict';

  const year = document.querySelector('[data-current-year]');
  if (year) year.textContent = new Date().getFullYear();
})();

/* ---------- Navbar: estado ao rolar + menu mobile ---------- */
(() => {
  'use strict';

  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const navToggle = document.getElementById('navToggle');
  const navLinks = navbar.querySelectorAll('.nav-links a');

  const updateScrolledState = () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  updateScrolledState();
  window.addEventListener('scroll', updateScrolledState, { passive: true });

  const closeMenu = () => {
    navbar.classList.remove('is-open');
    navToggle?.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Abrir menu');
  };

  navToggle?.addEventListener('click', () => {
    const isOpen = navbar.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));
})();
