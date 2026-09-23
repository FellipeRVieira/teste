/* =========================================================
   FORJ3D — Botão flutuante de Instagram
   Aparece junto com o botão de WhatsApp (depois que o usuário
   rola a página) e some de novo se ele voltar pro topo.
========================================================= */
(function () {

  const profileUrl = 'https://www.instagram.com/forj_3d/';
  const SHOW_AFTER = 320; // px rolados até o botão aparecer

  function injectButton() {
    if (document.getElementById('igFloat')) return;

    const a = document.createElement('a');
    a.id = 'igFloat';
    a.className = 'ig-float';
    a.href = profileUrl;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'Acompanhe nosso Instagram');
    a.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
      <span class="ig-float-label">Acompanhe nosso Instagram</span>
    `;
    document.body.appendChild(a);

    let ticking = false;
    function toggleVisibility() {
      const shouldShow = window.scrollY > SHOW_AFTER;
      a.classList.toggle('show', shouldShow);
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(toggleVisibility);
        ticking = true;
      }
    }, { passive: true });

    toggleVisibility();
  }

  document.addEventListener('DOMContentLoaded', injectButton);

})();
