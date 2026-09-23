// navbar em pílula
(function () {
  const groups = document.querySelectorAll('.pill-nav');
  if (!groups.length) return;

  groups.forEach((group) => {
    const groupKey = group.getAttribute('data-pill-group');

    group.querySelectorAll('.pill-link').forEach((link) => {
      link.addEventListener('click', () => {
        const pillKey = link.getAttribute('data-pill');
        if (!pillKey) return;

        document
          .querySelectorAll(`.pill-nav[data-pill-group="${groupKey}"] .pill-link`)
          .forEach((el) => {
            el.classList.toggle('active', el.getAttribute('data-pill') === pillKey);
          });
      });
    });
  });
})();

// offset do header nos links âncora
(function () {
  const header = document.querySelector('header');
  if (!header) return;

  function updateHeaderOffset() {
    const height = header.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--header-scroll-offset', `${height + 16}px`);
  }

  updateHeaderOffset();
  window.addEventListener('resize', updateHeaderOffset);
  window.addEventListener('load', updateHeaderOffset);
})();
