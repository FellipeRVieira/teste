/* =========================================================
   FORJ3D — barra de comparação: desenho x modelo 3D
   Arraste a barra vertical: pra esquerda esconde o desenho
   (revela o modelo), pra direita esconde o modelo (cobre com
   o desenho). Script simples, sem depender do three.js —
   só corta a imagem com clip-path por cima do canvas.
   ========================================================= */
(function () {
  const container = document.getElementById('charizardFluid');
  const image = document.getElementById('charizardCompareImage');
  const handle = document.getElementById('charizardCompareHandle');
  if (!container || !image || !handle) return;

  let dragging = false;

  function setPosition(pct) {
    pct = Math.max(0, Math.min(100, pct));
    image.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left = pct + '%';
    handle.setAttribute('aria-valuenow', String(Math.round(pct)));
  }

  function pctFromClientX(clientX) {
    const rect = container.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  handle.addEventListener('pointerdown', (e) => {
    dragging = true;
    handle.setPointerCapture(e.pointerId);
  });

  handle.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    setPosition(pctFromClientX(e.clientX));
  });

  function endDrag(e) {
    dragging = false;
    try { handle.releasePointerCapture(e.pointerId); } catch (_) { /* noop */ }
  }
  handle.addEventListener('pointerup', endDrag);
  handle.addEventListener('pointercancel', endDrag);

  // teclado: setas esquerda/direita movem a barra em passos de 5%
  handle.addEventListener('keydown', (e) => {
    const current = parseFloat(handle.style.left) || 100;
    if (e.key === 'ArrowLeft') { setPosition(current - 5); e.preventDefault(); }
    if (e.key === 'ArrowRight') { setPosition(current + 5); e.preventDefault(); }
  });

  setPosition(100); // começa 100% à direita — só o desenho aparece ao carregar
})();
