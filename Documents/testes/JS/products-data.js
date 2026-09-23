/* =========================================================
   FORJ3D — Dados compartilhados dos produtos
   ========================================================= */

window.FORJ3D_CONFIG = {
  whatsappNumber: "5527997941766"
};

window.FORJ3D_ICONS = {
  controle: '<svg viewBox="0 0 100 100" fill="none"><rect x="20" y="30" width="60" height="45" rx="4" stroke="currentColor" stroke-width="2"/><path d="M30 30v-8h40v8" stroke="currentColor" stroke-width="2"/></svg>',
  vaso: '<svg viewBox="0 0 100 100" fill="none"><path d="M50 20c14 0 22 10 22 24 0 12-10 16-10 28H38c0-12-10-16-10-28 0-14 8-24 22-24Z" stroke="currentColor" stroke-width="2"/></svg>',
  luminaria: '<svg viewBox="0 0 100 100" fill="none"><path d="M50 18v14M35 55l15-23 15 23z" stroke="currentColor" stroke-width="2"/><rect x="30" y="55" width="40" height="10" rx="2" stroke="currentColor" stroke-width="2"/><path d="M42 65v12h16V65" stroke="currentColor" stroke-width="2"/></svg>',
  celular: '<svg viewBox="0 0 100 100" fill="none"><rect x="26" y="24" width="48" height="52" rx="8" stroke="currentColor" stroke-width="2"/><path d="M38 65h24" stroke="currentColor" stroke-width="2"/></svg>',
  miniatura: '<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="42" r="16" stroke="currentColor" stroke-width="2"/><path d="M30 78c2-14 10-20 20-20s18 6 20 20" stroke="currentColor" stroke-width="2"/></svg>',
  organizador: '<svg viewBox="0 0 100 100" fill="none"><rect x="22" y="30" width="56" height="40" rx="4" stroke="currentColor" stroke-width="2"/><path d="M22 46h56M40 30v40M60 30v40" stroke="currentColor" stroke-width="1.4"/></svg>',
  porta_chaves: '<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="30" r="10" stroke="currentColor" stroke-width="2"/><path d="M50 40v34M38 60h24M40 74h20" stroke="currentColor" stroke-width="2"/></svg>',
  quadro: '<svg viewBox="0 0 100 100" fill="none"><rect x="24" y="22" width="52" height="56" rx="3" stroke="currentColor" stroke-width="2"/><path d="M24 62 42 46l12 12 22-20" stroke="currentColor" stroke-width="2"/></svg>',
  porta_copo: '<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="26" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="10" stroke="currentColor" stroke-width="1.4"/></svg>'
};

// O catálogo de produtos (window.FORJ3D_PRODUCTS) foi movido para
// JS/products-catalog.js, que é gerado automaticamente pelo painel
// em admin/ sempre que o Sávio cadastra, edita ou remove um produto.
// Esse script precisa ser incluído no HTML logo depois deste arquivo.


window.FORJ3D_CATEGORIES = ["Todos", "Decoração", "Colecionáveis", "Utilidades", "Organizadores"];

/* =========================================================
   Helpers de imagem otimizada — compartilhados por index.js,
   cart.js e produtos.js. Toda foto/gif em IMG/produtos/** tem
   uma versão .webp (cheia) e -thumb.webp (miniatura) gerada
   por scripts/optimize-images.js. Se a versão otimizada ainda
   não existir (script não rodou pra ela), o onerror cai de
   volta pro arquivo original — nada quebra visualmente, só
   fica mais pesado até rodar o script.
========================================================= */
window.FORJ3D_OPTIMIZABLE_EXT = /\.(jpe?g|png|gif)$/i;

window.forj3dToFullSrc = function (src) {
  return window.FORJ3D_OPTIMIZABLE_EXT.test(src) ? src.replace(window.FORJ3D_OPTIMIZABLE_EXT, '.webp') : src;
};

window.forj3dToThumbSrc = function (src) {
  return window.FORJ3D_OPTIMIZABLE_EXT.test(src) ? src.replace(window.FORJ3D_OPTIMIZABLE_EXT, '-thumb.webp') : src;
};

window.forj3dFallbackAttr = function (originalSrc) {
  return `onerror="this.onerror=null;this.src='${originalSrc}';"`;
};

/* =========================================================
   COOKIES/CONSENTIMENTO — libera fotos e vídeos (viewers 3D)
   só depois que o visitante aceita o banner de cookies.
   A UI do banner fica em cookie-consent.js; aqui só ficam os
   helpers que index.js/cart.js/produtos.js e os viewers 3D
   usam para checar consentimento e montar as imagens.
========================================================= */
window.FORJ3D_CONSENT_KEY = 'forj3d_cookie_consent';

window.forj3dHasConsent = function () {
  try {
    return localStorage.getItem(window.FORJ3D_CONSENT_KEY) === 'accepted';
  } catch (e) {
    return false;
  }
};

// Placeholder leve (SVG inline, sem requisição de rede) com um cadeado —
// ocupa o lugar da foto/vídeo real até o consentimento ser dado.
window.FORJ3D_MEDIA_PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">' +
    '<rect width="400" height="400" fill="#EDEDED"/>' +
    '<g transform="translate(200,200)" fill="none" stroke="#B7B7B7" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="-30" y="-6" width="60" height="46" rx="8"/>' +
      '<path d="M -18 -6 V -22 A 18 18 0 0 1 18 -22 V -6"/>' +
    '</g>' +
  '</svg>'
);

// Monta o atributo de src de uma imagem já respeitando o consentimento:
// aceito -> src real direto; não aceito -> guarda a URL real em
// data-gated-src e mostra o placeholder no lugar.
window.forj3dMediaAttrs = function (src) {
  return window.forj3dHasConsent()
    ? `src="${src}"`
    : `data-gated-src="${src}" src="${window.FORJ3D_MEDIA_PLACEHOLDER}"`;
};

// Chamado pelo banner de cookies quando o visitante aceita: troca todo
// placeholder já renderizado pela foto real e avisa os viewers 3D
// (hero-fluid-viewer.js / spider-fluid-viewer.js) que já podem carregar.
window.forj3dReleaseMedia = function () {
  document.querySelectorAll('[data-gated-src]').forEach((img) => {
    img.src = img.getAttribute('data-gated-src');
    img.removeAttribute('data-gated-src');
  });
  document.dispatchEvent(new CustomEvent('forj3d:consent-accepted'));
};
