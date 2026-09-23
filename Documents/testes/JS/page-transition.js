/* =========================================================
   TRANSIÇÃO DE PÁGINA — faixa líquida de tela cheia
   Só entra em ação em links marcados com a classe
   .js-bubble-transition (hoje, só o botão "Ver todos os
   produtos" abaixo do carrossel da home).
   ========================================================= */
(function () {
  const overlay = document.getElementById('pageTransition');
  if (!overlay) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resetOverlay() {
    overlay.classList.remove('is-covering', 'is-covered', 'is-revealing');
  }

  // ---------- saída: clique no link marcado ----------
  document.querySelectorAll('.js-bubble-transition').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const href = link.getAttribute('href');
      if (!href || link.target === '_blank') return;

      e.preventDefault();

      if (prefersReduced) {
        window.location.href = href;
        return;
      }

      overlay.classList.add('is-covering');

      const finish = () => {
        try { sessionStorage.setItem('forj3d_transition', '1'); } catch (err) { /* segue sem persistir */ }
        window.location.href = href;
      };

      // dispara ao fim da bolha de cima (a última a terminar de subir);
      // o setTimeout é uma rede de segurança caso o evento não dispare.
      overlay.querySelector('.ptb-b').addEventListener('animationend', finish, { once: true });
      setTimeout(finish, 900);
    });
  });

  // ---------- chegada: página carregada já em estado "coberto" ----------
  // (a classe is-covered é aplicada por um script inline, antes deste
  // arquivo carregar, pra não piscar a página nova sem a cobertura)
  if (overlay.classList.contains('is-covered')) {
    try { sessionStorage.removeItem('forj3d_transition'); } catch (e) { /* ignora */ }

    if (prefersReduced) {
      resetOverlay();
    } else {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.classList.add('is-revealing');
        });
      });

      overlay.querySelector('.ptb-a').addEventListener('animationend', resetOverlay, { once: true });
      setTimeout(resetOverlay, 1200);
    }
  }

  // ---------- corrige o botão "voltar" do navegador ----------
  // Quando a página de saída é restaurada do bfcache (histórico do
  // navegador), ela pode voltar com a classe "is-covering" ainda
  // aplicada (com a faixa parada no estado "cobriu tudo"), porque o
  // navegador saiu da página no meio/fim da animação, sem dar tempo
  // do JS limpar isso. O evento "pageshow" dispara de novo nesse
  // caso (com persisted=true) — usamos ele pra resetar a tela.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      resetOverlay();
    }
  });
})();
