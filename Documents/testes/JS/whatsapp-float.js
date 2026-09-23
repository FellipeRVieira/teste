/* =========================================================
   FORJ3D — Botão flutuante de WhatsApp
   Aparece depois que o usuário rola a página (evita
   sobrepor o hero) e some de novo se ele voltar pro topo.
========================================================= */
(function () {

  const whatsappNumber = window.FORJ3D_CONFIG?.whatsappNumber || "5527997941766";
  const message = "Olá! Vi o site da FORJ3D e gostaria de saber mais.";
  const SHOW_AFTER = 320; // px rolados até o botão aparecer

  function injectButton() {
    if (document.getElementById('waFloat')) return;

    const a = document.createElement('a');
    a.id = 'waFloat';
    a.className = 'wa-float';
    a.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'Falar no WhatsApp');
    a.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.35 5.07L2 22l5.1-1.33A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Zm0 18a7.9 7.9 0 0 1-4.05-1.11l-.29-.17-3.03.79.81-2.95-.19-.3A7.95 7.95 0 1 1 12 20Zm4.4-5.9c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.4-.14 0-.3-.02-.46-.02-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.15.2-.57.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28Z"/>
      </svg>
      <span class="wa-float-label">Falar no WhatsApp</span>
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
