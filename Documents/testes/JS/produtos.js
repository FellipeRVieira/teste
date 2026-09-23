/* =========================================================
   CONFIG — troque aqui quando tiver o número real
========================================================= */
const whatsappNumber = window.FORJ3D_CONFIG?.whatsappNumber || "5527997941766";
const products = window.FORJ3D_PRODUCTS || [];
const icons = window.FORJ3D_ICONS || {};
const categories = window.FORJ3D_CATEGORIES || ["Todos"];

/* =========================================================
   ESTADO
========================================================= */
let activeCategory = "Todos";
let searchTerm = "";
let sortMode = "relevancia";
let priceMin = null;
let priceMax = null;

const urlParams = new URLSearchParams(location.search);
const categoriaFromUrl = urlParams.get('categoria');
if (categoriaFromUrl && categories.includes(categoriaFromUrl)) {
  activeCategory = categoriaFromUrl;
}

/* =========================================================
   RENDER — FILTROS
========================================================= */
const filtersEl = document.getElementById('filters');
categories.forEach(cat => {
  const btn = document.createElement('button');
  btn.className = 'filter-btn' + (cat === activeCategory ? ' active' : '');
  btn.textContent = cat;
  btn.setAttribute('role','tab');
  btn.addEventListener('click', () => {
    activeCategory = cat;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderGrid();
  });
  filtersEl.appendChild(btn);
});

/* =========================================================
   RENDER — GRID
========================================================= */
function getFiltered(){
  const list = products.filter(p => {
    const matchesCategory = activeCategory === "Todos" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMin = priceMin === null || p.price >= priceMin;
    const matchesMax = priceMax === null || p.price <= priceMax;
    return matchesCategory && matchesSearch && matchesMin && matchesMax;
  });

  if (sortMode === "menor-preco") list.sort((a, b) => a.price - b.price);
  if (sortMode === "maior-preco") list.sort((a, b) => b.price - a.price);

  return list;
}

function getProductImages(p){
  return Array.isArray(p.images) ? p.images.filter(Boolean) : [];
}

/* =========================================================
   IMAGENS OTIMIZADAS (.webp)
   Helpers compartilhados, definidos em products-data.js
   (carregado antes deste arquivo em produtos.html):
     window.forj3dToFullSrc / forj3dToThumbSrc / forj3dFallbackAttr
========================================================= */
const toFullSrc = window.forj3dToFullSrc;
const toThumbSrc = window.forj3dToThumbSrc;
const fallbackAttr = window.forj3dFallbackAttr;

function productVisual(p, className = ''){
  const images = getProductImages(p);
  if (images.length) {
    const base = `<img class="${className}" ${window.forj3dMediaAttrs(toThumbSrc(images[0]))} alt="${p.name}" loading="lazy" draggable="false" ${fallbackAttr(images[0])}>`;
    const hover = images.length > 1
      ? `<img class="card-img-hover" ${window.forj3dMediaAttrs(toThumbSrc(images[1]))} alt="" aria-hidden="true" loading="lazy" draggable="false" ${fallbackAttr(images[1])}>`
      : '';
    return base + hover;
  }
  return icons[p.icon] || '';
}

function cardHTML(p){
  return `
    <div class="card" data-id="${p.id}" tabindex="0" role="button" aria-label="Ver detalhes de ${p.name}">
      <div class="card-img">${productVisual(p)}</div>
      <span class="card-cat">${p.category}</span>
      <div class="card-name">${p.name}</div>
      <div class="card-price">R$ ${p.price.toFixed(2).replace('.',',')}</div>
      <div class="card-cta">Ver produto</div>
    </div>`;
}

function renderGrid(){
  const grid = document.getElementById('grid');
  const empty = document.getElementById('emptyState');
  const meta = document.getElementById('resultsMeta');
  const list = getFiltered();

  meta.textContent = list.length + (list.length === 1 ? ' produto encontrado' : ' produtos encontrados');
  grid.innerHTML = list.map(cardHTML).join('');
  empty.classList.toggle('show', list.length === 0);
  grid.style.display = list.length === 0 ? 'none' : 'grid';

  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => openProduct(Number(card.dataset.id)));
    card.addEventListener('keypress', e => { if (e.key === 'Enter') openProduct(Number(card.dataset.id)); });
  });
}

/* =========================================================
   BUSCA
========================================================= */
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
searchInput.addEventListener('input', () => {
  searchTerm = searchInput.value.trim();
  searchClear.classList.toggle('show', searchTerm.length > 0);
  renderGrid();
});
searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchTerm = '';
  searchClear.classList.remove('show');
  renderGrid();
  searchInput.focus();
});

/* =========================================================
   ORDENAÇÃO E FAIXA DE PREÇO
========================================================= */
const sortSelect = document.getElementById('sortSelect');
const priceMinInput = document.getElementById('priceMin');
const priceMaxInput = document.getElementById('priceMax');

sortSelect.addEventListener('change', () => {
  sortMode = sortSelect.value;
  renderGrid();
});

function parsePrice(value){
  const n = parseFloat(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

let priceDebounce;
function handlePriceChange(){
  clearTimeout(priceDebounce);
  priceDebounce = setTimeout(() => {
    priceMin = parsePrice(priceMinInput.value);
    priceMax = parsePrice(priceMaxInput.value);
    renderGrid();
  }, 300);
}

priceMinInput.addEventListener('input', handlePriceChange);
priceMaxInput.addEventListener('input', handlePriceChange);

/* =========================================================
   MODAL DE PRODUTO
========================================================= */
const overlay = document.getElementById('modalOverlay');
let currentShareProduct = null;

function openProduct(id){
  const p = products.find(x => x.id === id);
  if (!p) return;

  document.getElementById('modalCat').textContent = p.category;
  document.getElementById('modalProductName').textContent = p.name;
  document.getElementById('modalPrice').textContent = 'R$ ' + p.price.toFixed(2).replace('.',',');
  document.getElementById('modalDesc').textContent = p.description;

  const galleryMain = document.getElementById('galleryMain');
  const thumbs = document.getElementById('galleryThumbs');
  const images = getProductImages(p);
  const galleryItems = images.length ? images : [null, null, null];

  function renderGalleryImage(src, index = 0){
    const visual = src
      ? `<img ${window.forj3dMediaAttrs(toFullSrc(src))} alt="${p.name} - imagem ${index + 1}" draggable="false" ${fallbackAttr(src)}>`
      : `${icons[p.icon] || ''}`;

    galleryMain.innerHTML = `
      ${visual}
      <div class="zoom-lens" id="zoomLens" aria-hidden="true"></div>
      <span class="zoom-hint" id="zoomHint">Passe o mouse para ampliar</span>
    `;

    setupImageZoom();
  }

  renderGalleryImage(galleryItems[0], 0);

  thumbs.innerHTML = galleryItems.map((src, i) => `
    <button class="thumb ${i === 0 ? 'active' : ''}" type="button" data-i="${i}" aria-label="Visualizar imagem ${i + 1}">
      ${src ? `<img ${window.forj3dMediaAttrs(toThumbSrc(src))} alt="${p.name} - miniatura ${i + 1}" loading="lazy" draggable="false" ${fallbackAttr(src)}>` : (icons[p.icon] || '')}
    </button>
  `).join('');

  thumbs.querySelectorAll('.thumb').forEach(t => {
    t.addEventListener('click', () => {
      const index = Number(t.dataset.i);
      thumbs.querySelectorAll('.thumb').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      galleryMain.classList.remove('is-zooming');
      renderGalleryImage(galleryItems[index], index);
    });
  });

  const mobileNote = document.getElementById('mobileZoomNote');
  if (mobileNote) mobileNote.hidden = !images.length;

  const message = `Olá! Tenho interesse no produto ${p.name}`;
  document.getElementById('modalWhats').href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  document.getElementById('modalAddCart').dataset.id = p.id;
  currentShareProduct = p;

  const related = products.filter(x => x.category === p.category && x.id !== p.id).slice(0,3);
  document.getElementById('relatedGrid').innerHTML = related.map(r => `
    <div class="related-card" data-id="${r.id}" tabindex="0" role="button" aria-label="Ver ${r.name}">
      <div class="card-img">${productVisual(r)}</div>
      <div class="card-name">${r.name}</div>
      <div class="card-price">R$ ${r.price.toFixed(2).replace('.',',')}</div>
    </div>`).join('');

  document.getElementById('relatedGrid').querySelectorAll('.related-card').forEach(c => {
    c.addEventListener('click', () => openProduct(Number(c.dataset.id)));
    c.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openProduct(Number(c.dataset.id));
      }
    });
  });

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  if (location.hash !== `#produto/${p.id}`) {
    history.pushState({ produto: p.id }, '', `#produto/${p.id}`);
  }
}

/* =========================================================
   ZOOM — estilo marketplace
   Desktop: lente + painel ampliado.
   Touch: toque para abrir uma visualização ampliada.
========================================================= */
function setupImageZoom(){
  const galleryMain = document.getElementById('galleryMain');
  const zoomLens = document.getElementById('zoomLens');
  const zoomPreview = document.getElementById('zoomPreview');
  const zoomHint = document.getElementById('zoomHint');
  const mobileNote = document.getElementById('mobileZoomNote');
  const image = galleryMain?.querySelector('img');

  if (!galleryMain || !zoomLens || !zoomPreview || !image) {
    if (zoomPreview) zoomPreview.innerHTML = '';
    return;
  }

  const zoom = 2.6;
  let touchZoomed = false;

  zoomPreview.innerHTML = `<img src="${image.src}" alt="" aria-hidden="true" draggable="false">`;
  const previewImage = zoomPreview.querySelector('img');

  const updatePreview = (clientX, clientY) => {
    const rect = galleryMain.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    const lensW = zoomLens.offsetWidth;
    const lensH = zoomLens.offsetHeight;
    let lensX = x - lensW / 2;
    let lensY = y - lensH / 2;

    lensX = Math.max(0, Math.min(lensX, rect.width - lensW));
    lensY = Math.max(0, Math.min(lensY, rect.height - lensH));

    zoomLens.style.left = `${lensX}px`;
    zoomLens.style.top = `${lensY}px`;

    const px = (lensX + lensW / 2) / rect.width * 100;
    const py = (lensY + lensH / 2) / rect.height * 100;
    previewImage.style.transformOrigin = `${px}% ${py}%`;
    previewImage.style.transform = `scale(${zoom})`;
  };

  const showZoom = (clientX, clientY) => {
    galleryMain.classList.add('is-zooming');
    if (zoomHint) zoomHint.style.opacity = '0';
    updatePreview(clientX, clientY);
  };

  const hideZoom = () => {
    if (!touchZoomed) {
      galleryMain.classList.remove('is-zooming');
      previewImage.style.transform = 'scale(1)';
      previewImage.style.transformOrigin = '50% 50%';
    }
  };

  galleryMain.onpointermove = event => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      showZoom(event.clientX, event.clientY);
    }
  };

  galleryMain.onpointerenter = event => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      showZoom(event.clientX, event.clientY);
    }
  };

  galleryMain.onpointerleave = () => {
    if (!touchZoomed) hideZoom();
  };

  galleryMain.onclick = event => {
    if (event.pointerType === 'touch') return;
  };

  galleryMain.ontouchstart = event => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      const touch = event.touches[0];
      touchZoomed = !touchZoomed;
      if (touchZoomed) {
        showZoom(touch.clientX, touch.clientY);
        if (mobileNote) mobileNote.textContent = 'Toque novamente para fechar o zoom';
      } else {
        galleryMain.classList.remove('is-zooming');
        if (mobileNote) mobileNote.textContent = 'Toque na imagem para ampliar';
      }
    }
  };

  galleryMain.ontouchmove = event => {
    if (touchZoomed) {
      const touch = event.touches[0];
      updatePreview(touch.clientX, touch.clientY);
      event.preventDefault();
    }
  };

  galleryMain.ontouchend = () => {};

  image.addEventListener('load', () => {
    previewImage.src = image.currentSrc || image.src;
  }, { once: true });
}

function closeModalUI(){
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function closeModal(){
  closeModalUI();
  // se a URL ainda tem o hash do produto, "consome" essa entrada do
  // histórico voltando, em vez de empilhar uma entrada nova — assim o
  // botão de voltar do navegador leva para a página anterior de verdade,
  // e não reabre o produto
  if (location.hash.match(/#produto\//)) {
    history.back();
  }
}

document.getElementById('modalAddCart').addEventListener('click', () => {
  const id = Number(document.getElementById('modalAddCart').dataset.id);
  if (id && window.FORJ3D_CART) window.FORJ3D_CART.addToCart(id);
});

/* =========================================================
   COMPARTILHAR PRODUTO
   Usa a Web Share API nativa quando disponível (principalmente
   mobile); no desktop, copia o link direto do produto (com o
   hash #produto/id) para a área de transferência.
========================================================= */
async function shareProduct(){
  const p = currentShareProduct;
  if (!p) return;

  const url = `${location.origin}${location.pathname}#produto/${p.id}`;
  const text = `Olha esse produto da FORJ3D: ${p.name}`;
  const shareLabel = document.getElementById('modalShareLabel');

  if (navigator.share) {
    try {
      await navigator.share({ title: p.name, text, url });
    } catch (e) {
      // usuário cancelou o compartilhamento — não faz nada
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    if (shareLabel) {
      const original = shareLabel.textContent;
      shareLabel.textContent = 'Link copiado!';
      setTimeout(() => { shareLabel.textContent = original; }, 2000);
    }
  } catch (e) {
    // clipboard indisponível — abre o compartilhamento pelo WhatsApp como último recurso
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank', 'noopener');
  }
}

document.getElementById('modalShare').addEventListener('click', shareProduct);

document.getElementById('modalClose').addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal(); });

/* mantém o modal sincronizado com a URL — tanto ao entrar direto com
   #produto/id quanto ao navegar com os botões voltar/avançar do navegador */
function checkHash(){
  const match = location.hash.match(/#produto\/(\d+)/);
  if (match) {
    openProduct(Number(match[1]));
  } else {
    closeModalUI();
  }
}
window.addEventListener('hashchange', checkHash);

/* =========================================================
   INIT
========================================================= */
renderGrid();
checkHash();